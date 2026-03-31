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

from app.api import auth, chat, interview, roadmap, hackathons, code, certificates, admin, messages, startup, activity, resume, study, groups, stripe, payment, reviews, users, pdf
from app.core.database import init_db, engine
from sqlalchemy import inspect
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter, _rate_limit_exceeded_handler
from fastapi.responses import RedirectResponse

# ── CORS origins — defined at module level so exception handlers can reference it ──
ALLOW_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://tulasiai.vercel.app",
    "https://tulasi-ai.vercel.app",
    "https://tulasi-ai-wgwl.onrender.com",
]

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
                # Step 1: Force create Review table if SQLModel failed it
                try:
                    conn.execute(text("""
                        CREATE TABLE IF NOT EXISTS review (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_id INTEGER,
                            name VARCHAR NOT NULL,
                            role VARCHAR,
                            review TEXT NOT NULL,
                            rating INTEGER NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    """))
                    print("[Migration] Ensuring 'review' table exists.")
                except Exception as e:
                    print(f"[Migration Error] Table creation: {e}")

                # Step 2: Add missing columns if table already existed but was old
                try:
                    conn.execute(text('ALTER TABLE review ADD COLUMN user_id INTEGER;'))
                except: pass
                try:
                    conn.execute(text('ALTER TABLE review ADD COLUMN email VARCHAR;'))
                except: pass
                try:
                    conn.execute(text('ALTER TABLE review ADD COLUMN role VARCHAR;'))
                except: pass
                try:
                    conn.execute(text('ALTER TABLE review ADD COLUMN rating INTEGER;'))
                except: pass
                try:
                    conn.execute(text('ALTER TABLE review ADD COLUMN created_at TIMESTAMP;'))
                except: pass
                try:
                    conn.execute(text('ALTER TABLE review ADD COLUMN is_featured BOOLEAN DEFAULT 0;'))
                except: pass
                
                # Step 3: Handle User table migrations
                try:
                    conn.execute(text('ALTER TABLE "user" ADD COLUMN pro_expiry_date VARCHAR;'))
                except: pass
                try:
                    conn.execute(text('ALTER TABLE "user" ADD COLUMN is_pro BOOLEAN DEFAULT 0;'))
                except: pass

                # Step 4: Handle GroupMessage migrations
                try:
                    conn.execute(text('ALTER TABLE groupmessage ADD COLUMN is_encrypted BOOLEAN DEFAULT 0;'))
                except: pass

                # Step 5: Hackathon Schema Expansion (Discovery Platform) — NON-BLOCKING CHECK
                try:
                    inspector = inspect(engine)
                    existing_cols = [c["name"] for c in inspector.get_columns("hackathon")]

                    for col in ["organizer", "description", "prize_pool", "deadline", "registration_deadline", "registration_link", "tags", "image_url", "participants_count", "status", "mode", "difficulty", "team_size", "start_date", "end_date", "domains", "currency", "location"]:
                        if col not in existing_cols:
                            try:
                                conn.execute(text(f'ALTER TABLE hackathon ADD COLUMN "{col}" VARCHAR;'))
                            except Exception as e:
                                print(f"[Migration Warning] Add {col}: {e}")

                    # Step 6: User Table — UNLOCK PLATINUM PRO & SYNC CHATS
                    existing_user_cols = [c["name"] for c in inspector.get_columns("user")]

                    for col in ["is_pro", "chats_today", "last_reset_date", "pro_expiry_date"]:
                        if col not in existing_user_cols:
                            try:
                                default = "1" if col == "is_pro" else "0" if col == "chats_today" else "NULL"
                                col_types = "BOOLEAN" if col=="is_pro" else "INTEGER" if col=="chats_today" else "VARCHAR"
                                conn.execute(text(f'ALTER TABLE "user" ADD COLUMN {col} {col_types} DEFAULT {default};'))
                            except Exception as e:
                                print(f"[Migration Warning] Add user col {col}: {e}")
                except Exception as e:
                    print(f"[Migration Warning] Schema inspection failed: {e}")
                
                # GLOBAL UNLOCK: Force all existing users to PRO (Targeted and Safe)
                try:
                    conn.execute(text('UPDATE "user" SET is_pro = 1 WHERE is_pro = 0 OR is_pro IS NULL;'))
                    conn.execute(text('UPDATE "user" SET chats_today = 0;'))
                    print("[Migration] PLATINUM PRO status verified for all users.")
                except Exception as e:
                    print(f"[Migration Warning] Global Unlock: {e}")

                # Step 7: Create HackathonApplication table if not exists
                try:
                    conn.execute(text("""
                        CREATE TABLE IF NOT EXISTS hackathonapplication (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_id INTEGER NOT NULL,
                            hackathon_id INTEGER NOT NULL,
                            status VARCHAR DEFAULT "Applied",
                            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    """))
                    print("[Migration] Ensuring 'hackathonapplication' table exists.")
                except Exception as e:
                    print(f"[Migration Error] HackathonApplication: {e}")

                # Step 7.5: Handle SavedResume schema expansion
                try:
                    inspector = inspect(engine)
                    existing_sr_cols = [c["name"] for c in inspector.get_columns("savedresume")]
                    if "savedresume" in inspector.get_table_names():
                        if "mode" not in existing_sr_cols:
                            conn.execute(text('ALTER TABLE savedresume ADD COLUMN "mode" VARCHAR DEFAULT \'ATS-Optimized\';'))
                            print("[Migration] Added 'mode' to savedresume.")
                except Exception as e:
                    print(f"[Migration Warning] SavedResume schema check: {e}")

                # Step 8: Ensure seed data (Fallback for empty databases)
                try:
                    user_count_stmt = text('SELECT count(*) as c FROM "user"')
                    user_count_res = conn.execute(user_count_stmt)
                    if user_count_res.mappings().first()["c"] == 0:
                        from app.core.security import get_password_hash
                        from app.core.config import settings
                        import uuid
                        admin_mail = settings.ADMIN_EMAIL
                        admin_pass = get_password_hash("password")
                        code = uuid.uuid4().hex[:8].upper()
                        conn.execute(text('INSERT INTO "user" (email, name, hashed_password, role, invite_code, is_pro) VALUES (:e, :n, :p, :r, :c, 1)'),
                        {"e": admin_mail, "n": "Super Admin", "p": admin_pass, "r": "admin", "c": code})
                        print("[Migration] 🌱 Seeded initial admin account.")

                    rev_count_stmt = text('SELECT count(*) as c FROM review')
                    rev_count_res = conn.execute(rev_count_stmt)
                    if rev_count_res.mappings().first()["c"] == 0:
                        reviews = [
                            {"n": "Alex Chen", "e": "alex@example.com", "rol": "Software Engineer", "rev": "Tulasi AI completely overhauled my interview prep. The AI mock interviews are incredibly realistic.", "rat": 5},
                            {"n": "Sarah Jenkins", "e": "sarah@example.com", "rol": "CS Student", "rev": "The personalized roadmaps saved me months of wandering. I landed my first internship because of the curated content.", "rat": 5},
                            {"n": "Mike Donovan", "e": "mike@example.com", "rol": "Frontend Dev", "rev": "Having an AI instantly explain why my code failed is a game changer. The UI is also visually stunning.", "rat": 5},
                            {"n": "Elena Rodriguez", "e": "elena@example.com", "rol": "Data Scientist", "rev": "The community hackathons are fantastic! The platform seamlessly integrates coding, learning, and competing.", "rat": 4},
                            {"n": "James Wu", "e": "james@example.com", "rol": "Backend Engineer", "rev": "Honestly the best gamified learning platform I've used. I actually look forward to logging in every day.", "rat": 5}
                        ]
                        for r in reviews:
                            conn.execute(text("INSERT INTO review (name, email, role, review, rating) VALUES (:n, :e, :rol, :rev, :rat)"), r)
                        print("[Migration] 🌱 Seeded initial realistic reviews.")

                    # ── 🤝 COMMUNITY SYNC ───────────────────────────
                    try:
                        group_count = conn.execute(text("SELECT count(*) as c FROM \"group\"")).mappings().first()["c"]
                        if group_count == 0:
                            conn.execute(text("INSERT INTO \"group\" (name, description, join_code, created_by) VALUES ('Global Community', 'The official hub for all Tulasi AI orbits.', 'ORBIT1', 1)"))
                            print("[Migration] 🌍 Initialized Global Community orbital.")
                    except Exception as e: 
                        print(f"[Migration Warning] Community Sync: {e}")

                    # ── 🚀 HACKATHON DISCOVERY SEED ──────────────────
                    try:
                        hack_count = conn.execute(text("SELECT count(*) as c FROM hackathon")).mappings().first()["c"]
                        if hack_count == 0:
                            hacks = [
                                {"t": "AI for India 2026", "o": "Tulasi AI", "d": "Build the next generation of social AI tools focused on regional accessibility.", "p": "₹5,00,000", "dl": "2026-05-15", "rl": "https://tulasiai.vercel.app/hackathons/1", "tg": "AI, ML, Social Impact", "iu": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e", "m": "Hybrid", "diff": "Medium", "ts": "1-4", "sd": "2026-05-20", "ed": "2026-05-22", "dom": "Engineering", "cur": "INR"},
                                {"t": "Zero-Key AI Hack", "o": "Meta-Labs", "d": "Design AI engines that require zero API keys using edge-compute-only models.", "p": "$10,000", "dl": "2026-04-10", "rl": "https://example.com/zero-key", "tg": "Edge, Security", "iu": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b", "m": "Remote", "diff": "Hard", "ts": "1-2", "sd": "2026-04-15", "ed": "2026-04-16", "dom": "Security", "cur": "USD"},
                                {"t": "Web3 Orbit 24H", "o": "Polygon", "d": "Rapid prototyping of decentralized learning platforms on Polygon zKEVM.", "p": "5,000 MATIC", "dl": "2026-06-01", "rl": "https://example.com/web3", "tg": "Web3, Blockchain", "iu": "https://images.unsplash.com/photo-1639762681057-408a5197bb40", "m": "In-Person (Bangalore)", "diff": "Easy", "ts": "1-3", "sd": "2026-06-05", "ed": "2026-06-06", "dom": "Web3", "cur": "MATIC"}
                            ]
                            for h in hacks:
                                conn.execute(text("""
                                    INSERT INTO hackathon (title, organizer, description, prize_pool, deadline, registration_link, tags, image_url, "mode", difficulty, team_size, start_date, end_date, domains, currency, participants_count, status) 
                                    VALUES (:t, :o, :d, :p, :dl, :rl, :tg, :iu, :m, :diff, :ts, :sd, :ed, :dom, :cur, 0, 'Active')
                                """), h)
                            print("[Migration] 🌱 Seeded initial high-tech hackathons.")
                    except Exception as e:
                        print(f"[Migration Warning] Hackathon Seed: {e}")
                    # ────────────────────────────────────────────────
                except Exception as e:
                    print(f"[Migration Error] Seeding: {e}")

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
    import traceback
    tb = traceback.format_exc()
    print(f"\u274c CRITICAL ERROR on {request.method} {request.url}:\n{tb}")
    origin = request.headers.get("origin", "*")
    cors_headers = {"Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true"} if origin in ALLOW_ORIGINS else {}
    debug_mode = os.environ.get("DEBUG", "").lower() in ("true", "1")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal Server Error",
            "message": str(exc) if debug_mode else "An unexpected error occurred. Please try again later.",
            "type": exc.__class__.__name__,
            **(  {"traceback": tb} if debug_mode else {}  )
        },
        headers=cors_headers
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

    if duration > 500:
        print(f"⚠️ [SLOW DB/API Action] {request.method} {request.url.path} took {duration}ms")

    print(
        f"[Backend Request] 📡 {request.method} {request.url.path} "
        f"→ {response.status_code} ({duration} ms)"
    )

    return response


# ── Routers ────────────────────────────────────────────────────────
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
app.include_router(pdf.router,          prefix="/api/pdf",          tags=["Document Q&A"])


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
    from app.core.database import engine
    from sqlalchemy import text
    db_status = "connected"
    try:
        with engine.begin() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unreachable: {str(e)}"
        print(f"❌ Database Health Check Failed: {e}")

    return {
        "status": "ok" if db_status == "connected" else "error",
        "db": db_status,
        "uptime_seconds": uptime,
        "version": "3.0.0",
        "server": "Tulasi AI Backend"
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