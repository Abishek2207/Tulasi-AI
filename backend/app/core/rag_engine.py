import os
import json
import numpy as np

try:
    import faiss
    from sentence_transformers import SentenceTransformer
    HAS_RAG_DEPS = True
except ImportError:
    HAS_RAG_DEPS = False

class LocalRAGEngine:
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        self.enabled = HAS_RAG_DEPS
        if not self.enabled:
            print("⚠️ FAISS/SentenceTransformers not installed. RAG is disabled.")
            return

        print(f"🔄 Initializing Local RAG Engine with model: {model_name}...")
        self.encoder = SentenceTransformer(model_name)
        
        # Dimensions for "all-MiniLM-L6-v2" is 384
        self.dimension = 384 
        
        # In-memory indices mapped by user_id for strict isolation
        self.user_indices = {}
        # In-memory document storage mapped by user_id
        self.user_docs = {}

    def _get_or_create_index(self, user_id: int):
        if user_id not in self.user_indices:
            self.user_indices[user_id] = faiss.IndexFlatL2(self.dimension)
            self.user_docs[user_id] = []
        return self.user_indices[user_id], self.user_docs[user_id]

    def add_context(self, user_id: int, content: str, source: str = "profile"):
        """Embeds and saves user context."""
        if not self.enabled or not content or len(content.strip()) == 0:
            return

        index, docs = self._get_or_create_index(user_id)
        
        # Simple chunking for sentences/paragraphs can be done. For now, entire content if small
        vector = self.encoder.encode([content])
        faiss.normalize_L2(vector)
        
        index.add(vector)
        docs.append({"content": content, "source": source})

    def search_context(self, user_id: int, query: str, top_k: int = 3) -> str:
        """Retrieves and formats top K relevant contexts for a user's query."""
        if not self.enabled or user_id not in self.user_indices:
            return ""

        index = self.user_indices.get(user_id)
        docs = self.user_docs.get(user_id)

        if not index or index.ntotal == 0:
            return ""

        vector = self.encoder.encode([query])
        faiss.normalize_L2(vector)
        
        # Make sure top_k does not exceed total documents
        k = min(top_k, index.ntotal)
        distances, indices = index.search(vector, k)

        relevant_contexts = []
        # Filter arbitrary distance thresholds if needed
        for i in indices[0]:
            if i != -1 and i < len(docs):
                relevant_contexts.append(docs[i]["content"])

        if not relevant_contexts:
            return ""

        return "\n--- RELEVANT CONTEXT ---\n" + "\n".join(relevant_contexts) + "\n------------------------"

# Singleton instance for the application
rag_engine = LocalRAGEngine()
