#!/bin/bash

# Deploy backend service on Raspberry Pi
# This script sets up the environment and runs the server using Gunicorn

# Configuration
# Get the project root directory (parent of the scripts directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/services/backend"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$PROJECT_ROOT/logs"
LOG_FILE="$LOG_DIR/deploy_${TIMESTAMP}.log"
SCREEN_NAME="backend"
NGROK_SCREEN="agent-interface-ngrok"
VENV_NAME=".venv"

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8081

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages to both console and file
log() {
    echo "$1" | tee -a "$LOG_FILE"
}

log "🚀 Starting deployment process at $(date)..."

# Check if ngrok is available (optional)
NGROK_AVAILABLE=false
if command -v ngrok &> /dev/null; then
    # Check if authtoken is configured (either via config file or environment)
    if [ -n "$NGROK_AUTH_TOKEN" ] || [ -f ~/.config/ngrok/ngrok.yml ]; then
        NGROK_AVAILABLE=true
        log "✅ Ngrok found and configured - will create public tunnel"
    else
        log "⚠️  Ngrok found but not configured - skipping public tunnel"
        log "💡 Set NGROK_AUTH_TOKEN environment variable or run: ngrok config add-authtoken YOUR_TOKEN"
    fi
else
    log "⚠️  Ngrok not found - skipping public tunnel"
fi

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    log "❌ Error: Backend directory not found at $BACKEND_DIR"
    exit 1
fi

# Navigate to backend directory
log "📂 Navigating to backend directory"
cd "$BACKEND_DIR"

# Clear Python cache files to ensure fresh deployment
log "🧹 Clearing Python cache files..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name "*.pyo" -delete 2>/dev/null || true
log "✅ Python cache cleared"

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
    if [ -f "requirements-raspberry-pi.txt" ]; then
        log "📋 Installing from requirements-raspberry-pi.txt..."
        pip install -r requirements-raspberry-pi.txt >> "$LOG_FILE" 2>&1
        log "✅ Dependencies installed from requirements-raspberry-pi.txt"
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
log "🔍 Checking for existing screen sessions..."
if screen -list | grep -q "$SCREEN_NAME"; then
    log "🛑 Killing existing backend screen session: $SCREEN_NAME"
    screen -S "$SCREEN_NAME" -X quit 2>>"$LOG_FILE" || true
    sleep 2
fi

if screen -list | grep -q "$NGROK_SCREEN"; then
    log "🛑 Killing existing ngrok screen session: $NGROK_SCREEN"
    screen -S "$NGROK_SCREEN" -X quit 2>>"$LOG_FILE" || true
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
UVICORN_CMD="uvicorn src.app.main:app --host $SERVER_HOST --port $SERVER_PORT"

# Create screen session with the server command
screen -dmS "$SCREEN_NAME" bash -c "
    cd '$PWD'
    source '$VENV_NAME/bin/activate' 2>/dev/null || true
    echo '🚀 Starting server in screen session...'
    echo '📍 Working directory: \$(pwd)'
    echo '🐍 Python: \$(which python)'
    echo '⚡ Command: $UVICORN_CMD'
    echo '🌐 Server will be available at: http://$SERVER_HOST:$SERVER_PORT'
    echo '📺 Screen session: $SCREEN_NAME'
    echo ''
    $UVICORN_CMD
    echo '🛑 Server stopped'
    read -p 'Press Enter to exit screen session...'
"

# Wait a moment for screen to start
sleep 3

# Check if screen session is running
if screen -list | grep -q "$SCREEN_NAME"; then
    log "✅ Screen session '$SCREEN_NAME' created and running"
    log "🌐 Server should be starting at http://$SERVER_HOST:$SERVER_PORT"
else
    log "❌ Error: Failed to create screen session"
fi

# Start Ngrok Service (expose to internet) - only if available and configured
if [ "$NGROK_AVAILABLE" = true ]; then
    log "🌐 Starting ngrok tunnel..."
    screen -dmS "$NGROK_SCREEN" bash -c "
        # Use environment variable if available, otherwise rely on config file
        if [ -n '$NGROK_AUTH_TOKEN' ]; then
            export NGROK_AUTHTOKEN='$NGROK_AUTH_TOKEN'
        fi
        echo '🚀 Starting Ngrok tunnel for agent-interface...'
        echo '🌍 Exposing http://localhost:$SERVER_PORT to the internet'
        echo '📱 This will make your agent interface accessible from anywhere'
        echo ''
        ngrok http $SERVER_PORT
    "
    log "✅ Ngrok tunnel started in screen session: $NGROK_SCREEN"
    
    # Wait for ngrok to start
    sleep 2
    
    # Check if ngrok session is running
    if screen -list | grep -q "$NGROK_SCREEN"; then
        log "✅ Ngrok tunnel running successfully"
        log "🌍 Public URL available in ngrok session (screen -r $NGROK_SCREEN)"
    else
        log "❌ Ngrok tunnel failed to start (check authtoken)"
    fi
else
    log "⚠️  Skipping ngrok tunnel (not available or not configured)"
fi

# Back to root
cd "$PROJECT_ROOT"

# Display deployment summary
log "📊 Deployment Summary:"
log "   📁 Backend directory: $BACKEND_DIR"
log "   🐍 Python command: $PYTHON_CMD"
log "   🔧 Virtual environment: $BACKEND_DIR/$VENV_NAME"
log "   📺 Screen session: $SCREEN_NAME"
log "   🌐 Server URL: http://$SERVER_HOST:$SERVER_PORT"
if [ "$NGROK_AVAILABLE" = true ]; then
    log "   🌍 Ngrok session: $NGROK_SCREEN"
fi
log "   📋 Log file: $LOG_FILE"

log "🎉 Deployment process completed at $(date)!"
log ""
log "🌐 Access URLs:"
log "   Local:    http://localhost:$SERVER_PORT"
log "   Network:  http://$SERVER_HOST:$SERVER_PORT"
if [ "$NGROK_AVAILABLE" = true ]; then
    log "   Public:   Check ngrok session for public URL"
fi
log ""
log "📺 Screen Session Commands:"
log "   📌 Attach to backend:     screen -r $SCREEN_NAME"
if [ "$NGROK_AVAILABLE" = true ]; then
    log "   📌 Attach to ngrok:       screen -r $NGROK_SCREEN"
fi
log "   📌 List all sessions:     screen -list"
log "   📌 Kill backend:          screen -S $SCREEN_NAME -X quit"
if [ "$NGROK_AVAILABLE" = true ]; then
    log "   📌 Kill ngrok:            screen -S $NGROK_SCREEN -X quit"
fi
log ""
log "🖥️  Commands while inside screen session:"
log "   � Detach from screen:    Ctrl+A, then D"
log "   📌 Show help:             Ctrl+A, then ?"
log "   📌 Kill current session:  Ctrl+A, then k"
log "   📌 Create new window:     Ctrl+A, then c"
log "   📌 Next window:           Ctrl+A, then n"
log "   📌 Previous window:       Ctrl+A, then p"