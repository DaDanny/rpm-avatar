import RecordRTC from 'recordrtc';

class AudioService {
  constructor() {
    this.recorder = null;
    this.stream = null;
    this.isRecording = false;
    this.audioContext = null;
    this.currentAudio = null;
    this.onRecordingStart = null;
    this.onRecordingStop = null;
    this.onAudioPlayStart = null;
    this.onAudioPlayEnd = null;
  }

  // Initialize audio context and get microphone permission
  async initialize() {
    try {
      // Get microphone permission
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });

      // Initialize Web Audio Context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      console.log('Audio service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing audio service:', error);
      throw new Error(`Microphone access denied: ${error.message}`);
    }
  }

  // Start recording audio
  async startRecording() {
    if (this.isRecording) {
      console.warn('Already recording');
      return;
    }

    if (!this.stream) {
      await this.initialize();
    }

    try {
      this.recorder = new RecordRTC(this.stream, {
        type: 'audio',
        mimeType: 'audio/webm;codecs=opus',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 48000,
        timeSlice: 1000,
        ondataavailable: (blob) => {
          // Real-time data if needed for streaming
        }
      });

      this.recorder.startRecording();
      this.isRecording = true;
      
      if (this.onRecordingStart) {
        this.onRecordingStart();
      }

      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error(`Failed to start recording: ${error.message}`);
    }
  }

  // Stop recording and return audio blob
  async stopRecording() {
    if (!this.isRecording || !this.recorder) {
      console.warn('Not currently recording');
      return null;
    }

    return new Promise((resolve, reject) => {
      this.recorder.stopRecording(() => {
        try {
          const blob = this.recorder.getBlob();
          this.isRecording = false;
          
          if (this.onRecordingStop) {
            this.onRecordingStop();
          }

          console.log('Recording stopped, blob size:', blob.size);
          resolve(blob);
        } catch (error) {
          console.error('Error stopping recording:', error);
          reject(new Error(`Failed to stop recording: ${error.message}`));
        }
      });
    });
  }

  // Convert blob to ArrayBuffer
  async blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

  // Play audio from base64 string
  async playAudio(base64Audio, format = 'mp3') {
    try {
      // Stop any currently playing audio
      this.stopAudio();

      // Convert base64 to blob
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: `audio/${format}` });

      // Create audio URL and play
      const audioUrl = URL.createObjectURL(blob);
      this.currentAudio = new Audio(audioUrl);
      
      this.currentAudio.onplay = () => {
        if (this.onAudioPlayStart) {
          this.onAudioPlayStart();
        }
      };

      this.currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (this.onAudioPlayEnd) {
          this.onAudioPlayEnd();
        }
      };

      this.currentAudio.onerror = (error) => {
        console.error('Error playing audio:', error);
        URL.revokeObjectURL(audioUrl);
        if (this.onAudioPlayEnd) {
          this.onAudioPlayEnd();
        }
      };

      await this.currentAudio.play();
      console.log('Audio playback started');
    } catch (error) {
      console.error('Error playing audio:', error);
      if (this.onAudioPlayEnd) {
        this.onAudioPlayEnd();
      }
      throw new Error(`Failed to play audio: ${error.message}`);
    }
  }

  // Stop currently playing audio
  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      
      if (this.onAudioPlayEnd) {
        this.onAudioPlayEnd();
      }
    }
  }

  // Check if currently recording
  getRecordingStatus() {
    return this.isRecording;
  }

  // Check if audio is playing
  getPlaybackStatus() {
    return this.currentAudio && !this.currentAudio.paused;
  }

  // Set event callbacks
  setCallbacks(callbacks) {
    this.onRecordingStart = callbacks.onRecordingStart;
    this.onRecordingStop = callbacks.onRecordingStop;
    this.onAudioPlayStart = callbacks.onAudioPlayStart;
    this.onAudioPlayEnd = callbacks.onAudioPlayEnd;
  }

  // Clean up resources
  cleanup() {
    this.stopAudio();
    
    if (this.isRecording && this.recorder) {
      this.recorder.stopRecording();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.recorder = null;
    this.isRecording = false;
  }

  // Check browser support
  static isSupported() {
    return !!(navigator.mediaDevices && 
              navigator.mediaDevices.getUserMedia && 
              (window.AudioContext || window.webkitAudioContext));
  }
}

// Create singleton instance
const audioService = new AudioService();
export default audioService; 