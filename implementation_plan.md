# TulasiAI Phase 6 Complete Product Implementation Plan

This document outlines the strategy to fulfill the Phase 6 requirements, completing the full TulasiAI product vision while avoiding mock data and enforcing real intelligence and persistence.

## User Review Required

> [!WARNING]
> **Database Environment for Testing:** The plan involves migrating from SQLite to Supabase PostgreSQL and implementing Row-Level Security (RLS) policies. Currently, the local environment uses SQLite (`DATABASE_URL=sqlite:///./ai_platform.db`), and Docker/Supabase CLI are not actively running to test a local Postgres instance. 
> To fully verify migrations, RLS, and Postgres-specific features (like `pgvector`), I need either:
> 1. A provisioned Supabase Postgres URL to connect to (you can provide this in the chat).
> 2. Confirmation to generate the migrations, RLS SQL, and codebase changes, and rely on your manual execution in your Supabase project.

> [!IMPORTANT]
> **API Keys:** SerpApi is required for real market intelligence (Jobs). If `SERPAPI_API_KEY` is missing in the environment, the system will gracefully fall back to the `UNAVAILABLE` or `STALE` status as requested, without hallucinating jobs.

## Open Questions

1. **Supabase Testing:** How would you like me to test the PostgreSQL database migrations and RLS policies given the current local environment limitations? Shall I assume a standard local Supabase connection string, or will you provide a remote one?
2. **Frontend Simplification:** The prompt requests focusing the frontend around a core loop (4 modules for Students, 4 for Professionals) and avoiding exposing unnecessary modules. Should I completely remove/hide the routing for the other experimental dashboard pages, or just restructure the main dashboard layouts?

## Proposed Changes

### 1. Repository Audit & Feature Matrix
- Conducted an initial audit. Detected >200 instances of `Math.random`, `mock`, `fake`, and `placeholder` in the frontend components (e.g., UI animations, simulated mock interviews, mock job scores, hardcoded notifications).
- **Current State Matrix:**
  - **Real Market Intelligence:** MOCK
  - **Skill Graph / Gap Engine:** MISSING / MOCK
  - **Smart Job Match:** MOCK
  - **Placement Readiness:** MOCK
  - **Personalized Learning Engine:** PARTIAL
  - **AI Interviewer:** PARTIAL
  - **Communication Coach:** PARTIAL (Camera implemented, lacks deep analysis)
  - **Hackathon Presentation Mode:** MISSING
  - **Professional Career Health:** MOCK
  - **Career Risk Intelligence:** MOCK
  - **Jarvis Intelligence:** PARTIAL
  - **Intelligent Notifications:** PARTIAL
  - **Supabase PostgreSQL + RLS:** MISSING

### 2. A. Production Database + Auth
- Update `backend/app/core/config.py` to enforce PostgreSQL when deployed.
- Implement an Alembic migration script to initialize all tables, foreign keys, and indexes in Postgres.
- Implement `pgvector` for the `DocumentChunk` embedding column.
- Write raw SQL migration steps to apply Supabase Row-Level Security (RLS) policies to ensure user-level isolation (e.g., `ALTER TABLE "user" ENABLE ROW LEVEL SECURITY; CREATE POLICY ...`).
- Synchronize authentication to use one canonical architecture (e.g., backend JWT matching Supabase Auth).

### 3. B - Q. Core Intelligence Engines
- **Canonical Career Profile:** Consolidate `User` and `Profile` models to a single source of truth used by all engines.
- **Market Intelligence (SerpApi):** Implement a service to fetch real Google Jobs via SerpApi, deduplicate using `content_hash`, and persist in `MarketSnapshot`. Implement strict STATUS returns (`LOADING`, `LIVE`, `STALE`, `UNAVAILABLE`).
- **Skill Engine & Job Match:** Calculate genuine skill gaps and match scores by comparing the canonical profile against the real fetched job descriptions.
- **Placement Readiness & Career Health:** Compute scores strictly from database evidence (completed tasks, real assessments, mock interview results). No `Math.random()`.
- **Learning Engine & Jarvis:** Orchestrate the "Next Best Action" using actual skill gaps. Jarvis will be upgraded to route queries to these concrete data points.
- **AI Interviewer & Communication Coach:** Wire the frontend's MediaPipe output and voice recognition to the backend to evaluate real metrics (filler words, pauses) and save the history.
- **Hackathon Presentation Mode:** Implement a new module accepting PPT (or text) and utilizing the camera/mic coach for presentation analysis.

### 4. R - U. Frontend & Quality Gate
- Strip out all mock data components and replace them with API hooks connecting to the new backend engines.
- Restructure the Student and Professional dashboards to only highlight the 4 core loop features.
- Build the Status System component to visually represent the data freshness of external APIs.
- Perform a final repository purge of all `Math.random` and `mock` strings.
- Run the full verification suite (pytest, typecheck, lint, build).

## Verification Plan

### Automated Tests
- Run `pytest` to verify API endpoints and business logic.
- Run `npm run typecheck` and `npm run lint` to verify frontend integrity.
- *(Pending DB decision)* Run Alembic migrations against a PostgreSQL instance and verify RLS using test users.

### Manual Verification
- Start the backend and frontend.
- Log in as a Student, ensure the dashboard only shows the 4 core features.
- Navigate to Smart Job Match; observe `UNAVAILABLE` if SerpApi key is missing, or real jobs if present.
- Verify that Jarvis can accurately explain the readiness score based on database history.
