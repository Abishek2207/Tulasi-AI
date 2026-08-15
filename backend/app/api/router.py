from fastapi import APIRouter
from app.api import (
    auth, chat, interview, roadmap, hackathons, code, certificates, admin, 
    messages, startup, activity, resume, study, groups, stripe, payment, 
    reviews, users, pdf, next_action, internships, system_design, prep_plan, 
    rag, daily_challenge, feed, mentor, follow, profile, roadmap_career, 
    streak_api, notifications_api, certifications_api, local_rag_api, industry_api,
    agents_api, opportunities_api, portfolio_api, career_intelligence, 
    daily_learning, practice, learn, subscriptions, payments, ats_engine,
    research, certifications, focus, intelligence_v2, project_builder,
    ws, professional_api
)
from app.websockets import signaling

api_router = APIRouter()

# Core Users & Practice
api_router.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
api_router.include_router(practice.router, prefix="/api/v1/practice", tags=["Practice Engine"])
api_router.include_router(learn.router, prefix="/api/v1/learn", tags=["Learn Mode"])
api_router.include_router(research.router, prefix="/api/v1/research", tags=["Deep Research"])
api_router.include_router(certifications.router, prefix="/api/v1/certifications", tags=["Certifications"])
api_router.include_router(focus.router, prefix="/api/v1/focus", tags=["Focus System"])

# Main API
api_router.include_router(auth.router,         prefix="/api/auth",         tags=["Authentication"])
api_router.include_router(chat.router,         prefix="/api/chat",         tags=["AI Chat"])
api_router.include_router(interview.router,    prefix="/api/interview",    tags=["Mock Interview"])
api_router.include_router(roadmap.router,      prefix="/api/roadmap-legacy", tags=["Legacy Roadmaps"])
api_router.include_router(roadmap_career.router, prefix="/api/roadmap/career", tags=["Career AI Roadmaps"])
api_router.include_router(hackathons.router,   prefix="/api/hackathons",   tags=["Hackathons"])
api_router.include_router(code.router,         prefix="/api/code",         tags=["Code Practice"])
api_router.include_router(certificates.router, prefix="/api/certificates-legacy", tags=["Legacy Certificates"])
api_router.include_router(certifications_api.router, prefix="/api/certifications", tags=["Curated Certifications"])
api_router.include_router(messages.router,     prefix="/api/messages",     tags=["Messages"])
api_router.include_router(startup.router,      prefix="/api/startup",      tags=["Startup Lab"])
api_router.include_router(admin.router,        prefix="/api/admin",        tags=["Admin"])
api_router.include_router(activity.router,     prefix="/api/activity",     tags=["Activity & Streaks"])
api_router.include_router(streak_api.router,   prefix="/api/streak",       tags=["Daily Streak Check-in"])
api_router.include_router(resume.router,       prefix="/api/resume",       tags=["Resume Builder"])
api_router.include_router(study.router,        prefix="/api/study",        tags=["Study Rooms"])
api_router.include_router(groups.router,       prefix="/api/groups",       tags=["Group Chat"])
api_router.include_router(stripe.router,       prefix="/api/stripe",       tags=["Monetization"])
api_router.include_router(payment.router,      prefix="/api/payment",      tags=["Payment"])
api_router.include_router(reviews.router,      prefix="/api/reviews",      tags=["Reviews"])
api_router.include_router(users.router,        prefix="/api/users",        tags=["Users"])
api_router.include_router(follow.router,       prefix="/api/follow",       tags=["Follow System"])
api_router.include_router(profile.router,      prefix="/api/profile",      tags=["Profile"])
api_router.include_router(notifications_api.router, prefix="/api/notifications", tags=["Notifications"])
api_router.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["Subscriptions"])
api_router.include_router(payments.router,     prefix="/api/payments",     tags=["Payments SaaS"])
api_router.include_router(ats_engine.router,   prefix="/api/ats",          tags=["ATS Engine"])

# Social, Feed and Mentor integration
api_router.include_router(feed.router,         prefix="/api/feed",         tags=["Idea Feed"])
api_router.include_router(mentor.router,       prefix="/api/mentor",       tags=["AI Mentor"])
api_router.include_router(industry_api.router, prefix="/api/v1/industry",  tags=["Industry Intelligence"])

# Super Intelligence Layer (V2 Overwrite)
api_router.include_router(intelligence_v2.router, prefix="/api/intel", tags=["Super Intelligence"])
api_router.include_router(pdf.router,          prefix="/api/pdf",          tags=["Document Q&A"])
api_router.include_router(next_action.router,  prefix="/api/next-action",  tags=["Next Action Engine"])
api_router.include_router(internships.router,  prefix="/api/internships",  tags=["Internship Discovery"])
api_router.include_router(system_design.router,  prefix="/api/system-design",  tags=["System Design Module"])
api_router.include_router(prep_plan.router,      prefix="/api/prep-plan",      tags=["Prep Plan"])
api_router.include_router(rag.router,            prefix="/api/rag",            tags=["Knowledge Base"])
api_router.include_router(local_rag_api.router,  prefix="/api/rag",            tags=["Personalized RAG"])
api_router.include_router(daily_challenge.router, prefix="/api/daily-challenge", tags=["ORBIT DAILY"])

# New Production Routers
api_router.include_router(agents_api.router,       prefix="/api/agents",        tags=["Specialized Agents"])
api_router.include_router(opportunities_api.router, prefix="/api/opportunities", tags=["Opportunities Discovery"])
api_router.include_router(portfolio_api.router,     prefix="/api/portfolio",     tags=["Portfolio Agent"])

api_router.include_router(professional_api.router,  prefix="/professional",      tags=["Professional Mode"])
api_router.include_router(career_intelligence.router, prefix="/api/v1", tags=["Career Intelligence"])
api_router.include_router(project_builder.router, prefix="/api/project-builder", tags=["Project Builder"])
api_router.include_router(daily_learning.router, prefix="/api/v1", tags=["Daily Learning"])

# WebSocket / WebRTC
api_router.include_router(ws.router, tags=["WebSocket Chat"])
api_router.include_router(signaling.router, prefix="/api/voice/signal", tags=["WebRTC Signaling"])
