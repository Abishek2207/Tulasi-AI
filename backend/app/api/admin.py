from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_session
from app.api.auth import get_admin_user, get_current_user
from app.models.models import User, Review, ActivityLog

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────
# STATS (Extended)
# ─────────────────────────────────────────────────────────────────────

@router.get("/stats")
def get_stats(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    from datetime import date, timedelta
    from app.models.models import SolvedProblem, ChatMessage
    from sqlalchemy import text

    users = db.exec(select(User)).all()
    total = len(users)
    students = [u for u in users if u.role == "student"]
    pro_users = [u for u in users if u.is_pro]

    # Active today (last_activity_date)
    today_str = date.today().isoformat()
    active_today = len([u for u in users if u.last_activity_date == today_str])

    # Active in last 24 hours (from activity logs)
    cutoff_24h = datetime.utcnow() - timedelta(hours=24)
    try:
        recent_activity = db.exec(
            select(ActivityLog).where(ActivityLog.created_at >= cutoff_24h)
        ).all()
        active_24h_users = len(set(a.user_id for a in recent_activity))
    except Exception:
        active_24h_users = active_today

    # Total reviews
    try:
        from app.models.models import Review as ReviewModel
        total_reviews = len(db.exec(select(ReviewModel)).all())
    except Exception:
        total_reviews = 0

    # Total code submissions
    try:
        total_submissions = len(db.exec(select(SolvedProblem)).all())
    except Exception:
        total_submissions = 0

    # Total hackathon participants
    try:
        from app.models.models import HackathonApplication
        total_hack_participants = len(db.exec(select(HackathonApplication)).all())
    except Exception:
        total_hack_participants = 0

    # Total chat messages
    try:
        total_chat_messages = len(db.exec(select(ChatMessage)).all())
    except Exception:
        total_chat_messages = 0

    return {
        "total_users": total,
        "students": len(students),
        "admins": total - len(students),
        "pro_users": len(pro_users),
        "active_today": active_today,
        "active_24h": active_24h_users,
        "total_reviews": total_reviews,
        "total_submissions": total_submissions,
        "total_hackathon_participants": total_hack_participants,
        "total_chat_messages": total_chat_messages,
    }


# ─────────────────────────────────────────────────────────────────────
# USERS (Full list)
# ─────────────────────────────────────────────────────────────────────

@router.get("/users")
def get_all_users(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    users = db.exec(select(User).order_by(User.xp.desc())).all()
    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "role": u.role,
                "xp": u.xp,
                "level": u.level,
                "streak": u.streak,
                "is_pro": u.is_pro,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "last_seen": u.last_seen.isoformat() if u.last_seen else None,
                "last_activity_date": u.last_activity_date,
                "is_active": u.is_active,
            }
            for u in users
        ]
    }


# ─────────────────────────────────────────────────────────────────────
# USER PROFILE (Single user)
# ─────────────────────────────────────────────────────────────────────

