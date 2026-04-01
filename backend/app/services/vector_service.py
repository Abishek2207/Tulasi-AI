import json
import numpy as np
try:
    import faiss
except ImportError:
    faiss = None

from sqlmodel import Session, select
from app.models.models import UserMemoryChunk

class VectorService:
    def __init__(self):
        self.model = None

    def _get_model(self):
        if self.model is None:
            # Lazy load to avoid massive startup delay if not used immediately
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
        return self.model

    def embed_documents(self, text: str) -> list[float]:
        """Embed a single text string into a vector."""
        import os
        # 🚨 Use Gemini API to prevent Render Server PyTorch OOM crashes
        api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
        if api_key:
            try:
                import google.generativeai as genai
                # Ensure it's configured in case it wasn't yet
                genai.configure(api_key=api_key)
                result = genai.embed_content(
                    model="models/embedding-001",
                    content=text,
                    task_type="retrieval_document"
                )
                return result['embedding']
            except Exception as e:
                print(f"Gemini API embed failed: {e}")
                # NEVER fallback to PyTorch on cloud! It will OOM crash the process!
                return [0.0] * 768
                
        # Fallback to local PyTorch only if absolutely no API key configured
        return self._get_model().encode(text).tolist()

    def store_embeddings(self, user_id: int, text: str, db: Session):
        """Generates embeddings and stores the conversational memory chunk."""
        vector = self.embed_documents(text)
        chunk = UserMemoryChunk(
            user_id=user_id, 
            content=text, 
            embedding_json=json.dumps(vector)
        )
        db.add(chunk)
        db.commit()

    def store_batch_embeddings(self, user_id: int, texts: list[str], db: Session):
        """Batch generates embeddings to completely bypass 429 Rate Limits on free cloud APIs."""
        if not texts: return
        import os
        api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                result = genai.embed_content(
                    model="models/embedding-001",
                    content=texts,
                    task_type="retrieval_document"
                )
                embeddings = result['embedding']
            except Exception as e:
                print(f"Batch embed failed: {e}")
                return
        else:
            embeddings = [self._get_model().encode(t).tolist() for t in texts]

        for i, text in enumerate(texts):
            chunk = UserMemoryChunk(user_id=user_id, content=text, embedding_json=json.dumps(embeddings[i]))
            db.add(chunk)
        db.commit()

    def retrieve_context(self, user_id: int, query: str, db: Session, top_k: int = 3) -> str:
        """Retrieves top_k relevant memory chunks for the user."""
        if not faiss:
            return ""

        chunks = db.exec(select(UserMemoryChunk).where(UserMemoryChunk.user_id == user_id)).all()
        if not chunks:
            return ""
        
        # Build ephemeral FAISS index for this user
        vectors = []
        valid_chunks = []
        for c in chunks:
            try:
                v = json.loads(c.embedding_json)
                if isinstance(v, list) and len(v) > 0:
                    vectors.append(v)
                    valid_chunks.append(c)
            except Exception:
                pass
        
        if not vectors:
            return ""

        # Ensure all vectors have the same dimension before creating the array
        dim = len(vectors[0])
        consistent_vectors = []
        consistent_chunks = []
        for i, v in enumerate(vectors):
            if len(v) == dim:
                consistent_vectors.append(v)
                consistent_chunks.append(valid_chunks[i])
        
        if not consistent_vectors:
            return ""

        vectors_np = np.array(consistent_vectors).astype('float32')
        index = faiss.IndexFlatL2(dim)
        index.add(vectors_np)
        
        try:
            query_vec = self.embed_documents(query)
            if not query_vec or len(query_vec) != dim:
                print(f"Query vector dimension mismatch ({len(query_vec) if query_vec else 0} vs {dim}). Skipping context.")
                return ""
            
            query_np = np.array([query_vec]).astype('float32')
            
            # Prevent out-of-bounds error if less chunks than top_k
            k = min(top_k, len(consistent_chunks))
            distances, indices = index.search(query_np, k)
            
            context_parts = []
            for idx in indices[0]:
                if 0 <= idx < len(consistent_chunks):
                    context_parts.append(consistent_chunks[idx].content)
            
            return "\n---\n".join(context_parts)
        except Exception as e:
            print(f"FAISS search failed: {e}")
            return ""

vector_service = VectorService()
