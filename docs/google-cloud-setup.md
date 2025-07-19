# Google Cloud Setup Guide

This guide walks you through setting up Google Cloud services for the AI Avatar Chat application.

## 📋 Prerequisites

- Google Cloud Project created
- Billing enabled on your Google Cloud Project
- Google Cloud Console access

## 🔑 Step 1: Enable Required APIs

1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)

2. **Select your project** from the project dropdown

3. **Enable the following APIs**:
   - Go to "APIs & Services" > "Library"
   - Search for and enable each API:

   ```
   ✅ Cloud Speech-to-Text API
   ✅ Cloud Text-to-Speech API  
   ✅ Gemini API (Google AI)
   ✅ Cloud Run API (for deployment)
   ✅ Cloud Build API (for deployment)
   ✅ Container Registry API (for deployment)
   ```

## 🛡️ Step 2: Create Service Account

1. **Navigate to IAM & Admin**:
   - Go to "IAM & Admin" > "Service Accounts"

2. **Create Service Account**:
   - Click "Create Service Account"
   - **Name**: `ai-avatar-chat-service`
   - **Description**: `Service account for AI Avatar Chat application`
   - Click "Create and Continue"

3. **Add Required Roles**:
   ```
   ✅ Cloud Speech Client (roles/speech.client)
   ✅ Cloud Text-to-Speech Client (roles/texttospeech.client)
   ✅ AI Platform User (roles/aiplatform.user)
   ✅ Cloud Run Developer (roles/run.developer)
   ✅ Storage Object Viewer (roles/storage.objectViewer)
   ```

4. **Generate JSON Key**:
   - Click on your created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose "JSON" format
   - Download the key file
   - **Save it securely** (you'll need this for your backend)

## 🤖 Step 3: Get Gemini API Key

1. **Go to Google AI Studio**: [aistudio.google.com](https://aistudio.google.com)

2. **Create API Key**:
   - Click "Get API Key"
   - Choose your Google Cloud project
   - Copy the generated API key
   - **Save this key** (you'll need it for your backend)

## 🔧 Step 4: Configure Environment Variables

Create your `backend/.env` file:

```env
# Google Cloud API Configuration
GOOGLE_API_KEY=your_gemini_api_key_from_step_3
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json

# Server Configuration
PORT=8080
FRONTEND_URL=https://your-app.web.app

# Node Environment
NODE_ENV=production
```

## 🔒 Step 5: Security Best Practices

### For Local Development:
1. **Store service account key securely**:
   ```bash
   # Create a secure directory
   mkdir ~/.gcloud-keys
   
   # Move your key file there
   mv ~/Downloads/ai-avatar-chat-service-*.json ~/.gcloud-keys/
   
   # Update your .env file
   GOOGLE_APPLICATION_CREDENTIALS=/Users/yourusername/.gcloud-keys/ai-avatar-chat-service-*.json
   ```

2. **Never commit keys to version control**:
   ```bash
   # Add to .gitignore
   echo "backend/.env" >> .gitignore
   echo "**/*.json" >> .gitignore
   echo "!package*.json" >> .gitignore
   ```

### For Production (Cloud Run):
- Use Google Cloud Secret Manager (covered in deployment guide)
- Set environment variables directly in Cloud Run
- Enable automatic key rotation

## 🧪 Step 6: Test Your Setup

1. **Test API access**:
   ```bash
   cd backend
   node -e "
   require('dotenv').config();
   const { GoogleGenerativeAI } = require('@google/generative-ai');
   const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
   console.log('✅ Gemini API configured');
   
   const speech = require('@google-cloud/speech');
   const client = new speech.SpeechClient();
   console.log('✅ Speech-to-Text configured');
   
   const textToSpeech = require('@google-cloud/text-to-speech');
   const ttsClient = new textToSpeech.TextToSpeechClient();
   console.log('✅ Text-to-Speech configured');
   "
   ```

## 📊 Step 7: Monitor Usage and Costs

1. **Set up billing alerts**:
   - Go to "Billing" in Google Cloud Console
   - Set budget alerts for your expected usage

2. **Monitor API usage**:
   - Go to "APIs & Services" > "Dashboard"
   - Check quotas and usage metrics

3. **Estimated costs for moderate usage**:
   ```
   Speech-to-Text: ~$0.006 per 15 seconds
   Text-to-Speech: ~$4.00 per 1M characters
   Gemini API: Varies by model and usage
   Cloud Run: Pay-per-use (very cost-effective)
   ```

## 🚨 Troubleshooting

### Common Issues:

**"Permission denied" errors**:
- Verify all required APIs are enabled
- Check service account has correct roles
- Ensure JSON key file path is correct

**"Quota exceeded" errors**:
- Check API quotas in Google Cloud Console
- Request quota increases if needed
- Implement rate limiting in your app

**Authentication errors**:
- Verify GOOGLE_APPLICATION_CREDENTIALS path
- Check JSON key file is valid and not corrupted
- Ensure service account hasn't been deleted

### Getting Help:
- Google Cloud Support
- Stack Overflow with `google-cloud` tag
- Google Cloud Community Slack

## ✅ Next Steps

Once your Google Cloud setup is complete:
1. Test your application locally
2. Follow the deployment guide for Firebase Hosting + Cloud Run
3. Set up monitoring and logging
4. Configure custom domains (optional)

**Your Google Cloud setup is now ready for the AI Avatar Chat application!** 🎉 