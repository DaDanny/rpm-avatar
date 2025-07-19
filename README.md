# 🤖 AI Avatar Chat

An interactive 3D avatar chat application that combines ReadyPlayerMe avatars with AI conversation powered by Google Cloud services. Talk to your avatar using voice or text and watch it respond with realistic speech and animations!

## ✨ Features

### 🎭 3D Avatar System
- **ReadyPlayerMe Integration**: Load custom 3D avatars from ReadyPlayerMe
- **Realistic Animations**: Dynamic facial movements and body language during speech
- **Professional Lighting**: Enhanced 3D rendering with realistic shadows and lighting
- **Interactive Controls**: Zoom, rotate, and view your avatar from different angles

### 🗣️ Voice & Chat
- **Voice Recording**: Real-time microphone recording with noise cancellation
- **Speech-to-Text**: Convert voice input to text using Google Cloud Speech-to-Text
- **AI Conversations**: Powered by Google Gemini AI for natural, contextual responses
- **Text-to-Speech**: High-quality voice synthesis using Google Cloud TTS
- **Real-time Communication**: WebSocket-based instant messaging

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful, modern interface with backdrop blur effects
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Live Status Updates**: Real-time connection and processing status
- **Conversation History**: Persistent chat history with timestamps
- **Error Handling**: Graceful error handling with user-friendly messages

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Three.js & React Three Fiber** - 3D graphics and avatar rendering
- **Socket.io Client** - Real-time communication
- **RecordRTC** - Audio recording capabilities
- **Modern CSS** - Glassmorphism UI with animations

### Backend
- **Node.js & Express** - RESTful API server
- **Socket.io** - WebSocket server for real-time communication
- **Google Cloud Speech-to-Text** - Voice recognition
- **Google Cloud Text-to-Speech** - Voice synthesis
- **Google Gemini AI** - Conversational AI
- **Audio Processing** - Real-time audio stream handling

## 🚀 Quick Start

**Got an error about "Service account key creation is disabled"?** 
→ Your organization uses secure authentication! Follow our [**Keyless Setup Guide**](docs/quick-start.md) instead.

### ⚡ Super Quick Setup (5 minutes)

1. **Install dependencies:**
   ```bash
   ./setup.sh
   ```

2. **Choose your authentication method:**
   
   **🔐 Secure Method (No JSON Keys - Recommended):**
   ```bash
   # See docs/quick-start.md for complete steps
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   # ... follow the keyless setup guide
   ```
   
   **🔑 Traditional Method (JSON Keys):**
   ```bash
   # Follow docs/google-cloud-setup.md
   ```

3. **Start developing:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend  
   cd frontend && npm start
   ```

4. **Deploy to production:**
   ```bash
   ./deploy.sh
   ```

**📖 Detailed Setup:** [Quick Start Guide](docs/quick-start.md)

## 📖 Usage Guide

### 1. **Set Up Your Avatar**
   - Visit [ReadyPlayerMe](https://readyplayer.me) to create a custom avatar
   - Copy the `.glb` URL from your avatar
   - Paste it into the Avatar URL field
   - Or use one of the sample avatars provided

### 2. **Enable Microphone**
   - Click "Enable Mic" to grant microphone permissions
   - You'll see a confirmation when access is granted

### 3. **Start Chatting**
   - **Voice**: Click "Record" and speak your message, then click "Stop"
   - **Text**: Type your message and press Enter or click "Send"
   - Watch your avatar respond with speech and animations!

### 4. **Conversation Features**
   - View real-time processing status (transcribing, thinking, generating speech)
   - See conversation history with timestamps
   - Clear conversation context anytime
   - Connection status monitoring

## 🔧 Configuration

### Voice Settings
The app uses optimal settings for voice recording:
- **Sample Rate**: 48kHz
- **Encoding**: WebM Opus
- **Noise Cancellation**: Enabled
- **Auto Gain Control**: Enabled

### AI Personality
The AI is configured to be:
- Friendly and conversational
- Concise but engaging (2-3 sentences)
- Context-aware of conversation history
- Natural and human-like in responses

### Avatar Animations
- **Idle State**: Gentle swaying and breathing
- **Speaking State**: Head movements, facial expressions, body language
- **Morph Targets**: Automatic facial animation if supported by avatar

## 🎨 Customization

### Avatar Appearance
- Create custom avatars at ReadyPlayerMe
- Supports various styles and appearances
- Automatic material enhancement for better lighting
- Compatible with standard GLTF/GLB formats

### Voice Customization
You can modify voice settings in `backend/src/services/TTSService.js`:
```javascript
voice: {
  languageCode: 'en-US',
  name: 'en-US-Neural2-F', // Change voice
  ssmlGender: 'FEMALE',
},
audioConfig: {
  speakingRate: 1.1, // Adjust speed
  pitch: 2.0,        // Adjust pitch
}
```

### UI Themes
Modify CSS variables in `frontend/src/App.css` to customize colors and styling.

## 🐛 Troubleshooting

### Common Issues

**Microphone not working:**
- Ensure HTTPS (required for microphone access)
- Check browser permissions
- Try refreshing the page

**Avatar not loading:**
- Verify the ReadyPlayerMe URL is correct and ends with `.glb`
- Check browser console for CORS issues
- Try using one of the sample avatars

**Voice synthesis issues:**
- Verify Google Cloud TTS API is enabled
- Check service account permissions
- Ensure proper environment variables are set

**Connection problems:**
- Make sure backend server is running on port 3001
- Check firewall settings
- Verify WebSocket connection in browser dev tools

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## 📁 Project Structure

```
rpm-avatar/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AvatarScene.js      # 3D avatar rendering
│   │   │   ├── ChatInterface.js    # Chat UI component
│   │   │   └── ChatInterface.css   # Chat styling
│   │   ├── services/
│   │   │   ├── SocketService.js    # WebSocket client
│   │   │   └── AudioService.js     # Audio recording/playback
│   │   ├── App.js                  # Main application
│   │   └── App.css                 # Main styling
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── GeminiService.js        # AI conversation
│   │   │   ├── TTSService.js           # Text-to-Speech
│   │   │   └── SpeechToTextService.js  # Speech-to-Text
│   │   └── server.js               # Express server
│   └── package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **ReadyPlayerMe** for the amazing avatar platform
- **Google Cloud** for AI and speech services
- **Three.js** and **React Three Fiber** communities
- **Socket.io** for real-time communication

---

**Enjoy chatting with your AI avatar!** 🚀🤖

For questions or support, please open an issue on GitHub.