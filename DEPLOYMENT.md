# Tulasi AI - Deployment Guide

This document outlines how to deploy the Tulasi AI platform using free-tier services. The frontend is optimized for **Vercel** and the backend for **Render**.

---

## 🏗️ 1. Frontend Deployment (Vercel)

Vercel is the optimal host for Next.js applications, offering a generous completely free tier.

**Steps:**
1. Push your `tulasi-ai` monorepo to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. **Important**: Since this is a monorepo, in the "Framework Preset" section, make sure:
   - **Root Directory**: Select `frontend` (Do not leave it as the root `tulasi-ai`).
   - Framework Preview: Next.js.
5. **Environment Variables**: Add the following vars:
   - `NEXT_PUBLIC_API_URL`: The URL of your Render backend (e.g., `https://tulasi-backend.onrender.com`).
   - `NEXTAUTH_URL`: The Vercel domain you are deploying to.
   - `NEXTAUTH_SECRET`: A secure random string (can use `openssl rand -base64 32`).
6. Click **Deploy**. Vercel will auto-install NPM packages and build your Next.js project.

---

## 🚀 2. Backend Deployment (Render)

Render offers free Web Services which can run Python APIs like FastAPI.

**Steps:**
1. Sign in to [Render](https://render.com/) and create a new **Web Service**.
2. Connect the same GitHub repository.
3. **Configuration**:
   - **Name**: tulasi-api
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**: Add the following vars:
   - `GROQ_API_KEY`: Your Groq Llama 3 API Key.
   - `GEMINI_API_KEY`: Your Gemini Flash 1.5 API Key.
   - `DEEPSEEK_API_KEY`: Your DeepSeek API Key.
   - `SECRET_KEY`: A secure random string for JWT authentication.
   - `ALGORITHM`: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `30`
5. Click **Create Web Service**. 
6. Note: Render free tier spins down after 15 minutes of inactivity, so the initial request might take ~30-50 seconds to boot up.

---

## 🗄️ 3. Database Considerations

- **SQLite**: The current codebase uses SQLite. Because Render instances are ephemeral (they reset state occasionally), SQLite is strictly for development and testing.
- **Production DB**: For full production stability, use a free **PostgreSQL** database (e.g., Supabase, Neon) and update the `SQLALCHEMY_DATABASE_URL` in `backend/.env`.

- **FAISS Vector Store**: Locally, FAISS saves indices to disk. If hosted ephemerally, indices will vanish on restart. Consider moving to a persistent free cloud Vector DB (like Pinecone free tier) if permanent document retention is necessary in production.
