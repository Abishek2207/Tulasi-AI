@echo off
echo Starting TulasiAI Educational Platform...

echo Installing Frontend Dependencies...
call npm install

echo Starting Backend Server...
cd backend
if not exist "venv" (
    echo Creating Python Virtual Environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
echo Installing Backend Dependencies...
pip install -r requirements.txt
pip install httpx

start cmd /k "echo Backend Server && uvicorn main:app --port 8000 --reload"

echo Starting Frontend Server...
cd ..
start cmd /k "echo Frontend Server && npm run dev"

echo.
echo TulasiAI is now starting! 
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000
echo.
pause
