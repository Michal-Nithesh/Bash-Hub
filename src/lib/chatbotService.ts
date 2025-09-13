// API service for chatbot backend integrations

interface ChatResponse {
  response?: string;
  message?: string;
  error?: string;
}

interface AnalysisResponse {
  analysis?: string;
  result?: string;
  error?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

class ChatbotService {
  private readonly CHAT_API_URL = 'http://localhost:9090/api/chat';
  private readonly ANALYZE_API_URL = 'http://localhost:9090/api/analyze';
  private readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private readonly GEMINI_API_KEY = this.getGeminiApiKey();

  private getGeminiApiKey(): string {
    // Try different environment variable access methods
    if (typeof process !== 'undefined' && process.env?.REACT_APP_GEMINI_API_KEY) {
      return process.env.REACT_APP_GEMINI_API_KEY;
    }
    
    if (typeof import.meta !== 'undefined' && import.meta.env?.REACT_APP_GEMINI_API_KEY) {
      return import.meta.env.REACT_APP_GEMINI_API_KEY;
    }
    
    // Check window object for runtime environment variables (with proper typing)
    if (typeof window !== 'undefined') {
      const windowEnv = window as typeof window & {
        REACT_APP_GEMINI_API_KEY?: string;
      };
      if (windowEnv.REACT_APP_GEMINI_API_KEY) {
        return windowEnv.REACT_APP_GEMINI_API_KEY;
      }
    }
    
    // Fallback to your provided API key
    return 'AIzaSyCjh-MiWI67crVWGAnQ_eyqp-6QUB2NoHc';
  }

  async sendChatMessage(message: string): Promise<string> {
    try {
      // Try Spring Boot backend first
      const springBootResponse = await this.sendToSpringBoot(message);
      return springBootResponse;
    } catch (springBootError) {
      console.warn('Spring Boot backend not available, falling back to Gemini AI:', springBootError);
      
      try {
        // Fallback to Gemini AI
        const geminiResponse = await this.sendToGemini(message);
        return geminiResponse;
      } catch (geminiError) {
        console.error('Gemini AI also failed:', geminiError);
        // Final fallback: Simple offline responses
        return this.getOfflineResponse(message);
      }
    }
  }

  // Simple offline fallback responses
  private getOfflineResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm currently in offline mode. Your backend services aren't connected yet. Please:\n\n1. Ensure your Spring Boot server is running on port 9090\n2. Add CORS configuration to your Spring Boot app\n3. Set up your Gemini API key in the .env file\n\nI can still help you with basic responses!";
    }
    
    if (lowerMessage.includes('math') || lowerMessage.includes('calculate')) {
      return "I'd love to help with mathematics! However, I'm currently in offline mode. To get full AI-powered math assistance, please:\n\n1. Configure your Spring Boot backend\n2. Set up Gemini AI with your API key\n\nFor now, I can suggest breaking down complex problems into smaller steps.";
    }
    
    if (lowerMessage.includes('code') || lowerMessage.includes('program')) {
      return "Programming help is one of my specialties! Currently running in offline mode. For full code analysis and debugging:\n\n1. Connect your Spring Boot backend on port 9090\n2. Configure Gemini AI for advanced code assistance\n\nIn the meantime, remember: good code is readable code!";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('assistance')) {
      return "I'm here to help! Currently in offline mode due to:\n\n🔴 Spring Boot backend: Not connected (port 9090)\n🔴 Gemini AI: API key not configured\n\nTo enable full functionality:\n1. Start your Spring Boot server\n2. Add CORS configuration\n3. Set REACT_APP_GEMINI_API_KEY in .env file\n\nWhat would you like help with today?";
    }
    
