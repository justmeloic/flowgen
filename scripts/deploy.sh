#!/bin/bash
# This script orchestrates the build and deployment of a "modular monolith" application
# called "cn-cba-agent".  It combines a Next.js frontend (for the web UI) and a FastAPI
# backend (which handles requests to the agent). 

# Create logs directory if it doesn't exist
mkdir -p ../logs
LOG_FILE="../logs/deploy_$(date +%Y%m%d_%H%M%S).log"
# Redirect all output to both console and log file
exec > >(tee -a "$LOG_FILE") 2>&1

echo "📝 Logging deployment to $LOG_FILE"

# --- Setup and Configuration ---

# Exit immediately if any command fails.
set -e

# Load environment variables from a .env file (if it exists).  `set -a` makes
set -a
source ../services/agent-orchestration/.env
set +a

# Determine the script's directory. This allows the script to be run from anywhere.
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Define paths to key directories, relative to the script's location.
FRONTEND_DIR="$SCRIPT_DIR/services/webui"        # Next.js frontend
BACKEND_DIR="$SCRIPT_DIR/services/agent-orchestration"    # FastAPI backend
STATIC_OUTPUT_DIR="$BACKEND_DIR/static_frontend"        # Where the built Next.js files go

# Get the Google Cloud project ID from gcloud configuration.  This assumes gcloud is already configured.
PROJECT_ID=$(gcloud config get-value project)

# Define Google Cloud region and service/repository names.
REGION="$REGION"
SERVICE_NAME="cn-cba-agent"  # The name of the Cloud Run service
REPO_NAME="cn-cba-agent"    # The name of the Artifact Registry repository
IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/app"  # Full image name
SECRET_NAME="gemini-api-key"

echo "☁️  Deploying to Cloud Run..."

# Create the Artifact Registry repository if it doesn't already exist.
echo "🏗️  Ensuring Artifact Registry repository exists..."
    if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION >/dev/null 2>&1; then
        echo "Creating repository $REPO_NAME..."
        gcloud artifacts repositories create $REPO_NAME \
            --repository-format=docker \
            --location=$REGION \
            --description="Container repository for $SERVICE_NAME"
    fi

# Configure Docker to authenticate with Artifact Registry.  This allows
# `docker push` to work. 
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet

# Build and push the Docker image.  `docker buildx build` is used for
# multi-platform builds (though here we're only targeting linux/amd64).
echo "🏗️  Building Docker image..."
docker buildx build \
    --platform linux/amd64 \
    -t $IMAGE_NAME \
    --push \
    -f Dockerfile \
    . || {
        echo "❌ Failed to build or push image. Make sure you have necessary permissions."
        exit 1
    }

# Deploy the image to Cloud Run.
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
        --image $IMAGE_NAME \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --set-secrets=GEMINI_API_KEY=$SECRET_NAME:latest

echo "✅ Deployment complete!"

