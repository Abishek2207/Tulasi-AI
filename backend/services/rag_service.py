import os
from typing import List
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from supabase.client import Client, create_client
from dotenv import load_dotenv

load_dotenv()

class RAGService:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        
        if self.supabase_url and self.supabase_key:
            self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
            self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        
    async def process_pdf(self, file_path: str, user_id: str, document_id: str):
        """Processes PDF, splits into chunks, and stores in Supabase pgvector."""
        try:
            loader = PyMuPDFLoader(file_path)
            documents = loader.load()
            
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=100
            )
            chunks = text_splitter.split_documents(documents)
            
            # Add metadata
            for chunk in chunks:
                chunk.metadata["user_id"] = user_id
                chunk.metadata["document_id"] = document_id
            
            # Store in Supabase
            SupabaseVectorStore.from_documents(
                chunks,
                self.embeddings,
                client=self.supabase,
                table_name="document_chunks",
                query_name="match_documents"
            )
            
            return True
        except Exception as e:
            print(f"RAG Processing Error: {e}")
            return False

    async def query_documents(self, query: str, user_id: str) -> str:
        """Searches for relevant chunks and returns context."""
        try:
            vector_store = SupabaseVectorStore(
                client=self.supabase,
                embedding=self.embeddings,
                table_name="document_chunks",
                query_name="match_documents"
            )
            
            # Filter by user_id in metadata
            results = vector_store.similarity_search(query, k=4, filter={"user_id": user_id})
            
            context = "\n\n".join([doc.page_content for doc in results])
            return context
        except Exception as e:
            print(f"RAG Query Error: {e}")
            return ""

rag_service = RAGService()
