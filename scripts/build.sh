#!/bin/bash

# Build script for agent-interface
# This script builds the frontend static files and prepares the project for deployment.

# Configuration
# Get the project root directory (parent of the scripts directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SERVICE_DIR="$PROJECT_ROOT/services/backend"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$PROJECT_ROOT/logs"
LOG_FILE="$LOG_DIR/build_${TIMESTAMP}.log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages to both console and file
log() {
    echo "$1" | tee -a "$LOG_FILE"
}

log "🚀 Starting build process at $(date)..."

# Check if the service directory exists
if [ ! -d "$SERVICE_DIR" ]; then
    log "❌ Error: Service directory not found at $SERVICE_DIR"
    exit 1
fi

# Build frontend static files
FRONTEND_DIR="$PROJECT_ROOT/services/frontend"
if [ -d "$FRONTEND_DIR" ]; then
    log "🎨 Building frontend static files..."
    cd "$FRONTEND_DIR"
    
    # Check if package.json exists
    if [ -f "package.json" ]; then
        # Check if node_modules exists, if not run npm install
        if [ ! -d "node_modules" ]; then
            log "📦 Installing frontend dependencies..."
            if npm install >> "$LOG_FILE" 2>&1; then
                log "✅ Frontend dependencies installed successfully"
            else
                log "❌ Error: Failed to install frontend dependencies"
                exit 1
            fi
        else
            log "✅ Frontend dependencies already installed"
        fi
        
        # Clear Next.js cache to ensure fresh build
        log "🧹 Clearing Next.js cache..."
        rm -rf .next >> "$LOG_FILE" 2>&1 || true
        
        # Run the static build
        log "🏗️  Running npm run build-static..."
        if NEXT_PUBLIC_API_BASE_URL= npm run build-static >> "$LOG_FILE" 2>&1; then
            log "✅ Frontend static build completed successfully"
        else
            log "❌ Error: Failed to build frontend static files"
            exit 1
        fi
    else
        log "❌ Error: No package.json found in frontend directory"
        exit 1
    fi
else
    log "❌ Error: Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

# Back to root
cd "$PROJECT_ROOT"

log "🎉 Build process completed successfully at $(date)!"
log "📋 Process log saved to: $LOG_FILE"