from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any

from app.core.database import get_session
from app.api.auth import get_current_user
from app.models.models import User
from app.services.local_rag_core import local_rag_service

router = APIRouter()

class Document(BaseModel):
    type: str
    content: str

class IndexRequest(BaseModel):
    documents: List[Document]

class QueryRequest(BaseModel):
    query: str

@router.post("/index")
async def index_data(
    payload: IndexRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Index user data into FAISS. Handled in the background since embedding can be slow.
    """
    if not payload.documents:
        raise HTTPException(status_code=400, detail="No documents provided")
        
    doc_dicts = [{"type": doc.type, "content": doc.content} for doc in payload.documents]
    
    background_tasks.add_task(
        local_rag_service.index_user_data,
        str(current_user.id),
        doc_dicts
    )
    
    return {
        "status": "Indexing started in background",
        "documents_count": len(doc_dicts)
    }

@router.post("/query")
async def query_rag(
    payload: QueryRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Query the personal RAG agent.
    """
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    result = await local_rag_service.generate_answer(str(current_user.id), payload.query)
    
    return result