    if (lowerMessage.includes('error') || lowerMessage.includes('problem')) {
      return "I see you're having connectivity issues. Here's a quick troubleshooting guide:\n\n1. **Spring Boot Backend:**\n   - Ensure server is running on http://localhost:9090\n   - Add CORS configuration for http://localhost:3000\n   - Check console logs for errors\n\n2. **Gemini AI:**\n   - Create .env file with REACT_APP_GEMINI_API_KEY\n   - Get API key from Google AI Studio\n   - Restart your React server after adding .env\n\nNeed more specific help?";
    }
    
    // Default response
    return `I understand you're asking about: "${message}"\n\nI'm currently running in offline mode because neither your Spring Boot backend nor Gemini AI are configured. This is normal for first-time setup!\n\n🔧 **Quick Setup:**\n1. Start Spring Boot on port 9090\n2. Add CORS configuration\n3. Set up Gemini API key\n\nOnce connected, I'll provide much more detailed and helpful responses. What specific topic would you like help with?`;
  }

  private async sendToSpringBoot(message: string): Promise<string> {
    try {
      const response = await fetch(this.CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors', // Explicitly set CORS mode
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`Spring Boot API error! status: ${response.status} - ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.response || data.message || 'No response received from the server.';
    } catch (error) {
      console.error('Spring Boot connection error:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError) {
        throw new Error('Cannot connect to Spring Boot backend. Please ensure:\n1. Your Spring Boot server is running on http://localhost:9090\n2. CORS is properly configured in your Spring Boot application');
      }
      
      throw error;
    }
  }

  private async sendToGemini(message: string): Promise<string> {
    if (!this.GEMINI_API_KEY || this.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      throw new Error('Gemini API key not configured. Please set REACT_APP_GEMINI_API_KEY environment variable.');
    }

    try {
      const response = await fetch(this.GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `As an AI academic assistant, please help with this query: ${message}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error! status: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No response generated from Gemini AI.');
      }

      return generatedText;
    } catch (error) {
      console.error('Gemini AI request failed:', error);
      throw error;
    }
  }

  async analyzeFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(this.ANALYZE_API_URL, {
        method: 'POST',
        mode: 'cors', // Explicitly set CORS mode
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`File analysis API error! status: ${response.status} - ${response.statusText}`);
      }

      const data: AnalysisResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.analysis || data.result || 'File analysis completed successfully.';
    } catch (error) {
      console.error('File analysis error:', error);
      
      // Fallback: Use Gemini AI for basic file analysis if Spring Boot fails
      if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        try {
          const fileContent = await this.readFileAsText(file);
          const analysisPrompt = `Please analyze the following file content and provide insights:\n\nFile: ${file.name}\nContent:\n${fileContent}`;
          return await this.sendToGemini(analysisPrompt);
        } catch (fallbackError) {
          console.error('Fallback analysis also failed:', fallbackError);
        }
      }
      
      throw new Error('File analysis service is currently unavailable. Please ensure the backend service is running.');
    }
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Health check method to test backend connectivity
  async checkBackendHealth(): Promise<{ springBoot: boolean; gemini: boolean }> {
    const results = {
      springBoot: false,
      gemini: false
    };

    // Test Spring Boot with better error handling
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(this.CHAT_API_URL, {
        method: 'OPTIONS',
        signal: controller.signal,
        mode: 'cors',
      });
      
      clearTimeout(timeoutId);
      results.springBoot = response.ok || response.status === 405;
    } catch (error) {
      console.warn('Spring Boot backend health check failed:', error);
      
      // Try a simple POST request as fallback
      try {
        const response = await fetch(this.CHAT_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({ message: 'ping' }),
        });
        results.springBoot = response.ok;
      } catch (fallbackError) {
        console.warn('Spring Boot POST request also failed:', fallbackError);
      }
    }

    // Test Gemini with proper API key validation
    try {
      if (this.GEMINI_API_KEY && this.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY') {
        await this.sendToGemini('ping');
        results.gemini = true;
      }
    } catch (error) {
      console.warn('Gemini AI health check failed:', error);
    }

    return results;
  }
}

export const chatbotService = new ChatbotService();
export default chatbotService;