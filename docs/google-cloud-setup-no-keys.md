# Google Cloud Setup Guide (No JSON Keys Required)

This guide shows you how to set up Google Cloud services for the AI Avatar Chat application **without downloading JSON service account keys** - a more secure approach that many organizations require.

## 🔒 Why No JSON Keys?

Your organization has enforced a security policy that prevents downloading service account keys. This is actually **a best practice** because:

- ✅ JSON keys never expire (security risk)
- ✅ Keys can be accidentally committed to version control
- ✅ Keys can be stolen or misused
- ✅ Cloud Run has better authentication methods

## 📋 Prerequisites

- Google Cloud Project created
- Billing enabled on your Google Cloud Project
- Organization allows Cloud Run deployment
- `gcloud` CLI installed and authenticated

## 🔑 Step 1: Enable Required APIs

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable speech.googleapis.com
gcloud services enable texttospeech.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

## 🛡️ Step 2: Create Service Account (No Key Download)

```bash
# Create service account
gcloud iam service-accounts create ai-avatar-chat-service \
    --description="Service account for AI Avatar Chat application" \
    --display-name="AI Avatar Chat Service"

# Get your project ID
PROJECT_ID=$(gcloud config get-value project)

# Add required roles to the service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:rpm-avatar-chat-service@cs-poc-swsy90eg9ggda0tmk2sgkwy.iam.gserviceaccount.com" \
    --role="roles/speech.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:rpm-avatar-chat-service@cs-poc-swsy90eg9ggda0tmk2sgkwy.iam.gserviceaccount.com" \
    --role="roles/texttospeech.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:rpm-avatar-chat-service@cs-poc-swsy90eg9ggda0tmk2sgkwy.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

# Verify the service account was created
gcloud iam service-accounts list
```

## 🤖 Step 3: Get Gemini API Key

The Gemini API still requires an API key (not a service account):

1. **Go to Google AI Studio**: [aistudio.google.com](https://aistudio.google.com)
2. **Create API Key**:
   - Click "Get API Key"
   - Choose your Google Cloud project
   - Copy the generated API key
   - **Save this key securely**

## 🚀 Step 4: Deploy Backend to Cloud Run (Secure Method)

### 4.1: Update Backend Code

No changes needed! Your backend code will automatically use Application Default Credentials.

### 4.2: Create Environment File for Local Development

For **local development only**, create `backend/.env.local`:

```env
# For local development only
GOOGLE_API_KEY=your_gemini_api_key_here
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# DO NOT SET GOOGLE_APPLICATION_CREDENTIALS for Cloud Run deployment
# Cloud Run will use the service account automatically
```

### 4.3: Deploy to Cloud Run

```bash
cd backend

# Deploy with automatic authentication
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
  --set-env-vars NODE_ENV=production,GOOGLE_API_KEY=your_gemini_api_key_here
```

**Important**: Replace `your_gemini_api_key_here` with your actual Gemini API key from Step 3.

### 4.4: Verify Deployment

```bash
# Get the service URL
gcloud run services describe ai-avatar-chat-backend \
  --region us-central1 \
  --format 'value(status.url)'

# Test the health endpoint
curl "$(gcloud run services describe ai-avatar-chat-backend --region us-central1 --format 'value(status.url)')/health"
```

## 🔐 Step 5: Secure API Key Management (Recommended)

For even better security, use Google Secret Manager:

```bash
# Store Gemini API key in Secret Manager
echo "your_gemini_api_key_here" | gcloud secrets create gemini-api-key --data-file=-

# Grant the service account access to the secret
gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:ai-avatar-chat-service@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# Update Cloud Run to use the secret
gcloud run services update ai-avatar-chat-backend \
  --region us-central1 \
  --set-secrets GOOGLE_API_KEY=gemini-api-key:latest
```

## 🧪 Step 6: Test Local Development

For local development, you can use your own Google Cloud credentials:

```bash
# Authenticate your local environment
gcloud auth application-default login

# Test your backend locally
cd backend
npm run dev
```

Your local environment will use **your** Google Cloud credentials automatically.

## 🔄 Step 7: Deploy Frontend to Firebase Hosting

```bash
cd frontend

# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# When prompted:
# - Use existing project: YOUR_PROJECT_ID
# - Public directory: build
# - Configure as SPA: Yes
# - Overwrite index.html: No

# Create production environment file
echo "REACT_APP_BACKEND_URL=$(gcloud run services describe ai-avatar-chat-backend --region us-central1 --format 'value(status.url)')" > .env.production

# Build and deploy
npm run build
firebase deploy --only hosting
```

## 🎯 Authentication Flow Summary

### Local Development:
```
Your Code → Application Default Credentials → Your Google Account → Google APIs
```

### Cloud Run Production:
```
Your Code → Service Account (ai-avatar-chat-service) → Google APIs
```

## ✅ Benefits of This Approach

- 🔒 **More Secure**: No JSON keys to manage or secure
- 🔄 **Automatic Rotation**: Service account credentials rotate automatically
- 📊 **Better Auditing**: All API calls are logged with proper attribution
- 🚀 **Easier Deployment**: No need to manage secret files
- 🏢 **Organization Compliant**: Meets enterprise security requirements

## 🚨 Troubleshooting

### "Permission denied" errors:

1. **Check service account roles**:
   ```bash
   gcloud projects get-iam-policy $PROJECT_ID \
     --flatten="bindings[].members" \
     --format="table(bindings.role)" \
     --filter="bindings.members:ai-avatar-chat-service@$PROJECT_ID.iam.gserviceaccount.com"
   ```

2. **Verify APIs are enabled**:
   ```bash
   gcloud services list --enabled
   ```

3. **Check Cloud Run service account**:
   ```bash
   gcloud run services describe ai-avatar-chat-backend \
     --region us-central1 \
     --format="value(spec.template.spec.serviceAccountName)"
   ```

### Local development issues:

1. **Re-authenticate**:
   ```bash
   gcloud auth application-default login
   ```

2. **Check your active account**:
   ```bash
   gcloud auth list
   ```

### "Quota exceeded" errors:

```bash
# Check quotas
gcloud compute project-info describe --format="value(quotas)"
```

## 📈 Next Steps

1. **Deploy and test your application**
2. **Set up monitoring and alerts**
3. **Configure custom domains** (optional)
4. **Set up CI/CD pipelines** using service account authentication

## 💡 Pro Tips

- Never set `GOOGLE_APPLICATION_CREDENTIALS` in production
- Use Secret Manager for all sensitive data
- Monitor API usage and set billing alerts
- Enable audit logging for security compliance
- Use least-privilege principles for service account roles

**Your secure, keyless Google Cloud setup is now ready!** 🎉 