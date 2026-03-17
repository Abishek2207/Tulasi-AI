import os

# Database folder is moved into backend/
FAISS_INDEX_DIR = os.path.join(os.path.dirname(__file__), '../../../../database/faiss')

# Resolve API key once at module level
_GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or ""


class VectorStoreManager:
    def __init__(self):
        self._embeddings = None
        self.index_path = os.path.join(FAISS_INDEX_DIR, "index")

    @property
    def embeddings(self):
        if self._embeddings is None:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            self._embeddings = GoogleGenerativeAIEmbeddings(
                model="models/text-embedding-004",
                google_api_key=_GOOGLE_API_KEY or None,  # None = use GOOGLE_API_KEY env var
            )
        return self._embeddings

    def get_or_create_vector_store(self):
        from langchain_community.vectorstores import FAISS
        if os.path.exists(self.index_path) and os.listdir(self.index_path):
            try:
                return FAISS.load_local(
                    self.index_path, self.embeddings,
                    allow_dangerous_deserialization=True
                )
            except Exception as e:
                print(f"⚠️  FAISS load failed (index may be stale): {e}. Recreating...")
                import shutil
                shutil.rmtree(self.index_path, ignore_errors=True)

        # Create a fresh store
        os.makedirs(self.index_path, exist_ok=True)
        store = FAISS.from_texts(["Tulasi AI knowledge base initialized."], self.embeddings)
        store.save_local(self.index_path)
        print("✅ FAISS index created fresh.")
        return store

    def add_texts(self, texts, metadatas=None):
        store = self.get_or_create_vector_store()
        store.add_texts(texts, metadatas=metadatas)
        store.save_local(self.index_path)

    def process_document(self, text: str, metadata: dict = None):
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        chunks = text_splitter.split_text(text)
        metadatas = [metadata] * len(chunks) if metadata else None
        self.add_texts(chunks, metadatas)
        print(f"✅ Indexed {len(chunks)} chunks into FAISS.")


# Singleton instance
vector_store_manager = VectorStoreManager()
