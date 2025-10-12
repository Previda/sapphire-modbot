@echo off
echo 🔍 Checking Skyfall Pi Bot Status...
echo.

set PI_IP=192.168.1.62
set PORT=3001

echo 📡 Testing Pi Bot Connection...
ping -n 1 %PI_IP% >nul
if %errorlevel% == 0 (
    echo ✅ Pi is reachable at %PI_IP%
) else (
    echo ❌ Cannot reach Pi at %PI_IP%
    echo Check network connection and Pi IP address
    pause
    exit /b 1
)

echo.
echo 🌐 Testing API endpoint...
curl -s --connect-timeout 5 http://%PI_IP%:%PORT%/api/status >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ API server is responding on port %PORT%
    echo.
    echo 📊 API Response:
    curl -s http://%PI_IP%:%PORT%/api/status
) else (
    echo ❌ API server not responding
    echo Bot may be offline or not serving API
)

echo.
echo 🌐 Dashboard Info:
echo Dashboard URL: https://skyfall-omega.vercel.app
echo Expected Pi URL: http://%PI_IP%:%PORT%
echo.
echo 🔧 To connect to Pi via SSH:
echo ssh pi@%PI_IP%
echo.
echo 📋 Useful Pi Commands:
echo pm2 list          - Check bot status
echo pm2 logs sapphire-bot - View bot logs  
echo pm2 restart sapphire-bot - Restart bot
echo pm2 start index.js --name sapphire-bot - Start bot
echo.
pause
