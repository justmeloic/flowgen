#!/bin/bash
# This script orchestrates the build and deployment of a "modular monolith" application
# called "cn-cba-agent".  It combines a Next.js frontend (for the web UI) and a FastAPI
# backend (which handles requests to the agent).

# Create logs directory if it doesn't exist
mkdir -p ../logs # Assuming script is in ./scripts, logs go to ./logs
LOG_FILE="../logs/deploy_$(date +%Y%m%d_%H%M%S).log"
# Redirect all output to both console and log file
exec > >(tee -a "$LOG_FILE") 2>&1

echo "📝 Logging deployment to $LOG_FILE"

# --- Setup and Configuration ---

# Exit immediately if any command fails.
set -e

# Load environment variables from a .env file (if it exists).
# Assuming .env is in ../services/agent-orchestration relative to script dir
SCRIPT_DIR_FOR_ENV="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_FILE_PATH="$SCRIPT_DIR_FOR_ENV/../services/agent-orchestration/.env"

if [ -f "$ENV_FILE_PATH" ]; then
    echo "Found .env file at $ENV_FILE_PATH, loading variables..."
    set -a
    source "$ENV_FILE_PATH"
    set +a
else
    echo "⚠️ Warning: .env file not found at $ENV_FILE_PATH. Using existing environment variables."
fi


# Determine the script's directory. This allows the script to be run from anywhere.
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Assuming the script is in a 'scripts' subdirectory, the project root is one level up.
PROJECT_ROOT_DIR="$SCRIPT_DIR/.."

# Define paths to key directories, relative to the project root.
# These might not be strictly needed if Dockerfile handles paths correctly from root.
# FRONTEND_DIR="$PROJECT_ROOT_DIR/services/frontend"
# BACKEND_DIR="$PROJECT_ROOT_DIR/services/agent-orchestration"
# STATIC_OUTPUT_DIR="$BACKEND_DIR/static_frontend"

# Get the Google Cloud project ID from gcloud configuration.
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ GCP Project ID not found. Configure gcloud CLI: gcloud init or gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi
echo "🎯 Using Google Cloud Project: $PROJECT_ID"

# Define Google Cloud region and service/repository names.
# Ensure REGION is set, either from .env or passed as an environment variable
if [ -z "$REGION" ]; then
    echo "❌ REGION environment variable is not set. Please set it in your .env file or environment."
    exit 1
fi
echo "📍 Using Google Cloud Region: $REGION"

SERVICE_NAME="cn-cba-agent"  # The name of the Cloud Run service
REPO_NAME="cn-cba-agent"     # The name of the Artifact Registry repository
# Full image name - Ensure Dockerfile is in the PROJECT_ROOT_DIR for the build context '.'
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:latest" # Added service name and latest tag for clarity
SECRET_NAME="gemini-api-key" # Ensure this secret exists in Secret Manager

echo "☁️  Deploying to Cloud Run..."

# Ensure the Cloud Build API is enabled
echo "🛠️  Ensuring Cloud Build API is enabled..."
gcloud services enable cloudbuild.googleapis.com --project="$PROJECT_ID"
gcloud services enable artifactregistry.googleapis.com --project="$PROJECT_ID"
gcloud services enable run.googleapis.com --project="$PROJECT_ID"
gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID"


# Create the Artifact Registry repository if it doesn't already exist.
echo "🏗️  Ensuring Artifact Registry repository exists..."
    if ! gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" --project="$PROJECT_ID" >/dev/null 2>&1; then
        echo "Creating repository $REPO_NAME in $REGION..."
        gcloud artifacts repositories create "$REPO_NAME" \
            --repository-format=docker \
            --location="$REGION" \
            --description="Container repository for $SERVICE_NAME" \
            --project="$PROJECT_ID"
    else
        echo "Repository $REPO_NAME already exists in $REGION."
    fi

# The gcloud auth configure-docker step is generally not needed when Cloud Build
# pushes to Artifact Registry in the same project, as Cloud Build's service account
# will have the necessary permissions by default. You might need it if you were
# running 'docker push' manually.
# echo "🔑 Configuring Docker authentication for Artifact Registry..."
# gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet --project="$PROJECT_ID"

# Build the Docker image using Google Cloud Build and push it to Artifact Registry.
echo "🏗️  Building Docker image with Google Cloud Build..."
# The build context is PROJECT_ROOT_DIR (where Dockerfile is located)
# The Dockerfile itself will be found automatically if it's named "Dockerfile"
# in the root of the build context.
(cd "$PROJECT_ROOT_DIR" && gcloud builds submit . \
    --tag "$IMAGE_NAME" \
    --project "$PROJECT_ID" \
    --region="$REGION" \
    --timeout=20m) || { # Added a timeout, adjust as needed
        echo "❌ Failed to build image with Google Cloud Build."
        exit 1
    }
echo "✅ Image built and pushed to Artifact Registry: $IMAGE_NAME"

# Deploy the image to Cloud Run.
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
        --image "$IMAGE_NAME" \
        --platform managed \
        --region "$REGION" \
        --no-allow-unauthenticated \
        --set-secrets=GEMINI_API_KEY="$SECRET_NAME":latest \
        --project "$PROJECT_ID" \
        --quiet

echo "✅ Deployment complete for service $SERVICE_NAME!"


# Granting permission to access the service for specific user you needs "user:" prefix, for specific group you need "group:" prefix etc...

gcloud run services add-iam-policy-binding "$SERVICE_NAME" \
    --member="user:loic.muhirwa@gmail.com" \
    --role="roles/run.invoker" \
    --region="$REGION" \
    --project="$PROJECT_ID"

gcloud run services add-iam-policy-binding cn-cba-agent \
    --member="domain:loicmuhirwa.altostrat.com" \
    --role="roles/run.invoker" \
    --region="us-central1" \
    --project="technical-assets-loicmuhirwa"