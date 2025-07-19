# AI Avatar Chat - Frontend Test

A React-based 3D avatar interface using Ready Player Me avatars with Three.js and React Three Fiber.

## Current Status

This is the **frontend-only** version for testing avatar loading and animation. The backend integration will come later.

## Features

- 3D avatar loading from Ready Player Me URLs
- Animated avatar responses using browser text-to-speech
- Interactive 3D scene with camera controls
- Test buttons to simulate AI responses

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Test

### Option 1: Create Avatar In-App
1. **Click "Create New Avatar"** - Opens the Ready Player Me creator
2. **Customize your avatar** - Use the built-in avatar creator
3. **Export** - Avatar automatically loads in the scene

### Option 2: Use Existing Avatar URL
1. **Get a Ready Player Me Avatar:**
   - Go to [Ready Player Me](https://readyplayer.me)
   - Create a free avatar
   - Copy the avatar URL (should end with `.glb`)
2. **Load Your Avatar:**
   - Paste the avatar URL into the input field
   - The avatar should load in the 3D scene

### Test Avatar Animation
- Click the "Test Response" buttons
- Watch the avatar animate while speaking
- The avatar should move more when "speaking" vs idle

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AvatarScene.js      # 3D avatar rendering
│   │   ├── TestControls.js     # Test buttons and controls
│   │   └── TestControls.css    # Styling for controls
│   ├── App.js                  # Main app component
│   ├── App.css                 # Main app styling
│   └── index.js                # React entry point
└── package.json
```

## Next Steps

Once the frontend is working well:

1. **Backend Integration:**
   - Node.js/Express server with WebSocket support
   - Google Gemini AI integration
   - Google Cloud Text-to-Speech
   - Audio processing pipeline

2. **Enhanced Features:**
   - Real microphone input
   - Better lip-sync animation
   - Voice activity detection
   - Cloud deployment (Firebase + Cloud Run)

## Troubleshooting

- **Avatar not loading:** Make sure the URL is a valid Ready Player Me `.glb` file
- **No animation:** Check browser console for errors
- **No speech:** Ensure your browser supports Web Speech API
- **Performance issues:** Try a simpler avatar or reduce scene complexity

## Technologies Used

- React 18
- Three.js
- React Three Fiber
- React Three Drei
- Ready Player Me React SDK (@readyplayerme/react-avatar-creator)
- Ready Player Me Visage (@readyplayerme/visage)
- Web Speech API (for text-to-speech testing)