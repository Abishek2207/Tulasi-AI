import os
from dotenv import load_dotenv

# Langchain imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage, HumanMessage
from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain

# Document Processing Imports
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from supabase.client import create_client, Client

load_dotenv()

# Initialize Supabase Client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# Initialize the Gemini Model (100% Free Tier API)
def get_ai_model():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Warning: GOOGLE_API_KEY not found in environment variables.")
        return None
    # Using gemini-1.5-flash for speed and free tier limits
    return ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key, temperature=0.7)

llm = get_ai_model()

# Initialize Local Embedding Model (100% Free, runs offline)
try:
    hf_embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
except Exception as e:
    print(f"Warning: Failed to load local embeddings. {e}")
    hf_embeddings = None

# Memory for user sessions
user_memories = {}

def get_memory_for_user(user_id: str):
    if user_id not in user_memories:
        user_memories[user_id] = ConversationBufferMemory(return_messages=True)
    return user_memories[user_id]

# Core System Prompt for the AI Tutor
SYSTEM_PROMPT = """
You are TulasiAI, an advanced, intelligent educational assistant built for students.
Your core capabilities include:
1. Explaining complex concepts clearly and step-by-step.
2. Integrating context from uploaded PDFs, YouTube video transcripts, and LeetCode problems when provided.
3. Conducting realistic mock interviews, scoring answers (ATS friendly), and providing roadmaps.
4. Communicating fluently in multiple languages (English, Tamil, etc.). ALWAYS respond in the user's preferred language or the language they initiated the chat in.
5. Offering supportive, encouraging feedback to maintain learning streaks.

If a student asks a technical doubt, break it down. If they upload a question, solve it clearly. Do NOT invent information.
"""

def chat_with_tulasiai(message: str, user_id: str = "default_user", context: str = "", db_session=None):
    """Core function to interact with the LLM"""
    if not llm:
        return "Error: AI engine is offline. Please configure GOOGLE_API_KEY in .env."
    
    memory = get_memory_for_user(user_id)
    
    # RAG: Query Supabase pgvector
    rag_context = ""
    if supabase and hf_embeddings:
        rag_context = query_supabase_vectorstore(message, user_id)
    
    # Combine provided context and RAG context
    final_context = f"{context}\n\n{rag_context}".strip()
    
    # Construct the prompt
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="history"),
        ("human", "Context (Relevant documents/data): {context}\n\nStudent Query: {input}")
    ])
    
    chain = LLMChain(
        llm=llm,
        prompt=prompt,
        memory=memory,
        verbose=False
    )
    
    try:
        response = chain.invoke({"input": message, "context": final_context})
        return response['text']
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return "I'm having trouble connecting to my neural network right now. Please try again in a moment."

# RAG specific functions (Supabase pgvector)
def process_pdf_for_rag(pdf_path: str, user_id: str = "default_user"):
    """Loads a PDF, chunks it, and saves to Supabase pgvector using local embeddings."""
    if not hf_embeddings or not supabase:
        print("Error: Embeddings model or Supabase client not initialized.")
        return None
    
    try:
        loader = PyMuPDFLoader(pdf_path)
        docs = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        splits = text_splitter.split_documents(docs)
        
        # Add metadata for user isolation
        for split in splits:
            split.metadata["user_id"] = user_id
            
        # Save to Supabase
        vector_store = SupabaseVectorStore.from_documents(
            splits,
            hf_embeddings,
            client=supabase,
            table_name="documents",
            query_name="match_documents",
        )
        return vector_store
    except Exception as e:
        print(f"Error processing document: {e}")
        return None

def query_supabase_vectorstore(query: str, user_id: str):
    """Searches Supabase pgvector for relevant chunks filtered by user_id."""
    if not supabase or not hf_embeddings: return ""
    try:
        vector_store = SupabaseVectorStore(
            client=supabase,
            embedding=hf_embeddings,
            table_name="documents",
            query_name="match_documents",
        )
        
        # Perform similarity search with metadata filter
        results = vector_store.similarity_search(
            query, 
            k=3, 
            filter={"user_id": user_id}
        )
        return "\n\n".join([res.page_content for res in results])
    except Exception as e:
        print(f"RAG Query Error: {e}")
        return ""
