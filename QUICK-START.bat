@echo off
echo ========================================
echo  Sapphire Modbot - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and restart this script.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
npm --version
echo.

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo.
    echo Creating .env template...
    (
        echo # Required Discord Bot Settings
        echo DISCORD_BOT_TOKEN=your_bot_token_here
        echo DISCORD_CLIENT_ID=your_application_client_id_here
        echo.
        echo # Optional Database
        echo MYSQL_URL=
        echo MONGODB_URI=
        echo.
        echo # Optional Channel IDs
        echo MOD_LOG_CHANNEL_ID=
        echo APPEALS_CHANNEL_ID=
        echo.
        echo # Memory Settings
        echo MAX_MEMORY=200
        echo PORT=3001
    ) > .env
    echo.
    echo [CREATED] .env file created!
    echo.
    echo IMPORTANT: Edit .env file and add your bot token and client ID
    echo Get them from: https://discord.com/developers/applications
    echo.
    pause
    exit /b 0
)

echo [OK] .env file exists
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed successfully!
    echo.
)

REM Ask user what to do
echo What would you like to do?
echo.
echo 1. Deploy commands to Discord
echo 2. Start the bot
echo 3. Deploy commands AND start bot
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo [INFO] Deploying commands to Discord...
    call npm run deploy-all
    echo.
    echo [DONE] Commands deployed!
    pause
    exit /b 0
)

if "%choice%"=="2" (
    echo.
    echo [INFO] Starting bot...
    echo Press Ctrl+C to stop the bot
    echo.
    call npm run bot
    exit /b 0
)

if "%choice%"=="3" (
    echo.
    echo [INFO] Deploying commands...
    call npm run deploy-all
    echo.
    echo [INFO] Starting bot...
    echo Press Ctrl+C to stop the bot
    echo.
    call npm run bot
    exit /b 0
)

if "%choice%"=="4" (
    exit /b 0
)

echo.
echo [ERROR] Invalid choice!
pause
exit /b 1
