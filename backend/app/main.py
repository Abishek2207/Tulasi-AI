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

from app.api import auth, chat, interview, roadmap, hackathons, code, certificates, admin, messages, startup, activity, resume, study, groups, stripe, payment, reviews, users, pdf, next_action, internships, system_design, prep_plan, rag, intelligence
from app.core.database import init_db, engine
from sqlalchemy import inspect
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter, _rate_limit_exceeded_handler
from fastapi.responses import RedirectResponse

# ── CORS origins — defined at module level so exception handlers can reference it ──
ALLOW_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
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
            from sqlalchemy import text, inspect
            
            inspector = inspect(engine)
            tables = inspector.get_table_names()

            def add_column_if_missing(table_name, column_name, column_type, default=None):
                """Helper to add a column only if it doesn't already exist."""
                existing_cols = [c["name"] for c in inspector.get_columns(table_name)]
                if column_name not in existing_cols:
                    try:
                        # We use a fresh connection for each ALTER to prevent transaction poisoning
                        with engine.begin() as conn:
                            default_clause = f" DEFAULT {default}" if default is not None else ""
                            conn.execute(text(f'ALTER TABLE "{table_name}" ADD COLUMN "{column_name}" {column_type}{default_clause};'))
                        print(f"[Migration] Added column '{column_name}' to '{table_name}'.")
                    except Exception as e:
                        print(f"[Migration Warning] Failed to add column '{column_name}' to '{table_name}': {e}")
                return column_name in existing_cols or column_name in [c["name"] for c in inspector.get_columns(table_name)]

            # Step 1: Review Table
            if "review" in tables:
                add_column_if_missing("review", "user_id", "INTEGER")
                add_column_if_missing("review", "email", "VARCHAR")
                add_column_if_missing("review", "role", "VARCHAR")
                add_column_if_missing("review", "rating", "INTEGER")
                add_column_if_missing("review", "created_at", "TIMESTAMP")
                add_column_if_missing("review", "is_featured", "BOOLEAN", default="FALSE")
                add_column_if_missing("review", "is_approved", "BOOLEAN", default="FALSE")

            # Step 2: User Table
            if "user" in tables:
                add_column_if_missing("user", "pro_expiry_date", "VARCHAR")
                add_column_if_missing("user", "is_pro", "BOOLEAN", default="FALSE")
                add_column_if_missing("user", "chats_today", "INTEGER", default="0")
                add_column_if_missing("user", "last_reset_date", "VARCHAR")

                # Global Unlock Action (PRO status sync)
                try:
                    with engine.begin() as conn:
                        conn.execute(text('UPDATE "user" SET is_pro = TRUE WHERE is_pro IS FALSE OR is_pro IS NULL;'))
                        conn.execute(text('UPDATE "user" SET chats_today = 0;'))
                    print("[Migration] PLATINUM PRO status verified for all users.")
                except Exception as e:
                    print(f"[Migration Warning] Global Unlock failed: {e}")

            # Step 3: GroupMessage Table
            if "groupmessage" in tables:
                add_column_if_missing("groupmessage", "is_encrypted", "BOOLEAN", default="FALSE")

            # Step 4: Hackathon Table (Handling mode -> event_mode rename)
            if "hackathon" in tables:
                cols = [c["name"] for c in inspector.get_columns("hackathon")]
                if "mode" in cols and "event_mode" not in cols:
                    try:
                        with engine.begin() as conn:
                            conn.execute(text('ALTER TABLE hackathon RENAME COLUMN "mode" TO event_mode;'))
                        print("[Migration] Renamed 'mode' to 'event_mode' in hackathon.")
                    except Exception as e:
                        print(f"[Migration Warning] Failed to rename 'mode' in hackathon: {e}")

                # Ensure all other hackathon columns exist
                hackathon_fields = [
                    ("organizer", "VARCHAR"), ("description", "VARCHAR"), ("prize_pool", "VARCHAR"),
                    ("deadline", "VARCHAR"), ("registration_deadline", "VARCHAR"), ("registration_link", "VARCHAR"),
                    ("tags", "VARCHAR"), ("image_url", "VARCHAR"), ("participants_count", "INTEGER"),
                    ("status", "VARCHAR"), ("event_mode", "VARCHAR"), ("difficulty", "VARCHAR"),
                    ("team_size", "VARCHAR"), ("start_date", "VARCHAR"), ("end_date", "VARCHAR"),
                    ("domains", "VARCHAR"), ("currency", "VARCHAR"), ("location", "VARCHAR")
                ]
                for col_name, col_type in hackathon_fields:
                    add_column_if_missing("hackathon", col_name, col_type)

            # Step 5: SavedResume Table
            if "savedresume" in tables:
                cols = [c["name"] for c in inspector.get_columns("savedresume")]
                if "mode" in cols and "resume_mode" not in cols:
                    try:
                        with engine.begin() as conn:
                            conn.execute(text('ALTER TABLE savedresume RENAME COLUMN "mode" TO resume_mode;'))
                        print("[Migration] Renamed 'mode' to 'resume_mode' in savedresume.")
                    except Exception as e:
                        print(f"[Migration Warning] Failed to rename 'mode' in savedresume: {e}")
                
                # Ensure resume_mode exists if neither 'mode' nor 'resume_mode' were found (edge case)
                add_column_if_missing("savedresume", "resume_mode", "VARCHAR", default="'ATS-Optimized'")

            # Step 6: PersistentInterviewSession
            if "persistentinterviewsession" in tables:
                add_column_if_missing("persistentinterviewsession", "scores_json", "VARCHAR", default="'{}'")
                add_column_if_missing("persistentinterviewsession", "current_difficulty", "INTEGER", default="5")

            # Step 8: User — Platform Upgrade fields
            if "user" in tables:
                add_column_if_missing("user", "user_type", "VARCHAR", default="'student'")
                add_column_if_missing("user", "abuse_count", "INTEGER", default="0")
                add_column_if_missing("user", "is_onboarded", "BOOLEAN", default="FALSE")
                add_column_if_missing("user", "user_intelligence_profile", "VARCHAR", default="'{}'")
                add_column_if_missing("user", "last_intelligence_update", "TIMESTAMP", default="CURRENT_TIMESTAMP")
                add_column_if_missing("user", "behavioral_patterns", "VARCHAR", default="'{}'")

            # Step 7: Seeding
            # Seed Admin User
            try:
                with engine.begin() as conn:
                    user_count = conn.execute(text('SELECT count(*) as c FROM "user"')).mappings().first()["c"]
                    if user_count == 0:
                        from app.core.security import get_password_hash
                        from app.core.config import settings
                        import uuid
                        admin_mail = settings.ADMIN_EMAIL
                        admin_pass = get_password_hash("password")
                        code = uuid.uuid4().hex[:8].upper()
                        conn.execute(text('INSERT INTO "user" (email, name, hashed_password, role, invite_code, is_pro, provider, streak, longest_streak, xp, level, chats_today, created_at, last_seen, is_active) VALUES (:e, :n, :p, :r, :c, TRUE, :pr, 0, 0, 0, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, TRUE)'),
                        {"e": admin_mail, "n": "Super Admin", "p": admin_pass, "r": "admin", "c": code, "pr": "email"})
                        print("[Migration] 🌱 Seeded initial admin account.")
            except Exception as e:
                print(f"[Migration Warning] Failed to seed Admin User: {e}")

            # Seed Global Community
            try:
                with engine.begin() as conn:
                    group_count = conn.execute(text('SELECT count(*) as c FROM "group"')).mappings().first()["c"]
                    if group_count == 0:
                        conn.execute(text("INSERT INTO \"group\" (name, description, join_code, created_by, created_at) VALUES ('Global Community', 'The official hub for all Tulasi AI orbits.', 'ORBIT1', 1, CURRENT_TIMESTAMP)"))
                        print("[Migration] 🌍 Initialized Global Community orbit.")
            except Exception as e:
                print(f"[Migration Warning] Failed to seed Global Community: {e}")

            # Seed Hackathons
            try:
                with engine.begin() as conn:
                    hack_count = conn.execute(text("SELECT count(*) as c FROM hackathon")).mappings().first()["c"]
                    if hack_count == 0:
                        hacks = [
                            {"t": "AI for India 2026", "o": "Tulasi AI", "d": "Build the next generation of social AI tools focused on regional accessibility.", "p": "₹5,00,000", "dl": "2026-05-15", "rl": "https://tulasiai.vercel.app/hackathons/1", "tg": "AI, ML, Social Impact", "iu": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e", "m": "Hybrid", "diff": "Medium", "ts": "1-4", "sd": "2026-05-20", "ed": "2026-05-22", "dom": "Engineering", "cur": "INR"},
                            {"t": "Zero-Key AI Hack", "o": "Meta-Labs", "d": "Design AI engines that require zero API keys using edge-compute-only models.", "p": "$10,000", "dl": "2026-04-10", "rl": "https://example.com/zero-key", "tg": "Edge, Security", "iu": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b", "m": "Remote", "diff": "Hard", "ts": "1-2", "sd": "2026-04-15", "ed": "2026-04-16", "dom": "Security", "cur": "USD"},
                            {"t": "Web3 Orbit 24H", "o": "Polygon", "d": "Rapid prototyping of decentralized learning platforms on Polygon zKEVM.", "p": "5,000 MATIC", "dl": "2026-06-01", "rl": "https://example.com/web3", "tg": "Web3, Blockchain", "iu": "https://images.unsplash.com/photo-1639762681057-408a5197bb40", "m": "In-Person (Bangalore)", "diff": "Easy", "ts": "1-3", "sd": "2026-06-05", "ed": "2026-06-06", "dom": "Web3", "cur": "MATIC"}
                        ]
                        for h in hacks:
                            conn.execute(text("""
                                INSERT INTO hackathon (name, organizer, description, prize, prize_pool, deadline, link, registration_link, tags, image_url, event_mode, difficulty, team_size, start_date, end_date, domains, currency, participants_count, status, is_active) 
                                VALUES (:t, :o, :d, :p, :p, :dl, :rl, :rl, :tg, :iu, :m, :diff, :ts, :sd, :ed, :dom, :cur, 0, 'Active', TRUE)
                            """), h)
                        print("[Migration] 🌱 Seeded initial high-tech hackathons.")
            except Exception as e:
                print(f"[Migration Warning] Failed to seed Hackathons: {e}")

            # Seed Real Reviews
            try:
                with engine.begin() as conn:
                    REAL_REVIEWS = [
                        {"name": "Gurucharan",    "role": None,               "review": "GOOD NOT BAD",                                                                                                                                                                         "rating": 5},
                        {"name": "KRISHNA",       "role": "STUDENT",          "review": "Really amazing....!!!!",                                                                                                                                                               "rating": 5},
                        {"name": "Aadhi",         "role": "PAAVAI",           "review": "It is incredibly easy for beginners to learn, yet powerful enough to handle the complex needs of advanced users",                                                                       "rating": 5},
                        {"name": "Bharat",        "role": "Student@Paavai",   "review": "All in one AI excellent for beginners",                                                                                                                                                 "rating": 5},
                        {"name": "Yogeshwaran",   "role": "Student@Paavai",   "review": "Good features \u2764\ufe0f\U0001f525",                                                                                                                                                                "rating": 5},
                        {"name": "Santhosh",      "role": "Designer@Airbus",  "review": "Tulsi AI is an outstanding platform that perfectly balances simplicity and power. Its intuitive design makes it incredibly accessible for beginners, while its robust features provide all the depth that advanced users need. Highly recommended", "rating": 5},
                        {"name": "Krishna",       "role": None,               "review": "Excellent Platform",                                                                                                                                                                    "rating": 5},
                        {"name": "Abdul",         "role": "student",          "review": "this AI will beat the open AI",                                                                                                                                                         "rating": 5},
                        {"name": "Hami",          "role": None,               "review": "Really, It's amazing to use this website\U0001f44c!!!",                                                                                                                                  "rating": 5},
                        {"name": "Abhimanyu S S", "role": "Student@PEC",      "review": "Excellent platform for Students\U0001f525\U0001f525",                                                                                                                                   "rating": 5},
                    ]
                    for r in REAL_REVIEWS:
                        existing = conn.execute(text("SELECT id FROM review WHERE name = :n AND review = :rev"), {"n": r["name"], "rev": r["review"]}).first()
                        if not existing:
                            conn.execute(text("""
                                INSERT INTO review (name, role, review, rating, is_approved, is_featured, created_at)
                                VALUES (:n, :ro, :rev, :ra, TRUE, FALSE, CURRENT_TIMESTAMP)
                            """), {"n": r["name"], "ro": r["role"], "rev": r["review"], "ra": r["rating"]})
                    print("[Migration] 🌱 Ensured default real reviews exist.")
            except Exception as e:
                print(f"[Migration Warning] Failed to seed Real Reviews: {e}")

            # Seed Internships
            try:
                from app.api.internships import INTERNSHIP_SEED_DATA
                with engine.begin() as conn:
                    count = conn.execute(text("SELECT count(*) as c FROM internship")).mappings().first()["c"]
                    if count == 0:
                        for i in INTERNSHIP_SEED_DATA:
                            conn.execute(text("""
                                INSERT INTO internship (title, company, domain, type, mode, location, stipend, duration, description, apply_link, deadline, is_active)
                                VALUES (:title, :company, :domain, :type, :mode, :location, :stipend, :duration, :description, :apply_link, :deadline, TRUE)
                            """), i)
                        print(f"[Migration] 🌱 Seeded {len(INTERNSHIP_SEED_DATA)} curated internships.")
            except Exception as e:
                print(f"[Migration Warning] Failed to seed Internships: {e}")

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
    from fastapi.responses import PlainTextResponse
    import traceback
    tb = traceback.format_exc()
    print(f"❌ CRITICAL ERROR on {request.method} {request.url}:\n{tb}")
    
    origin = request.headers.get("origin", "*")
    headers = {"Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true"} if origin in ALLOW_ORIGINS else {"Access-Control-Allow-Origin": "http://localhost:3000"}
    
    # Returning plain text traceback with CORS headers to avoid silent browser blockers
    return PlainTextResponse(
        content=f"--- CRITICAL BACKEND ERROR ---\n\n{tb}",
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
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["Roadmap"])
app.include_router(intelligence.router, prefix="/api/intelligence", tags=["Intelligence"])
app.include_router(pdf.router,          prefix="/api/pdf",          tags=["Document Q&A"])
app.include_router(next_action.router,  prefix="/api/next-action",  tags=["Next Action Engine"])
app.include_router(internships.router,  prefix="/api/internships",  tags=["Internship Discovery"])
app.include_router(system_design.router,  prefix="/api/system-design",  tags=["System Design Module"])
app.include_router(prep_plan.router,      prefix="/api/prep-plan",      tags=["Prep Plan"])
app.include_router(rag.router,            prefix="/api/rag",            tags=["Knowledge Base"])

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
        "version": "3.0.0",
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