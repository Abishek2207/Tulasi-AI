from langchain_groq import ChatGroq
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferWindowMemory
from langchain_community.vectorstores import SupabaseVectorStore
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate
from deep_translator import GoogleTranslator
from supabase import create_client
import os
from datetime import date, timedelta
from langdetect import detect

# ENV
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# 🔥 Lazy Supabase Init (IMPORTANT FIX)
def get_supabase():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    return create_client(url, key)

# Embeddings
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# LLM (Groq)
llm = ChatGroq(
    model="llama3-70b-8192",
    api_key=GROQ_API_KEY,
    temperature=0.3
)

SYSTEM_PROMPT = """You are Tulasi AI, an advanced educational assistant for students.

Your capabilities:
- Solve any programming, math, science problem step-by-step
- Explain concepts clearly with examples  
- Help with interview preparation
- Guide students on career roadmaps
- Support multiple languages
- Track student progress

Rules:
- Always provide clear, structured solutions
- Use code blocks for programming answers
- Explain each step thoroughly
- Be encouraging and supportive
- If question is in Tamil/Hindi/Telugu - respond in that language
- For coding: provide time complexity, space complexity
- Always suggest related topics to learn next

Context from uploaded documents:
{context}

Chat History:
{chat_history}
"""

# -------------------------
# RAG CHAIN
# -------------------------

def get_rag_chain(session_id: str):
    supabase = get_supabase()

    vectorstore = SupabaseVectorStore(
        client=supabase,
        embedding=embeddings,
        table_name="documents",
        query_name="match_documents"
    )
    
    memory = ConversationBufferWindowMemory(
        k=10,
        memory_key="chat_history",
        return_messages=True,
        output_key="answer"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(SYSTEM_PROMPT),
        ("human", "{question}")
    ])
    
    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
        memory=memory,
        combine_docs_chain_kwargs={"prompt": prompt},
        return_source_documents=True
    )
    
    return chain


# -------------------------
# PDF PROCESSING
# -------------------------

async def process_pdf(file_content: bytes, user_id: str, filename: str):
    import PyPDF2
    import io

    supabase = get_supabase()
    
    reader = PyPDF2.PdfReader(io.BytesIO(file_content))
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_text(text)
    
    SupabaseVectorStore.from_texts(
        texts=chunks,
        embedding=embeddings,
        client=supabase,
        table_name="documents",
        query_name="match_documents",
        metadatas=[{"user_id": user_id, "filename": filename}] * len(chunks)
    )
    
    return {"chunks": len(chunks), "filename": filename}


# -------------------------
# TRANSLATION
# -------------------------

async def translate_text(text: str, target_lang: str) -> str:
    if target_lang == "en":
        return text
    translator = GoogleTranslator(source="auto", target=target_lang)
    return translator.translate(text)


# -------------------------
# CHAT RESPONSE
# -------------------------

async def detect_and_respond(question: str, session_id: str, user_id: str):
    supabase = get_supabase()

    lang = detect(question)
    chain = get_rag_chain(session_id)
    
    result = chain({"question": question})
    answer = result["answer"]
    
    # Log activity
    try:
        supabase.table("activity_logs").insert({
            "user_id": user_id,
            "action": "chat_message",
            "metadata": {
                "question_length": len(question),
                "language": lang
            }
        }).execute()
    except Exception as e:
        print(f"Error logging activity: {e}")
    
    update_streak(user_id)
    
    return {
        "answer": answer,
        "language": lang,
        "sources": [
            doc.page_content[:200]
            for doc in result.get("source_documents", [])
        ]
    }


# -------------------------
# STREAK SYSTEM
# -------------------------

def update_streak(user_id: str):
    supabase = get_supabase()
    today = date.today()
    
    try:
        user = (
            supabase
            .table("users")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )

        user_data = user.data
        
        if not user_data:
            return

        last_active_str = user_data.get("last_active")
        streak = user_data.get("streak_count", 0)
        
        if last_active_str == str(today):
            return
        
        yesterday = today - timedelta(days=1)
        
        if last_active_str == str(yesterday):
            streak += 1
        else:
            streak = 1
        
        supabase.table("users").update({
            "streak_count": streak,
            "last_active": str(today),
            "total_xp": user_data.get("total_xp", 0) + 10
        }).eq("id", user_id).execute()

    except Exception as e:
        print(f"Error updating streak: {e}")