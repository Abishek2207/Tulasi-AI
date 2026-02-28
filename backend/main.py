from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from pydantic import BaseModel

# Internal imports
from database import create_user, save_chat_history
from core.ai_engine import chat_with_tulasiai, process_pdf_for_rag
from services.leetcode import fetch_leetcode_stats
from services.youtube import get_educational_videos

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

class ChatRequest(BaseModel):
    message: str
    user_id: str = "demo_student"
    context: str = ""

@app.get("/")
async def root():
    return {"message": "Welcome to the TulasiAI API", "status": "online"}

@app.post("/api/chat")
async def chat_interaction(request: ChatRequest):
    try:
        # Acknowledge the user speaking
        # if using supabase: save_chat_history(request.user_id, request.message, "user")
        
        # Call the LangChain Engine
        ai_response = chat_with_tulasiai(
            message=request.message, 
            user_id=request.user_id, 
            context=request.context
        )
        
        # Save AI's reply
        # if using supabase: save_chat_history(request.user_id, ai_response, "ai")
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
    # Save the file temporarily
    file_location = f"temp_{user_id}_{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
        
    # Process with Langchain/FAISS (RAG)
    try:
        process_pdf_for_rag(file_location, user_id)
        status_msg = f"'{file.filename}' uploaded and indexed successfully! You can now ask questions about its content."
    except Exception as e:
        print(f"RAG Processing Error: {e}")
        status_msg = f"'{file.filename}' uploaded, but indexing encountered an issue. Basic chat is still available."

        
    # Clean up
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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
