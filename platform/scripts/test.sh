#!/bin/bash

# Run tests
# Usage: ./test.sh [--watch] [--coverage]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLATFORM_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PLATFORM_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Parse arguments
ARGS=""
for arg in "$@"; do
    case $arg in
        --watch)
            ARGS="$ARGS --watch"
            ;;
        --coverage)
            ARGS="$ARGS --coverage"
            ;;
    esac
done

echo "Running tests..."
npm run test $ARGS
