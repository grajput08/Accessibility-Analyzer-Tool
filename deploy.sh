#!/bin/bash

# Deployment script for Accessibility Analyzer Tool
# This script helps prepare and deploy the application to Vercel

echo "🚀 Starting deployment preparation..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found. Please run this script from the project root."
    exit 1
fi

# Build the project
echo "📦 Building the project..."
pnpm build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if we should deploy
echo ""
echo "🎯 Ready to deploy to Vercel!"
echo ""
echo "Next steps:"
echo "1. Run 'vercel' to deploy (if not logged in, it will prompt for login)"
echo "2. Or run 'vercel --prod' to deploy directly to production"
echo ""
echo "Your application will be available at:"
echo "- Frontend: https://your-project.vercel.app"
echo "- Backend API: https://your-project.vercel.app/api"
echo ""

# Ask if user wants to deploy now
read -p "Do you want to deploy now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying to Vercel..."
    vercel
else
    echo "📝 Deployment skipped. Run 'vercel' when ready to deploy."
fi 