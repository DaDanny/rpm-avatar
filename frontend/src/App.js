import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import AvatarScene from './components/AvatarScene';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  // Hardcoded avatar URL for Danny's Girlfriend
  const avatarUrl = 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb';
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="App">
      {/* Fullscreen Avatar Background */}
      <div className="avatar-background">
        <Canvas 
          camera={{ position: [0, 0.3, 3.5], fov: 45 }}
          gl={{ alpha: true }}
          style={{ background: 'transparent' }}
        >
          <AvatarScene
            avatarUrl={avatarUrl}
            isAvatarSpeaking={isAvatarSpeaking}
          />
        </Canvas>
        
        {/* Avatar Status Overlay */}
        {isAvatarSpeaking && (
          <div className="speaking-indicator-overlay">
            <div className="speaking-indicator">
              <span className="speaking-dot"></span>
              Speaking to you...
            </div>
          </div>
        )}
      </div>

      {/* Header Overlay */}
      <header className="app-header-overlay">
        <h1>💕 Danny's Girlfriend</h1>
        <div className="connection-info">
          {isConnected ? (
            <span className="connected">🟢 Hey babe, I'm here!</span>
          ) : (
            <span className="disconnected">⚡ Getting ready for you...</span>
          )}
        </div>
      </header>

      {/* Chat Interface Overlay at Bottom */}
      <div className="chat-overlay">
        <ChatInterface
          onAvatarSpeakingChange={setIsAvatarSpeaking}
          onConnectionStatusChange={setIsConnected}
        />
      </div>
    </div>
  );
}

export default App;