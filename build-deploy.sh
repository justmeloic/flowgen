#!/bin/bash
# This script builds and deploys the application to Cloud Run using the VM's default service account.

set -e

# Load environment variables
set -a
source .env
set +a

# Configuration: env
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WEBUI_DIR="$SCRIPT_DIR/services/webui"
MERMAID_DIR="$SCRIPT_DIR/services/mermaid"
STATIC_OUTPUT_DIR="$MERMAID_DIR/static"

# Configuration: gcp
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
SERVICE_NAME="flowgen"
REPO_NAME="flowgen"
IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/app"

function build_local() {
    # Validate directory structure
    if [ ! -d "$WEBUI_DIR" ]; then
        echo "❌ Error: WebUI directory not found at $WEBUI_DIR"
        exit 1
    fi

    if [ ! -d "$MERMAID_DIR" ]; then
        echo "❌ Error: Mermaid service directory not found at $MERMAID_DIR"
        exit 1
    fi

    echo "🧹 Cleaning previous builds..."
    rm -rf "$WEBUI_DIR/.next"
    rm -rf "$WEBUI_DIR/out"
    rm -rf "$STATIC_OUTPUT_DIR"

    echo "🏗️  Building Next.js static site..."
    cd "$WEBUI_DIR"
    npm install
    npm run build

    echo "📦 Copying static files to FastAPI..."
    mkdir -p "$STATIC_OUTPUT_DIR"
    cp -r out/* "$STATIC_OUTPUT_DIR/"

    echo "🚀 Starting FastAPI server..."
    cd "$MERMAID_DIR"
    if [ ! -f "src/main.py" ]; then
        echo "❌ Error: main.py not found at $MERMAID_DIR/src/main.py"
        exit 1
    fi

    uv run src/main.py
}

function build_cloud() {
    echo "☁️  Deploying to Cloud Run..."

    # Create Artifact Registry repository if it doesn't exist
    echo "🏗️  Ensuring Artifact Registry repository exists..."
    if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION >/dev/null 2>&1; then
        echo "Creating repository $REPO_NAME..."
        gcloud artifacts repositories create $REPO_NAME \
            --repository-format=docker \
            --location=$REGION \
            --description="Container repository for $SERVICE_NAME"
    fi

    # Ensure Docker is configured for Artifact Registry
    gcloud auth configure-docker $REGION-docker.pkg.dev --quiet

    # Build and push the Docker image
    echo "🏗️  Building Docker image..."
    docker buildx build --platform linux/amd64 \
        -t $IMAGE_NAME \
        -f Dockerfile \
        . --push || {
            echo "❌ Failed to build or push image. Make sure you have necessary permissions."
            exit 1
        }

    # Deploy to Cloud Run
    echo "🚀 Deploying to Cloud Run..."
    gcloud run deploy $SERVICE_NAME \
        --image $IMAGE_NAME \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated

    echo "✅ Deployment complete!"
}

# Check deployment type
case "$1" in
    "--docker")
        echo "🐳 Building Docker image..."
        docker compose build
        echo "🚀 Starting Docker container..."
        docker compose up
        ;;

    "--cloud")
        echo "🚀 Starting cloud deployment..."
        build_cloud

        ;;

    "--local")
        echo "💻 Starting local development..."
        build_local
        ;;

    "")
        echo "⚠️  No deployment option specified. Using local development..."
        build_local
        ;;

    *)
        echo "❌ Invalid option. Use --docker, --cloud, or --local"
        echo "Usage: $0 [--docker|--cloud|--local]"
        exit 1
        ;;
esac
