from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from typing import Optional

# Import Routers
from routers import auth, chat, code, interview, leetcode, youtube, roadmap, groups, resume, certificates, notes, hackathons, activity, leaderboard

app = FastAPI(title="TulasiAI API", version="2.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files for Certificates/Uploads
os.makedirs("assets/certificates", exist_ok=True)
os.makedirs("assets/uploads", exist_ok=True)
app.mount("/files", StaticFiles(directory="assets"), name="assets")

# Include Routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(code.router)
app.include_router(interview.router)
app.include_router(leetcode.router)
app.include_router(youtube.router)
app.include_router(roadmap.router)
app.include_router(groups.router)
app.include_router(resume.router)
app.include_router(certificates.router)
app.include_router(notes.router)
app.include_router(hackathons.router)
app.include_router(activity.router)
app.include_router(leaderboard.router)

@app.get("/")
async def root():
    return {"status": "online", "message": "TulasiAI Advanced API v2.0"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
