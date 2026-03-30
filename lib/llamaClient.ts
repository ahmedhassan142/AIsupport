// lib/llamaClient.ts
import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export const LlamaModels = {
  LLAMA_3_70B: 'llama3-70b-8192',
  LLAMA_3_8B: 'llama3-8b-8192',
  LLAMA_3_3_70B: 'llama-3.3-70b-versatile',
  MIXTRAL: 'mixtral-8x7b-32768',
};

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface SentimentAnalysis {
  score: number;
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
  };
  keywords: string[];
  intent: 'inquiry' | 'complaint' | 'feedback' | 'praise' | 'technical' | 'billing' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export class LlamaClient {
  private apiKey: string;
  private baseURL: string;
  private defaultModel: string;

  constructor(
    apiKey: string = GROQ_API_KEY,
    baseURL: string = GROQ_API_URL,
    defaultModel: string = LlamaModels.LLAMA_3_3_70B
  ) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.defaultModel = defaultModel;
  }

  async chatCompletion(messages: ChatMessage[], options: any = {}) {
    const {
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 1000,
      topP = 0.9,
      responseFormat = null // Default to null, not json_object
    } = options;

    try {
      const requestBody: any = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
      };

      // Only add response_format if explicitly requested and not null
      if (responseFormat && responseFormat.type) {
        requestBody.response_format = responseFormat;
      }

      const response = await axios.post(this.baseURL, requestBody, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      return response.data;
    } catch (error) {
      console.error('Groq API error:', error);
      throw error;
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    const systemPrompt = `You are an expert sentiment analyst. Analyze this customer message and return ONLY a valid JSON object with this exact structure (no other text):
{
  "score": number between -1 and 1,
  "label": "positive" or "neutral" or "negative",
  "confidence": number between 0 and 1,
  "emotions": {
    "joy": number 0-1,
    "sadness": number 0-1,
    "anger": number 0-1,
    "fear": number 0-1,
    "surprise": number 0-1,
    "disgust": number 0-1,
    "trust": number 0-1,
    "anticipation": number 0-1
  },
  "keywords": ["key", "words"],
  "intent": "inquiry" or "complaint" or "feedback" or "praise" or "technical" or "billing" or "other",
  "urgency": "low" or "medium" or "high" or "critical"
}`;

    const response = await this.chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ], {
      temperature: 0.3,
      maxTokens: 500,
      responseFormat: { type: 'json_object' } // Only use JSON mode for sentiment analysis
    });

    try {
      const content = response.choices[0].message.content;
      // Clean the response to ensure it's valid JSON
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysis = JSON.parse(cleanContent);
      return analysis;
    } catch (error) {
      console.error('Failed to parse sentiment analysis:', error);
      return this.getFallbackAnalysis(text);
    }
  }

 // lib/llamaClient.ts - Make sure this section is correct
async generateResponse(message: string, sentiment: SentimentAnalysis, history: ChatMessage[]): Promise<string> {
  const systemPrompt = `You are a friendly, empathetic customer support AI assistant. Generate a helpful, concise response.
  
Current context:
- Customer sentiment: ${sentiment.label} (score: ${sentiment.score})
- Detected intent: ${sentiment.intent}
- Urgency level: ${sentiment.urgency}

Guidelines:
- Be empathetic and understanding
- Keep responses concise (2-3 sentences max)
- Offer specific help or solutions
- Maintain a friendly, professional tone
- Return ONLY plain text, no JSON, no markdown, no quotes`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-5),
    { role: 'user', content: message }
  ];

  // IMPORTANT: Do NOT use responseFormat here
  //@ts-ignore
  const response = await this.chatCompletion(messages, {
    temperature: 0.8,
    maxTokens: 300,
    responseFormat: undefined // No JSON mode
  });

  let responseText = response.choices[0].message.content;
  // Clean up any potential JSON artifacts
  responseText = responseText.replace(/^["']|["']$/g, '').trim();
  
  return responseText || "I'm here to help! Could you please provide more details?";
}
  private getFallbackAnalysis(text: string): SentimentAnalysis {
    // Simple keyword-based fallback
    const lowerText = text.toLowerCase();
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'happy', 'love'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'hate', 'disappointed'];
    
    let score = 0;
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 0.2;
    });
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 0.2;
    });
    
    score = Math.max(-1, Math.min(1, score));
    
    let label: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (score > 0.2) label = 'positive';
    if (score < -0.2) label = 'negative';
    
    return {
      score,
      label,
      confidence: 0.6,
      emotions: {
        joy: 0, sadness: 0, anger: 0, fear: 0,
        surprise: 0, disgust: 0, trust: 0, anticipation: 0
      },
      keywords: [],
      intent: 'inquiry',
      urgency: 'medium'
    };
  }
}

export const llamaClient = new LlamaClient();