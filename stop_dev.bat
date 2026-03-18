@echo off
echo Stopping Local Next.js Node Servers...
taskkill /F /IM node.exe /T >nul 2>&1

echo Stopping Local Python API Servers...
taskkill /F /IM python.exe /T >nul 2>&1

echo All local dev servers successfully shut down!
pause
