#!/bin/bash

# Setup script for Git hooks
# Run this once after cloning the repository

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
SCRIPTS_HOOKS_DIR="$PROJECT_ROOT/scripts/hooks"

echo "Setting up Git hooks..."

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Copy pre-commit hook
if [ -f "$SCRIPTS_HOOKS_DIR/pre-commit" ]; then
    cp "$SCRIPTS_HOOKS_DIR/pre-commit" "$HOOKS_DIR/pre-commit"
    chmod +x "$HOOKS_DIR/pre-commit"
    echo "✅ Installed pre-commit hook"
else
    echo "❌ Error: pre-commit hook not found at $SCRIPTS_HOOKS_DIR/pre-commit"
    exit 1
fi

echo ""
echo "Git hooks installed successfully!"
echo ""
echo "Hooks installed:"
echo "  - pre-commit: Branch protection, permissions validation, security & testing checks"
echo ""
echo "To bypass hooks in an emergency (NOT RECOMMENDED):"
echo "  git commit --no-verify"
echo ""
