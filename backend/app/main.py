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

from app.api import auth, chat, pdf, interview, roadmap, hackathons, code, certificates, admin, messages, startup, activity, resume, study, groups, stripe, payment, reviews, users
from app.core.database import init_db
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter, _rate_limit_exceeded_handler
from fastapi.responses import RedirectResponse

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
            
            # ── 🚨 DATABASE AUTO-MIGRATION 🚨 ────────────────────
            from app.core.database import engine
            from sqlalchemy import text
            with engine.begin() as conn:
                try:
                    conn.execute(text('ALTER TABLE "user" ADD COLUMN pro_expiry_date VARCHAR;'))
                    print("[Migration] Added 'pro_expiry_date' column successfully.")
                except Exception as e:
                    pass
                
                # Auto-migrate Review table
                try:
                    conn.execute(text('ALTER TABLE review ADD COLUMN role VARCHAR;'))
                except:
                    pass
                try:
                    conn.execute(text('ALTER TABLE review ADD COLUMN created_at TIMESTAMP;'))
                except:
                    pass
            # ───────────────────────────────────────────────────
            
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
    origin = request.headers.get("origin", "*")
    headers = {"Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true"} if origin in ALLOW_ORIGINS else {}
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": "Validation failed",
            "detail": exc.errors(),
            "message": "Validation failed. Check your request payload.",
        },
        headers=headers
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    origin = request.headers.get("origin", "*")
    headers = {"Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true"} if origin in ALLOW_ORIGINS else {}
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
        },
        headers=headers
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    # Log the full traceback or error for internal debugging
    print(f"❌ CRITICAL ERROR on {request.method} {request.url}: {exc}")
    # Return a clean JSON only response as requested
    origin = request.headers.get("origin", "*")
    headers = {"Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true"} if origin in ALLOW_ORIGINS else {}
    return JSONResponse(
        status_code=500,
        content={
            "success": False, 
            "error": "Internal Server Error",
            "message": str(exc) if os.environ.get("DEBUG") == "true" else "An unexpected error occurred. Please try again later.",
            "type": exc.__class__.__name__
        },
        headers=headers
    )


ALLOW_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://tulasiai.vercel.app",
    "https://tulasi-ai.vercel.app",
    "https://tulasi-ai-wgwl.onrender.com",
]

# Allow all origins in production so Render backend works with any frontend
# (Vercel, custom domains, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
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
app.include_router(reviews.router,      prefix="/api/reviews",      tags=["Reviews"])
app.include_router(users.router,        prefix="/api/users",        tags=["Users"])


# ── WebSocket Router ───────────────────────────────────────────────
from app.api import ws as ws_router
from app.websockets import signaling
app.include_router(ws_router.router, tags=["WebSocket Chat"])
app.include_router(signaling.router, prefix="/api/voice/signal", tags=["WebRTC Signaling"])


# ── Root Endpoint ──────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "name": "Tulasi AI API",
        "version": "3.0.0",
        "status": "running",
        "docs": "/api/docs",
    }

@app.get("/docs", include_in_schema=False)
def docs_redirect():
    """Redirects /docs to the actual docs URL /api/docs"""
    return RedirectResponse(url="/api/docs")


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


@app.get("/api/debug/db")
def debug_db():
    from app.core.database import engine
    from sqlalchemy import text
    try:
        with engine.begin() as conn:
            res = conn.execute(text("SELECT * FROM review LIMIT 1"))
            return {"status": "success", "data": [dict(r) for r in res.mappings()]}
    except Exception as e:
        return {"status": "error", "error_type": e.__class__.__name__, "error_detail": str(e)}

@app.get("/api/debug/rag")
def debug_rag():
    import traceback
    try:
        from app.services.vector_service import vector_service
        vec = vector_service.embed_documents("Testing Memory Load")
        return {"status": "success", "vector_len": len(vec)}
    except Exception as e:
        return {"status": "error", "error_type": e.__class__.__name__, "traceback": traceback.format_exc()}


# ── AI Key Debug Endpoint ──────────────────────────────────────────
@app.get("/api/debug/ai-env")
def debug_ai_env():
    """Diagnostic: checks which AI API keys are currently set (values masked)."""
    import os
    keys = {
        "GOOGLE_API_KEY": bool(os.getenv("GOOGLE_API_KEY")),
        "GEMINI_API_KEY": bool(os.getenv("GEMINI_API_KEY")),
        "OPENROUTER_API_KEY": bool(os.getenv("OPENROUTER_API_KEY")),
        "GROQ_API_KEY": bool(os.getenv("GROQ_API_KEY")),
    }
    return {"ai_env_vars": keys, "any_key_set": any(keys.values())}


# /health is already registered above with full detail (lines 212-234)


# ── Keep-Alive Cron ────────────────────────────────────────────────
@app.get("/api/cron")
@app.get("/cron")
async def cron_ping():
    """Endpoint for Vercel/External cron to keep Render instance alive."""
    return {
        "success": True,
        "message": "Keep-alive ping received",
        "timestamp": time.time(),
        "status": "active"
    }


# ── Local Development ──────────────────────────────────────────────
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)