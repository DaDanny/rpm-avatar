const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const GeminiService = require('./services/GeminiService');
const TTSService = require('./services/TTSService');
const SpeechToTextService = require('./services/SpeechToTextService');

const app = express();
const server = http.createServer(app);

// Production-ready CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000', // Keep for local development
  /\.web\.app$/, // Allow Firebase Hosting domains
  /\.firebaseapp\.com$/, // Allow Firebase app domains
  /\.run\.app$/ // Allow Cloud Run domains
];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Basic info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI Avatar Chat Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      websocket: 'Available via Socket.IO'
    }
  });
});

// Initialize services
const geminiService = new GeminiService();
const ttsService = new TTSService();
const speechToTextService = new SpeechToTextService();

// Store conversation context for each socket
const conversationContexts = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Initialize conversation context for this socket
  conversationContexts.set(socket.id, {
    messages: [],
    isProcessing: false
  });

  socket.on('audio_message', async (data) => {
    const context = conversationContexts.get(socket.id);
    
    if (context.isProcessing) {
      socket.emit('error', { message: 'Still processing previous message' });
      return;
    }

    try {
      context.isProcessing = true;
      console.log('Received audio message from:', socket.id);
      
      // Emit processing status
      socket.emit('processing_status', { status: 'transcribing' });
      
      // Convert audio buffer to text
      const audioBuffer = Buffer.from(data.audio, 'base64');
      const transcription = await speechToTextService.transcribeWithFormat(
        audioBuffer, 
        data.format || 'webm'
      );
      
      if (!transcription || transcription.trim().length === 0) {
        throw new Error('No speech detected in audio');
      }
      
      // Emit the user message
      socket.emit('user_message', { text: transcription });
      context.messages.push(`User: ${transcription}`);
      
      // Emit processing status
      socket.emit('processing_status', { status: 'generating_response' });
      
      // Get AI response with context
      const aiResponse = await geminiService.generatePersonalizedResponse(
        transcription, 
        { previousMessages: context.messages.slice(-6) }
      );
      
      socket.emit('ai_response', { text: aiResponse });
      context.messages.push(`AI: ${aiResponse}`);
      
      // Emit processing status
      socket.emit('processing_status', { status: 'generating_audio' });
      
      // Convert response to speech
      const audioResponse = await ttsService.textToSpeech(aiResponse, {
        speakingRate: 1.1,
        pitch: 2.0
      });
      
      socket.emit('audio_response', { 
        audioBuffer: audioResponse.toString('base64'),
        format: 'mp3'
      });
      
      socket.emit('processing_status', { status: 'complete' });
      
    } catch (error) {
      console.error('Error processing audio message:', error);
      socket.emit('error', { 
        message: error.message || 'Failed to process audio message',
        type: 'audio_processing_error'
      });
    } finally {
      context.isProcessing = false;
    }
  });

  socket.on('text_message', async (data) => {
    const context = conversationContexts.get(socket.id);
    
    if (context.isProcessing) {
      socket.emit('error', { message: 'Still processing previous message' });
      return;
    }

    try {
      context.isProcessing = true;
      console.log('Received text message from:', socket.id, ':', data.text);
      
      // Emit the user message
      socket.emit('user_message', { text: data.text });
      context.messages.push(`User: ${data.text}`);
      
      // Emit processing status
      socket.emit('processing_status', { status: 'generating_response' });
      
      // Get AI response with context
      const aiResponse = await geminiService.generatePersonalizedResponse(
        data.text, 
        { previousMessages: context.messages.slice(-6) }
      );
      
      socket.emit('ai_response', { text: aiResponse });
      context.messages.push(`AI: ${aiResponse}`);
      
      // Emit processing status
      socket.emit('processing_status', { status: 'generating_audio' });
      
      // Convert response to speech
      const audioResponse = await ttsService.textToSpeech(aiResponse, {
        speakingRate: 1.1,
        pitch: 2.0
      });
      
      socket.emit('audio_response', { 
        audioBuffer: audioResponse.toString('base64'),
        format: 'mp3'
      });
      
      socket.emit('processing_status', { status: 'complete' });
      
    } catch (error) {
      console.error('Error processing text message:', error);
      socket.emit('error', { 
        message: error.message || 'Failed to process text message',
        type: 'text_processing_error'
      });
    } finally {
      context.isProcessing = false;
    }
  });

  socket.on('clear_context', () => {
    const context = conversationContexts.get(socket.id);
    if (context) {
      context.messages = [];
      socket.emit('context_cleared');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    conversationContexts.delete(socket.id);
  });
});

// Cleanup temp files periodically
setInterval(async () => {
  try {
    await ttsService.cleanupTempFiles();
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}, 30 * 60 * 1000); // Every 30 minutes

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Use PORT environment variable (required for Cloud Run)
const PORT = process.env.PORT || 8080;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Avatar Chat Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Services initialized:');
  console.log('  ✅ Gemini AI Service');
  console.log('  ✅ Text-to-Speech Service');
  console.log('  ✅ Speech-to-Text Service');
  console.log('  ✅ Socket.IO Server');
  console.log(`  🌐 Health check available at http://localhost:${PORT}/health`);
});