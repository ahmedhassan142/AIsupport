// models/Analytics.ts
import mongoose from 'mongoose';

const DailyAnalyticsSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  totalConversations: { type: Number, default: 0 },
  resolvedConversations: { type: Number, default: 0 },
  averageSentiment: { type: Number, default: 0 },
  sentimentDistribution: {
    positive: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
    negative: { type: Number, default: 0 }
  },
  topIntents: [{
    intent: String,
    count: { type: Number, default: 0 }
  }],
  averageResponseTime: { type: Number, default: 0 },
  messagesCount: { type: Number, default: 0 },
  peakHours: [{
    hour: Number,
    conversations: { type: Number, default: 0 }
  }]
}, { timestamps: true });

// Ensure defaults are set when creating new document
DailyAnalyticsSchema.pre('save', function(next) {
  if (!this.sentimentDistribution) {
    this.sentimentDistribution = { positive: 0, neutral: 0, negative: 0 };
  }
  
});

export const DailyAnalytics = mongoose.models.DailyAnalytics || mongoose.model('DailyAnalytics', DailyAnalyticsSchema);