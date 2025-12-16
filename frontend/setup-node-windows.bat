@echo off
REM Batch script to download and setup Node.js on Windows (portable)
REM Run this script: setup-node-windows.bat

set NODE_VERSION=v20.6.0
set NODE_DIR=node-%NODE_VERSION%-win-x64
set ZIP_FILE=%NODE_DIR%.zip
set NODE_URL=https://nodejs.org/dist/%NODE_VERSION%/%ZIP_FILE%

echo 📦 Downloading Node.js %NODE_VERSION%...
powershell -Command "Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%ZIP_FILE%' -UseBasicParsing"
if errorlevel 1 (
    echo ❌ Download failed
    exit /b 1
)

echo 📂 Extracting...
powershell -Command "Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '.' -Force"
if errorlevel 1 (
    echo ❌ Extraction failed
    exit /b 1
)

echo.
echo ✅ Node.js extracted to %NODE_DIR%\
echo.

REM Add to PATH for current session
set PATH=%CD%\%NODE_DIR%;%PATH%

echo Verifying installation...
"%CD%\%NODE_DIR%\node.exe" -v
if errorlevel 1 (
    echo ❌ Verification failed
    exit /b 1
)

"%CD%\%NODE_DIR%\npm.cmd" -v
if errorlevel 1 (
    echo ❌ npm verification failed
    exit /b 1
)

echo.
echo 📝 Node.js is added to PATH for this session
echo.
echo To make it permanent, add this to your PATH environment variable:
echo   %CD%\%NODE_DIR%
echo.
echo ✅ Setup complete! Now run:
echo   cd frontend
echo   npm install
echo   npm run dev

