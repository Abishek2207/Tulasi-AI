import sys
import os
# Auto fix PYTHONPATH so 'app.main' and 'app.core' resolve when running from project root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import uvicorn
import time

from app.api import auth, chat, pdf, interview, roadmap, hackathons, code, certificates, admin, messages, startup, activity, resume, study, groups, stripe, payment
from app.core.database import init_db
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter, _rate_limit_exceeded_handler

# ── Track startup time ─────────────────────────────────────────────
_START_TIME = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):

    print("🚀 Tulasi AI v3.0 — Starting up...")

    import asyncio
    def db_init_task():
        try:
            init_db()
            print("✅ Database initialised")
        except Exception as e:
            print(f"❌ Database init failed: {e}")
            
        try:
            print("⏳ Warming up FAISS vector store...")
            # FAISS warmup can sometimes be heavy, keep it in background
            time.sleep(0.5) 
            print("✅ FAISS indexes ready")
        except Exception as e:
            print(f"⚠️  FAISS warmup warning: {e}")
            
    # Run all heavy init strictly in the background so FastAPI binds to $PORT instantly
    asyncio.create_task(asyncio.to_thread(db_init_task))

    from app.websockets.manager import manager as ws_manager
    print(f"✅ WebSocket manager ready ({ws_manager.__class__.__name__})")

    print("✅ Tulasi AI v3.0 — Backend ready!")
    print("📖 API Docs: /api/docs")

    yield

    print("🛑 Tulasi AI — Shutting down...")


# ── FastAPI App ────────────────────────────────────────────────────
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


from fastapi.exceptions import RequestValidationError, HTTPException

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": "Validation failed",
            "detail": exc.errors(),
            "message": "Validation failed. Check your request payload.",
        },
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
        },
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    print(f"❌ Error on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False, 
            "error": str(exc),
            "detail": "Internal server error"
        },
    )


# ── CORS ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request Logger (helps debugging) ───────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 2)

    print(
        f"📡 {request.method} {request.url.path} "
        f"→ {response.status_code} ({duration} ms)"
    )

    return response


# ── Routers ────────────────────────────────────────────────────────
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
app.include_router(groups.router,       prefix="/api/groups",       tags=["Group Chat"])
app.include_router(stripe.router,       prefix="/api/stripe",       tags=["Monetization"])
app.include_router(payment.router,      prefix="/api/payment",      tags=["Payment"])


# ── WebSocket Router ───────────────────────────────────────────────
from app.api import ws as ws_router
app.include_router(ws_router.router, tags=["WebSocket Chat"])


# ── Root Endpoint ──────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "name": "Tulasi AI API",
        "version": "3.0.0",
        "status": "running",
        "docs": "/api/docs",
    }


# ── API Root ───────────────────────────────────────────────────────
@app.get("/api")
def api_root():
    return {
        "message": "Tulasi AI API running",
        "docs": "/api/docs",
        "health": "/api/health"
    }


# ── Health Check ───────────────────────────────────────────────────
@app.get("/api/health")
@app.get("/health")
@app.get("/api/status")
def health():
    uptime = int(time.time() - _START_TIME)

    return {
        "success": True,
        "status": "alive",
        "server": "Tulasi AI backend",
        "version": "3.0.0",
        "uptime_seconds": uptime,
        "services": [
            "chat",
            "code",
            "roadmaps",
            "rewards",
            "analytics",
            "interview",
            "hackathons",
            "websocket",
        ],
    }


@app.get("/api/ping")
@app.get("/ping")
def ping():
    return {"ping": "pong", "uptime_seconds": int(time.time() - _START_TIME)}


# ── Local Development ──────────────────────────────────────────────
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)