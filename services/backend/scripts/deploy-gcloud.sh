#!/bin/bash
# Simple Google Cloud deployment script
set -e

PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
if [ -z "$PROJECT_ID" ]; then
    echo "Error: No project set. Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "Deploying to Google Cloud Run..."
echo "Project: $PROJECT_ID"

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com secretmanager.googleapis.com

# Deploy directly using gcloud run deploy with source
echo "Building and deploying..."
gcloud run deploy flowgen-backend \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8081 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --set-env-vars="GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GOOGLE_CLOUD_LOCATION=us-central1,ENVIRONMENT=production,LOG_LEVEL=INFO,GEMINI_MODEL=gemini-2.5-flash,GEMINI_MODEL_PRO=gemini-2.5-pro,BUGS_DIR=bugs,GOOGLE_GENAI_USE_VERTEXAI=FALSE,USE_GCS_FOR_BUGS=true,GCS_BUGS_BUCKET=flowgen,GCS_BUGS_PATH=bugs" \
    --set-secrets="GOOGLE_API_KEY=gemini-api-key:latest,AUTH_SECRET=flowgen-secret:latest"

echo "Deployment complete!"
echo "Service URL:"
gcloud run services describe flowgen-backend --region us-central1 --format="value(status.url)"
