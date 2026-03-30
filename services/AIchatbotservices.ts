// services/AIChatbotService.ts
import { llamaClient, ChatMessage } from '@/lib/llamaClient';
import { Conversation } from '@/models/Conversation';
import { DailyAnalytics } from '@/models/Analytics';
import { connectDB } from '@/lib/db/mongoose';

export class AIChatbotService {
  private static instance: AIChatbotService;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new AIChatbotService();
    }
    return this.instance;
  }

  async processMessage(message: string, conversationId?: string, customerInfo?: any) {
    await connectDB();
    
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ conversationId });
    }
    
    if (!conversation) {
      conversation = new Conversation({
        conversationId: conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customer: customerInfo || { name: 'Anonymous' },
        messages: []
      });
    }
    
    // Analyze sentiment with AI
    let sentiment;
    try {
      sentiment = await llamaClient.analyzeSentiment(message);
      console.log('✅ Sentiment analysis:', sentiment.label, sentiment.score);
    } catch (error) {
      console.error('❌ Sentiment analysis failed:', error);
      // Fallback sentiment
      sentiment = {
        score: 0,
        label: 'neutral',
        confidence: 0.5,
        emotions: {
          joy: 0, sadness: 0, anger: 0, fear: 0,
          surprise: 0, disgust: 0, trust: 0, anticipation: 0
        },
        keywords: [],
        intent: 'inquiry',
        urgency: 'medium'
      };
    }
    
    // Update priority based on urgency
    if (sentiment.urgency === 'critical' || sentiment.urgency === 'high') {
      conversation.priority = sentiment.urgency;
    }
    
    // Get conversation history
    const history: ChatMessage[] = conversation.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Generate AI response
    let aiResponse;
    try {
      aiResponse = await llamaClient.generateResponse(message, sentiment, history);
      console.log('✅ AI response generated:', aiResponse.substring(0, 50));
    } catch (error) {
      console.error('❌ AI response generation failed:', error);
      aiResponse = "I'm here to help! Could you please tell me more about what you need assistance with?";
    }
    
    // Save user message
    conversation.messages.push({
      content: message,
      role: 'user',
      sentiment,
      timestamp: new Date()
    });
    
    // Save AI response
    conversation.messages.push({
      content: aiResponse,
      role: 'assistant',
      timestamp: new Date()
    });
    
    conversation.lastActivityAt = new Date();
    await conversation.save();
    
    // Update analytics
    try {
      await this.updateAnalytics(conversation, sentiment);
    } catch (error) {
      console.error('❌ Failed to update analytics:', error);
      // Don't fail the whole request if analytics fails
    }
    
    return {
      response: aiResponse,
      sentiment,
      conversationId: conversation.conversationId,
      status: conversation.status
    };
  }
  
  async resolveConversation(conversationId: string, satisfactionScore?: number) {
    await connectDB();
    const conversation = await Conversation.findOne({ conversationId });
    
    if (conversation) {
      conversation.status = 'resolved';
      conversation.resolvedAt = new Date();
      if (satisfactionScore) {
        conversation.satisfactionScore = satisfactionScore;
      }
      await conversation.save();
    }
    
    return conversation;
  }
  
  async getActiveConversations() {
    await connectDB();
    return await Conversation.find({ status: 'active' }).sort({ priority: -1, lastActivityAt: -1 });
  }
  
  async getAllConversations(limit = 50, skip = 0) {
    await connectDB();
    return await Conversation.find()
      .sort({ startedAt: -1 })
      .limit(limit)
      .skip(skip);
  }
  
  async analyzeConversationHealth(conversationId: string) {
    await connectDB();
    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) throw new Error('Conversation not found');
    
    const messages: ChatMessage[] = conversation.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));
    
    const analysis = await llamaClient.analyzeConversation(messages);
    return analysis;
  }
  
  private async updateAnalytics(conversation: any, sentiment: any) {
    const today = new Date().toISOString().split('T')[0];
    
    let analytics = await DailyAnalytics.findOne({ date: today });
    if (!analytics) {
      analytics = new DailyAnalytics({ 
        date: today,
        sentimentDistribution: { positive: 0, neutral: 0, negative: 0 }
      });
    }
    
    // Initialize if undefined
    if (!analytics.sentimentDistribution) {
      analytics.sentimentDistribution = { positive: 0, neutral: 0, negative: 0 };
    }
    
    // Increment counters safely
    analytics.totalConversations = (analytics.totalConversations || 0) + 1;
    
    // Update sentiment distribution with proper number handling
    if (sentiment.label === 'positive') {
      analytics.sentimentDistribution.positive = (analytics.sentimentDistribution.positive || 0) + 1;
    } else if (sentiment.label === 'negative') {
      analytics.sentimentDistribution.negative = (analytics.sentimentDistribution.negative || 0) + 1;
    } else {
      analytics.sentimentDistribution.neutral = (analytics.sentimentDistribution.neutral || 0) + 1;
    }
    
    // Update average sentiment
    const currentAvg = analytics.averageSentiment || 0;
    const total = analytics.totalConversations;
    analytics.averageSentiment = (currentAvg * (total - 1) + sentiment.score) / total;
    
    // Update top intents
    if (!analytics.topIntents) analytics.topIntents = [];
    const intentIndex = analytics.topIntents.findIndex((i: any) => i.intent === sentiment.intent);
    if (intentIndex >= 0) {
      analytics.topIntents[intentIndex].count = (analytics.topIntents[intentIndex].count || 0) + 1;
    } else {
      analytics.topIntents.push({ intent: sentiment.intent, count: 1 });
    }
    
    // Update message count
    analytics.messagesCount = (analytics.messagesCount || 0) + 2;
    
    await analytics.save();
    console.log('✅ Analytics updated for:', today);
  }
  
  async getCRMReport(startDate: Date, endDate: Date) {
    await connectDB();
    
    const conversations = await Conversation.find({
      startedAt: { $gte: startDate, $lte: endDate }
    });
    
    const analytics = await DailyAnalytics.find({
      date: { $gte: startDate.toISOString().split('T')[0], $lte: endDate.toISOString().split('T')[0] }
    });
    
    const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);
    const resolvedCount = conversations.filter(c => c.status === 'resolved').length;
    
    // Calculate sentiment averages
    let totalSentiment = 0;
    let sentimentCount = 0;
    const sentimentDist = { positive: 0, neutral: 0, negative: 0 };
    const intentMap = new Map();
    const issueMap = new Map();
    
    conversations.forEach(conv => {
      conv.messages.forEach((msg: any) => {
        if (msg.sentiment) {
          totalSentiment += msg.sentiment.score;
          sentimentCount++;
          if (msg.sentiment.label === 'positive') sentimentDist.positive++;
          else if (msg.sentiment.label === 'negative') sentimentDist.negative++;
          else sentimentDist.neutral++;
          
          if (msg.sentiment.intent) {
            intentMap.set(msg.sentiment.intent, (intentMap.get(msg.sentiment.intent) || 0) + 1);
          }
          
          if (msg.sentiment.keywords) {
            msg.sentiment.keywords.forEach((keyword: string) => {
              issueMap.set(keyword, (issueMap.get(keyword) || 0) + 1);
            });
          }
        }
      });
    });
    
    const topIntents = Array.from(intentMap.entries())
      .map(([intent, count]) => ({ intent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const topIssues = Array.from(issueMap.entries())
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      summary: {
        totalConversations: conversations.length,
        resolvedCount,
        resolutionRate: conversations.length ? (resolvedCount / conversations.length) * 100 : 0,
        totalMessages,
        averageSentiment: sentimentCount ? totalSentiment / sentimentCount : 0,
        averageResponseTime: this.calculateAvgResponseTime(conversations)
      },
      sentimentAnalysis: {
        distribution: sentimentDist,
        topIntents,
        totalAnalyzed: sentimentCount
      },
      topIssues,
      dailyMetrics: analytics.map(a => ({
        date: a.date,
        conversations: a.totalConversations || 0,
        averageSentiment: a.averageSentiment || 0,
        messages: a.messagesCount || 0
      })),
      recommendations: await this.generateRecommendations(conversations, analytics)
    };
  }
  
  private calculateAvgResponseTime(conversations: any[]): number {
    let totalTime = 0;
    let count = 0;
    
    conversations.forEach(conv => {
      for (let i = 1; i < conv.messages.length; i++) {
        if (conv.messages[i].role === 'assistant' && conv.messages[i-1].role === 'user') {
          const timeDiff = conv.messages[i].timestamp - conv.messages[i-1].timestamp;
          if (timeDiff > 0 && timeDiff < 3600000) { // Less than 1 hour
            totalTime += timeDiff;
            count++;
          }
        }
      }
    });
    
    return count ? totalTime / count / 1000 : 0;
  }
  
  private async generateRecommendations(conversations: any[], analytics: any[]): Promise<string[]> {
    const recommendations: string[] = [];
    
    const resolutionRate = conversations.length ? 
      (conversations.filter(c => c.status === 'resolved').length / conversations.length) * 100 : 0;
    
    if (resolutionRate < 70 && conversations.length > 10) {
      recommendations.push('📊 Resolution rate is below 70%. Consider reviewing common issues and improving response quality.');
    }
    
    const negativeCount = conversations.reduce((sum, c) => 
      sum + c.messages.filter((m: any) => m.sentiment?.label === 'negative').length, 0);
    
    if (negativeCount > conversations.length * 0.3 && conversations.length > 10) {
      recommendations.push('😟 High number of negative interactions detected. Review common complaints and update your knowledge base.');
    }
    
    const avgResponseTime = this.calculateAvgResponseTime(conversations);
    if (avgResponseTime > 300 && conversations.length > 10) {
      recommendations.push('⏱️ Average response time is high. Consider preparing common response templates for faster replies.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Great job! Your support metrics look healthy. Keep up the good work!');
    }
    
    return recommendations;
  }
}

export const aiChatbotService = AIChatbotService.getInstance();