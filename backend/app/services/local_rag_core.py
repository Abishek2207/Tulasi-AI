import os
import faiss
import numpy as np
import json
import httpx
from typing import List, Dict, Any
import google.generativeai as genai
from app.core.config import settings

# Global dictionary to store models safely and load on-demand
_EMBEDDER = None

def get_embedder():
    global _EMBEDDER
    if _EMBEDDER is None:
        from sentence_transformers import SentenceTransformer
        print("🔄 Loading sentence-transformers (all-MiniLM-L6-v2) - this might take a moment...")
        _EMBEDDER = SentenceTransformer('all-MiniLM-L6-v2')
    return _EMBEDDER

class LocalRAGService:
    def __init__(self):
        self.indices_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "rag_indices")
        os.makedirs(self.indices_dir, exist_ok=True)
    
    def _get_user_index_path(self, user_id: str) -> str:
        return os.path.join(self.indices_dir, f"user_{user_id}.faiss")
        
    def _get_user_metadata_path(self, user_id: str) -> str:
        return os.path.join(self.indices_dir, f"user_{user_id}_meta.json")

    def _generate_embeddings(self, texts: List[str]) -> np.ndarray:
        embedder = get_embedder()
        print(f"Generate embeddings for {len(texts)} chunks")
        embeddings = embedder.encode(texts)
        return np.array(embeddings).astype('float32')

    async def index_user_data(self, user_id: str, documents: List[Dict[str, Any]]):
        """
        Expects documents as [{"type": "skill", "content": "..."}]
        """
        if not documents:
            return

        texts = [doc["content"] for doc in documents]
        embeddings = self._generate_embeddings(texts)

        # Dimension of all-MiniLM-L6-v2 is 384
        dimension = embeddings.shape[1]
        
        index_path = self._get_user_index_path(str(user_id))
        meta_path = self._get_user_metadata_path(str(user_id))
        
        # We always recreate the index for simplicity and absolute isolation in Free RAG.
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings)
        faiss.write_index(index, index_path)
        
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(documents, f)
            
        print(f"✅ Indexed {len(documents)} document(s) for user {user_id}")

    def retrieve_context(self, user_id: str, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        index_path = self._get_user_index_path(str(user_id))
        meta_path = self._get_user_metadata_path(str(user_id))
        
        if not os.path.exists(index_path) or not os.path.exists(meta_path):
            return []

        try:
            index = faiss.read_index(index_path)
            with open(meta_path, "r", encoding="utf-8") as f:
                documents = json.load(f)
                
            query_embedding = self._generate_embeddings([query])
            
            # search
            distances, indices = index.search(query_embedding, min(top_k, len(documents)))
            
            results = []
            for i, idx in enumerate(indices[0]):
                if idx >= 0 and idx < len(documents):
                    res = documents[idx].copy()
                    res["distance"] = float(distances[0][i])
                    results.append(res)
            return results
        except Exception as e:
            print(f"❌ RAG Retrieval failed: {e}")
            return []

    async def _query_ollama(self, prompt: str) -> str:
        """Query local Ollama instance"""
        # Default Ollama address
        url = "http://127.0.0.1:11434/api/generate"
        payload = {
            "model": "mistral", # mistral or llama3
            "prompt": prompt,
            "stream": False
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")

    def _query_gemini(self, prompt: str) -> str:
        """Fallback to Google Gemini"""
        # Initialize generative API if needed
        genai.configure(api_key=settings.effective_gemini_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text

    async def generate_answer(self, user_id: str, query: str) -> Dict[str, Any]:
        context = self.retrieve_context(user_id, query)
        
        context_str = "\n".join([f"[{c.get('type', 'info')}] {c.get('content', '')}" for c in context])
        
        prompt = (
            f"You are a personalized AI mentor on TulasiAI.\n"
            f"Use the following learned context about the user to provide a highly personalized, empathetic, and actionable response.\n"
            f"If the context doesn't directly answer the question, still use it to personalize the tone or relate it to their skills/roadmap if applicable.\n\n"
            f"USER CONTEXT:\n{context_str}\n\n"
            f"USER QUERY:\n{query}\n\n"
            f"ANSWER:"
        )

        answer = ""
        used_model = "unknown"
        
        # Try Ollama first
        try:
            answer = await self._query_ollama(prompt)
            if answer.strip():
                used_model = "ollama"
        except Exception as e:
            print(f"⚠️ Ollama unavailable, falling back to Gemini. Error: {str(e)}")
            pass
            
        if not answer:
            try:
                # Fallback to Gemini
                answer = self._query_gemini(prompt)
                used_model = "gemini"
            except Exception as e:
                print(f"❌ Gemini fallback also failed: {str(e)}")
                answer = "I'm sorry, my AI backend is temporarily unresponsive. But based on your context, " + \
                         ("\n".join([c.get('content', '') for c in context]) if context else "I don't have enough context.")

        return {
            "answer": answer,
            "sources": context,
            "used_model": used_model
        }

local_rag_service = LocalRAGService()
