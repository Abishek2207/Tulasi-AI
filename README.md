# Tulasi AI - Local Development Guide

Welcome to the Tulasi AI project repository. This document outlines how to spin up the local environment, test seamlessly, and toggle between local and production data.

## 🚀 One-Click Local Startup

We've automated the entire local dev environment setup for Windows!

Simply run:
```bash
./start_dev.bat
```
*(Or navigate to `/frontend` and run `$ npm run dev:all`)*

This script will automatically:
1. Boot the Python `FastAPI` instance natively via isolated Virtual Environments (`backend/venv`).
2. Boot the `Next.js` frontend dev server.
3. Automatically launch your browser to `http://localhost:3000`.

To gracefully kill both servers when you are done, simply double-click or run:
```bash
./stop_dev.bat
```

## 🔐 Environment Setup (Production Upgrade)

### Professional Mode Configuration
To run the agentic Professional Mode with real-time career intelligence:
1. Ensure your `.env` contains `SERPAPI_API_KEY` for live job postings and skill demand analytics.
2. Provide `QDRANT_URL` and `QDRANT_API_KEY` to enable vector storage for career risk RAG. (Can be run locally via `docker run -p 6333:6333 qdrant/qdrant` or via Qdrant Cloud).
3. If no `SERPAPI_API_KEY` is present, the app will gracefully fall back to a `demo_mode` to ensure the platform doesn't crash, but it will not serve real-time market data.

TulasiAI now uses a Free-First API architecture! No credit cards required.

1. **Backend API Keys:**
   Navigate to the `backend/` directory, copy `.env.example` to `.env`, and fill in the keys:
   ```bash
   cd backend
   cp .env.example .env
   ```
   *Required Keys:*
   - `GEMINI_API_KEY` (Free tier from Google AI Studio. Required for DSA, Communication, Interview Agents)

   *Optional Keys:*
   - `ADZUNA_APP_ID` & `ADZUNA_APP_KEY` (For additional Job matches, otherwise RemoteOK is used)
   - `JOOBLE_API_KEY` (For additional Job matches)
   - `GITHUB_TOKEN` (Not required, Public API is used. Add to increase rate limits)

2. **Frontend Config:**
   Navigate to the `frontend/` directory, copy `.env.example` to `.env.local`:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
   *Required Keys:*
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Verify Configuration:**
   Once both servers are running, go to **`http://localhost:3000/dashboard/settings/api-setup`** in your browser to verify that your integrations are securely connected.

## 🔄 Toggling API Connections

If you want to use your Local Backend (`http://127.0.0.1:8000`), simply add this to your `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
```
To reconnect back to the live Production Cloud API (`https://tulasi-ai-hycl.onrender.com`), simply delete that line.

## 🛠 Manual Setup Instructions

If you need to install or run components manually:

**Backend:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python create_db.py  # Run database migration for first-time setup
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing
Run PyTest locally for the comprehensive Python suite:
```bash
cd backend
.\venv\Scripts\python.exe -m pytest
```

---

## 💎 About the Creator

**Tulasi AI** was architected, developed, and launched by **Abishek R**, Founder & CEO. 

Driven by the mission to democratize career intelligence for engineers worldwide, Abishek built this platform to bridge the gap between academic theory and global industry standards using advanced Generative AI and neural skill mapping.

- **Founder & CEO:** [Abishek R](https://www.linkedin.com/in/abishek-r)
- **GitHub:** [Abishek2207](https://github.com/Abishek2207)
- **Portfolio:** [tulasiai.in](https://www.tulasiai.in)
