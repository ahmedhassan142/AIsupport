// components/ConversationList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Eye, CheckCircle, Clock, AlertCircle, Search, ChevronRight, Calendar, MessageSquare } from 'lucide-react';

interface Conversation {
  conversationId: string;
  customer: { name: string; email?: string };
  messages: any[];
  status: string;
  priority: string;
  startedAt: string;
  satisfactionScore?: number;
}

export function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    fetchConversations();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };
  
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const resolveConversation = async (conversationId: string, satisfaction?: number) => {
    try {
      await fetch('/api/conversations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, satisfactionScore: satisfaction })
      });
      fetchConversations();
    } catch (error) {
      console.error('Failed to resolve:', error);
    }
  };
  
  const filteredConversations = conversations.filter(conv =>
    conv.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    conv.conversationId.includes(search)
  );
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 md:pl-10 pr-3 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
        />
      </div>
      
      {/* Conversation Cards (Mobile) */}
      {isMobile ? (
        <div className="space-y-3">
          {filteredConversations.map((conv) => (
            <div
              key={conv.conversationId}
              className="bg-white rounded-xl shadow border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{conv.customer.name}</h3>
                  {conv.customer.email && (
                    <p className="text-xs text-gray-500 mt-0.5">{conv.customer.email}</p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(conv.priority)}`}>
                  {conv.priority}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{conv.messages.length} msgs</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(conv.startedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    conv.status === 'resolved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {conv.status}
                  </span>
                  <button
                    onClick={() => setSelectedConversation(conv)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Messages</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredConversations.map((conv) => (
                  <tr key={conv.conversationId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                      {conv.conversationId.slice(-8)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{conv.customer.name}</div>
                      {conv.customer.email && (
                        <div className="text-xs text-gray-500">{conv.customer.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{conv.messages.length}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        conv.status === 'resolved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {conv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(conv.priority)}`}>
                        {conv.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(conv.startedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedConversation(conv)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {conv.status !== 'resolved' && (
                          <button
                            onClick={() => resolveConversation(conv.conversationId)}
                            className="text-green-600 hover:text-green-800 p-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Conversation Details Modal - Mobile Optimized */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] md:max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Conversation Details</h3>
                <p className="text-xs md:text-sm text-gray-500">ID: {selectedConversation.conversationId.slice(-8)}</p>
              </div>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Customer</p>
                  <p className="text-sm md:text-base font-medium">{selectedConversation.customer.name}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Status</p>
                  <p className="text-sm md:text-base font-medium capitalize">{selectedConversation.status}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Priority</p>
                  <p className="text-sm md:text-base font-medium capitalize">{selectedConversation.priority}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Messages</p>
                  <p className="text-sm md:text-base font-medium">{selectedConversation.messages.length}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-2">Conversation History</p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedConversation.messages.map((msg, idx) => (
                    <div key={idx} className={`p-2 md:p-3 rounded-lg ${
                      msg.role === 'user' ? 'bg-purple-50 ml-4 md:ml-8' : 'bg-gray-50 mr-4 md:mr-8'
                    }`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-gray-600">
                          {msg.role === 'user' ? 'Customer' : 'AI Assistant'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-gray-900 break-words">{msg.content}</p>
                      {msg.sentiment && (
                        <div className="mt-1 text-xs text-gray-500">
                          Sentiment: {msg.sentiment.label} ({msg.sentiment.score.toFixed(2)})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add missing X import
import { X } from 'lucide-react';