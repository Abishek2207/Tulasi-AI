@echo off
echo ==========================================
echo 🌿 Tulasi AI - Backend Setup Fixer
echo ==========================================

cd /d "%~dp0"

echo [1/4] Creating Virtual Environment (venv)...
python -m venv venv
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create virtual environment. 
    echo Please ensure Python is installed and added to PATH.
    pause
    exit /b %errorlevel%
)

echo [2/4] Activating Virtual Environment...
call .\venv\Scripts\activate

echo [3/4] Installing Required Dependencies...
echo This might take a few minutes...
pip install --upgrade pip
pip install -r requirements.txt

echo [4/4] Starting Backend Server on Port 10000...
echo ------------------------------------------
echo If you see errors about "SUPABASE_URL", 
echo make sure you updated the .env file!
echo ------------------------------------------
uvicorn main:app --reload --port 10000

pause
