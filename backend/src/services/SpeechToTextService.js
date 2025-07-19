const speech = require('@google-cloud/speech');
const fs = require('fs-extra');

class SpeechToTextService {
  constructor() {
    this.client = new speech.SpeechClient();
  }

  async transcribeAudio(audioBuffer, options = {}) {
    try {
      const request = {
        audio: {
          content: audioBuffer.toString('base64'),
        },
        config: {
          encoding: options.encoding || 'WEBM_OPUS', // Common format from browsers
          sampleRateHertz: options.sampleRate || 48000,
          languageCode: options.languageCode || 'en-US',
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: false,
          model: 'latest_short', // Optimized for short audio clips
        },
      };

      const [response] = await this.client.recognize(request);
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

      console.log('Transcription:', transcription);
      return transcription;
    } catch (error) {
      console.error('Error in speech-to-text:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async transcribeAudioStream() {
    // For real-time streaming transcription (future enhancement)
    try {
      const request = {
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
        },
        interimResults: true,
      };

      const recognizeStream = this.client
        .streamingRecognize(request)
        .on('error', console.error)
        .on('data', data => {
          if (data.results[0] && data.results[0].alternatives[0]) {
            console.log(`Transcription: ${data.results[0].alternatives[0].transcript}`);
          }
        });

      return recognizeStream;
    } catch (error) {
      console.error('Error setting up streaming transcription:', error);
      throw new Error('Failed to setup streaming transcription');
    }
  }

  // Handle different audio formats
  async transcribeWithFormat(audioBuffer, format = 'webm') {
    const formatConfig = {
      webm: {
        encoding: 'WEBM_OPUS',
        sampleRate: 48000
      },
      wav: {
        encoding: 'LINEAR16',
        sampleRate: 44100
      },
      mp3: {
        encoding: 'MP3',
        sampleRate: 44100
      },
      ogg: {
        encoding: 'OGG_OPUS',
        sampleRate: 48000
      }
    };

    const config = formatConfig[format.toLowerCase()] || formatConfig.webm;
    
    return await this.transcribeAudio(audioBuffer, {
      encoding: config.encoding,
      sampleRate: config.sampleRate
    });
  }
}

module.exports = SpeechToTextService; 