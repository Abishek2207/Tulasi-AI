@echo off
setlocal

echo 🚀 Tulasi AI — Initializing Local Development Environment...

:: Check for Backend Virtual Environment
if not exist "backend\venv" (
    echo ❌ ERROR: Backend virtual environment NOT found at 'backend\venv'.
    echo 💡 Run 'cd backend && python -m venv venv && pip install -r requirements.txt' first.
    pause
    exit /b 1
)

echo ✅ Backend Environment Verified.
echo 📡 Starting Frontend and Backend Services...

cd frontend
npm run dev:all