#!/bin/bash

# Start development environment with Docker Compose
# This starts the Next.js app with hot-reload and Firebase Emulator

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLATFORM_DIR="$(dirname "$SCRIPT_DIR")"

echo "Starting development environment..."
echo "Platform directory: $PLATFORM_DIR"

cd "$PLATFORM_DIR"

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start the development environment
docker compose -f docker/docker-compose.yml up --build

echo "Development environment stopped."
