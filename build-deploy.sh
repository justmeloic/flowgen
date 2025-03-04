#!/bin/bash
# This script builds and deploys the application to Cloud Run using the VM's default service account.

set -e

# Load environment variables
set -a
source .env
set +a

# Common variables
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WEBUI_DIR="$SCRIPT_DIR/services/webui"
MERMAID_DIR="$SCRIPT_DIR/services/mermaid"
STATIC_OUTPUT_DIR="$MERMAID_DIR/static"

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

# Check deployment type
case "$1" in
    "--docker")
        echo "🐳 Building Docker image..."
        docker compose build
        echo "🚀 Starting Docker container..."
        docker compose up
        ;;

    "--cloud")
        echo "☁️  Deploying to Cloud Run..."

        # Ensure gcloud is configured (Good practice, but probably already set)
        if ! gcloud config get-value project &>/dev/null; then
            echo "❌ Error: GCloud project not configured"
            exit 1
        fi
        gcloud config set project $PROJECT_ID

        # Configure Docker to use gcloud credentials (REQUIRED)
        gcloud auth configure-docker ${REGION}-docker.pkg.dev

        # Create Artifact Registry repository if it doesn't exist
        if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION &>/dev/null; then
            echo "🏗️  Creating Artifact Registry repository..."
            gcloud artifacts repositories create $REPO_NAME \
                --repository-format=docker \
                --location=$REGION
        fi

        echo "🏗️  Building Docker image..."
        docker build -t $ARTIFACT_REGISTRY .

        echo "⬆️  Pushing image to Artifact Registry..."
        docker push $ARTIFACT_REGISTRY

        echo "🚀 Deploying to Cloud Run..."
        gcloud run deploy $SERVICE_NAME \
            --image=$ARTIFACT_REGISTRY \
            --region=$REGION \
            --project=$PROJECT_ID \
            --platform=managed \
            --allow-unauthenticated \
            --service-account=$SERVICE_ACCOUNT

        echo "✅ Deployment complete!"
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
