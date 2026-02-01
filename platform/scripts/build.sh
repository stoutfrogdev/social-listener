#!/bin/bash

# Build the production Docker image
# Usage: ./build.sh [staging|production]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLATFORM_DIR="$(dirname "$SCRIPT_DIR")"
ENV="${1:-production}"

echo "Building for environment: $ENV"
echo "Platform directory: $PLATFORM_DIR"

cd "$PLATFORM_DIR"

# Build the Docker image
docker build -t social-listener-platform:$ENV -f docker/Dockerfile .

echo "Build complete: social-listener-platform:$ENV"
