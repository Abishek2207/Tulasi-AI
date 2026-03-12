from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api import auth, chat, pdf, interview, roadmap, hackathons, code, certificates, admin, messages, startup, activity
from app.core.database import init_db

app = FastAPI(
    title="Tulasi AI API",
    description="Production-grade AI learning platform backend",
    version="3.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS — allow frontend (localhost dev + Vercel deployments)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://tulasiai.vercel.app",
        "https://frontend-eight-tan-33.vercel.app",
        "https://tulasi-frontend.onrender.com",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers
app.include_router(auth.router,         prefix="/api/auth",         tags=["Authentication"])
app.include_router(chat.router,         prefix="/api/chat",         tags=["AI Chat"])
app.include_router(pdf.router,          prefix="/api/pdf",          tags=["PDF Q&A"])
app.include_router(interview.router,    prefix="/api/interview",    tags=["Mock Interview"])
app.include_router(roadmap.router,      prefix="/api/roadmap",      tags=["Roadmaps"])
app.include_router(hackathons.router,   prefix="/api/hackathons",   tags=["Hackathons"])
app.include_router(code.router,         prefix="/api/code",         tags=["Code Practice"])
app.include_router(certificates.router, prefix="/api/certificates", tags=["Certificates"])
app.include_router(messages.router,     prefix="/api/messages",     tags=["Messages"])
app.include_router(startup.router,      prefix="/api/startup",      tags=["Startup Lab"])
app.include_router(admin.router,        prefix="/api/admin",        tags=["Admin"])
app.include_router(activity.router,     prefix="/api/activity",     tags=["Activity & Streaks"])

# Startup event
@app.on_event("startup")
async def startup():
    try:
        init_db()
        print("✅ Tulasi AI v3.0 — Backend started!")
        print("📖 API Docs: /api/docs")
    except Exception as e:
        print("❌ Database init failed:", e)

# Root endpoint
@app.get("/")
def root():
    return {
        "name": "Tulasi AI API",
        "version": "3.0.0",
        "status": "running"
    }

# Health check (important for Render)
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "version": "3.0.0"
    }

@app.get("/ping")
def ping():
    return "pong"

# Local run
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=10000)