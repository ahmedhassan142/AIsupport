// models/Conversation.ts
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  sentiment: {
    score: Number,
    label: String,
    confidence: Number,
    emotions: {
      joy: Number, sadness: Number, anger: Number, fear: Number,
      surprise: Number, disgust: Number, trust: Number, anticipation: Number
    },
    keywords: [String],
    intent: String,
    urgency: String
  },
  timestamp: { type: Date, default: Date.now }
});

const ConversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, default: 'Anonymous' },
    email: String,
    phone: String
  },
  messages: [MessageSchema],
  status: {
    type: String,
    enum: ['active', 'pending', 'resolved'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  tags: [String],
  startedAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  satisfactionScore: Number,
  notes: String
});

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);