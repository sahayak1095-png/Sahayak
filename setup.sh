#!/bin/bash

# Sahayak Setup Script for macOS/Linux

echo ""
echo "========================================"
echo "  Sahayak Full Stack Setup"
echo "========================================"
echo ""

# Check .NET
echo "Checking .NET installation..."
if ! command -v dotnet &> /dev/null; then
    echo "ERROR: .NET SDK not found. Please install .NET 8 SDK first."
    echo "Download from: https://dotnet.microsoft.com/download"
    exit 1
fi
echo "✓ .NET SDK found: $(dotnet --version)"

# Check Node.js
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Please install Node.js 16+ first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js found: $(node --version)"

# Check PostgreSQL
echo "Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo "WARNING: PostgreSQL CLI not found in PATH"
    echo "You may need to ensure PostgreSQL is running locally"
fi
echo ""

# Setup Backend
echo "========================================"
echo "Setting up Backend..."
echo "========================================"
cd Sahayak.Backend

echo "Restoring dependencies..."
dotnet restore

echo "Applying database migrations..."
dotnet ef database update

if [ $? -ne 0 ]; then
    echo "ERROR: Database migration failed"
    echo "Make sure PostgreSQL is running and connection string is correct"
    exit 1
fi
echo "✓ Backend setup complete"

cd ..
echo ""

# Setup Frontend
echo "========================================"
echo "Setting up Frontend..."
echo "========================================"
cd Sahayak.Frontend

echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed"
    exit 1
fi

echo "Creating .env.local..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✓ Created .env.local"
fi

echo "✓ Frontend setup complete"

cd ..
echo ""

echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd Sahayak.Backend"
echo "   dotnet run"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd Sahayak.Frontend"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Admin Password: sahayak"
echo ""
