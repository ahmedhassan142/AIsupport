// components/AIChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, ChevronDown, X } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  sentiment?: any;
  timestamp: Date;
}

export function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showCustomerInfo, setShowCustomerInfo] = useState(true);
  const [isInfoCollapsed, setIsInfoCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    // Auto-focus input on mobile
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading]);
  
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    
    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationId,
          customerInfo: {
            name: customerName || 'Anonymous',
            email: customerEmail
          }
        })
      });
      
      if (!response.ok) throw new Error('Failed to send');
      
      const data = await response.json();
      
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
        setShowCustomerInfo(false);
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        sentiment: data.sentiment,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Failed to send:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const getSentimentEmoji = (sentiment: any) => {
    if (!sentiment) return '😐';
    if (sentiment.label === 'positive') return '😊';
    if (sentiment.label === 'negative') return '😟';
    return '😐';
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg border flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="border-b p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-sm md:text-lg font-semibold text-gray-900">AI Support Chat</h2>
              <p className="text-xs md:text-sm text-gray-600">Powered by Llama 3.3 70B</p>
            </div>
          </div>
          {conversationId && (
            <div className="text-xs text-gray-500 bg-white px-2 md:px-3 py-1 rounded-full">
              ID: {conversationId.slice(-6)}
            </div>
          )}
        </div>
      </div>
      
      {/* Customer Info Form */}
      {showCustomerInfo && (
        <div className="p-3 md:p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2 flex-1">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-yellow-800 mb-2">Customer Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="px-2 md:px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="px-2 md:px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsInfoCollapsed(!isInfoCollapsed)}
              className="p-1 hover:bg-yellow-100 rounded-lg"
            >
              <ChevronDown className={`w-4 h-4 transform transition-transform ${isInfoCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8 md:mt-12">
            <Bot className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm md:text-base">Start a conversation with your AI support assistant</p>
            <p className="text-xs md:text-sm mt-2">I can help with questions, troubleshooting, and more!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`flex max-w-[85%] md:max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-1 md:space-x-2`}>
              <div className={`flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' ? 'bg-purple-600' : 'bg-blue-600'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
                ) : (
                  <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
                )}
              </div>
              
              <div className="flex flex-col space-y-1">
                <div className={`rounded-lg p-2 md:p-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-xs md:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                
                {message.sentiment && message.role === 'user' && (
                  <div className="flex flex-wrap items-center gap-1 md:gap-2 text-xs text-gray-500 px-2">
                    <span>{getSentimentEmoji(message.sentiment)}</span>
                    <span className="capitalize text-xs">{message.sentiment.label}</span>
                    {message.sentiment.intent && (
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded-full text-xs">
                        {message.sentiment.intent}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-2 md:p-3">
                <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-gray-500" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="border-t p-3 md:p-4 bg-white">
        <div className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg p-2 text-sm md:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="self-end bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}