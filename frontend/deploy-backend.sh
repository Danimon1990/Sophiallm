#!/bin/bash

# Deployment script for Backend to Google Cloud Run
# Project: sophiallm-474120

set -e  # Exit on error

echo "🚀 Deploying Backend to Google Cloud Run"
echo "=========================================="

# Configuration
PROJECT_ID="sophiallm-474120"
REGION="us-central1"
SERVICE_NAME="sophiallm-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the project
echo "📋 Setting GCP project to ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Build the container image
echo "🐳 Building container image..."
gcloud builds submit --tag ${IMAGE_NAME} .

# Deploy to Cloud Run
echo "🚢 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars "FLASK_ENV=production" \
  --set-secrets "OPENAI_API_KEY=OPENAI_API_KEY:latest"

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo ""
echo "✅ Deployment complete!"
echo "=========================================="
echo "🌐 Backend URL: ${SERVICE_URL}"
echo "📡 Health check: ${SERVICE_URL}/api/health"
echo ""
echo "⚠️  Next steps:"
echo "   1. Update frontend to use this backend URL"
echo "   2. Make sure OPENAI_API_KEY is set in Secret Manager"
echo ""
