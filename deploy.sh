#!/bin/bash

# Exit on error
set -e

# Configuration
PROJECT_ID="content-humanizer-f9499"

# Prevent IPv6 loopback timeouts on Node 18+ (especially on Mac setups)
export NODE_OPTIONS="--dns-result-order=ipv4first"

echo "============================================="
echo "🚀 Starting Content Humanizer Deployment"
echo "============================================="
echo "Target Firebase Project: $PROJECT_ID"
echo ""

echo ">>> 📦 Compiling React frontend codebase..."
cd webapp
npm install
npm run build
cd ..

echo ">>> 🌐 Deploying Frontend & Firestore Configuration..."
npx -y firebase-tools@latest deploy --only hosting,firestore --project "$PROJECT_ID"

echo ""
echo "🎉 Deployment completed successfully!"
echo "Live URL: https://$PROJECT_ID.web.app"
