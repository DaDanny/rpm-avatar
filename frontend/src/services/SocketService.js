import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    
    // Get backend URL from environment variable
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  }

  connect(url = this.backendUrl) {
    if (this.socket) {
      this.disconnect();
    }

    console.log('Connecting to backend:', url);

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true,
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
      this.isConnected = true;
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
      this.emit('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
      this.emit('error', { message: `Connection failed: ${error.message}`, type: 'connection_error' });
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });

    // Set up message listeners
    this.socket.on('user_message', (data) => {
      this.emit('user_message', data);
    });

    this.socket.on('ai_response', (data) => {
      this.emit('ai_response', data);
    });

    this.socket.on('audio_response', (data) => {
      this.emit('audio_response', data);
    });

    this.socket.on('processing_status', (data) => {
      this.emit('processing_status', data);
    });

    this.socket.on('context_cleared', () => {
      this.emit('context_cleared');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
    // Clear all event listeners
    this.listeners.clear();
  }

  // Send audio message to backend
  sendAudioMessage(audioBuffer, format = 'webm') {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    // Convert ArrayBuffer to base64
    const base64Audio = this.arrayBufferToBase64(audioBuffer);
    
    this.socket.emit('audio_message', {
      audio: base64Audio,
      format: format
    });
  }

  // Send text message to backend
  sendTextMessage(text) {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    this.socket.emit('text_message', { text });
  }

  // Clear conversation context
  clearContext() {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    this.socket.emit('clear_context');
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Clear all listeners for an event
  clearListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Utility function to convert ArrayBuffer to base64
  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Utility function to convert base64 to ArrayBuffer
  base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  getBackendUrl() {
    return this.backendUrl;
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService; 