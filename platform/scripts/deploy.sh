#!/bin/bash

# Deploy helper script
# Usage: ./deploy.sh [staging|production]
#
# Note: This script only builds and prepares for deployment.
# Actual deployment should be triggered via GitHub Actions.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLATFORM_DIR="$(dirname "$SCRIPT_DIR")"
ENV="${1:-staging}"

echo "Preparing deployment for: $ENV"
echo "Platform directory: $PLATFORM_DIR"

cd "$PLATFORM_DIR"

case $ENV in
    staging)
        echo "Building staging image..."
        docker compose -f docker/docker-compose.staging.yml build
        echo ""
        echo "Staging image built successfully."
        echo "To deploy, push changes to the develop branch and merge to staging."
        ;;
    production)
        echo "Building production image..."
        docker compose -f docker/docker-compose.prod.yml build
        echo ""
        echo "Production image built successfully."
        echo "IMPORTANT: Production deployments must be triggered manually via GitHub Actions."
        echo "Go to: GitHub > Actions > Deploy to Production > Run workflow"
        ;;
    *)
        echo "Unknown environment: $ENV"
        echo "Usage: ./deploy.sh [staging|production]"
        exit 1
        ;;
esac