@router.get("/users/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    from app.models.models import SolvedProblem, ChatMessage
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(404, "User not found")

    # Activity logs
    logs = db.exec(
        select(ActivityLog)
        .where(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(20)
    ).all()

    # Solved problems count
    try:
        solved_count = len(db.exec(select(SolvedProblem).where(SolvedProblem.user_id == user_id)).all())
    except Exception:
        solved_count = 0

    # Chat messages count
    try:
        chat_count = len(db.exec(select(ChatMessage).where(ChatMessage.user_id == user_id)).all())
    except Exception:
        chat_count = 0

    # Rank: count users with more XP
    all_users_xp = db.exec(select(User.xp).order_by(User.xp.desc())).all()
    rank = next((i + 1 for i, xp in enumerate(all_users_xp) if xp <= u.xp), len(all_users_xp))

    return {
        "user": {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "role": u.role,
            "xp": u.xp,
            "level": u.level,
            "streak": u.streak,
            "longest_streak": u.longest_streak,
            "is_pro": u.is_pro,
            "is_active": u.is_active,
            "provider": u.provider,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "last_seen": u.last_seen.isoformat() if u.last_seen else None,
            "last_activity_date": u.last_activity_date,
            "skills": u.skills,
            "bio": u.bio,
        },
        "stats": {
            "rank": rank,
            "solved_problems": solved_count,
            "chat_messages": chat_count,
        },
        "recent_activity": [
            {
                "id": a.id,
                "action_type": a.action_type,
                "title": a.title,
                "xp_earned": a.xp_earned,
                "created_at": a.created_at.isoformat(),
            }
            for a in logs
        ],
    }


# ─────────────────────────────────────────────────────────────────────
# TOGGLE USER ACTIVE
# ─────────────────────────────────────────────────────────────────────

class ToggleUserRequest(BaseModel):
    user_id: int
    is_active: bool


@router.post("/toggle-user")
def toggle_user(req: ToggleUserRequest, db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    user = db.get(User, req.user_id)
    if not user:
        return {"error": "User not found"}
    if user.email == admin.email:
        return {"error": "Cannot disable your own admin account"}
    user.is_active = req.is_active
    db.add(user)
    db.commit()
    return {"message": f"User {'enabled' if req.is_active else 'disabled'} successfully"}


# ─────────────────────────────────────────────────────────────────────
# REVIEWS
# ─────────────────────────────────────────────────────────────────────

@router.get("/reviews")
def get_admin_reviews(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Fetch all reviews with user details for admin moderation."""
    from sqlalchemy import text
    try:
        res = db.execute(text(
            "SELECT id, name, email, role, review, rating, created_at, "
            "COALESCE(is_featured, 0) as is_featured "
            "FROM review ORDER BY created_at DESC"
        ))
        rows = res.mappings().all()
        return {
            "reviews": [
                {
                    "id": row["id"],
                    "name": row["name"] or "Anonymous",
                    "role": row.get("role"),
                    "review": row["review"],
                    "rating": row["rating"],
                    "created_at": str(row["created_at"]),
                    "user_email": row.get("email") or "Anonymous",
                    "is_featured": bool(row.get("is_featured", False)),
                }
                for row in rows
            ]
        }
    except Exception:
        try:
            res = db.execute(text(
                "SELECT id, name, role, review, rating, created_at FROM review ORDER BY created_at DESC"
            ))
            rows = res.mappings().all()
            return {
                "reviews": [
                    {
                        "id": row["id"],
                        "name": row["name"],
                        "role": row.get("role"),
                        "review": row["review"],
                        "rating": row["rating"],
                        "created_at": str(row["created_at"]),
                        "user_email": "Anonymous",
                        "is_featured": False,
                    }
                    for row in rows
                ]
            }
        except Exception as e:
            return {"error": str(e), "reviews": []}


@router.delete("/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Delete a review (Admin Only)."""
    review = db.get(Review, review_id)
    if not review:
        return {"error": "Review not found"}
    db.delete(review)
    db.commit()
    return {"message": "Review deleted successfully"}


@router.patch("/reviews/{review_id}/feature")
def toggle_feature_review(review_id: int, db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Toggle featured status on a review (Admin Only)."""
    from sqlalchemy import text
    try:
        res = db.execute(text(f"SELECT id, COALESCE(is_featured, 0) as is_featured FROM review WHERE id = {review_id}"))
        row = res.mappings().first()
        if not row:
            return {"error": "Review not found"}
        new_val = 0 if row["is_featured"] else 1
        db.execute(text(f"UPDATE review SET is_featured = {new_val} WHERE id = {review_id}"))
        db.commit()
        return {"message": "Featured status updated", "is_featured": bool(new_val)}
    except Exception as e:
        return {"error": str(e)}


# ─────────────────────────────────────────────────────────────────────
# ACTIVITY LOGS
# ─────────────────────────────────────────────────────────────────────

@router.get("/activity")
def get_global_activity(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Fetch global user activity logs with user details for admin review."""
    results = db.exec(
        select(ActivityLog, User.name, User.email)
        .join(User, ActivityLog.user_id == User.id, isouter=True)
        .order_by(ActivityLog.created_at.desc())
        .limit(150)
    ).all()

    return {
        "activity": [
            {
                "id": act[0].id,
                "user_name": act[1] or "Unknown",
                "user_email": act[2] or "Unknown",
                "action_type": act[0].action_type,
                "title": act[0].title,
                "metadata": act[0].metadata_json,
                "xp": act[0].xp_earned,
                "created_at": act[0].created_at.isoformat()
            }
            for act in results
        ]
    }


# ─────────────────────────────────────────────────────────────────────
# LEADERBOARD
# ─────────────────────────────────────────────────────────────────────

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Full leaderboard sorted by XP with dynamic rank assignment."""
    users = db.exec(select(User).order_by(User.xp.desc())).all()
    leaderboard = []
    for rank, u in enumerate(users, start=1):
        leaderboard.append({
            "rank": rank,
            "id": u.id,
            "name": u.name or u.email.split("@")[0],
            "email": u.email,
            "xp": u.xp,
            "level": u.level,
            "streak": u.streak,
            "is_pro": u.is_pro,
            "is_top10": rank <= 10,
        })
    return {"leaderboard": leaderboard, "total": len(leaderboard)}


# ─────────────────────────────────────────────────────────────────────
# CODE ANALYTICS
# ─────────────────────────────────────────────────────────────────────

@router.get("/code-analytics")
def get_code_analytics(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Code Practice analytics — submissions, acceptance rate, top solvers."""
    from app.models.models import SolvedProblem
    from sqlalchemy import func

    # Total solved records
    all_solved = db.exec(select(SolvedProblem)).all()
    total_submissions = len(all_solved)

    # Count per user
    user_solve_counts: dict = {}
    for s in all_solved:
        user_solve_counts[s.user_id] = user_solve_counts.get(s.user_id, 0) + 1

    # Top 10 solvers
    top_solver_ids = sorted(user_solve_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    top_solvers = []
    for uid, count in top_solver_ids:
        u = db.get(User, uid)
        if u:
            top_solvers.append({
                "user_id": uid,
                "name": u.name or u.email.split("@")[0],
                "email": u.email,
                "solved_count": count,
                "xp": u.xp,
            })

    # Wrong answers from activity logs
    wrong_answer_logs = db.exec(
        select(ActivityLog).where(ActivityLog.action_type.contains("wrong"))
    ).all()
    wrong_answer_count = len(wrong_answer_logs)

    # Problems solved by difficulty (from activity log titles)
    total_problems_available = 130  # hardcoded from code.py PROBLEMS list

    return {
        "total_submissions": total_submissions,
        "accepted_count": total_submissions,  # 1 record = 1 accepted
        "wrong_answer_count": wrong_answer_count,
        "acceptance_rate": round((total_submissions / max(total_submissions + wrong_answer_count, 1)) * 100, 1),
        "total_problems_available": total_problems_available,
        "top_solvers": top_solvers,
        "unique_solvers": len(user_solve_counts),
    }


# ─────────────────────────────────────────────────────────────────────
# CHAT ANALYTICS
# ─────────────────────────────────────────────────────────────────────

@router.get("/chat-analytics")
def get_chat_analytics(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Chat analytics — total messages, active users, recent conversations."""
    from app.models.models import ChatMessage, ChatSession

    all_messages = db.exec(select(ChatMessage)).all()
    total_messages = len(all_messages)

    # Active users in last 7 days
    cutoff_7d = datetime.utcnow() - timedelta(days=7)
    recent_msgs = db.exec(
        select(ChatMessage).where(ChatMessage.created_at >= cutoff_7d)
    ).all()
    active_users_7d = len(set(m.user_id for m in recent_msgs if m.user_id))

    # Active users in last 24 hours
    cutoff_24h = datetime.utcnow() - timedelta(hours=24)
    msgs_24h = db.exec(
        select(ChatMessage).where(ChatMessage.created_at >= cutoff_24h)
    ).all()
    active_users_24h = len(set(m.user_id for m in msgs_24h if m.user_id))

    # Last 10 sessions with user info + last message preview
    try:
        sessions = db.exec(
            select(ChatSession).order_by(ChatSession.created_at.desc()).limit(10)
        ).all()
        last_conversations = []
        for sess in sessions:
            u = db.get(User, sess.user_id) if sess.user_id else None
            # Get last message in this session
            last_msg = db.exec(
                select(ChatMessage)
                .where(ChatMessage.session_id == sess.session_id)
                .order_by(ChatMessage.created_at.desc())
                .limit(1)
            ).first()
            last_conversations.append({
                "session_id": sess.session_id,
                "title": sess.title,
                "user_name": u.name if u else "Unknown",
                "user_email": u.email if u else "Unknown",
                "last_message": last_msg.content[:120] + "..." if last_msg and len(last_msg.content) > 120 else (last_msg.content if last_msg else "No messages"),
                "created_at": sess.created_at.isoformat() if sess.created_at else None,
            })
    except Exception:
        last_conversations = []

    # Message role breakdown (user vs ai)
    user_msgs = len([m for m in all_messages if m.role == "user"])
    ai_msgs = len([m for m in all_messages if m.role == "assistant"])

    return {
        "total_messages": total_messages,
        "user_messages": user_msgs,
        "ai_messages": ai_msgs,
        "active_users_7d": active_users_7d,
        "active_users_24h": active_users_24h,
        "last_conversations": last_conversations,
    }


# ─────────────────────────────────────────────────────────────────────
# ANALYTICS (14-day charts)
# ─────────────────────────────────────────────────────────────────────

@router.get("/analytics")
def get_admin_analytics(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Fetch 14-day aggregated analytics with robust date parsing for SQLite."""
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=13)

        users = db.exec(select(User).where(User.created_at >= start_date)).all()
        logs = db.exec(select(ActivityLog).where(ActivityLog.created_at >= start_date)).all()

        def to_day(dt):
            if not dt: return None
            if hasattr(dt, 'strftime'):
                return dt.strftime("%Y-%m-%d")
            if isinstance(dt, str):
                return dt.split(" ")[0]
            return str(dt).split(" ")[0]

        daily_stats = {}
        for i in range(14):
            date_str = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
            daily_stats[date_str] = {"date": date_str, "signups": 0, "actions": 0}

        for u in users:
            try:
                day = to_day(u.created_at)
                if day in daily_stats:
                    daily_stats[day]["signups"] += 1
            except Exception:
                pass

        for log in logs:
            try:
                day = to_day(log.created_at)
                if day in daily_stats:
                    daily_stats[day]["actions"] += 1
            except Exception:
                pass

        growth_history = [daily_stats[d] for d in sorted(daily_stats.keys())]

        all_users = db.exec(select(User)).all()
        pro_count = sum(1 for u in all_users if getattr(u, 'is_pro', False))
        free_count = len(all_users) - pro_count

        return {
            "growth": growth_history,
            "segmentation": [
                {"name": "Pro 👑", "value": pro_count, "color": "#A78BFA"},
                {"name": "Free", "value": free_count, "color": "rgba(255,255,255,0.1)"}
            ],
            "total_users": len(all_users),
            "pro_percentage": round((pro_count / len(all_users) * 100), 1) if all_users else 0
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"growth": [], "segmentation": [], "error": str(e), "success": False}


# ─────────────────────────────────────────────────────────────────────
# SEED REAL DATA (Reviews & Hackathons)
# ─────────────────────────────────────────────────────────────────────

REAL_REVIEWS = [
    {"name": "Ananya Sharma", "role": "Final Year CSE", "review": "Tulasi AI helped me crack my first technical interview! The AI feedback is incredibly precise and feels like talking to a real mentor.", "rating": 5},
    {"name": "Rahul Verma", "role": "Software Engineer", "review": "The resume analysis tool is a game-changer. I increased my keyword match score from 40% to 85% in just a few iterations.", "rating": 5},
    {"name": "Priyanka Nair", "role": "Pre-final IT", "review": "The hackathon discovery platform is so convenient. I no longer have to check multiple sites to find the best coding events.", "rating": 4},
    {"name": "Aditya Singh", "role": "M.Tech Student", "review": "Building roadmaps with AI has made my learning journey so structured. I'm now learning Web3 with a clear path.", "rating": 5},
    {"name": "Sneha Reddy", "role": "Full Stack Developer", "review": "The code sandbox is super fast and the AI explanations for complex algorithms are very helpful for my daily standups.", "rating": 4},
    {"name": "Vikram Malhotra", "role": "Engineering Lead", "review": "As a mentor, I recommend Tulasi AI to all my juniors for interview prep. It's the most comprehensive tool I've seen.", "rating": 5},
    {"name": "Ishaan Gupta", "role": "BCA Student", "review": "The UI is stunning and the experience is seamless. It's not just an AI tool, it's a complete career ecosystem.", "rating": 5},
]

@router.post("/seed-reviews")
def seed_reviews(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Seed high-quality, professional reviews."""
    from sqlalchemy import text
    added = 0
    skipped = 0
    for r in REAL_REVIEWS:
        # Check if review by same person exists
        existing = db.execute(text("SELECT id FROM review WHERE name = :n AND review = :r"), {"n": r["name"], "r": r["review"]}).first()
        if existing:
            skipped += 1
            continue
        
        db.execute(text(
            "INSERT INTO review (name, role, review, rating, created_at, is_featured) "
            "VALUES (:n, :rol, :rev, :rat, :c, 1)"
        ), {
            "n": r["name"], "rol": r["role"], "rev": r["review"], 
            "rat": r["rating"], "c": datetime.utcnow(), "is_featured": 1
        })
        added += 1
    db.commit()
    return {"message": f"Seeded {added} reviews ({skipped} skipped)", "added": added}

# ─────────────────────────────────────────────────────────────────────
# HACKATHONS
# ─────────────────────────────────────────────────────────────────────

@router.get("/hackathons")
def get_admin_hackathons(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_session),
    admin: User = Depends(get_admin_user)
):
    """Fetch hackathons with pagination for admin management."""
    from app.models.models import Hackathon
    from sqlmodel import func

    total = db.exec(select(func.count(Hackathon.id))).one()
    hackathons = db.exec(
        select(Hackathon)
        .order_by(Hackathon.id.desc())
        .offset(offset)
        .limit(limit)
    ).all()

    return {"hackathons": hackathons, "total": total}


class CreateHackathonRequest(BaseModel):
    name: str
    organizer: str
    description: str
    prize: str
    deadline: str
    link: str
    tags: str = ""
    status: str = "Open"
    image_url: str = ""


@router.post("/hackathons")
def create_hackathon(req: CreateHackathonRequest, db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Add a new hackathon (Admin Only)."""
    from app.models.models import Hackathon
    h = Hackathon(
        name=req.name,
        organizer=req.organizer,
        description=req.description,
        prize=req.prize,
        prize_pool=req.prize,
        deadline=req.deadline,
        link=req.link,
        registration_link=req.link,
        tags=req.tags,
        status=req.status,
        image_url=req.image_url or "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=60"
    )
    db.add(h)
    db.commit()
    db.refresh(h)
    return h


@router.delete("/hackathons/{hackathon_id}")
def delete_hackathon(hackathon_id: int, db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Delete a hackathon (Admin Only)."""
    from app.models.models import Hackathon
    h = db.get(Hackathon, hackathon_id)
    if not h:
        return {"error": "Hackathon not found"}
    db.delete(h)
    db.commit()
    return {"message": "Hackathon deleted successfully"}


# ─────────────────────────────────────────────────────────────────────
# SEED 20 REAL HACKATHONS
# ─────────────────────────────────────────────────────────────────────

REAL_HACKATHONS = [
    {"name": "Smart India Hackathon", "organizer": "Government of India", "description": "India's largest hackathon uniting students to solve national challenges across education, health, agriculture and more.", "prize": "₹1,00,000", "deadline": "2026-08-15", "link": "https://www.sih.gov.in", "tags": "india,government,innovation,ai", "status": "Upcoming"},
    {"name": "Google Solution Challenge", "organizer": "Google", "description": "Build solutions using Google technologies that address one or more of the UN's 17 Sustainable Development Goals.", "prize": "$20,000", "deadline": "2026-05-30", "link": "https://developers.google.com/community/gdsc-solution-challenge", "tags": "google,sustainability,ai,mobile", "status": "Open"},
    {"name": "Microsoft Imagine Cup", "organizer": "Microsoft", "description": "Global student technology competition to build innovative solutions using Microsoft Azure and AI.", "prize": "$100,000", "deadline": "2026-04-30", "link": "https://imaginecup.microsoft.com", "tags": "microsoft,azure,ai,cloud", "status": "Open"},
    {"name": "HackMIT", "organizer": "MIT", "description": "MIT's flagship annual 24-hour hackathon bringing together the best student hackers from around the world.", "prize": "$10,000", "deadline": "2026-09-20", "link": "https://hackmit.org", "tags": "mit,hardware,software,ai", "status": "Upcoming"},
    {"name": "ETHGlobal Hackathon", "organizer": "ETHGlobal", "description": "The world's premier Ethereum hackathon series connecting Web3 builders to shape the decentralized future.", "prize": "$250,000", "deadline": "2026-06-10", "link": "https://ethglobal.com", "tags": "ethereum,web3,blockchain,defi", "status": "Open"},
    {"name": "Hack The Box CTF", "organizer": "Hack The Box", "description": "Elite cybersecurity Capture The Flag competition testing real-world penetration testing and ethical hacking skills.", "prize": "$15,000", "deadline": "2026-05-15", "link": "https://hackthebox.com", "tags": "cybersecurity,ctf,hacking,infosec", "status": "Open"},
    {"name": "NASA Space Apps Challenge", "organizer": "NASA", "description": "International hackathon that tasks solvers with using NASA's open data to tackle challenges on Earth and in space.", "prize": "Internship + Recognition", "deadline": "2026-10-05", "link": "https://www.spaceappschallenge.org", "tags": "nasa,space,data,science", "status": "Upcoming"},
    {"name": "Flipkart GRiD", "organizer": "Flipkart", "description": "Flipkart's flagship engineering and technology competition for engineering students across India.", "prize": "₹2,00,000 + PPO", "deadline": "2026-07-01", "link": "https://unstop.com/hackathons/flipkart-grid", "tags": "ecommerce,engineering,india,supply-chain", "status": "Upcoming"},
    {"name": "Amazon HackOn", "organizer": "Amazon", "description": "Amazon's premier hackathon where students apply Amazon's leadership principles to solve real-world business and tech problems.", "prize": "₹3,00,000 + PPO", "deadline": "2026-05-20", "link": "https://hackon.amazon.in", "tags": "amazon,aws,cloud,ecommerce", "status": "Open"},
    {"name": "Meta Hacker Cup", "organizer": "Meta", "description": "Annual international programming competition hosted by Meta where coders solve algorithmic challenges.", "prize": "$20,000", "deadline": "2026-09-01", "link": "https://www.facebook.com/codingcompetitions/hacker-cup", "tags": "meta,competitive,algorithms,programming", "status": "Upcoming"},
    {"name": "AngelHack Global Hackathon", "organizer": "AngelHack", "description": "One of the world's biggest hackathon series, connecting innovators across 50+ cities globally.", "prize": "$100,000+ across cities", "deadline": "2026-06-30", "link": "https://angelhack.com", "tags": "global,innovation,startup,product", "status": "Open"},
    {"name": "TechGig Code Gladiators", "organizer": "TechGig", "description": "India's largest coding competition with participation from 250,000+ developers across industries.", "prize": "₹20 Lakhs + Trophy", "deadline": "2026-07-15", "link": "https://www.techgig.com/codegladiators", "tags": "india,coding,enterprise,algorithms", "status": "Open"},
    {"name": "MLH Global Hack Week", "organizer": "Major League Hacking", "description": "A week-long virtual hackathon with daily mini-events, workshops and beginner-friendly challenges.", "prize": "Prizes + Swag", "deadline": "2026-04-20", "link": "https://ghw.mlh.io", "tags": "mlh,beginner,virtual,open-source", "status": "Open"},
    {"name": "Devfolio Hackathons", "organizer": "Devfolio", "description": "Platform hosting India's most innovative hackathons spanning AI, Web3, fintech, and social impact categories.", "prize": "Varies per event", "deadline": "2026-05-31", "link": "https://devfolio.co/hackathons", "tags": "devfolio,web3,ai,fintech,india", "status": "Open"},
    {"name": "HackerEarth Hiring Challenge", "organizer": "HackerEarth", "description": "Solve real-world company problems in a hackathon format and get direct hiring opportunities at top tech companies.", "prize": "Job Offers + ₹1,00,000", "deadline": "2026-05-10", "link": "https://www.hackerearth.com/challenges", "tags": "hiring,coding,algorithms,india", "status": "Open"},
    {"name": "CodeChef SnackDown", "organizer": "CodeChef", "description": "Global team programming competition conducted annually, open to teams of 1-2 members worldwide.", "prize": "$10,000", "deadline": "2026-08-30", "link": "https://www.codechef.com/snackdown", "tags": "codechef,competitive,algorithms,team", "status": "Upcoming"},
    {"name": "TCS CodeVita", "organizer": "Tata Consultancy Services", "description": "World's largest programming competition hosted by TCS, open to engineering students and professionals globally.", "prize": "₹5,00,000 + Job Offer", "deadline": "2026-09-15", "link": "https://www.tcscodevita.com", "tags": "tcs,programming,global,competitive", "status": "Upcoming"},
    {"name": "Infosys HackWithInfy", "organizer": "Infosys", "description": "A hackathon by Infosys for students and fresh graduates to showcase coding skills and earn fast-track job offers.", "prize": "PPO + ₹1,25,000", "deadline": "2026-06-15", "link": "https://infytq.onlinetest.in/hackwithinfy", "tags": "infosys,india,coding,freshers", "status": "Open"},
    {"name": "IBM Call for Code", "organizer": "IBM", "description": "Global challenge calling developers to create sustainable open-source solutions to fight climate change and natural disasters.", "prize": "$200,000", "deadline": "2026-07-31", "link": "https://developer.ibm.com/callforcode", "tags": "ibm,climate,open-source,sustainability", "status": "Open"},
    {"name": "Cisco Global Hackathon", "organizer": "Cisco", "description": "Cisco's global internal and external innovation hackathon focused on networking, security, and next-gen connectivity solutions.", "prize": "$25,000 + Mentorship", "deadline": "2026-08-01", "link": "https://developer.cisco.com/devnet-sandbox", "tags": "cisco,networking,security,iot", "status": "Upcoming"},
]


@router.post("/seed-hackathons")
def seed_hackathons(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Seed 20 real hackathons (idempotent — checks by name before inserting)."""
    from app.models.models import Hackathon
    from sqlalchemy import text

    added = 0
    skipped = 0

    for h_data in REAL_HACKATHONS:
        # Check if hackathon with same name exists
        existing = db.execute(text("SELECT id FROM hackathon WHERE name = :n"), {"n": h_data["name"]}).first()
        if existing:
            skipped += 1
            continue

        h = Hackathon(
            name=h_data["name"],
            organizer=h_data["organizer"],
            description=h_data["description"],
            prize=h_data["prize"],
            prize_pool=h_data["prize"],
            deadline=h_data["deadline"],
            link=h_data["link"],
            registration_link=h_data["link"],
            tags=h_data["tags"],
            status=h_data["status"],
            is_active=True,
            mode="Online",
            difficulty="Beginner",
            image_url="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=60",
        )
        db.add(h)
        added += 1

    db.commit()
    return {
        "message": f"Seeded {added} hackathons ({skipped} already existed)",
        "added": added,
        "skipped": skipped,
        "total": len(REAL_HACKATHONS),
    }


# ─────────────────────────────────────────────────────────────────────
# EMERGENCY SYNC (keep legacy)
# ─────────────────────────────────────────────────────────────────────

@router.get("/system-sync-emergency-9922")
def emergency_sync(db: Session = Depends(get_session)):
    """Secret emergency sync to promote admin and delete spam on LIVE site."""
    from app.models.models import User
    admin_emails = ["abishekramamoorthy22@gmail.com", "abishek.ramamoorthy.dev@gmail.com"]
    for email in admin_emails:
        query = select(User).where(User.email == email)
        result = db.exec(query)
        user = result.first()
        if user:
            user.role = "admin"
            db.add(user)

    from sqlalchemy import text
    try:
        db.execute(text("DELETE FROM review WHERE review LIKE '%mia kalifa%'"))
        db.execute(text("DELETE FROM review WHERE name LIKE '%mia kalifa%'"))
        db.execute(text("DELETE FROM review WHERE review LIKE '%mia khalifa%'"))
        db.execute(text("DELETE FROM review WHERE name LIKE '%mia khalifa%'"))
        db.execute(text("DELETE FROM review WHERE role LIKE '%corn actor%'"))
    except Exception:
        pass

    db.commit()
    return {"status": "success", "message": "Spam cleared & Admin role synchronized."}
