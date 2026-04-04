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
        # 🚨 Use Gemini API to prevent Render Server PyTorch OOM crashes
        api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
        if api_key:
            try:
                from google import genai
                from google.genai import types
                client = genai.Client(api_key=api_key)
                result = client.models.embed_content(
                    model="text-embedding-004",
                    contents=text,
                    config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT")
                )
                if result.embeddings and len(result.embeddings) > 0:
                    return result.embeddings[0].values
                return [0.0] * 768
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
                from google import genai
                from google.genai import types
                client = genai.Client(api_key=api_key)
                result = client.models.embed_content(
                    model="text-embedding-004",
                    contents=texts,
                    config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT")
                )
                embeddings = [e.values for e in result.embeddings]
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

    def update_user_intelligence(self, user_id: int, interaction: str, db: Session):
        """Uses AI to extract key facts about the user from an interaction and updates their profile."""
        from app.models.models import User
        from app.core.ai_router import get_ai_response
        import json

        user = db.get(User, user_id)
        if not user: return

        current_profile = json.loads(user.user_intelligence_profile or "{}")
        
        prompt = f"""
        Analyze this interaction and extract key user intelligence (technical skills, career goals, strengths, or knowledge gaps).
        Update the existing profile JSON with NEW facts. Do not repeat old facts.
        
        Current Profile: {json.dumps(current_profile)}
        New Interaction: {interaction}
        
        Return ONLY valid JSON matching this schema:
        {{
          "facts": ["list of user facts/facts about background"],
          "strengths": ["extracted technical strengths"],
          "gaps": ["knowledge gaps or weaknesses"],
          "sentiment": "positive|neutral|frustrated"
        }}
        """
        
        try:
            res = get_ai_response(prompt, force_model="fast_flash")
            import re
            match = re.search(r'\{.*\}', res, re.DOTALL)
            if match:
                new_profile = json.loads(match.group())
                # Strategic merge (keep set of unique facts)
                combined = {
                    "facts": list(set((current_profile.get("facts", []) + new_profile.get("facts", []))[-20:])),
                    "strengths": list(set((current_profile.get("strengths", []) + new_profile.get("strengths", []))[-10:])),
                    "gaps": list(set((current_profile.get("gaps", []) + new_profile.get("gaps", []))[-10:])),
                    "sentiment": new_profile.get("sentiment", "neutral")
                }
                user.user_intelligence_profile = json.dumps(combined)
                from datetime import datetime
                user.last_intelligence_update = datetime.utcnow()
                db.add(user)
                db.commit()
        except Exception as e:
            print(f"⚠️ Intelligence update failed: {e}")

vector_service = VectorService()
