"""
Tulasi AI — Clean Production FastAPI Backend
=========================================
Endpoint:   POST /api/chat
Model:      gemini-1.5-flash (standard Google Generative AI SDK)
Deploy:     Render.com compatible
"""

from contextlib import asynccontextmanager
import os
import time
import uuid

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional

from dotenv import load_dotenv

# ── Load env ───────────────────────────────────────────────────────
load_dotenv()

_START_TIME = time.time()


# ── Lifespan ───────────────────────────────────────────────────────
import threading
import time
import urllib.request
from app.core.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Tulasi AI — Starting up...")
    
    # Phase 2: Move DB init to background thread (prevent Render/Railway timeout)
    def bg_init_db():
        try:
            init_db()
            print("✅ Background DB init complete.")
        except Exception as e:
            print(f"⚠️ Background DB init failed gracefully: {e}")
            
    threading.Thread(target=bg_init_db, daemon=True).start()
    
    # Railway Keep-Alive Thread
    def keep_alive():
        while True:
            try:
                # Ping our own health check every 14 minutes
                time.sleep(840)
                urllib.request.urlopen("https://tulasiai.up.railway.app/api/health", timeout=10)
                print("💓 Keep-alive ping successful")
            except Exception as e:
                print(f"⚠️ Keep-alive ping failed: {e}")
                
    threading.Thread(target=keep_alive, daemon=True).start()
    
    yield
    print("🛑 Tulasi AI — Shutting down...")


# ── App ────────────────────────────────────────────────────────────
app = FastAPI(
    title="Tulasi AI API",
    description="Production-grade AI learning platform backend",
    version="3.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Error Handlers ─────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "message": "Validation failed."},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    print(f"❌ Unhandled error on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": str(exc)},
    )


# ── Request Logger ─────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    ms = (time.time() - start) * 1000
    print(f"📡 {request.method} {request.url.path} → {response.status_code} ({ms:.1f}ms)")
    return response


# ── Routers ────────────────────────────────────────────────────────
from app.api import auth, chat, pdf, interview, roadmap, hackathons
from app.api import code, certificates, admin, messages, startup, activity, resume, study
from app.core.database import init_db
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter, _rate_limit_exceeded_handler

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(auth.router,         prefix="/api/auth",         tags=["Auth"])
app.include_router(chat.router,         prefix="/api/chat",         tags=["AI Chat"])
app.include_router(pdf.router,          prefix="/api/pdf",          tags=["PDF Q&A"])
app.include_router(interview.router,    prefix="/api/interview",    tags=["Interview"])
app.include_router(roadmap.router,      prefix="/api/roadmap",      tags=["Roadmaps"])
app.include_router(hackathons.router,   prefix="/api/hackathons",   tags=["Hackathons"])
app.include_router(code.router,         prefix="/api/code",         tags=["Code"])
app.include_router(certificates.router, prefix="/api/certificates", tags=["Certificates"])
app.include_router(messages.router,     prefix="/api/messages",     tags=["Messages"])
app.include_router(startup.router,      prefix="/api/startup",      tags=["Startup"])
app.include_router(admin.router,        prefix="/api/admin",        tags=["Admin"])
app.include_router(activity.router,     prefix="/api/activity",     tags=["Activity"])
app.include_router(resume.router,       prefix="/api/resume",       tags=["Resume"])
app.include_router(study.router,        prefix="/api/study",        tags=["Study"])

from app.api import ws as ws_router
app.include_router(ws_router.router, tags=["WebSocket"])


# ── Root ───────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "name": "Tulasi AI API",
        "status": "running",
        "version": "3.0.0",
        "docs": "/api/docs",
    }


# ── Health ─────────────────────────────────────────────────────────
@app.get("/api/health")
@app.get("/health")
@app.get("/api/status")
def health():
    return {
        "status": "ok",
        "uptime_seconds": int(time.time() - _START_TIME),
        "model": "gemini-1.5-flash",
    }


@app.get("/api/ping")
def ping():
    return {"ping": "pong"}


@app.get("/api/cron")
def cron_keep_alive():
    """Endpoint for external cron jobs to ping and keep the server awake."""
    return {
        "status": "awake",
        "time": int(time.time()),
        "message": "Cron ping successful"
    }


# ── Local Dev ─────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
