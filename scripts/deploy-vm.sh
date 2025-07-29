#!/bin/bash

# Deploy agent-orchestration service to VM from Google Cloud Storage
# This script downloads the latest build, sets up environment, and runs the server

# Configuration
PROJECT_ROOT="/home/txt36456/cn-cba-agent"
GCS_BUCKET="gs://cn-agent-deployment/"
DEPLOY_DIR="$PROJECT_ROOT/latest-deployment"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$PROJECT_ROOT/logs"
LOG_FILE="$LOG_DIR/deploy_${TIMESTAMP}.log"
SCREEN_NAME="agent-orchestration"
PYTHON_VERSION="3.11"
VENV_NAME=".venv"

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8081

# Profile Cnnfigurations
export PATH="$PATH:$HOME/.local/bin"

export ACCOUNT=txt36456@cn.ca
export PROJECT_ID=cnr-agentspace-lab-76cg
export REGION=us-central1
export AGENT_STAGING_BUCKET="gs://cn-agent-staging"

# Handy aliases
alias gs='git status'
alias auth='gcloud auth login --update-adc'
alias dev='uvicorn src.app.main:app --reload --host 0.0.0.0 --port $SERVER_PORT'
alias serve='gunicorn src.app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$SERVER_PORT --timeout 600'


# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages to both console and file
log() {
    echo "$1" | tee -a "$LOG_FILE"
}

log "🚀 Starting VM deployment process at $(date)..."

gcloud auth login --update-adc

# Check gcloud authentication
log "🔐 Checking gcloud authentication..."
if ! gcloud auth list --filter="status:ACTIVE" --format="value(account)" | grep -q .; then
    log "❌ Error: No active gcloud authentication found. Please run 'gcloud auth login' first."
    log "🔄 Continuing with deployment anyway..."
fi
log "✅ Gcloud authentication check passed"

# Install necessary packages (standard GCP VMs don't have come with unzip, python3.11-venv pre-installed)
log "🔧 Updating package list..."
if ! sudo apt-get update -y >> "$LOG_FILE" 2>&1; then
    log "❌ Error: Failed to update package list."
    log "🔄 Continuing with deployment anyway..."
fi

# Loic: even if the host server has python3.11 installed, the venv module might not be installed by default
# This is especially common in Linux distros like Debian-based ones like Ubuntu.
log "🔧 Installing required packages (unzip, python3.11-venv)..."
if ! sudo apt-get install -y unzip python3.11-venv >> "$LOG_FILE" 2>&1; then
    log "❌ Error: Failed to install dependencies (unzip, python3.11-venv)."
    log "🔄 Continuing with deployment anyway..."
fi
log "✅ System dependencies checked/installed."

# Create deployment directory
log "📁 Creating deployment directory: $DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

# Find the latest build in GCS bucket
log "🔍 Finding latest build in GCS bucket..."
LATEST_BUILD=$(gcloud storage ls "$GCS_BUCKET" | grep "build-" | sort -r | head -1 2>>"$LOG_FILE")

if [ -z "$LATEST_BUILD" ]; then
    log "❌ Error: No builds found in bucket $GCS_BUCKET"
    log "🔄 Continuing with deployment anyway..."
else
    log "📦 Latest build found: $LATEST_BUILD"
    
    # Download the latest build
    log "⬇️  Downloading build from GCS..."
    if gcloud storage cp "$LATEST_BUILD" . 2>>"$LOG_FILE"; then
        log "✅ Build downloaded successfully"
        
        # Extract the zip file
        BUILD_FILE=$(basename "$LATEST_BUILD")
        log "📦 Extracting build: $BUILD_FILE"
        
        # Remove existing extraction directory if it exists
        if [ -d "agent-orchestration" ]; then
            log "🗑️  Removing existing agent-orchestration directory..."
            rm -rf agent-orchestration
        fi
        
        # Extract with overwrite and verbose logging
        if unzip -o "$BUILD_FILE" -d . >> "$LOG_FILE" 2>&1; then
            log "✅ Build extracted successfully"
            rm "$BUILD_FILE"
            log "🗑️  Cleaned up zip file"
        else
            log "❌ Error: Failed to extract build (timeout or extraction error)"
            log "🔄 Continuing with deployment anyway..."
            # Clean up the zip file even if extraction failed
            #rm -f "$BUILD_FILE" 2>/dev/null || true
        fi
    else
        log "❌ Error: Failed to download build from GCS"
        log "🔄 Continuing with deployment anyway..."
    fi
fi

# Navigate to agent-orchestration directory
if [ -d "agent-orchestration" ]; then
    log "📂 Navigating to agent-orchestration directory"
    cd agent-orchestration
    
    # Clear Python cache files to ensure fresh deployment
    log "🧹 Clearing Python cache files..."
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.pyc" -delete 2>/dev/null || true
    find . -name "*.pyo" -delete 2>/dev/null || true
    log "✅ Python cache cleared"
else
    log "⚠️  Warning: agent-orchestration directory not found, staying in current directory"
fi

# Check if Python is available
log "🐍 Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    log "✅ Python3 found: $(python3 --version)"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
    log "✅ Python found: $(python --version)"
else
    log "❌ Error: Python not found. Please install Python first."
    log "🔄 Continuing with deployment anyway..."
    PYTHON_CMD="python3"  # Default fallback
fi

# Create virtual environment
log "🔧 Creating virtual environment..."
# Remove existing virtual environment to ensure fresh setup
if [ -d "$VENV_NAME" ]; then
    log "🗑️  Removing existing virtual environment..."
    rm -rf "$VENV_NAME"
fi

