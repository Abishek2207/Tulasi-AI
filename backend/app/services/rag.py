import os
import json
import numpy as np
import google.generativeai as genai
from typing import List, Dict, Any

from app.core.config import settings

class RAGEvaluator:
    _instance = None
    _dataset: List[Dict[str, Any]] = []
    _embeddings: np.ndarray = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load_and_embed_dataset()
        return cls._instance

    def _load_and_embed_dataset(self):
        """Load the JSON dataset and compute embeddings for all questions/ideal answers."""
        dataset_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'rag_interview.json')
        if not os.path.exists(dataset_path):
            print("⚠️ RAG Dataset not found. Using fallback engine.")
            return

        with open(dataset_path, "r", encoding="utf-8") as f:
            self._dataset = json.load(f)

        if not self._dataset:
            return

        # Initialize generative API just for embeddings if needed
        if settings.effective_gemini_key:
            genai.configure(api_key=settings.effective_gemini_key)

        print(f"🔄 Embedding {len(self._dataset)} items for RAG...")
        
        texts_to_embed = [
            f"Question: {item['question']}\nAnswer: {item['ideal_answer']}"
            for item in self._dataset
        ]
        
        try:
            # batch embed
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=texts_to_embed,
            )
            self._embeddings = np.array(result['embedding'])
            print("✅ Pre-computed embeddings stored in memory.")
        except Exception as e:
            print(f"❌ Failed to generate embeddings: {e}")

    def retrieve_top_k(self, user_answer_context: str, k: int = 3) -> List[Dict[str, Any]]:
        """Retrieve top k most relevant ideal answers using Cosine Similarity."""
        if self._embeddings is None or len(self._dataset) == 0:
            return []

        try:
            query_emb = genai.embed_content(
                model="models/text-embedding-004",
                content=user_answer_context
            )['embedding']
            
            query_emb = np.array(query_emb)
            
            # Compute cosine similarity
            # Since gemini embeddings might already be normalized, dot product is often enough, 
            # but we explicitly compute cosine
            norms = np.linalg.norm(self._embeddings, axis=1) * np.linalg.norm(query_emb)
            similarities = np.dot(self._embeddings, query_emb) / norms
            
            top_k_indices = np.argsort(similarities)[::-1][:k]
            
            return [self._dataset[i] for i in top_k_indices]
        except Exception as e:
            print(f"❌ RAG Retrieval failed: {e}")
            return []

rag_evaluator = RAGEvaluator()
