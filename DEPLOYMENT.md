# 🚀 Tulasi AI — Production Deployment Guide

This guide walks through the complete, zero-to-live deployment of Tulasi AI using **Vercel** (frontend) and **Render** (backend + database).

---

## Architecture Overview

```
User → Vercel (Next.js) → Render (FastAPI) → PostgreSQL
                              ↕
                         Google Gemini AI
                         Stripe Payments
```

---

## Step 1: Deploy the Backend to Render

### Option A: One-Click via `render.yaml` (Recommended)
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repo: `Abishek2207/Tulasi-AI`
4. Render will auto-detect `render.yaml` and provision:
   - `tulasi-ai-backend` (Python web service)
   - `tulasi-ai-db` (PostgreSQL database)
5. Once deployed, note your backend URL e.g. `https://tulasi-ai-soda.onrender.com`

### Required Environment Variables (set in Render Dashboard)
| Variable | Description |
|---|---|
| `GOOGLE_API_KEY` | Your Gemini API key from [aistudio.google.com](https://aistudio.google.com) |
| `STRIPE_SECRET_KEY` | Stripe secret key from [dashboard.stripe.com](https://dashboard.stripe.com) |
| `OPENROUTER_API_KEY` | OpenRouter key (optional fallback AI) |
| `GROQ_API_KEY` | Groq key (optional fallback AI) |

> `SECRET_KEY` and `DATABASE_URL` are auto-managed by `render.yaml`.

---

## Step 2: Deploy the Frontend to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo: `Abishek2207/Tulasi-AI`
3. Set **Root Directory** to `frontend`
4. Set these **Environment Variables** in Vercel:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://tulasi-ai-soda.onrender.com` |
| `NEXTAUTH_URL` | `https://www.tulasiai.in` |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console (OAuth 2.0) |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |

5. Click **Deploy** — Vercel will build and deploy automatically.

---

## Step 3: Configure GitHub Secrets for CI/CD

Go to **GitHub → Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | Your Render backend URL |
| `RENDER_DEPLOY_HOOK_URL` | From Render: Service → Settings → Deploy Hooks |
| `VERCEL_DEPLOY_HOOK_URL` | From Vercel: Project → Settings → Git → Deploy Hooks |

After this, every push to `main` will automatically:
1. ✅ Run backend tests (27 tests)
2. ✅ Run frontend build (65 pages)
3. 🚀 Trigger Render redeploy
4. 🚀 Trigger Vercel redeploy

---

## Step 4: Custom Domain (tulasiai.in)

### Vercel
1. Vercel Dashboard → Project → Settings → Domains
2. Add `www.tulasiai.in` and `tulasiai.in`
3. Point DNS `CNAME` → `cname.vercel-dns.com`

### Render (API subdomain)
1. Render Dashboard → Service → Settings → Custom Domains
2. Add `api.tulasiai.in`
3. Point DNS `CNAME` → your Render service URL

---

## Step 5: Verify Everything Works

```bash
# Health check
curl https://tulasi-ai-soda.onrender.com/api/health

# Expected response
{"status": "ok", "version": "3.0"}
```

Then visit `https://www.tulasiai.in` — you should see the live platform!

---

## Local Development

```bash
# Backend
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## Docker (Alternative)

```bash
# At project root
docker-compose up --build -d

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
```
