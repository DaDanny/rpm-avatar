import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import AvatarScene from './components/AvatarScene';
import TestControls from './components/TestControls';
import './App.css';

function App() {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);

  // Sample Ready Player Me URLs for quick testing
  const sampleAvatars = [
    'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb',
    'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a7.glb'
  ];

  const loadSampleAvatar = (url) => {
    setAvatarUrl(url);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>AI Avatar Chat - Frontend Test</h1>
      </header>

      <main className="app-main">
        <div className="avatar-container">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <AvatarScene
              avatarUrl={avatarUrl}
              isAvatarSpeaking={isAvatarSpeaking}
            />
          </Canvas>
        </div>

        <div className="controls-container">
          <div className="avatar-input">
            <input
              type="text"
              placeholder="Enter Ready Player Me Avatar URL (.glb)"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <div className="avatar-actions">
              <a 
                href="https://readyplayer.me" 
                target="_blank" 
                rel="noopener noreferrer"
                className="create-avatar-btn"
              >
                Create New Avatar →
              </a>
              <p className="help-text">
                Create a free avatar at Ready Player Me, then copy the .glb URL here
              </p>
              <div className="sample-avatars">
                <p className="sample-label">Or try a sample avatar:</p>
                <button 
                  onClick={() => loadSampleAvatar(sampleAvatars[0])}
                  className="sample-btn"
                >
                  Sample Avatar 1
                </button>
                <button 
                  onClick={() => loadSampleAvatar(sampleAvatars[1])}
                  className="sample-btn"
                >
                  Sample Avatar 2
                </button>
              </div>
            </div>
          </div>

          <TestControls
            onSpeakingStart={() => setIsAvatarSpeaking(true)}
            onSpeakingEnd={() => setIsAvatarSpeaking(false)}
          />
        </div>
      </main>
    </div>
  );
}

export default App;