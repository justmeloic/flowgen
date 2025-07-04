#!/bin/bash
# Loïc: Before running the app, make the script executable with this command in your terminal: chmod +x restart-server.sh

echo "Stopping existing uvicorn processes..."

# Find and kill the process running with your specific app path
pkill -f "uvicorn src.app.main:app"

# Also try to kill any process using port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Wait and check if port is free
echo "Waiting for port 8000 to be freed..."
for i in {1..10}; do
    if ! lsof -i:8000 > /dev/null 2>&1; then
        echo "Port 8000 is now free"
        break
    fi
    echo "Port still in use, waiting... ($i/10)"
    sleep 1
done

# Final check
if lsof -i:8000 > /dev/null 2>&1; then
    echo "Error: Port 8000 is still in use after 10 seconds"
    exit 1
fi

echo "Starting server..."
# Start the server again using your exact command
nohup uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000 > nohup.out 2>&1 &

echo "Server restart initiated"