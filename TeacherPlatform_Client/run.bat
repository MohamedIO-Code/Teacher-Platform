@echo off
title Teacher Platform Launcher
color 0A
cls
===================================================
            Teacher Platform
===================================================

[INFO] Initializing system...


set "CURRENT_DIR=%~dp0"
set "NODE_EXE=%CURRENT_DIR%\bin\node.exe"
set "APP_DIR=%CURRENT_DIR%\app"

if not exist "%NODE_EXE%" (
    color 0C
    echo [ERROR] node.exe not found!

    The system cannot start because 'node.exe' is missing from the 'bin' folder.

    Please ensure the platform files are complete.
    pause
    exit /b
)

cd /d "%APP_DIR%"

set PORT=3000
set HOSTNAME=localhost
set NODE_ENV=production
set DATABASE_URL=file:./prisma/dev.db

[INFO] Starting Server...
[INFO] A browser window will open shortly at http://localhost:3000

---------------------------------------------------
     DO NOT CLOSE THIS WINDOW WHILE WORKING
---------------------------------------------------


start /b "" cmd /c "timeout /t 5 >nul & start "" "http://localhost:3000""

"%NODE_EXE%" server.js

[INFO] Server stopped.
pause
