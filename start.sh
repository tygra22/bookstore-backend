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
if ! docker ps | grep -q "bookstore-mongodb"; then
    echo "🔄 MongoDB container not found. Starting MongoDB container..."
    
    # Check if MongoDB container exists but is stopped
    if docker ps -a | grep -q "bookstore-mongodb"; then
        echo "🔄 Restarting existing MongoDB container..."
        docker start bookstore-mongodb
    else
        echo "🔄 Creating and starting new MongoDB container..."
        docker run -d --name bookstore-mongodb -p 27017:27017 -v mongodb_data:/data/db mongo:latest
    fi
    
    echo "✅ MongoDB container started."
else
    echo "✅ MongoDB container is already running."
fi

# Check Node.js version
echo "🔄 Setting up Node.js environment..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "🔄 Using Node.js version: $NODE_VERSION"
else
    echo "⚠️ Node.js not found. Please install Node.js to run this application."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "🔄 Installing dependencies..."
    npm install
fi

# Skip TypeScript build as we'll use ts-node-dev instead
echo "🔄 Skipping TypeScript build (using ts-node-dev instead)..."

# Create admin user if it doesn't exist
echo "🔄 Creating admin user if it doesn't exist..."
npm run create-admin

# Start the backend server
echo "🚀 Starting backend server..."
npm run dev

echo "✅ Setup complete!"
