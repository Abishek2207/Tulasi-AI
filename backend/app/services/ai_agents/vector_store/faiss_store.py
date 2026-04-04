import os
import json
import numpy as np
import google.generativeai as genai

FAISS_INDEX_DIR = os.path.join(os.path.dirname(__file__), '../../../../database/faiss')
_GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or ""

if _GOOGLE_API_KEY:
    genai.configure(api_key=_GOOGLE_API_KEY)

class SimpleVectorStoreManager:
    def __init__(self):
        self.index_path = os.path.join(FAISS_INDEX_DIR, "index.json")
        self.store = []
        os.makedirs(FAISS_INDEX_DIR, exist_ok=True)
        self.load()

    def load(self):
        try:
            if os.path.exists(self.index_path):
                with open(self.index_path, 'r', encoding='utf-8') as f:
                    self.store = json.load(f)
        except Exception as e:
            print(f"⚠️  Failed to load simple vector store: {e}")
            self.store = []

    def save(self):
        try:
            with open(self.index_path, 'w', encoding='utf-8') as f:
                json.dump(self.store, f)
        except Exception as e:
            print(f"⚠️  Failed to save simple vector store: {e}")

    def embed_text(self, text: str):
        try:
            if not _GOOGLE_API_KEY: return None
            result = genai.embed_content(
                model="models/gemini-embedding-001",
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            print(f"⚠️  Embedding failed: {e}")
            return None

    def process_document(self, text: str, metadata: dict = None):
        # Very simple chunking
        chunks = [text[i:i+1000] for i in range(0, len(text), 800)]
        for chunk in chunks:
            embedding = self.embed_text(chunk)
            if embedding:
                self.store.append({
                    "text": chunk,
                    "embedding": embedding,
                    "metadata": metadata or {}
                })
        self.save()
        print(f"✅ Indexed {len(chunks)} chunks.")

    def search(self, query: str, top_k: int = 3):
        try:
            if not _GOOGLE_API_KEY: return []
            result = genai.embed_content(
                model="models/gemini-embedding-001",
                content=query,
                task_type="retrieval_query"
            )
            query_embedding = result['embedding']
        except Exception as e:
            print(f"⚠️  Query embedding failed: {e}")
            return []

        if not self.store: return []

        import math
        def cosine_similarity(v1, v2):
            dot = sum(a*b for a, b in zip(v1, v2))
            norm1 = math.sqrt(sum(a*a for a in v1))
            norm2 = math.sqrt(sum(b*b for b in v2))
            return dot / (norm1 * norm2) if norm1 * norm2 > 0 else 0

        scored = []
        for item in self.store:
            score = cosine_similarity(query_embedding, item["embedding"])
            scored.append((score, item))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        return [item["text"] for score, item in scored[:top_k]]

vector_store_manager = SimpleVectorStoreManager()

