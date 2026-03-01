import sys
import os
import pydantic

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Graceful imports - don't crash if optional modules fail
try:
    from database import get_db, create_user, save_chat_history
except Exception as e:
    print(f"Warning: database module failed to load: {e}")
    def get_db(): yield None
    def create_user(*args, **kwargs): return None
    def save_chat_history(*args, **kwargs): return None

try:
    from core.ai_engine import chat_with_tulasiai, process_pdf_for_rag
except Exception as e:
    print(f"Warning: AI engine failed to load: {e}")
    def chat_with_tulasiai(message="", **kwargs):
        return "AI engine is still initializing. Please check server logs."
    def process_pdf_for_rag(*args, **kwargs): return None

try:
    from services.leetcode import fetch_leetcode_stats
except Exception as e:
    print(f"Warning: leetcode service failed to load: {e}")
    async def fetch_leetcode_stats(username): return {"error": "Service unavailable"}

try:
    from services.youtube import get_educational_videos
except Exception as e:
    print(f"Warning: youtube service failed to load: {e}")
    def get_educational_videos(**kwargs): return []

app = FastAPI(
    title="TulasiAI Backend",
    description="The intelligent backend powering the TulasiAI educational ecosystem.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuthRequest(BaseModel):
    user_id: str
    email: str
    name: str

@app.post("/api/auth/login")
async def sync_user(request: AuthRequest, db: Session = Depends(get_db)):
    """Syncs Firebase/Auth provider user into our SQLite/Supabase DB."""
    try:
        user = create_user(db, request.email, request.user_id, request.name)
        if user:
            return {"status": "success", "message": "User synced successfully", "streak": user.streak}
        return {"status": "success", "message": "User already exists"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    message: str
    user_id: str = "demo_student"
    context: str = ""

@app.get("/")
async def root():
    return {"message": "Welcome to the TulasiAI API", "status": "online"}

@app.post("/api/chat")
async def chat_interaction(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        # Save user message
        if db: save_chat_history(db, request.user_id, request.message, "user")
        
        ai_response = chat_with_tulasiai(
            message=request.message, 
            user_id=request.user_id, 
            context=request.context,
            db_session=db
        )
        
        # Save AI response
        if db: save_chat_history(db, request.user_id, ai_response, "ai")
        return {"response": ai_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class InterviewRequest(BaseModel):
    user_id: str
    action: str
    topic: str = ""
    difficulty: str = ""
    answer: str = ""

@app.post("/api/interview")
async def mock_interview(request: InterviewRequest):
    try:
        session_id = f"interview_{request.user_id}"
        
        if request.action == "start":
            prompt = f"Start a {request.difficulty} level mock interview on {request.topic}. Ask me the first question and wait for my answer. Do not give the answer."
            response = chat_with_tulasiai(message=prompt, user_id=session_id)
            return {"response": response, "session_id": session_id}
            
        elif request.action == "answer":
            prompt = f"My answer is: {request.answer}. Evaluate my answer, give a score out of 10, explain why, and then ask the NEXT question."
            response = chat_with_tulasiai(message=prompt, user_id=session_id)
            return {"response": response, "session_id": session_id}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-document")
async def upload_document(file: UploadFile = File(...), user_id: str = Form("default_user")):
    file_location = f"temp_{user_id}_{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
        
    try:
        process_pdf_for_rag(file_location, user_id)
        status_msg = f"'{file.filename}' uploaded and indexed successfully! You can now ask questions about its content."
    except Exception as e:
        print(f"RAG Processing Error: {e}")
        status_msg = f"'{file.filename}' uploaded, but indexing encountered an issue. Basic chat is still available."

    if os.path.exists(file_location):
        os.remove(file_location)
        
    return {"filename": file.filename, "status": status_msg}

@app.get("/api/leetcode/stats/{username}")
async def get_leetcode_stats_route(username: str):
    return await fetch_leetcode_stats(username)

@app.get("/api/youtube/videos")
async def get_youtube_videos_route(query: str = "software engineering tutorial", limit: int = 10):
    return get_educational_videos(query=query, limit=limit)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
