const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class TTSService {
  constructor() {
    this.client = new textToSpeech.TextToSpeechClient();
    this.audioDir = path.join(process.cwd(), 'temp-audio');
    this.ensureAudioDir();
  }

  async ensureAudioDir() {
    try {
      await fs.ensureDir(this.audioDir);
    } catch (error) {
      console.error('Error creating audio directory:', error);
    }
  }

  async textToSpeech(text, options = {}) {
    try {
      const request = {
        input: { text: text },
        voice: {
          languageCode: options.languageCode || 'en-US',
          name: options.voiceName || 'en-US-Neural2-F', // Female neural voice
          ssmlGender: options.gender || 'FEMALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: options.speakingRate || 1.0,
          pitch: options.pitch || 0.0,
          volumeGainDb: options.volumeGainDb || 0.0,
        },
      };

      const [response] = await this.client.synthesizeSpeech(request);
      
      // Return audio buffer directly for streaming
      return response.audioContent;
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      throw new Error('Failed to generate speech');
    }
  }

  async textToSpeechFile(text, options = {}) {
    try {
      const audioContent = await this.textToSpeech(text, options);
      const filename = `${uuidv4()}.mp3`;
      const filepath = path.join(this.audioDir, filename);
      
      await fs.writeFile(filepath, audioContent, 'binary');
      
      return {
        filepath,
        filename,
        buffer: audioContent
      };
    } catch (error) {
      console.error('Error creating audio file:', error);
      throw new Error('Failed to create audio file');
    }
  }

  async cleanupTempFiles() {
    try {
      const files = await fs.readdir(this.audioDir);
      const now = Date.now();
      
      for (const file of files) {
        const filepath = path.join(this.audioDir, file);
        const stats = await fs.stat(filepath);
        
        // Delete files older than 1 hour
        if (now - stats.mtime.getTime() > 3600000) {
          await fs.unlink(filepath);
          console.log('Cleaned up old audio file:', file);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  // Get available voices for customization
  async getAvailableVoices(languageCode = 'en-US') {
    try {
      const request = { languageCode };
      const [response] = await this.client.listVoices(request);
      return response.voices;
    } catch (error) {
      console.error('Error getting available voices:', error);
      return [];
    }
  }
}

module.exports = TTSService; 