# TulasiAI Architecture Audit

## Current Architecture
- **Frontend**: Next.js 14 (App Router) with TypeScript, Tailwind CSS, shadcn-style components, and Framer Motion.
- **Backend**: FastAPI with Python 3.13 support, SQLModel for ORM.
- **Database**: Configured for SQLite locally (`ai_platform.db`), intended for Postgres/Supabase in production.
- **Authentication**: Hybrid session hook (`useSession.tsx`) heavily reliant on Supabase OAuth + FastAPI JWT fallback, though some components still import NextAuth incorrectly.
- **AI Providers**: LangChain with Google Generative AI (Gemini) and Anthropic integrations.

## Exact Root Causes of Current Errors

1. **`useSession()` undefined**
   - **Root Cause**: `frontend/src/components/dashboard/AdaptivePracticeWidget.tsx` imports `useSession` from `next-auth/react`. However, the app uses a custom `useSession` hook (`@/hooks/useSession.tsx`) and the `SessionProvider` from `next-auth/react` is missing.

2. **Database engine initialization failed / 503 Database connection error**
   - **Root Cause**: The `.env` file specifies `DATABASE_URL=sqlite:///./ai_platform.db`. When the backend runs from the `backend/` directory, it expects the DB file there, but `ai_platform.db` is located at the project root. This causes the engine to be `None` and throws 503s on `get_db`.

3. **Authentication returns 503**
   - **Root Cause**: The FastAPI auth routes depend on the database connection, which is currently failing (503). Additionally, Supabase endpoints are pointing to a dummy `http://localhost:54321`.

4. **Google login/Continue with Google flow is broken**
   - **Root Cause**: Supabase is configured with dummy local credentials (`NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321`) without a running local Supabase instance, preventing the OAuth flow from initiating.

5. **Email verification code is not reaching Gmail**
   - **Root Cause**: Supabase email provider is not configured properly in the local mock environment, causing email delivery to fail silently. 

6. **AI chat returns network error**
   - **Root Cause**: The backend relies on AI providers (Gemini/Anthropic), but `.env` lacks real API keys (`GEMINI_API_KEY` is missing, `ANTHROPIC_API_KEY` is dummy). External HTTP calls timeout or fail.

7. **DSA problems fail to load & Career roadmap generation fails**
   - **Root Cause**: Cascading failure from the Database 503 and missing AI API keys. The generation service crashes when it tries to connect to the DB or call the LLM.

8. **Admin dashboard contains empty/incorrect metrics**
   - **Root Cause**: The metrics rely on real DB queries. Because the DB engine fails to initialize, these queries crash or return empty fallbacks.

9. **Inconsistent features between frontend auth and backend auth**
   - **Root Cause**: A hybrid architecture is in place where `localStorage` JWTs take priority, but Supabase OAuth listeners also attempt to synchronize state. This leads to race conditions and mismatched states if the backend rejects the JWT or the Supabase session expires.

10. **Some routes show Not Found**
    - **Root Cause**: Stale navigation links point to legacy Next.js pages or unimplemented placeholder routes in the new App Router structure.

## Prioritized Repair Plan (Phase 1)
1. **Fix Environment Variables**: Align `DATABASE_URL` in `.env` to point to the correct DB path, or migrate to a valid Supabase Postgres URL for both auth and data.
2. **Standardize Auth**: Remove `next-auth` imports globally and strictly enforce the Supabase + FastAPI JWT architecture.
3. **Database Health**: Update `app/core/database.py` to properly handle SQLite relative paths during development, ensuring the engine initializes without crashing.
4. **Graceful Degradation**: Add proper try-catch error states in the frontend components (e.g., AI Chat) to display "AI service is not configured" instead of throwing uncaught network errors.
