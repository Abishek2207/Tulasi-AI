class RAGAgent:
    def __init__(self):
        self._retriever = None
        self._system_prompt = (
            "You are an AI learning assistant for Tulasi AI. "
            "Use the given context to answer the user's question accurately. "
            "If the context doesn't contain enough information, say so clearly. "
            "Context: {context}"
        )

    @property
    def retriever(self):
        if self._retriever is None:
            try:
                from app.services.ai_agents.vector_store.faiss_store import vector_store_manager
                store = vector_store_manager.get_or_create_vector_store()
                self._retriever = store.as_retriever(search_kwargs={"k": 3})
            except Exception as e:
                print(f"⚠️  RAGAgent: Failed to load vector store: {e}")
                return None
        return self._retriever

    def reset_retriever(self):
        """Call this after new documents are uploaded to refresh the retriever."""
        self._retriever = None

    def get_answer(self, query: str) -> str:
        """Return an answer grounded in the vector store. Falls back gracefully on any error."""
        try:
            from langchain.chains import create_retrieval_chain
            from langchain.chains.combine_documents import create_stuff_documents_chain
            from langchain_core.prompts import ChatPromptTemplate
            from app.services.ai_agents.router.model_router import ai_router

            llm = ai_router.get_best_model("complex_reasoning")
            if not llm:
                return "No AI model is available. Please configure GOOGLE_API_KEY or GROQ_API_KEY."

            retriever = self.retriever
            if retriever is None:
                return "The document knowledge base is not ready. Please upload a PDF first."

            prompt = ChatPromptTemplate.from_messages([
                ("system", self._system_prompt),
                ("human", "{input}"),
            ])

            question_answer_chain = create_stuff_documents_chain(llm, prompt)
            rag_chain = create_retrieval_chain(retriever, question_answer_chain)

            response = rag_chain.invoke({"input": query})
            answer = response.get("answer", "")
            if not answer:
                return "I couldn't find a relevant answer in the document. Try rephrasing your question."
            return answer

        except Exception as e:
            print(f"❌ RAGAgent.get_answer error: {e}")
            return f"An error occurred while searching the document: {str(e)}"


# Singleton instance
rag_agent = RAGAgent()
