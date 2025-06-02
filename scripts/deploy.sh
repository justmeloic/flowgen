#!/bin/bash
# This script orchestrates the build and deployment of a "distributed monolith" application
# called "flowgen".  It combines a Next.js frontend (for the web UI) and a FastAPI
# backend (which handles Mermaid diagram generation).  It supports local development,
# Docker Compose based deployment, and deployment to Google Cloud Run.

# Create logs directory if it doesn't exist
mkdir -p ../logs # Assuming script is in ./scripts, logs go to ./logs
LOG_FILE="../logs/deploy_$(date +%Y%m%d_%H%M%S).log"
# Redirect all output to both console and log file
exec > >(tee -a "$LOG_FILE") 2>&1

echo "📝 Logging deployment to $LOG_FILE"

# --- Setup and Configuration ---

# Exit immediately if any command fails.
set -e

# Determine the script's directory. This allows the script to be run from anywhere.
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Determine the project root directory relative to the script's location
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Define paths to key directories, relative to the project root
WEBUI_DIR="$PROJECT_ROOT/services/webui"        # Next.js frontend
MERMAID_DIR="$PROJECT_ROOT/services/mermaid"    # FastAPI backend
STATIC_OUTPUT_DIR="$MERMAID_DIR/static"         # Where the built Next.js files go

# Load environment variables from .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo "📄 Loading environment variables from .env file..."
    source "$PROJECT_ROOT/.env"
else
    echo "⚠️  No .env file found at $PROJECT_ROOT/.env"
fi

# Get the Google Cloud project ID from gcloud configuration.  This assumes gcloud
# is already configured.
PROJECT_ID=$(gcloud config get-value project)

# Define Google Cloud region and service/repository names.
REGION="us-central1"
SERVICE_NAME="flowgen"  # The name of the Cloud Run service
REPO_NAME="flowgen"    # The name of the Artifact Registry repository
IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/app"  # Full image nameclear
SECRET_NAME="gemini-api-key"


# --- Functions ---

# `build_local`: Builds and runs the application locally (without Docker).
function build_local() {
    # Basic validation: Check if the expected directories exist.
    if [ ! -d "$WEBUI_DIR" ]; then
        echo "❌ Error: WebUI directory not found at $WEBUI_DIR"
        exit 1
    fi

    if [ ! -d "$MERMAID_DIR" ]; then
        echo "❌ Error: Mermaid service directory not found at $MERMAID_DIR"
        exit 1
    fi

    echo "🧹 Cleaning previous builds..."
    rm -rf "$WEBUI_DIR/.next"  # Remove Next.js build cache
    rm -rf "$WEBUI_DIR/out"    # Remove Next.js export directory
    rm -rf "$STATIC_OUTPUT_DIR"  # Remove old static files

    echo "🏗️  Building Next.js static site..."
    cd "$WEBUI_DIR"
    npm install            # Install frontend dependencies
    npm run build          # Build the Next.js application

    echo "📦 Copying static files to FastAPI..."
    mkdir -p "$STATIC_OUTPUT_DIR"  # Create the static directory if it doesn't exist
    cp -r out/* "$STATIC_OUTPUT_DIR/"  # Copy the built Next.js files

    echo "🚀 Starting FastAPI server..."
    cd "$MERMAID_DIR"
    
    # Set PYTHONPATH to include the 'src' directory
    export PYTHONPATH=$(pwd)/src:$PYTHONPATH
    
    if [ ! -f "src/main.py" ]; then  # Basic check for FastAPI entry point
        echo "❌ Error: main.py not found at $MERMAID_DIR/src/main.py"
        exit 1
    fi

    uv run src/main.py  # Start the FastAPI server using `uv`
}

# `build_cloud`: Builds a Docker image using Cloud Build and deploys it to Google Cloud Run.
function build_cloud() {
    echo "☁️  Deploying to Cloud Run..."

    # Ensure required Google Cloud APIs are enabled
    echo "🛠️  Ensuring required APIs are enabled..."
    gcloud services enable cloudbuild.googleapis.com --project="$PROJECT_ID"
    gcloud services enable artifactregistry.googleapis.com --project="$PROJECT_ID"
    gcloud services enable run.googleapis.com --project="$PROJECT_ID"
    gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID"

    # Create the Artifact Registry repository if it doesn't already exist
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

    # Build and push the Docker image using Cloud Build
    echo "🏗️  Building Docker image with Google Cloud Build..."
    (cd "$PROJECT_ROOT" && gcloud builds submit . \
        --tag "$IMAGE_NAME" \
        --project "$PROJECT_ID" \
        --region="$REGION" \
        --timeout=20m) || {
            echo "❌ Failed to build image with Google Cloud Build."
            exit 1
        }
    echo "✅ Image built and pushed to Artifact Registry: $IMAGE_NAME"

    # Deploy the image to Cloud Run
    echo "🚀 Deploying to Cloud Run..."
    gcloud run deploy "$SERVICE_NAME" \
        --image "$IMAGE_NAME" \
        --platform managed \
        --region "$REGION" \
        --allow-unauthenticated \
        --set-secrets=GEMINI_API_KEY="$SECRET_NAME":latest \
        --project "$PROJECT_ID"

    echo "✅ Deployment complete for service $SERVICE_NAME!"
}

# --- Main Script Logic (Command-line Argument Handling) ---

# This section uses a `case` statement to handle different command-line
# arguments.  This provides a clean way to select different execution paths.
case "$1" in
    "--docker")  # Run with Docker Compose
        echo "🐳 Building Docker image..."
        docker compose build
        echo "🚀 Starting Docker container..."
        docker compose up
        ;;

    "--cloud")  # Deploy to Cloud Run
        echo "🚀 Starting cloud deployment..."
        build_cloud  # Call the `build_cloud` function
        ;;

    "--local")  # Run locally (without Docker)
        echo "💻 Starting local development..."
        build_local  # Call the `build_local` function
        ;;

    "")  # No argument provided: default to local development
        echo "⚠️  No deployment option specified. Using local development..."
        build_local
        ;;

    *)  # Any other argument: error
        echo "❌ Invalid option. Use --docker, --cloud, or --local"
        echo "Usage: $0 [--docker|--cloud|--local]"
        exit 1
        ;;
esac