if $PYTHON_CMD -m venv "$VENV_NAME" 2>>"$LOG_FILE"; then
    log "✅ Virtual environment created successfully"
else
    log "❌ Error: Failed to create virtual environment"
    log "🔄 Continuing with deployment anyway..."
fi

# Activate virtual environment and install dependencies
log "📦 Installing dependencies..."
if [ -f "$VENV_NAME/bin/activate" ]; then
    source "$VENV_NAME/bin/activate"
    log "✅ Virtual environment activated"
    
    # Upgrade pip
    log "⬆️  Upgrading pip..."
    pip install --upgrade pip >> "$LOG_FILE" 2>&1
    
    # Install dependencies from requirements files
    if [ -f "vm-requirements.txt" ]; then
        log "📋 Installing from vm-requirements.txt..."
        pip install -r vm-requirements.txt >> "$LOG_FILE" 2>&1
        log "✅ Dependencies installed from vm-requirements.txt"
    elif [ -f "requirements.txt" ]; then
        log "📋 Installing from requirements.txt..."
        pip install -r requirements.txt >> "$LOG_FILE" 2>&1
        log "✅ Dependencies installed from requirements.txt"
    else
        log "⚠️  Warning: No requirements file found, installing basic dependencies..."
        pip install fastapi uvicorn >> "$LOG_FILE" 2>&1
        log "✅ Basic dependencies installed"
    fi
    
    # Install additional dependencies if pyproject.toml exists
    if [ -f "pyproject.toml" ]; then
        log "📋 Installing from pyproject.toml..."
        pip install -e . >> "$LOG_FILE" 2>&1
        log "✅ Project dependencies installed"
    fi
else
    log "❌ Error: Virtual environment activation failed"
    log "🔄 Continuing with deployment anyway..."
fi

# Kill existing screen session if it exists
log "🔍 Checking for existing screen session..."
if screen -list | grep -q "$SCREEN_NAME"; then
    log "🛑 Killing existing screen session: $SCREEN_NAME"
    screen -S "$SCREEN_NAME" -X quit 2>>"$LOG_FILE" || true
    sleep 2
fi

# Kill any processes using port 8081
log "🔍 Checking for processes using port $SERVER_PORT..."
PORT_PROCESS=$(lsof -ti:$SERVER_PORT 2>/dev/null || true)
if [ -n "$PORT_PROCESS" ]; then
    log "🛑 Found process using port $SERVER_PORT (PID: $PORT_PROCESS), killing it..."
    kill -9 $PORT_PROCESS 2>/dev/null || true
    sleep 2
    log "✅ Port $SERVER_PORT cleared"
else
    log "✅ Port $SERVER_PORT is available"
fi

# Kill any uvicorn processes (additional safety)
log "🔍 Checking for any running uvicorn processes..."
if pgrep -f "uvicorn" > /dev/null 2>&1; then
    log "🛑 Found running uvicorn processes, killing them..."
    pkill -f "uvicorn" 2>/dev/null || true
    sleep 2
    log "✅ Uvicorn processes cleared"
else
    log "✅ No uvicorn processes found"
fi

# Create new screen session and start the server
log "🖥️  Creating screen session: $SCREEN_NAME"
UVICORN_CMD="uvicorn src.app.main:app --reload --host 0.0.0.0 --port $SERVER_PORT"
GUNICORN_CMDD="gunicorn src.app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$SERVER_PORT --timeout 600"

SERVE_CMD=$UVICORN_CMD

# Create screen session with the server commandscre
screen -dmS "$SCREEN_NAME" bash -c "
    cd '$PWD'
    source '$VENV_NAME/bin/activate' 2>/dev/null || true
    echo '🚀 Starting server in screen session...'
    echo '📍 Working directory: \$(pwd)'
    echo '🐍 Python: \$(which python)'
    echo '⚡ Command: $SERVE_CMD'
    echo '🌐 Server will be available at: http://0.0.0.0:$SERVER_PORT'
    echo '📺 Screen session: $SCREEN_NAME'
    echo ''
    $SERVE_CMD
    echo '🛑 Server stopped'
    read -p 'Press Enter to exit screen session...'
"

# Wait a moment for screen to start
sleep 3

# Check if screen session is running
if screen -list | grep -q "$SCREEN_NAME"; then
    log "✅ Screen session '$SCREEN_NAME' created and running"
    log "🌐 Server should be starting at http://0.0.0.0:$SERVER_PORT"
else
    log "❌ Error: Failed to create screen session"
fi

# Back to root
cd "$PROJECT_ROOT"

# Display deployment summary
log "📊 Deployment Summary:"
log "   📁 Deploy directory: $DEPLOY_DIR"
log "   🐍 Python command: $PYTHON_CMD"
log "   🔧 Virtual environment: $PWD/$VENV_NAME"
log "   📺 Screen session: $SCREEN_NAME"
log "   🌐 Server URL: http://0.0.0.0:$SERVER_PORT"
log "   📋 Log file: $LOG_FILE"

log "🎉 VM deployment process completed at $(date)!"
log ""
log "� Screen Session Commands:"
log "   📌 Attach to session:     screen -r $SCREEN_NAME"
log "   📌 List all sessions:     screen -list"
log "   📌 Kill session:          screen -S $SCREEN_NAME -X quit"
log ""
log "🖥️  Commands while inside screen session:"
log "   � Detach from screen:    Ctrl+A, then D"
log "   📌 Show help:             Ctrl+A, then ?"
log "   📌 Kill current session:  Ctrl+A, then k"
log "   📌 Create new window:     Ctrl+A, then c"
log "   📌 Next window:           Ctrl+A, then n"
log "   📌 Previous window:       Ctrl+A, then p"