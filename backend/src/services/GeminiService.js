const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateResponse(text) {
    try {
      const prompt = `You are a friendly AI avatar assistant. Respond to the user's question or comment in a conversational, helpful way. Keep responses concise but engaging (2-3 sentences max). Respond as if you're having a natural conversation.

User: ${text}

AI Assistant:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      console.log('Generated response:', responseText);
      return responseText;
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generatePersonalizedResponse(text, context = {}) {
    try {
      const contextString = context.previousMessages ? 
        `Previous conversation context: ${context.previousMessages.slice(-3).join('. ')}` : '';
      
      const prompt = `You are a friendly AI avatar assistant. Respond naturally and conversationally. Keep responses brief (2-3 sentences). ${contextString}

User: ${text}

AI Assistant:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating personalized response:', error);
      return "I'm sorry, I had trouble processing that. Could you try again?";
    }
  }
}

module.exports = GeminiService;