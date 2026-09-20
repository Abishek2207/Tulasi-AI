import os
import json

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
                from google import genai as google_genai
                genai.configure(api_key=api_key)
                result = genai.embed_content(
                    model="models/gemini-embedding-001",
                    content=text,
                    task_type="retrieval_document"
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
            embedding=json.dumps(vector)
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
                from google import genai as google_genai
                genai.configure(api_key=api_key)
                result = genai.embed_content(
                    model="models/gemini-embedding-001",
                    content=texts,
                    task_type="retrieval_document"
                )
                embeddings = [e.values for e in result.embeddings]
            except Exception as e:
                print(f"Batch embed failed: {e}")
                return
        else:
            embeddings = [self._get_model().encode(t).tolist() for t in texts]

        for i, text in enumerate(texts):
            chunk = UserMemoryChunk(user_id=user_id, content=text, embedding=json.dumps(embeddings[i]))
            db.add(chunk)
        db.commit()

    def retrieve_context(self, user_id: int, query: str, db: Session, top_k: int = 3) -> str:
        """Retrieves top_k relevant memory chunks for the user."""
        query_vec = self.embed_documents(query)
        if not query_vec:
            return ""

        from app.core.database import is_sqlite
        
        try:
            if is_sqlite:
                chunks = db.exec(select(UserMemoryChunk).where(UserMemoryChunk.user_id == user_id)).all()
                if not chunks:
                    return ""
                
                import numpy as np
                valid_chunks = []
                vectors = []
                for c in chunks:
                    if c.embedding:
                        try:
                            v = json.loads(c.embedding)
                            if isinstance(v, list) and len(v) > 0:
                                vectors.append(v)
                                valid_chunks.append(c)
                        except Exception:
                            pass
                
                if not vectors:
                    return ""

                vecs_np = np.array(vectors)
                q_np = np.array(query_vec)
                norms_v = np.linalg.norm(vecs_np, axis=1)
                norm_q = np.linalg.norm(q_np)
                norms_v[norms_v == 0] = 1e-9
                if norm_q == 0: norm_q = 1e-9
                similarities = np.dot(vecs_np, q_np) / (norms_v * norm_q)
                
                top_k_idx = similarities.argsort()[-top_k:][::-1]
                
                context_parts = []
                for i in top_k_idx:
                    if similarities[i] > 0.3:
                        context_parts.append(valid_chunks[i].content)
                return "\n".join(context_parts)
            else:
                q = select(UserMemoryChunk).where(UserMemoryChunk.user_id == user_id)
                q = q.order_by(UserMemoryChunk.embedding.cosine_distance(query_vec)).limit(top_k)
                top_chunks = db.exec(q).all()
                if not top_chunks:
                    return ""
                return "\n".join([c.content for c in top_chunks])
        except Exception as e:
            print(f"Context retrieval failed: {e}")
            return ""

    def update_user_intelligence(self, user_id: int, interaction: str, db: Session):
        """Uses AI to extract key facts about the user from an interaction and updates their profile."""
        from app.models.models import User
        from app.core.ai_router import get_ai_response
        import json

        user = db.get(User, user_id)
        if not user: return

        current_profile = json.loads((user.profile.user_intelligence_profile if getattr(user, "profile", None) else "{}") or "{}")
        
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
                if user.profile:
                    user.profile.user_intelligence_profile = json.dumps(combined)
                from datetime import datetime
                user.last_intelligence_update = datetime.utcnow()
                db.add(user)
                db.commit()
        except Exception as e:
            print(f"⚠️ Intelligence update failed: {e}")

vector_service = VectorService()

