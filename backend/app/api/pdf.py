from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
import os, uuid, tempfile

from app.core.config import settings
from app.api.auth import get_current_user
from app.models.models import User

# LangChain & ChromaDB Imports
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

router = APIRouter()
pdf_sessions: dict = {}

# Initialize Google Generative AI Embeddings (Cloud-based, low memory usage)
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=settings.GEMINI_API_KEY)
vector_store_dir = "./data/chroma"
os.makedirs(vector_store_dir, exist_ok=True)

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files accepted")
    
    session_id = str(uuid.uuid4())
    content = await file.read()
    
    try:
        # Save temp file for PyPDFLoader
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(content)
            tmp_path = tmp.name
            
        # 1. Load Document
        loader = PyPDFLoader(tmp_path)
        docs = loader.load()
        num_pages = len(docs)
        
        # 2. Chunk Document
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        
        # Add session metadata so we can filter by user uploaded file later
        for doc in splits:
            doc.metadata["session_id"] = session_id
            doc.metadata["user_id"] = current_user.id
            
        # 3. Store in persistent ChromaDB Vector Store
        vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings, persist_directory=vector_store_dir)
        
        os.unlink(tmp_path)
        
        pdf_sessions[session_id] = {
            "filename": file.filename,
            "pages": num_pages,
            "user_id": current_user.id
        }
        return {"session_id": session_id, "pages": num_pages, "filename": file.filename, "status": "ready"}
    except Exception as e:
        raise HTTPException(500, f"PDF processing error: {str(e)}")


class PDFQuestionRequest(BaseModel):
    question: str
    session_id: str


@router.post("/ask")
def ask_pdf(req: PDFQuestionRequest, current_user: User = Depends(get_current_user)):
    session = pdf_sessions.get(req.session_id)
    if not session:
        raise HTTPException(404, "PDF session not found. Please upload a PDF first.")
        
    try:
        # Retrieve Context from VectorDB
        vectorstore = Chroma(persist_directory=vector_store_dir, embedding_function=embeddings)
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3, "filter": {"session_id": req.session_id}})
        relevant_docs = retriever.invoke(req.question)
        
        context = "\n\n".join([doc.page_content for doc in relevant_docs])
        
        # Use Gemini for LLM Generation (Verified API Key)
        if settings.GEMINI_API_KEY:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("models/gemini-3.1-flash-lite-preview")
            prompt = f"Answer the question based STRICTLY on this context:\n{context}\n\nQuestion: {req.question}"
            response = model.generate_content(prompt)
            return {"answer": response.text, "source": session["filename"]}

        # Use Groq for LLM Generation (Fast & Free)
        elif settings.GROQ_API_KEY:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": f"You are a helpful AI document assistant. Answer the user's question based strictly on the provided context below.\n\nCONTEXT:\n{context}"},
                    {"role": "user", "content": req.question}
                ],
                max_tokens=1024,
            )
            return {"answer": completion.choices[0].message.content, "source": session["filename"]}
            
        return {"answer": "(No API Key) Found context for you but could not generate response.", "source": session["filename"]}
    except Exception as e:
        return {"answer": f"Error performing RAG query: {str(e)}", "source": session["filename"]}
