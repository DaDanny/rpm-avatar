# Deployment Guide: Firebase Hosting + Google Cloud Run

This guide walks you through deploying your AI Avatar Chat application using Firebase Hosting for the frontend and Google Cloud Run for the backend.

## 🏗️ Architecture Overview

```
Frontend (React) → Firebase Hosting
Backend (Node.js) → Google Cloud Run
```

**Benefits:**
- ✅ Auto-scaling backend
- ✅ Global CDN for frontend
- ✅ HTTPS by default
- ✅ Pay-per-use pricing
- ✅ Easy CI/CD integration

## 📋 Prerequisites

- [x] Google Cloud project created
- [x] Service account configured (see google-cloud-setup.md)
- [x] Firebase CLI installed
- [x] Google Cloud CLI installed
- [x] Docker installed (for Cloud Run)

## 🔧 Step 1: Install Required Tools

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Install Google Cloud CLI
# macOS:
brew install google-cloud-sdk

# Verify installations
firebase --version
gcloud --version
```

## 🚀 Step 2: Prepare Backend for Cloud Run

### 2.1: Create Dockerfile

Create `backend/Dockerfile`:

```dockerfile
# Use Node.js official image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create non-root user
RUN groupadd -r nodeuser && useradd -r -g nodeuser nodeuser
RUN chown -R nodeuser:nodeuser /app
USER nodeuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start application
CMD ["node", "src/server.js"]
```

### 2.2: Create .dockerignore

Create `backend/.dockerignore`:

```
node_modules
npm-debug.log
.env
.env.local
.git
.gitignore
README.md
Dockerfile
.dockerignore
temp-audio/
```

### 2.3: Update Backend for Production

Update `backend/src/server.js` for Cloud Run:

```javascript
// Add this near the top after other requires
const PORT = process.env.PORT || 8080; // Cloud Run uses PORT env var

// Update CORS configuration
const io = socketIo(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:3000", // Keep for local development
      /\.web\.app$/, // Allow Firebase Hosting domains
      /\.firebaseapp\.com$/ // Allow Firebase app domains
    ],
    methods: ["GET", "POST"]
  }
});

// Add health check route (if not already present)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Update server listen
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Avatar Chat Backend running on port ${PORT}`);
  console.log('Services initialized:');
  console.log('  ✅ Gemini AI Service');
  console.log('  ✅ Text-to-Speech Service');
  console.log('  ✅ Speech-to-Text Service');
  console.log('  ✅ Socket.IO Server');
});
```

## 🌐 Step 3: Deploy Backend to Cloud Run

### 3.1: Authenticate and Configure

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required services (if not done already)
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 3.2: Build and Deploy

```bash
cd backend

# Build and deploy to Cloud Run
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
  --set-env-vars NODE_ENV=production
```

### 3.3: Set Environment Variables

```bash
# Set your Gemini API key
gcloud run services update ai-avatar-chat-backend \
  --region us-central1 \
  --set-env-vars GOOGLE_API_KEY=your_gemini_api_key

# For service account authentication, you have two options:

# Option 1: Use the default Cloud Run service account (recommended)
gcloud run services update ai-avatar-chat-backend \
  --region us-central1 \
  --service-account ai-avatar-chat-service@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Option 2: Upload JSON key to Secret Manager (more complex but more secure)
# See "Advanced: Using Secret Manager" section below
```

### 3.4: Get Your Backend URL

```bash
# Get the deployed service URL
gcloud run services describe ai-avatar-chat-backend \
  --region us-central1 \
  --format 'value(status.url)'

# Save this URL - you'll need it for the frontend
```

## 🔥 Step 4: Deploy Frontend to Firebase Hosting

### 4.1: Initialize Firebase

```bash
cd frontend

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# When prompted, choose:
# - Use an existing project: YOUR_PROJECT_ID
# - Public directory: build
# - Configure as SPA: Yes
# - Overwrite index.html: No
```

### 4.2: Update Frontend Configuration

Update `frontend/src/services/SocketService.js`:

```javascript
// Update the connect method to use your Cloud Run URL
connect(url = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001') {
  // ... rest of the method
}
```

Create `frontend/.env.production`:

```env
REACT_APP_BACKEND_URL=https://ai-avatar-chat-backend-xxx-uc.a.run.app
```

