# Quick Start Guide

Choose your setup path based on your organization's Google Cloud security settings.

## 🔍 Which Setup Method Should I Use?

### 🚨 Got this error when creating service account keys?
```
Service account key creation is disabled
An Organization Policy that blocks service accounts key creation has been enforced...
```

**→ Use the [Secure Keyless Method](#secure-keyless-method-recommended) (it's actually better!)**

### ✅ No restrictions on service account keys?

**→ You can use either method, but [Secure Keyless](#secure-keyless-method-recommended) is still recommended**

---

## 🔐 Secure Keyless Method (Recommended)

**Best for: Enterprise organizations, security-conscious setups, production deployments**

### ⚡ Super Quick Setup (5 minutes)

1. **Install dependencies:**
   ```bash
   ./setup.sh
   ```

2. **Setup Google Cloud (keyless):**
   ```bash
   # Authenticate and set project
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   
   # Enable APIs and create service account
   gcloud services enable speech.googleapis.com texttospeech.googleapis.com aiplatform.googleapis.com run.googleapis.com cloudbuild.googleapis.com
   
   # Create service account with permissions
   gcloud iam service-accounts create ai-avatar-chat-service \
     --description="AI Avatar Chat service account"
   
   PROJECT_ID=$(gcloud config get-value project)
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:ai-avatar-chat-service@$PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/speech.client"
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:ai-avatar-chat-service@$PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/texttospeech.client"
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:ai-avatar-chat-service@$PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

3. **Get Gemini API key:**
   - Visit [Google AI Studio](https://aistudio.google.com)
   - Create API key for your project
   - Save the key

4. **Setup local development:**
   ```bash
   # Setup local authentication
   gcloud auth application-default login
   
   # Create local environment
   cp backend/.env.example backend/.env
   # Edit backend/.env and add your Gemini API key
   ```

5. **Test locally:**
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd frontend && npm start
   ```

6. **Deploy to production:**
   ```bash
   ./deploy.sh
   ```

**📖 Detailed guide:** [docs/google-cloud-setup-no-keys.md](google-cloud-setup-no-keys.md)

---

## 🔑 Traditional Method (JSON Keys)

**Best for: Personal projects, small teams, quick prototypes**

### ⚡ Quick Setup

1. **Install dependencies:**
   ```bash
   ./setup.sh
   ```

2. **Follow the detailed setup:**
   
   **📖 Detailed guide:** [docs/google-cloud-setup.md](google-cloud-setup.md)

3. **Deploy:**
   
   **📖 Deployment guide:** [docs/deployment-guide.md](deployment-guide.md)

---

## 🎯 What You'll Get

After setup, you'll have:

- **🎭 3D Avatar Chat**: ReadyPlayerMe avatars with realistic animations
- **🗣️ Voice Interface**: Record voice messages, get AI responses
- **💬 Text Chat**: Type messages as an alternative to voice
- **🤖 AI Conversations**: Powered by Google Gemini AI
- **🌐 Cloud Deployment**: Scalable hosting on Google Cloud

---

## 🚨 Need Help?

### Common Issues:

**"Permission denied" errors:**
- Make sure all APIs are enabled
- Check service account permissions
- Verify project billing is enabled

**"CORS errors" in browser:**
- Check frontend/backend URL configuration
- Verify CORS settings in backend

**"No microphone access":**
- Allow microphone permissions in browser
- Use HTTPS for production (required for microphone)

### Get Support:
- Check the detailed guides in `/docs/`
- Review error logs in Google Cloud Console
- Test with provided sample avatars first

---

## 💰 Cost Estimate

For moderate usage (100 conversations/day):
- **Cloud Run**: ~$5-10/month
- **Firebase Hosting**: Free tier sufficient
- **Speech APIs**: ~$10-20/month
- **Gemini API**: ~$5-15/month

**Total: ~$20-45/month** for moderate usage

---

**Ready to build your AI Avatar Chat app?** 🚀

Choose your path above and start chatting with AI avatars in minutes! 