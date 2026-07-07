@echo off
REM Sahayak Setup Script for Windows

echo.
echo ========================================
echo  Sahayak Full Stack Setup
echo ========================================
echo.

REM Check .NET
echo Checking .NET installation...
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: .NET SDK not found. Please install .NET 8 SDK first.
    echo Download from: https://dotnet.microsoft.com/download
    exit /b 1
)
echo ✓ .NET SDK found

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 16+ first.
    echo Download from: https://nodejs.org/
    exit /b 1
)
echo ✓ Node.js found: %node --version%

REM Check PostgreSQL
echo Checking PostgreSQL installation...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: PostgreSQL CLI not found in PATH
    echo You may need to add PostgreSQL bin directory to PATH
    echo Or ensure PostgreSQL is running locally
)
echo.

REM Setup Backend
echo ========================================
echo Setting up Backend...
echo ========================================
cd Sahayak.Backend

echo Restoring dependencies...
dotnet restore

echo Applying database migrations...
dotnet ef database update

if %errorlevel% neq 0 (
    echo ERROR: Database migration failed
    echo Make sure PostgreSQL is running and connection string is correct
    exit /b 1
)
echo ✓ Backend setup complete

cd ..
echo.

REM Setup Frontend
echo ========================================
echo Setting up Frontend...
echo ========================================
cd Sahayak.Frontend

echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    exit /b 1
)

echo Creating .env.local...
if not exist .env.local (
    copy .env.example .env.local
    echo ✓ Created .env.local
)

echo ✓ Frontend setup complete

cd ..
echo.

echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Start Backend (Terminal 1):
echo    cd Sahayak.Backend
echo    dotnet run
echo.
echo 2. Start Frontend (Terminal 2):
echo    cd Sahayak.Frontend
echo    npm run dev
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo Admin Password: sahayak
echo.
pause
