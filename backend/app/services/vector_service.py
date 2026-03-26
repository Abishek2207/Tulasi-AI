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
        """Embed a single text string into a 384-dimensional vector."""
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
                vectors.append(json.loads(c.embedding_json))
                valid_chunks.append(c)
            except Exception:
                pass
        
        if not vectors:
            return ""

        vectors_np = np.array(vectors).astype('float32')
        index = faiss.IndexFlatL2(vectors_np.shape[1])
        index.add(vectors_np)
        
        query_vec = self.embed_documents(query)
        query_np = np.array([query_vec]).astype('float32')
        
        # Prevent out-of-bounds error if less chunks than top_k
        k = min(top_k, len(valid_chunks))
        distances, indices = index.search(query_np, k)
        
        context_parts = []
        for idx in indices[0]:
            if idx < len(valid_chunks):
                context_parts.append(valid_chunks[idx].content)
        
        return "\n---\n".join(context_parts)

vector_service = VectorService()
