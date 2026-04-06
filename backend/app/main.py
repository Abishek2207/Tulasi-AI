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

# Core imports kept at top level for FastAPI instance
# Route and model imports moved into lifespan or inclusion functions for speed

# ── CORS origins — defined at module level so exception handlers can reference it ──
ALLOW_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://tulasiai.vercel.app",
    "https://tulasi-ai.vercel.app",
    "https://tulasi-ai-hycl.onrender.com",
    "https://tulasiai.in",
    "https://www.tulasiai.in",
]

# ── Track startup time ─────────────────────────────────────────────
_START_TIME = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio

    print("🚀 Tulasi AI v3.0 — Starting up (Fast-Path)...")

    # Run all heavy init in the background to ensure port-bind within < 1 second.
    async def run_migrations_in_background():
        import asyncio
        from app.core.database import init_db
        try:
            # We defer all database-heavy logic until AFTER the app is listening
            await asyncio.sleep(1) 
            await asyncio.to_thread(init_db)
            print("✅ Database initialised (Background)")
        except Exception as e:
            print(f"❌ Deferred Init Failed: {e}")

    asyncio.create_task(run_migrations_in_background())

    print("✅ Tulasi AI v3.0 — Backend ready (Port Bound)!")
    yield
    print("🛑 Tulasi AI — Shutting down...")


# ── FastAPI App ────────────────────────────────────────────────────
app = FastAPI(
    title="Tulasi AI API",
    description="Production-grade AI learning platform backend",
    version="3.0.3",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter, _rate_limit_exceeded_handler

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


from fastapi.exceptions import RequestValidationError, HTTPException

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    origin = request.headers.get("origin", "*")
    headers = {"Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true"} if origin in ALLOW_ORIGINS else {}
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": "Bad Request",
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
    from fastapi.responses import PlainTextResponse
    import traceback
    tb = traceback.format_exc()
    error_msg = f"❌ CRITICAL ERROR on {request.method} {request.url}"
    print(f"{error_msg}:\n{tb}")
    
    # Check if it's an import error which often causes 503/500 on startup
    if isinstance(exc, ImportError):
        print("🚩 Detected ImportError — This usually indicates a missing dependency in requirements.txt")

    origin = request.headers.get("origin", "*")
    # For error transparency, we allow the requesting origin if it looks like our app
    is_valid_origin = origin in ALLOW_ORIGINS or ".vercel.app" in origin
    headers = {"Access-Control-Allow-Origin": origin if is_valid_origin else "https://tulasiai.vercel.app", "Access-Control-Allow-Credentials": "true"}
    
    # Returning plain text traceback with CORS headers to avoid silent browser blockers
    return PlainTextResponse(
        content=f"--- TULASI AI: CRITICAL BACKEND ERROR ---\n\n{tb}\n\nCheck Render logs for dependency or environment conflicts.",
        status_code=500,
        headers=headers
    )


# ── CORS Middleware (origins already defined above) ────────────────────────────────
# Allow all origins in production so Render backend works with any frontend
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

    # if duration > 500:
    #     print(f"⚠️ [SLOW DB/API Action] {request.method} {request.url.path} took {duration}ms")

    print(
        f"[Backend Request] 📡 {request.method} {request.url.path} "
        f"→ {response.status_code} ({duration} ms)"
    )

    return response


# ── Routers (Lazy-Loaded to speed up cold starts) ────────────────────────
from app.api import auth, chat, interview, roadmap, hackathons, code, certificates, admin, messages, startup, activity, resume, study, groups, stripe, payment, reviews, users, pdf, next_action, internships, system_design, prep_plan, rag, daily_challenge, feed, mentor, follow

app.include_router(auth.router,         prefix="/api/auth",         tags=["Authentication"])
app.include_router(chat.router,         prefix="/api/chat",         tags=["AI Chat"])
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
app.include_router(follow.router,       prefix="/api/follow",       tags=["Follow System"])

# Social, Feed and Mentor integration
app.include_router(feed.router,         prefix="/api/feed",         tags=["Idea Feed"])
app.include_router(mentor.router,       prefix="/api/mentor",       tags=["AI Mentor"])


# Super Intelligence Layer (V2 Overwrite)
from app.api import intelligence_v2
app.include_router(intelligence_v2.router, prefix="/api/intel", tags=["Super Intelligence"])

app.include_router(pdf.router,          prefix="/api/pdf",          tags=["Document Q&A"])
app.include_router(next_action.router,  prefix="/api/next-action",  tags=["Next Action Engine"])
app.include_router(internships.router,  prefix="/api/internships",  tags=["Internship Discovery"])
app.include_router(system_design.router,  prefix="/api/system-design",  tags=["System Design Module"])
app.include_router(prep_plan.router,      prefix="/api/prep-plan",      tags=["Prep Plan"])
app.include_router(rag.router,            prefix="/api/rag",            tags=["Knowledge Base"])
app.include_router(daily_challenge.router, prefix="/api/daily-challenge", tags=["ORBIT DAILY"])

# ── WebSocket Router (Standard Legacy Support) ──────────────────────
from app.api import ws as ws_router
from app.websockets import signaling
app.include_router(ws_router.router, tags=["WebSocket Chat"])
app.include_router(signaling.router, prefix="/api/voice/signal", tags=["WebRTC Signaling"])


# ── Socket.io Implementation (Advanced Real-time) ───────────────────
from app.core.socket_server import socket_app
app.mount("/socket.io", socket_app)


# ── Root Endpoint ──────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "TulasiAI Backend Running 🚀"
    }

@app.get("/api")
def api_root():
    return {
        "name": "Tulasi AI API",
        "version": "3.0.3",
        "status": "running",
        "docs": "/api/docs",
        "health": "/api/health"
    }

@app.get("/docs", include_in_schema=False)
def docs_redirect():
    """Redirects /docs to the actual docs URL /api/docs"""
    return RedirectResponse(url="/api/docs")


# ── Health Check ───────────────────────────────────────────────────
@app.get("/api/health")
@app.get("/health")
@app.get("/api/status")
def health():
    uptime = int(time.time() - _START_TIME)
    from app.core.database import engine
    from sqlalchemy import text
    db_status = "connected"
    db_detail = "Ready"
    try:
        if engine:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        else:
            db_status = "unreachable"
            db_detail = "Engine is None (check DATABASE_URL)"
    except Exception as e:
        db_status = "error"
        db_detail = f"Unreachable: {str(e)}"
        print(f"❌ Database Health Check Failed: {e}")

    return {
        "status": "ok" if db_status == "connected" else "error",
        "api": "Tulasi AI Backend v3.1.2",
        "db": db_status,
        "db_detail": db_detail,
        "uptime_seconds": uptime,
        "environment": "production" if "render" in str(engine.url) else "development" if engine else "error-state"
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