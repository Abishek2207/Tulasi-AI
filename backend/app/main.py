import sys
import os

# ── [HOTFIX] SQLAlchemy 2.0 + Python 3.13 compatibility ──
try:
    import sqlalchemy.sql.elements as sqlalchemy_elements
    if hasattr(sqlalchemy_elements, "TypingOnly"):
        # The base class TypingOnly in some SQLAlchemy versions asserts that inheriting 
        # classes have no extra attributes. Python 3.13+ injects __firstlineno__ 
        # and __static_attributes__, triggering a false-positive AssertionError.
        sqlalchemy_elements.TypingOnly.__init_subclass__ = classmethod(lambda cls, **kwargs: None)
        print("🔧 Applied SQLAlchemy TypingOnly hotfix for Python 3.13")
except Exception as e:
    print(f"⚠️ SQLAlchemy Hotfix failed: {e}")

# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.gzip import GZipMiddleware
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
    "https://tulasiai.in",
    "https://tulasi-ai.vercel.app",
    "https://tulasi-ai-soda.onrender.com",
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

    async def keep_awake():
        import httpx
        import asyncio
        url = "https://tulasi-ai-soda.onrender.com/api/ping"
        while True:
            await asyncio.sleep(300)  # Ping every 5 mins — prevents 15-min Render sleep
            try:
                async with httpx.AsyncClient() as client:
                    await client.get(url, timeout=10.0)
                print(f"🔄 Keep-awake ping sent to {url}")
            except Exception as e:
                print(f"⚠️ Keep-awake ping failed: {e}")

    asyncio.create_task(run_migrations_in_background())
    asyncio.create_task(keep_awake())

    print("✅ Tulasi AI v3.0 — Backend ready (Port Bound)!")
    yield
    print("🛑 Tulasi AI — Shutting down...")


# ── FastAPI App ────────────────────────────────────────────────────
from app.core.logger import LoggingMiddleware, logger

app = FastAPI(
    title="Tulasi AI Orbit API",
    description="Centralized intelligence and platform API.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

app.add_middleware(LoggingMiddleware)

from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter, _rate_limit_exceeded_handler

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


from app.core.exceptions import setup_exception_handlers, ALLOW_ORIGINS
from app.api.router import api_router

setup_exception_handlers(app)

# ── CORS Middleware (origins already defined above) ────────────────────────────────
# Allow all origins in production so Render backend works with any frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Performance Optimizations ──────────────────────────────────────
# Compress large JSON responses (Hackathons, Reviews, Feed)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# ── Security Hardening (Phase 15) ──────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "frame-ancestors 'none'"
    return response

# Include all API routes from centralized router
app.include_router(api_router)

# ── Socket.io Implementation (Advanced Real-time) ───────────────────
from app.core.socket_server import socket_app
app.mount("/socket.io", socket_app)

# ── Static Media Files (Allows Media Uploads to Load) ───────────────
from fastapi.staticfiles import StaticFiles
os.makedirs("data/chat_media", exist_ok=True)
app.mount("/data", StaticFiles(directory="data"), name="data")



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


# ── Health Check & Integration Status ────────────────────────────────
@app.get("/api/health")
@app.get("/health")
@app.get("/api/status")
def health():
    uptime = int(time.time() - _START_TIME)
    from app.core.database import engine
    from sqlalchemy import text
    import os
    
    db_status = "connected"
    db_detail = "Ready"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = "error"
        db_detail = f"Unreachable: {str(e)}"
        print(f"❌ Database Health Check Failed: {e}")

    # Check external integrations
    integrations = {
        "ai": bool(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")),
        "github": True, # Public API now used without token
        "jobs": True, # Uses Free RemoteOK, optional Adzuna/Jooble
        "hackathons": True, # Uses Free Devpost RSS
        "database": db_status == "connected"
    }

    return {
        "status": "ok" if db_status == "connected" else "error",
        "api": "Tulasi AI Backend v3.1.2",
        "db": db_status,
        "db_detail": db_detail,
        "uptime_seconds": uptime,
        "environment": "production" if "render" in str(engine.url) else "development" if engine else "error-state",
        "integrations": integrations
    }


@app.get("/api/ping")
@app.get("/ping")
def ping():
    return {"ping": "pong", "uptime_seconds": int(time.time() - _START_TIME)}


@app.get("/api/health/db")
def health_db():
    """Strict database health check — returns 200 ONLY when DB is genuinely reachable."""
    from app.core.database import engine
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected", "message": "Database is healthy."}
    except Exception as e:
        print(f"❌ /api/health/db check failed: {e}")
        raise HTTPException(status_code=503, detail=f"Database unreachable: {str(e)}")


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
    """Diagnostic: checks which API keys are currently set (values masked)."""
    import os
    keys = {
        "OPENAI_API_KEY": bool(os.getenv("OPENAI_API_KEY")),
        "GOOGLE_API_KEY": bool(os.getenv("GOOGLE_API_KEY")),
        "GEMINI_API_KEY": bool(os.getenv("GEMINI_API_KEY")),
        "OPENROUTER_API_KEY": bool(os.getenv("OPENROUTER_API_KEY")),
        "GROQ_API_KEY": bool(os.getenv("GROQ_API_KEY")),
        "GITHUB_TOKEN": bool(os.getenv("GITHUB_TOKEN")),
        "ADZUNA_APP_ID": bool(os.getenv("ADZUNA_APP_ID")),
        "JOOBLE_API_KEY": bool(os.getenv("JOOBLE_API_KEY")),
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
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)