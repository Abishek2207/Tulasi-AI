from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import sys

# Use absolute imports for reliability
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routers import (
    auth, chat, leetcode, youtube, interview, certificates, resume, groups
)

app = FastAPI(title="Tulasi AI Backend", version="1.0.0")

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

# Include Routers with Prefixes as requested
app.include_router(auth.router, prefix="/auth")
app.include_router(chat.router, prefix="/chat")
app.include_router(leetcode.router, prefix="/leetcode")
app.include_router(youtube.router, prefix="/youtube")
app.include_router(interview.router, prefix="/interview")
app.include_router(certificates.router, prefix="/certificate")
app.include_router(resume.router, prefix="/resume")
app.include_router(groups.router, prefix="/groups")

@app.get("/")
async def root():
    return {"status": "online", "message": "Tulasi AI Backend v1.0.0"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
