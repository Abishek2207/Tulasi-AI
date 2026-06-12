from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
import os

# Example stub for vector store.
# In a real startup environment, we would inject embeddings and search them.

qdrant_url = os.environ.get("QDRANT_URL", "http://localhost:6333")
qdrant_api_key = os.environ.get("QDRANT_API_KEY", "")

def get_qdrant_client() -> QdrantClient:
    try:
        return QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
    except Exception as e:
        print(f"Failed to connect to Qdrant: {e}")
        return None

def init_vector_db():
    client = get_qdrant_client()
    if client:
        try:
            collections = [c.name for c in client.get_collections().collections]
            if "skills_market" not in collections:
                client.create_collection(
                    collection_name="skills_market",
                    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
                )
        except Exception as e:
            print(f"Error initializing Qdrant collections: {e}")

# Call init_vector_db() on startup in main.py
