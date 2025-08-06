#!/bin/bash

# This script adds the Apache 2.0 license header to all source files.
# It logs its output to the /logs directory and must be run from the project root.

# --- Configuration ---
COPYRIGHT_HOLDER="Google LLC"
LICENSE_TYPE="apache"
BACKEND_SRC_DIR="services/backend/src"
FRONTEND_SRC_DIR="services/frontend/src"

# --- Logging Configuration ---
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
LOG_DIR="logs"
LOG_FILE="$LOG_DIR/add-license_${TIMESTAMP}.log"

# A flag to track the final outcome
OVERALL_SUCCESS=true

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages to both console and file
log() {
    echo "$1" | tee -a "$LOG_FILE"
}

# --- Script Logic ---
log "🚀 Starting license application process at $(date)..."
log ""

log "🔄 Checking for 'addlicense' command..."
if ! command -v addlicense &> /dev/null; then
    log "❌ Error: 'addlicense' command not found."
    log "Please install it by running: go install github.com/google/addlicense@latest"
    exit 1 # We still exit here because the script cannot continue.
fi
log "✅ 'addlicense' is installed."
log ""

# --- Apply license to Backend ---
log "✍️ Applying license headers to backend: ${BACKEND_SRC_DIR}"
if addlicense -c "${COPYRIGHT_HOLDER}" -l "${LICENSE_TYPE}" "${BACKEND_SRC_DIR}" >> "$LOG_FILE" 2>&1; then
    log "✅ Backend processed successfully."
else
    log "❌ Error processing backend. Check log for details."
    OVERALL_SUCCESS=false
fi
log ""

# --- Apply license to Frontend ---
log "✍️ Applying license headers to frontend: ${FRONTEND_SRC_DIR}"
if addlicense -c "${COPYRIGHT_HOLDER}" -l "${LICENSE_TYPE}" "${FRONTEND_SRC_DIR}" >> "$LOG_FILE" 2>&1; then
    log "✅ Frontend processed successfully."
else
    log "❌ Error processing frontend. Check log for details."
    OVERALL_SUCCESS=false
fi
log ""

# --- Final Status ---
if [ "$OVERALL_SUCCESS" = true ]; then
    log "🎉 All operations completed successfully!"
else
    log "⚠️  One or more steps failed. Please review the log."
fi

log "📋 Process log saved to: ${LOG_FILE}"

# Set the script's final exit code based on success without closing the terminal
[ "$OVERALL_SUCCESS" = true ]