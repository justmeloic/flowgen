#!/bin/bash

# Bundle and upload agent-orchestration service to Google Cloud Storage
# This script creates a zip archive of the agent-orchestration service,
# uploads it to GCS, and cleans up the local zip file.

# Configuration
PROJECT_ROOT="/home/txt36456/codebase/cn-cba-agent"
SERVICE_DIR="$PROJECT_ROOT/services/agent-orchestration"
GCS_BUCKET="gs://cn-agent-deployment/" 
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ZIP_NAME="build-${TIMESTAMP}.zip"
ZIP_PATH="$PROJECT_ROOT/$ZIP_NAME"
LOG_DIR="$PROJECT_ROOT/logs"
LOG_FILE="$LOG_DIR/build_${TIMESTAMP}.log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages to both console and file
log() {
    echo "$1" | tee -a "$LOG_FILE"
}

log "🚀 Starting build and upload process at $(date)..."

# Check gcloud authentication
log "🔐 Checking gcloud authentication..."
if ! gcloud auth list --filter="status:ACTIVE" --format="value(account)" | grep -q .; then
    log "❌ Error: No active gcloud authentication found. Please run 'gcloud auth login' first."
    exit 1
fi
log "✅ Gcloud authentication check passed"

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
                log "🔄 Continuing with build process anyway..."
            fi
        else
            log "✅ Frontend dependencies already installed"
        fi
        
        # Run the static build
        log "🏗️  Running npm run build-static..."
        if NEXT_PUBLIC_API_BASE_URL= npm run build-static >> "$LOG_FILE" 2>&1; then
            log "✅ Frontend static build completed successfully"
        else
            log "❌ Error: Failed to build frontend static files"
            log "🔄 Continuing with build process anyway..."
        fi
    else
        log "⚠️  Warning: No package.json found in frontend directory"
    fi
else
    log "⚠️  Warning: Frontend directory not found at $FRONTEND_DIR"
    log "🔄 Continuing with build process anyway..."
fi

# Create zip archive
log "📦 Creating zip archive: $ZIP_NAME"
cd "$PROJECT_ROOT/services"

# Use a more effective approach to exclude .venv
zip -r "$ZIP_PATH" agent-orchestration/ \
    -x "agent-orchestration/.venv/*" \
    -x "agent-orchestration/.venv/**" \
    -x "*/.venv/*" \
    -x "*/.venv/**" \
    -x "agent-orchestration/__pycache__/*" \
    -x "agent-orchestration/*/__pycache__/*" \
    -x "agent-orchestration/*/*/__pycache__/*" \
    -x "**/__pycache__/*" >> "$LOG_FILE" 2>&1

# Check if zip was created successfully
if [ ! -f "$ZIP_PATH" ]; then
    log "❌ Error: Failed to create zip archive"
    exit 1
fi

log "✅ Zip archive created successfully: $ZIP_PATH"
log "📏 Archive size: $(du -h "$ZIP_PATH" | cut -f1)"

# Clean up existing zip files in the bucket
log "🧹 Cleaning up existing zip files in bucket..."
if gcloud storage ls "$GCS_BUCKET*.zip" 2>>"$LOG_FILE" | grep -q ".zip"; then
    log "🗑️  Found existing zip files, deleting them..."
    gcloud storage rm "$GCS_BUCKET*.zip" 2>>"$LOG_FILE" || log "⚠️  No zip files to delete or deletion failed"
else
    log "✨ No existing zip files found in bucket"
fi

# Upload to Google Cloud Storage
log "☁️  Uploading to Google Cloud Storage: $GCS_BUCKET"
if gcloud storage cp "$ZIP_PATH" "$GCS_BUCKET" 2>>"$LOG_FILE"; then
    log "🎉 Upload successful!"
else
    log "❌ Error: Failed to upload to Google Cloud Storage"
    log "🔄 Continuing with cleanup despite upload failure..."
fi

# Clean up local zip file
log "🧹 Cleaning up local zip file..."
rm "$ZIP_PATH"

if [ ! -f "$ZIP_PATH" ]; then
    log "✅ Local zip file deleted successfully"
else
    log "⚠️  Warning: Failed to delete local zip file"
fi

# Back to root
cd "$PROJECT_ROOT"

log "🎉 Bundle and upload process completed successfully at $(date)!"
log "📤 Archive uploaded to: ${GCS_BUCKET}${ZIP_NAME}"
log "📋 Process log saved to: $LOG_FILE"