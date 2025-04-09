#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Bookstore Backend Setup..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if MongoDB container is running
if ! docker ps | grep -q "mongodb"; then
    echo "🔄 MongoDB container not found. Starting MongoDB container..."
    
    # Check if MongoDB container exists but is stopped
    if docker ps -a | grep -q "mongodb"; then
        echo "🔄 Restarting existing MongoDB container..."
        docker start mongodb
    else
        echo "🔄 Creating and starting new MongoDB container..."
        docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db mongo:latest
    fi
    
    echo "✅ MongoDB container started."
else
    echo "✅ MongoDB container is already running."
fi

# Use nvm to set the correct Node.js version
echo "🔄 Setting up Node.js environment..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# Check if .nvmrc exists and use it
if [ -f .nvmrc ]; then
    echo "🔄 Using Node.js version specified in .nvmrc..."
    nvm use
else
    echo "⚠️ No .nvmrc file found. Using default Node.js version."
    # You can specify a default version here if needed
    # nvm use 16
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "🔄 Installing dependencies..."
    npm install
fi

# Build TypeScript files if needed
echo "🔄 Building TypeScript files..."
npm run build

# Start the backend server
echo "🚀 Starting backend server..."
npm run dev

echo "✅ Setup complete!"
