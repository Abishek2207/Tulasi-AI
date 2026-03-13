class RAGAgent:
    def __init__(self):
        self._retriever = None
        self._system_prompt = (
            "You are an AI learning assistant for Tulasi AI. "
            "Use the given context to answer the user's question accurately. "
            "If you don't know the answer, say you don't know. "
            "Context: {context}"
        )
        
    @property
    def retriever(self):
        if self._retriever is None:
            from app.services.ai_agents.vector_store.faiss_store import vector_store_manager
            store = vector_store_manager.get_or_create_vector_store()
            self._retriever = store.as_retriever(search_kwargs={"k": 3})
        return self._retriever
        
    def get_answer(self, query: str):
        from langchain.chains import create_retrieval_chain
        from langchain.chains.combine_documents import create_stuff_documents_chain
        from langchain_core.prompts import ChatPromptTemplate
        from app.services.ai_agents.router.model_router import ai_router
        
        llm = ai_router.get_best_model("complex_reasoning")
        if not llm:
            return "No suitable AI model is configured. Please provide API keys."
            
        prompt = ChatPromptTemplate.from_messages([
            ("system", self._system_prompt),
            ("human", "{input}"),
        ])
        
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(self.retriever, question_answer_chain)
        
        response = rag_chain.invoke({"input": query})
        return response["answer"]

# Singleton instance
rag_agent = RAGAgent()
