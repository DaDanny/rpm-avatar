import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import AvatarScene from './components/AvatarScene';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

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
        <h1>🤖 AI Avatar Chat</h1>
        <div className="connection-info">
          {isConnected ? (
            <span className="connected">🟢 Ready to chat!</span>
          ) : (
            <span className="disconnected">⚡ Connecting...</span>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="content-layout">
          {/* Avatar Display Section */}
          <div className="avatar-section">
            <div className="avatar-container">
              <Canvas camera={{ position: [0, 0.3, 2.5], fov: 35 }}>
                <AvatarScene
                  avatarUrl={avatarUrl}
                  isAvatarSpeaking={isAvatarSpeaking}
                />
              </Canvas>
              
              {/* Avatar Status Overlay */}
              <div className="avatar-status">
                {isAvatarSpeaking && (
                  <div className="speaking-indicator">
                    <span className="speaking-dot"></span>
                    Avatar is speaking...
                  </div>
                )}
              </div>
            </div>

            {/* Avatar Selection */}
            <div className="avatar-controls">
              <div className="avatar-input">
                <label htmlFor="avatar-url">Avatar URL</label>
                <input
                  id="avatar-url"
                  type="text"
                  placeholder="Enter Ready Player Me Avatar URL (.glb)"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>

              <div className="avatar-actions">
                <a 
                  href="https://readyplayer.me" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="create-avatar-btn"
                >
                  🎨 Create New Avatar
                </a>
                
                <div className="sample-avatars">
                  <p>Or try a sample:</p>
                  <div className="sample-buttons">
                    <button 
                      onClick={() => loadSampleAvatar(sampleAvatars[0])}
                      className="sample-btn"
                    >
                      Sample 1
                    </button>
                    <button 
                      onClick={() => loadSampleAvatar(sampleAvatars[1])}
                      className="sample-btn"
                    >
                      Sample 2
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="chat-section">
            <ChatInterface
              onAvatarSpeakingChange={setIsAvatarSpeaking}
              onConnectionStatusChange={setIsConnected}
            />
          </div>
        </div>
      </main>

      {/* Instructions Footer */}
      <footer className="app-footer">
        <div className="instructions">
          <h3>How to use:</h3>
          <ol>
            <li>🎭 Select or create an avatar above</li>
            <li>🎤 Click "Enable Mic" to grant microphone access</li>
            <li>💬 Start chatting using voice or text</li>
            <li>🗣️ Watch your avatar respond with speech and animations!</li>
          </ol>
        </div>
      </footer>
    </div>
  );
}

export default App;