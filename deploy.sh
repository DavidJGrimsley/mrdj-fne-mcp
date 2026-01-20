#!/bin/bash
set -e

# Deploy script for mrdj-fne-mcp
# This script builds and starts the MCP server

echo "🚀 Deploying mrdj-fne-mcp..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ ! -f "build/index.js" ]; then
    echo "❌ Build failed - build/index.js not found"
    exit 1
fi

echo "✅ Build successful"

# Start the server with PM2 (if available)
if command -v pm2 &> /dev/null; then
    echo "🔄 Restarting with PM2..."
    pm2 delete mrdj-fne-mcp 2>/dev/null || true
    pm2 start npm --name "mrdj-fne-mcp" -- run start:http
    pm2 save
    echo "✅ Server started with PM2"
else
    echo "⚠️  PM2 not found. To run as a service, install PM2:"
    echo "   npm install -g pm2"
    echo ""
    echo "To start the server manually:"
    echo "   npm run start:http"
fi

echo "✅ Deployment complete!"
echo ""
echo "Server endpoints:"
echo "  - Health: http://localhost:4028/health"
echo "  - MCP: http://localhost:4028/mcp"
echo "  - Portfolio: http://localhost:4028/portfolio.json"
