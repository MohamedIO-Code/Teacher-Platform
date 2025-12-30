@echo off
setlocal
echo ===================================================
echo   Building Teacher Platform for Client Distribution
echo ===================================================
echo.

:: 1. Install Dependencies
echo [1/7] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies.
    pause
    exit /b %ERRORLEVEL%
)

:: 2. Generate Prisma Client
echo [2/7] Generating Prisma Client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo Error generating Prisma client.
    pause
    exit /b %ERRORLEVEL%
)

:: 3. Build Next.js App
echo [3/7] Building Next.js application (Standalone Mode)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Error building application.
    pause
    exit /b %ERRORLEVEL%
)

:: 4. Prepare Directory Structure
echo [4/7] Creating distribution directories...
if exist TeacherPlatform_Client rmdir /s /q TeacherPlatform_Client
mkdir TeacherPlatform_Client
mkdir TeacherPlatform_Client\bin
mkdir TeacherPlatform_Client\app

:: 4.5 Download Node.js Runtime
echo [4.5/7] Downloading Node.js Runtime (Portable)...
powershell -Command "try { Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.0/win-x64/node.exe' -OutFile 'TeacherPlatform_Client\bin\node.exe' -ErrorAction Stop; Write-Host 'Download complete.' } catch { Write-Host 'Download failed. You will need to download node.exe manually.' }"

:: 5. Copy Application Files
echo [5/7] Copying application files...
:: Copy Standalone build
xcopy /E /I /Y .next\standalone TeacherPlatform_Client\app > nul
:: Copy Static assets (Required for CSS/JS to work)
mkdir TeacherPlatform_Client\app\.next\static
xcopy /E /I /Y .next\static TeacherPlatform_Client\app\.next\static > nul
:: Copy Public assets
mkdir TeacherPlatform_Client\app\public
xcopy /E /I /Y public TeacherPlatform_Client\app\public > nul

:: 6. Copy Database and Config
echo [6/7] Copying database and configuration...
mkdir TeacherPlatform_Client\app\prisma
:: Copy the SQLite database
copy prisma\dev.db TeacherPlatform_Client\app\prisma\dev.db > nul
:: Copy schema (sometimes needed)
copy prisma\schema.prisma TeacherPlatform_Client\app\prisma\schema.prisma > nul
:: Copy .env
copy .env TeacherPlatform_Client\app\.env > nul

:: 7. Create Client Launcher Script
echo [7/7] Creating 'run.bat' for client...
(
echo @echo off
echo title Teacher Platform Launcher
echo color 0A
echo cls
echo ===================================================
echo             Teacher Platform
echo ===================================================
echo.
echo [INFO] Initializing system...
echo.
echo.
echo set "CURRENT_DIR=%%~dp0"
echo set "NODE_EXE=%%CURRENT_DIR%%\bin\node.exe"
echo set "APP_DIR=%%CURRENT_DIR%%\app"
echo.
:: Check for Node.js
echo if not exist "%%NODE_EXE%%" ^(
    echo     color 0C
    echo     echo [ERROR] node.exe not found!
    echo.
    echo     The system cannot start because 'node.exe' is missing from the 'bin' folder.
    echo.
    echo     Please ensure the platform files are complete.
    echo     pause
    echo     exit /b
    echo ^)
echo.
:: Switch to App Directory
echo cd /d "%%APP_DIR%%"
echo.
:: Set Environment Variables
echo set PORT=3000
echo set HOSTNAME=localhost
echo set NODE_ENV=production
:: Ensure DB path is correct relative to execution
echo set DATABASE_URL=file:./prisma/dev.db
echo.
echo [INFO] Starting Server...
echo [INFO] A browser window will open shortly at http://localhost:3000
echo.
echo ---------------------------------------------------
echo      DO NOT CLOSE THIS WINDOW WHILE WORKING
echo ---------------------------------------------------
echo.
echo.
:: Open Browser after a slight delay
echo start /b "" cmd /c "timeout /t 5 >nul & start "" "http://localhost:3000""
echo.
:: Start Node Server
echo "%%NODE_EXE%%" server.js
echo.
echo [INFO] Server stopped.
echo pause
) > TeacherPlatform_Client\run.bat

:: Create Instructions Text
(
echo ===================================================
echo   TEACHER PLATFORM - DISTRIBUTION INSTRUCTIONS
echo ===================================================
echo.
echo 1. BINARY REQUIREMENT:
   echo    You (the developer) must download the standalone 'node.exe' file.
   echo    - Download from: https://nodejs.org/dist/v20.10.0/win-x64/node.exe
     echo      (Or any stable Node v18+ executable for Windows x64)
echo.
echo 2. PLACE THE FILE:
   echo    Put 'node.exe' inside the 'bin' folder located here:
   echo    TeacherPlatform_Client\bin\
echo.
echo 3. DISTRIBUTE:
   echo    Once 'node.exe' is in place, you can zip the 'TeacherPlatform_Client' folder
   echo    and send it to the client.
echo.
echo 4. RUNNING:
   echo    The client only needs to unzip the folder and double-click 'run.bat'.
) > TeacherPlatform_Client\README_FOR_DEVELOPER.txt

echo.
echo ===================================================
echo                 BUILD COMPLETE
echo ===================================================
echo.
echo The package is ready in: TeacherPlatform_Client\
echo.
echo IMPORTANT NEXT STEP:
echo Read 'TeacherPlatform_Client\README_FOR_DEVELOPER.txt'
echo and place 'node.exe' in the bin folder.
echo.
pause