Replace the URL with your actual Cloud Run service URL from Step 3.4.

### 4.3: Build and Deploy

```bash
# Build the React app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Get your app URL
firebase hosting:channel:list
```

## 🔧 Step 5: Configure Custom Domain (Optional)

### 5.1: For Firebase Hosting

```bash
# Add custom domain
firebase hosting:domain:add yourdomain.com

# Follow the instructions to verify domain ownership
# and update DNS records
```

### 5.2: For Cloud Run

```bash
# Map custom domain to Cloud Run
gcloud run domain-mappings create \
  --service ai-avatar-chat-backend \
  --domain api.yourdomain.com \
  --region us-central1
```

## 📊 Step 6: Set Up Monitoring and Logging

### 6.1: Enable Monitoring

```bash
# Enable monitoring APIs
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com

# Create uptime check
gcloud alpha monitoring uptime create \
  --display-name="AI Avatar Chat Backend" \
  --monitored-resource-type=gce_instance \
  --http-check-path=/health \
  --hostname=your-backend-url
```

### 6.2: View Logs

```bash
# View Cloud Run logs
gcloud logs tail --service=ai-avatar-chat-backend

# View Firebase Hosting logs
firebase hosting:logs
```

## 🚀 Step 7: Set Up CI/CD (Optional)

### 7.1: GitHub Actions for Backend

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to Cloud Run

on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Google Cloud
      uses: google-github-actions/setup-gcloud@v1
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT_ID }}
    
    - name: Deploy to Cloud Run
      run: |
        cd backend
        gcloud run deploy ai-avatar-chat-backend \
          --source . \
          --platform managed \
          --region us-central1 \
          --allow-unauthenticated
```

### 7.2: GitHub Actions for Frontend

Create `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend to Firebase

on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Build
      run: |
        cd frontend
        npm run build
      env:
        REACT_APP_BACKEND_URL: ${{ secrets.BACKEND_URL }}
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: ${{ secrets.GCP_PROJECT_ID }}
        channelId: live
        entryPoint: frontend
```

## 🔒 Advanced: Using Secret Manager

For enhanced security, store sensitive data in Google Secret Manager:

```bash
# Create secrets
echo "your-gemini-api-key" | gcloud secrets create gemini-api-key --data-file=-

# Grant access to Cloud Run
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:ai-avatar-chat-service@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Update Cloud Run to use secrets
gcloud run services update ai-avatar-chat-backend \
  --region us-central1 \
  --set-secrets GOOGLE_API_KEY=gemini-api-key:latest
```

## 💰 Cost Optimization Tips

1. **Use Cloud Run minimum instances = 0** (cold starts are acceptable for this use case)
2. **Set appropriate memory/CPU limits** (1GB/1CPU is usually sufficient)
3. **Enable Firebase Hosting compression**
4. **Use Cloud Run concurrency settings** (default 1000 is usually fine)
5. **Monitor API usage** and set billing alerts

## 🧪 Testing Your Deployment

1. **Test backend health**:
   ```bash
   curl https://your-backend-url/health
   ```

2. **Test frontend**:
   - Visit your Firebase Hosting URL
   - Check browser console for errors
   - Test voice recording and AI responses

3. **Test end-to-end**:
   - Load an avatar
   - Record a voice message
   - Verify AI response and speech synthesis

## 🚨 Troubleshooting

### Common Issues:

**CORS errors**:
- Verify frontend URL is in backend CORS whitelist
- Check Firebase Hosting domain configuration

**Authentication errors**:
- Verify service account has required roles
- Check environment variables are set correctly

**Cold start timeouts**:
- Increase Cloud Run timeout to 300s
- Consider using minimum instances > 0 for production

**Memory issues**:
- Increase Cloud Run memory allocation
- Monitor memory usage in Cloud Console

## 📈 Monitoring Your App

- **Cloud Run Metrics**: CPU, memory, request count, latency
- **Firebase Analytics**: User engagement, performance
- **Error Reporting**: Automatic error tracking
- **Uptime Monitoring**: Service availability

## 🎉 Congratulations!

Your AI Avatar Chat application is now deployed and ready for users! 

**Frontend**: https://your-project.web.app  
**Backend**: https://your-backend-url

Next steps:
- Set up custom domains
- Configure monitoring alerts
- Add analytics tracking
- Optimize performance based on usage 