#!/bin/bash

# Start Firebase Emulator standalone (without the app)
# Useful for running tests or when developing locally without Docker

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLATFORM_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PLATFORM_DIR"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

echo "Starting Firebase Emulator..."
echo "Firestore: http://localhost:8080"
echo "Auth: http://localhost:9099"
echo "Emulator UI: http://localhost:4000"

cd firebase
firebase emulators:start --project social-listener-dev --only auth,firestore
