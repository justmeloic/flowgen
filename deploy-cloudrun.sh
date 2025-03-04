#!/bin/bash
set -e

# Configuration
SERVICE_NAME="flowgen-service"
REGION="us-central1"
WEBUI_DIR="services/webui"
MERMAID_DIR="services/mermaid"
STATIC_OUTPUT_DIR="$MERMAID_DIR/static"

echo "🏗️  Building application..."
# Clean previous builds
rm -rf "$WEBUI_DIR/.next" "$WEBUI_DIR/out" "$STATIC_OUTPUT_DIR"

# Build Next.js static site
cd "$WEBUI_DIR"
npm run build

# Check if build was successful and files exist
if [ ! -d "out" ]; then
    echo "❌ Next.js build failed: 'out' directory not found"
    exit 1
fi

# Copy static files to FastAPI
cd ../..  # Return to root directory
mkdir -p "$STATIC_OUTPUT_DIR"
echo "📁 Copying files from $WEBUI_DIR/out/ to $STATIC_OUTPUT_DIR/"
cp -r "$WEBUI_DIR/out/"* "$STATIC_OUTPUT_DIR/" || {
    echo "❌ Failed to copy static files"
    exit 1
}

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source $MERMAID_DIR \
  --region $REGION \
  --memory 512Mi \
  --timeout 60s \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080 \
  --platform managed

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format='value(status.url)')

echo "✅ Deployment complete!"
echo "Service URL: $SERVICE_URL"
