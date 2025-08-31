#!/bin/bash
# Copyright 2025 Loïc Muhirwa
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Google Cloud Build deployment script for Architecture Designer Backend
# Replaces the previous ngrok-based deployment with proper cloud deployment

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEFAULT_REGION="us-central1"
SERVICE_NAME="flowgen-backend"

print_banner() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "    Google Cloud Build Deployment"
    echo "=================================================="
    echo -e "${NC}"
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    echo "Usage: $0 [deploy|logs|stop|status] [options]"
    echo
    echo "Commands:"
    echo "  deploy    Deploy the service to Google Cloud Run (default)"
    echo "  logs      Show service logs"
    echo "  stop      Delete the Cloud Run service"
    echo "  status    Show service status and URL"
    echo "  help      Show this help message"
    echo
    echo "Options:"
    echo "  --project-id PROJECT_ID    Google Cloud project ID"
    echo "  --region REGION           Deployment region (default: $DEFAULT_REGION)"
    echo "  --build-only              Only build, don't deploy"
    echo
    echo "Examples:"
    echo "  $0 deploy --project-id my-project --region us-west1"
    echo "  $0 logs --project-id my-project"
    echo "  $0 stop --project-id my-project"
}

# Parse command line arguments
COMMAND="deploy"
PROJECT_ID=""
REGION="$DEFAULT_REGION"
BUILD_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        deploy|logs|stop|status|help)
            COMMAND=$1
            shift
            ;;
        --project-id)
            PROJECT_ID="$2"
            shift 2
            ;;
        --region)
            REGION="$2"
            shift 2
            ;;
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

if [ "$COMMAND" = "help" ]; then
    show_help
    exit 0
fi

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI is required but not installed."
        log_error "Install from: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    # Get project ID if not provided
    if [ -z "$PROJECT_ID" ]; then
        PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
        if [ -z "$PROJECT_ID" ]; then
            log_error "No project ID provided and no default project set."
            log_error "Use: $0 $COMMAND --project-id YOUR_PROJECT_ID"
            log_error "Or set default: gcloud config set project YOUR_PROJECT_ID"
            exit 1
        fi
        log_info "Using project: $PROJECT_ID"
    fi
    
    # Check authentication
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1 > /dev/null; then
        log_error "Not authenticated with gcloud."
        log_error "Run: gcloud auth login"
        exit 1
    fi
    
    # Enable required APIs
    log_info "Ensuring required APIs are enabled..."
    gcloud services enable cloudbuild.googleapis.com --project="$PROJECT_ID"
    gcloud services enable run.googleapis.com --project="$PROJECT_ID"
    gcloud services enable containerregistry.googleapis.com --project="$PROJECT_ID"
}

deploy_service() {
    log_info "Starting deployment to Google Cloud..."
    
    cd "$PROJECT_ROOT"
    
    # Submit build to Google Cloud Build
    log_info "Submitting build to Google Cloud Build..."
    gcloud builds submit \
        --config=cloudbuild.yaml \
        --substitutions=_REGION="$REGION" \
        --project="$PROJECT_ID" \
        ../..
    
    if [ "$BUILD_ONLY" = "true" ]; then
        log_info "Build completed successfully!"
        return
    fi
    
    # Get service URL
    log_info "Getting service URL..."
    SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(status.url)" 2>/dev/null || echo "")
    
    if [ -n "$SERVICE_URL" ]; then
        echo
        log_info "Deployment completed successfully!"
        echo -e "${GREEN}Service URL: ${SERVICE_URL}${NC}"
        echo -e "${GREEN}API Documentation: ${SERVICE_URL}/docs${NC}"
        echo -e "${GREEN}Health Check: ${SERVICE_URL}/health${NC}"
    else
        log_warn "Deployment may have completed, but couldn't retrieve service URL."
        log_info "Check status with: $0 status --project-id $PROJECT_ID"
    fi
}

show_logs() {
    log_info "Showing Cloud Run service logs..."
    gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" \
        --project="$PROJECT_ID" \
        --limit=50 \
        --format="table(timestamp,severity,textPayload)"
}

stop_service() {
    log_info "Stopping Cloud Run service..."
    gcloud run services delete "$SERVICE_NAME" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --quiet
    log_info "Service deleted successfully!"
}

show_status() {
    log_info "Checking service status..."
    
    # Get service details
    SERVICE_INFO=$(gcloud run services describe "$SERVICE_NAME" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(status.url,status.conditions[0].status,spec.template.spec.containers[0].image)" 2>/dev/null || echo "")
    
    if [ -n "$SERVICE_INFO" ]; then
        IFS=$'\t' read -r URL STATUS IMAGE <<< "$SERVICE_INFO"
        echo -e "${GREEN}Service Status: ${STATUS}${NC}"
        echo -e "${GREEN}Service URL: ${URL}${NC}"
        echo -e "${GREEN}Current Image: ${IMAGE}${NC}"
        
        # Show recent deployments
        echo -e "${YELLOW}Recent Revisions:${NC}"
        gcloud run revisions list \
            --service="$SERVICE_NAME" \
            --region="$REGION" \
            --project="$PROJECT_ID" \
            --limit=3 \
            --format="table(metadata.name,status.conditions[0].status,metadata.creationTimestamp)"
    else
        log_warn "Service '$SERVICE_NAME' not found in region '$REGION'"
        log_info "Use '$0 deploy' to deploy the service"
    fi
}

# Main execution
print_banner

case $COMMAND in
    deploy)
        check_prerequisites
        deploy_service
        ;;
    logs)
        check_prerequisites
        show_logs
        ;;
    stop)
        check_prerequisites
        stop_service
        ;;
    status)
        check_prerequisites
        show_status
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        show_help
        exit 1
        ;;
esac
