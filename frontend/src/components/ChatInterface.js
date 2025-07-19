import React, { useState, useEffect, useRef } from 'react';
import socketService from '../services/SocketService';
import audioService from '../services/AudioService';
import './ChatInterface.css';

function ChatInterface({ onAvatarSpeakingChange, onConnectionStatusChange }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [audioSupported, setAudioSupported] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);

  const messagesEndRef = useRef(null);
  const recordButtonRef = useRef(null);

  useEffect(() => {
    // Check audio support
    setAudioSupported(audioService.constructor.isSupported());

    // Initialize socket connection
    initializeConnection();

    // Set up audio service callbacks
    audioService.setCallbacks({
      onRecordingStart: () => setIsRecording(true),
      onRecordingStop: () => setIsRecording(false),
      onAudioPlayStart: () => onAvatarSpeakingChange(true),
      onAudioPlayEnd: () => onAvatarSpeakingChange(false)
    });

    // Cleanup on unmount
    return () => {
      cleanupConnection();
      audioService.cleanup();
    };
  }, [onAvatarSpeakingChange]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    onConnectionStatusChange(isConnected);
  }, [isConnected, onConnectionStatusChange]);

  const initializeConnection = () => {
    try {
      // Clear any existing listeners first
      cleanupConnection();
      
      socketService.connect();

      // Store handler references for cleanup
      const handlers = {
        connected: () => {
          setIsConnected(true);
          setError(null);
          addSystemMessage('Connected to AI avatar! 🤖');
        },
        disconnected: () => {
          setIsConnected(false);
          addSystemMessage('Disconnected from server 😞');
        },
        user_message: (data) => {
          addMessage('user', data.text);
        },
        ai_response: (data) => {
          addMessage('ai', data.text);
        },
        audio_response: async (data) => {
          try {
            await audioService.playAudio(data.audioBuffer, data.format);
          } catch (error) {
            console.error('Error playing audio response:', error);
            addSystemMessage('Error playing audio response');
          }
        },
        processing_status: (data) => {
          setProcessingStatus(data.status);
          setIsProcessing(data.status !== 'complete');
        },
        error: (error) => {
          setError(error.message);
          setIsProcessing(false);
          addSystemMessage(`Error: ${error.message}`, 'error');
        },
        context_cleared: () => {
          setMessages([]);
          addSystemMessage('Conversation cleared');
        }
      };

      // Register all handlers
      Object.entries(handlers).forEach(([event, handler]) => {
        socketService.on(event, handler);
      });

    } catch (error) {
      console.error('Error initializing connection:', error);
      setError('Failed to connect to server');
    }
  };

  const cleanupConnection = () => {
    // Clear all event listeners first, then disconnect
    socketService.clearListeners();
    socketService.disconnect();
  };

  const initializeAudio = async () => {
    if (audioInitialized) return;

    try {
      await audioService.initialize();
      setAudioInitialized(true);
      setError(null);
      addSystemMessage('Microphone access granted! 🎤');
    } catch (error) {
      console.error('Error initializing audio:', error);
      setError(`Microphone error: ${error.message}`);
      addSystemMessage('Microphone access denied. You can still type messages.', 'warning');
    }
  };

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender,
      text,
      timestamp: new Date()
    }]);
  };

  const addSystemMessage = (text, type = 'info') => {
    setMessages(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: 'system',
      text,
      type,
      timestamp: new Date()
    }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRecordToggle = async () => {
    if (!audioInitialized) {
      await initializeAudio();
      return;
    }

    if (!isConnected) {
      setError('Not connected to server');
      return;
    }

    try {
      if (isRecording) {
        // Stop recording and send audio
        const audioResult = await audioService.stopRecording();
        if (audioResult) {
          const { blob, format } = audioResult;
          const arrayBuffer = await audioService.blobToArrayBuffer(blob);
          socketService.sendAudioMessage(arrayBuffer, format);
          setIsProcessing(true);
        }
      } else {
        // Start recording
        await audioService.startRecording();
        setError(null);
      }
    } catch (error) {
      console.error('Error handling recording:', error);
      setError(error.message);
      setIsRecording(false);
    }
  };

  const handleSendText = () => {
    if (!textInput.trim() || !isConnected || isProcessing) return;

    try {
      socketService.sendTextMessage(textInput.trim());
      setTextInput('');
      setIsProcessing(true);
      setError(null);
    } catch (error) {
      console.error('Error sending text:', error);
      setError(error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const clearConversation = () => {
    if (isConnected) {
      socketService.clearContext();
    } else {
      setMessages([]);
    }
  };

  const getProcessingStatusText = () => {
    switch (processingStatus) {
      case 'transcribing': return 'Converting speech to text...';
      case 'generating_response': return 'AI is thinking...';
      case 'generating_audio': return 'Generating speech...';
      default: return 'Processing...';
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h3>Chat with Avatar</h3>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          {messages.length > 0 && (
            <button onClick={clearConversation} className="clear-btn">
              Clear Chat
            </button>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-content">
              {message.sender === 'system' ? (
                <div className={`system-message ${message.type || 'info'}`}>
                  {message.text}
                </div>
              ) : (
                <>
                  <div className="message-header">
                    <span className="sender">
                      {message.sender === 'user' ? '👤 You' : '🤖 Avatar'}
                    </span>
                    <span className="timestamp">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-text">{message.text}</div>
                </>
              )}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="processing-indicator">
            <div className="processing-content">
              <div className="spinner"></div>
              <span>{getProcessingStatusText()}</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="input-container">
          <div className="text-input-group">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice..."
              disabled={!isConnected || isProcessing}
              rows="2"
            />
            <button
              onClick={handleSendText}
              disabled={!textInput.trim() || !isConnected || isProcessing}
              className="send-btn"
            >
              Send
            </button>
          </div>

          {audioSupported && (
            <div className="voice-controls">
              <button
                ref={recordButtonRef}
                onClick={handleRecordToggle}
                disabled={!isConnected || isProcessing}
                className={`record-btn ${isRecording ? 'recording' : ''} ${!audioInitialized ? 'needs-permission' : ''}`}
              >
                {!audioInitialized ? '🎤 Enable Mic' : isRecording ? '⏹️ Stop' : '🎤 Record'}
              </button>
              {isRecording && (
                <div className="recording-indicator">
                  <span className="recording-dot"></span>
                  Recording...
                </div>
              )}
            </div>
          )}
        </div>

        <div className="chat-help">
          <p>
            💬 Type a message or 🎤 record your voice to chat with the AI avatar.
            The avatar will respond with both text and speech!
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface; 