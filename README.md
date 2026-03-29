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

## 🔄 Toggling API Connections

If you want to use your Local Backend (`http://127.0.0.1:10000`), simply add this to your `frontend/.env.local`:
```env
NEXT_PUBLIC_LOCAL_BACKEND="http://127.0.0.1:10000"
```
To reconnect back to the live Production Cloud API (`https://tulasi-ai-wgwl.onrender.com`), simply delete that line.

## 🛠 Manual Setup Instructions

If you need to install or run components manually:

**Backend:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 10000
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
