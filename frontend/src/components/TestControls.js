import React, { useState, useRef } from 'react';
import './TestControls.css';

function TestControls({ onSpeakingStart, onSpeakingEnd }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Test responses - you can add your own audio files to public folder
  const testResponses = [
    {
      text: "Hello! I'm your AI avatar assistant. How can I help you today?",
      audioFile: "/test-audio/hello.mp3" // You'll need to add this file
    },
    {
      text: "That's a great question! Let me think about that for a moment.",
      audioFile: "/test-audio/thinking.mp3" // You'll need to add this file
    },
    {
      text: "I hope that helps! Is there anything else you'd like to know?",
      audioFile: "/test-audio/helpful.mp3" // You'll need to add this file
    }
  ];

  const playTestResponse = async (response) => {
    if (isPlaying) return;

    try {
      setIsPlaying(true);
      onSpeakingStart();

      // For now, we'll use text-to-speech if audio files aren't available
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        
        utterance.onend = () => {
          setIsPlaying(false);
          onSpeakingEnd();
        };

        utterance.onerror = () => {
          setIsPlaying(false);
          onSpeakingEnd();
        };

        speechSynthesis.speak(utterance);
      } else {
        // Fallback - just simulate speaking for 3 seconds
        setTimeout(() => {
          setIsPlaying(false);
          onSpeakingEnd();
        }, 3000);
      }

    } catch (error) {
      console.error('Error playing test response:', error);
      setIsPlaying(false);
      onSpeakingEnd();
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    onSpeakingEnd();
  };

  return (
    <div className="test-controls">
      <h3>Test Avatar Responses</h3>
      <p className="test-description">
        Click the buttons below to test avatar speech animation
      </p>
      
      <div className="test-buttons">
        {testResponses.map((response, index) => (
          <button
            key={index}
            onClick={() => playTestResponse(response)}
            disabled={isPlaying}
            className="test-btn"
          >
            Test Response {index + 1}
          </button>
        ))}
      </div>

      {isPlaying && (
        <div className="speaking-controls">
          <div className="speaking-indicator">
            🔊 Avatar is speaking...
          </div>
          <button onClick={stopSpeaking} className="stop-btn">
            Stop Speaking
          </button>
        </div>
      )}

      <div className="current-text">
        <h4>Instructions:</h4>
        <ul>
          <li>Create a new avatar or paste a Ready Player Me URL</li>
          <li>Click test buttons to see avatar animation</li>
          <li>The avatar should move slightly when "speaking"</li>
          <li>Uses browser's built-in text-to-speech for now</li>
          <li>Try the "Create New Avatar" button for the full RPM experience</li>
        </ul>
      </div>
    </div>
  );
}

export default TestControls;