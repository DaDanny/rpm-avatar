#!/bin/bash

echo "🚀 AI Avatar Chat - Deployment Script"
echo "===================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI is not installed."
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null; then
    echo "❌ Not authenticated with Google Cloud."
    echo "Run: gcloud auth login"
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No Google Cloud project set."
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "✅ Using Google Cloud project: $PROJECT_ID"
echo ""

# Check if Gemini API key is set
read -p "Enter your Gemini API key: " GEMINI_API_KEY
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Gemini API key is required."
    echo "Get it from: https://aistudio.google.com"
    exit 1
fi

echo ""
echo "📦 Deploying backend to Cloud Run..."
echo ""

# Deploy backend
cd backend

# Deploy to Cloud Run with keyless authentication
echo "Deploying ai-avatar-chat-backend..."
gcloud run deploy ai-avatar-chat-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --service-account ai-avatar-chat-service@$PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars NODE_ENV=production,GOOGLE_API_KEY=$GEMINI_API_KEY

if [ $? -ne 0 ]; then
    echo "❌ Backend deployment failed."
    echo ""
    echo "Common fixes:"
    echo "1. Make sure the service account exists:"
    echo "   gcloud iam service-accounts list"
    echo ""
    echo "2. Create the service account if missing:"
    echo "   gcloud iam service-accounts create ai-avatar-chat-service \\"
    echo "     --description='Service account for AI Avatar Chat application' \\"
    echo "     --display-name='AI Avatar Chat Service'"
    echo ""
    echo "3. Follow the setup guide: docs/google-cloud-setup-no-keys.md"
    exit 1
fi

# Get the backend URL
BACKEND_URL=$(gcloud run services describe ai-avatar-chat-backend \
  --region us-central1 \
  --format 'value(status.url)')

echo ""
echo "✅ Backend deployed successfully!"
echo "🌐 Backend URL: $BACKEND_URL"
echo ""

# Test the backend
echo "🧪 Testing backend health..."
if curl -f "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo "✅ Backend health check passed!"
else
    echo "⚠️  Backend health check failed, but deployment may still be working."
    echo "Check logs: gcloud logs tail --service=ai-avatar-chat-backend"
fi

echo ""
echo "📱 Deploying frontend to Firebase Hosting..."
echo ""

cd ../frontend

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Create production environment file
echo "REACT_APP_BACKEND_URL=$BACKEND_URL" > .env.production

# Build the frontend
echo "Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed."
    exit 1
fi

# Deploy to Firebase Hosting
echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting --project $PROJECT_ID

if [ $? -ne 0 ]; then
    echo "❌ Frontend deployment failed."
    echo ""
    echo "Make sure Firebase is initialized:"
    echo "1. Run: firebase login"
    echo "2. Run: firebase init hosting"
    echo "3. Choose your project: $PROJECT_ID"
    echo "4. Set public directory: build"
    echo "5. Configure as SPA: Yes"
    exit 1
fi

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "🌐 Your AI Avatar Chat app is now live:"
echo ""
echo "Frontend: https://$PROJECT_ID.web.app"
echo "Backend:  $BACKEND_URL"
echo ""
echo "📊 Useful commands:"
echo ""
echo "View backend logs:"
echo "gcloud logs tail --service=ai-avatar-chat-backend"
echo ""
echo "Update backend environment:"
echo "gcloud run services update ai-avatar-chat-backend \\"
echo "  --region us-central1 \\"
echo "  --set-env-vars GOOGLE_API_KEY=new_key_here"
echo ""
echo "Monitor costs:"
echo "https://console.cloud.google.com/billing"
echo ""
echo "Happy chatting with your AI avatar! 🤖✨" 