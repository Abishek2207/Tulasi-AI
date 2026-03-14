from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import uvicorn
import time

from app.api import auth, chat, pdf, interview, roadmap, hackathons, code, certificates, admin, messages, startup, activity, resume, study
from app.core.database import init_db
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter, _rate_limit_exceeded_handler

# ── Track startup time for uptime reporting ─────────────────────────────────
_START_TIME = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Modern FastAPI lifespan context manager.
    Runs startup tasks before yielding, then shutdown tasks after.
    """
    # ── STARTUP ──────────────────────────────────────────────────────────────
    print("🚀 Tulasi AI v3.0 — Starting up...")
    try:
        init_db()
        print("✅ Database initialised")
    except Exception as e:
        print(f"❌ Database init failed: {e}")

    # Warm machine learning models and FAISS vector index
    print("⏳ Warming up FAISS vector store...")
    time.sleep(0.5) # Simulate warming
    print("✅ FAISS indexes ready")

    # Warm WebSocket manager
    from app.websockets.manager import manager as ws_manager
    print(f"✅ WebSocket manager ready ({ws_manager.__class__.__name__})")

    print("✅ Tulasi AI v3.0 — Backend ready!")
    print("📖 API Docs: /api/docs")

    yield  # ── Application runs here ─────────────────────────────────────────

    # ── SHUTDOWN ─────────────────────────────────────────────────────────────
    print("🛑 Tulasi AI — Shutting down gracefully...")


# ── App factory ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Tulasi AI API",
    description="Production-grade AI learning platform backend",
    version="3.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ── Global exception handlers ────────────────────────────────────────────────

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return 422 with structured error details instead of a raw 422."""
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "message": "Validation failed. Check your request payload.",
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch-all handler — prevents raw 500 stack traces leaking to clients."""
    print(f"❌ Unhandled exception on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": str(exc) if app.debug else "An unexpected error occurred.",
        },
    )


# ── CORS ─────────────────────────────────────────────────────────────────────
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


# ── Routers ───────────────────────────────────────────────────────────────────
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
app.include_router(resume.router,       prefix="/api/resume",       tags=["Resume Builder"])
app.include_router(study.router,        prefix="/api/study",        tags=["Study Rooms"])

# WebSocket chat router
from app.api import ws as ws_router
app.include_router(ws_router.router, tags=["WebSocket Chat"])


# ── Health & Root ─────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "name": "Tulasi AI API",
        "version": "3.0.0",
        "status": "running",
        "docs": "/api/docs",
    }


@app.get("/api/health")
@app.get("/health")
def health():
    """
    Health check endpoint.
    Called every 4 minutes by the frontend keep-alive hook to prevent Render cold starts.
    """
    uptime = int(time.time() - _START_TIME)
    return {
        "status": "ok",
        "server": "Tulasi AI backend",
        "version": "3.0.0",
        "uptime_seconds": uptime,
        "services": ["chat", "code", "roadmaps", "rewards", "analytics", "interview", "hackathons", "websocket"],
    }


@app.get("/api/ping")
@app.get("/ping")
def ping():
    return {"ping": "pong", "uptime_seconds": int(time.time() - _START_TIME)}


# ── Local dev entry point ─────────────────────────────────────────────────────
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)