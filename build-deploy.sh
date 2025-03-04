#!/bin/bash
# This script orchestrates the build and deployment of a distributed monolith application,
# combining a Next.js frontend (web UI) with a FastAPI backend (Mermaid).
set -e

# Configuration
WEBUI_DIR="services/webui"
MERMAID_DIR="mermaid"
STATIC_OUTPUT_DIR="$MERMAID_DIR/static"

echo "🧹 Cleaning previous builds..."
rm -rf "$WEBUI_DIR/.next"
rm -rf "$WEBUI_DIR/out"
rm -rf "$WEBUI_DIR/out"
rm -rf "services/$MERMAID_DIR/static"

echo "🏗️  Building Next.js static site..."
cd "$WEBUI_DIR"
npm run build

echo "📦 Copying static files to FastAPI..."
mkdir -p "../$STATIC_OUTPUT_DIR"
cp -r out/* "../$STATIC_OUTPUT_DIR"
cd ..

echo "🚀 Starting FastAPI server..."
cd "$MERMAID_DIR"
echo 
uv run src/main.py

