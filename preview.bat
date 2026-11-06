@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   Yu Sicheng - Portfolio local preview
echo   Browser will open http://localhost:8000
echo   Close this window to stop the server.
echo.
start "" http://localhost:8000
python -m http.server 8000
pause
