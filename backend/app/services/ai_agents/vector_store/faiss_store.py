import os

# Database folder is moved into backend/
FAISS_INDEX_DIR = os.path.join(os.path.dirname(__file__), '../../../../database/faiss')

class VectorStoreManager:
    def __init__(self):
        self._embeddings = None
        self.index_path = os.path.join(FAISS_INDEX_DIR, "index")
    
    @property
    def embeddings(self):
        if self._embeddings is None:
            from langchain_huggingface import HuggingFaceEmbeddings
            self._embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        return self._embeddings
        
    def get_or_create_vector_store(self):
        from langchain_community.vectorstores import FAISS
        if os.path.exists(self.index_path) and os.listdir(self.index_path):
            return FAISS.load_local(self.index_path, self.embeddings, allow_dangerous_deserialization=True)
        else:
            # Create empty if not exists with a dummy doc
            os.makedirs(self.index_path, exist_ok=True)
            store = FAISS.from_texts(["Init"], self.embeddings)
            store.save_local(self.index_path)
            return store
            
    def add_texts(self, texts, metadatas=None):
        store = self.get_or_create_vector_store()
        store.add_texts(texts, metadatas=metadatas)
        store.save_local(self.index_path)
        
    def process_document(self, text, metadata=None):
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        chunks = text_splitter.split_text(text)
        metadatas = [metadata] * len(chunks) if metadata else None
        self.add_texts(chunks, metadatas)

# Singleton instance
vector_store_manager = VectorStoreManager()
