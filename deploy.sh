#!/bin/bash

# Exit on error
set -e

# Configuration
PROJECT_ID="content-humanizer-f9499"

# Prevent IPv6 loopback timeouts on Node 18+ (especially on Mac setups)
export NODE_OPTIONS="--dns-result-order=ipv4first"

echo "============================================="
echo "  Content Humanizer Deployment Tool"
echo "============================================="
echo "Target Firebase Project: $PROJECT_ID"
echo ""
echo "Select deployment option:"
echo "1) Compile & Deploy ALL Firebase resources (Functions, Firestore, & Hosting)"
echo "2) Compile & Deploy Firebase Functions only"
echo "3) Deploy Firestore rules and indexes only"
echo "4) Compile & Deploy Firebase Hosting only"
echo "5) Exit"
echo ""
read -rp "Enter choice [1-5]: " choice

compile_functions() {
  echo ">>> Compiling functions codebase..."
  cd functions
  npm install
  npm run build
  cd ..
}

compile_webapp() {
  echo ">>> Compiling webapp codebase..."
  cd webapp
  npm install
  npm run build
  cd ..
}

case $choice in
  1)
    echo "Starting full deployment..."
    compile_webapp
    compile_functions
    echo ">>> Deploying to Firebase..."
    npx -y firebase-tools@latest deploy --project "$PROJECT_ID"
    ;;
  2)
    echo "Starting functions deployment..."
    compile_functions
    echo ">>> Deploying functions codebase..."
    npx -y firebase-tools@latest deploy --only functions --project "$PROJECT_ID"
    ;;
  3)
    echo "Deploying Firestore configuration..."
    npx -y firebase-tools@latest deploy --only firestore --project "$PROJECT_ID"
    ;;
  4)
    echo "Starting hosting deployment..."
    compile_webapp
    echo ">>> Deploying hosting..."
    npx -y firebase-tools@latest deploy --only hosting --project "$PROJECT_ID"
    ;;
  5)
    echo "Deployment cancelled."
    exit 0
    ;;
  *)
    echo "Invalid option."
    exit 1
    ;;
esac

echo ""
echo "Deployment process completed successfully!"

