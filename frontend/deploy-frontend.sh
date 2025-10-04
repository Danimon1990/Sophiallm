#!/bin/bash

# Deployment script for Frontend to Firebase Hosting
# Project: sophiallm

set -e  # Exit on error

echo "🚀 Deploying Frontend to Firebase Hosting"
echo "=========================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in to Firebase
echo "🔐 Checking Firebase authentication..."
firebase login

# Build the React app
echo "📦 Building React application..."
npm run build

# Deploy to Firebase Hosting
echo "🚢 Deploying to Firebase Hosting..."
firebase deploy --only hosting

# Get the hosting URL
echo ""
echo "✅ Deployment complete!"
echo "=========================================="
echo "🌐 Frontend URL: https://sophiallm.web.app"
echo "   or: https://sophiallm.firebaseapp.com"
echo ""
