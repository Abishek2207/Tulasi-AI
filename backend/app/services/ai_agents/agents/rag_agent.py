class RAGAgent:
    def __init__(self):
        self._system_prompt = (
            "You are an AI learning assistant for Tulasi AI. "
            "Use the given context to answer the user's question accurately. "
            "If the context doesn't contain enough information, say so clearly. "
            "Context: {context}"
        )

    def reset_retriever(self):
        """No-op for simple vector store as it dynamically reads its internal array."""
        pass

    def get_answer(self, query: str, user_id: int) -> str:
        """Return an answer grounded in the vector store."""
        try:
            from app.services.vector_service import vector_service
            from app.core.database import engine
            from sqlmodel import Session
            from app.core.ai_client import ai_client
            import os

            # Retrieve context chunks from SQLite vector db
            with Session(engine) as db:
                rag_context = vector_service.retrieve_context(user_id, query, db, top_k=5)
            
            if not rag_context:
                return "The document knowledge base is empty or no relevant info found. Please upload a PDF first."

            context = rag_context
            system_prompt = self._system_prompt.format(context=context)
            full_prompt = f"{system_prompt}\n\nUser Question: {query}"

            answer = ai_client.get_response(full_prompt)
            return str(answer)

        except Exception as e:
            print(f"❌ RAGAgent.get_answer error: {e}")
            return f"An error occurred while searching the document: {str(e)}"

# Singleton instance
rag_agent = RAGAgent()
