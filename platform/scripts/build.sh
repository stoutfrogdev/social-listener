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

# Use environment-specific env file if it exists
ENV_FILE="config/.env.${ENV}"
BUILD_ARGS=""

if [ -f "$ENV_FILE" ]; then
  echo "Using env file: $ENV_FILE"
  BUILD_ARGS="--build-arg ENV_FILE=$ENV_FILE"
fi

# Build the Docker image with environment tag
docker build \
  $BUILD_ARGS \
  --build-arg NODE_ENV="${ENV}" \
  -t "social-listener-platform:${ENV}" \
  -f docker/Dockerfile .

echo "Build complete: social-listener-platform:${ENV}"
