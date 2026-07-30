#!/bin/bash

# Exit on error
set -e

# Configuration
PROJECT_ID="content-humanizer-f9499"

# Prevent IPv6 loopback timeouts on Node 18+ (especially on Mac setups)
export NODE_OPTIONS="--dns-result-order=ipv4first"

echo "============================================="
echo "  Forzeo Frontend Deployment Tool"
echo "============================================="
echo "Target Firebase Project: $PROJECT_ID"
echo ""

echo ">>> Compiling React frontend dashboard..."
cd webapp
npm install
npm run build
cd ..

echo ">>> Deploying frontend to Firebase Hosting..."
npx -y firebase-tools@latest deploy --only hosting --project "$PROJECT_ID"

echo ""
echo "Frontend deployment completed successfully!"
echo "Your live app URL: https://$PROJECT_ID.web.app"
