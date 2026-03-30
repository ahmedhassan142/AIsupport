// components/CRMDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, TrendingDown, MessageSquare, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function CRMDashboard() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  
  useEffect(() => {
    fetchReport();
  }, [days]);
  
  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/crm?days=${days}`);
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const exportReport = () => {
    if (!report) return;
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `crm-report-${new Date().toISOString()}.json`);
    linkElement.click();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  if (!report || !report.summary) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }
  
  // Safely get values with defaults
  const totalConversations = report.summary.totalConversations || 0;
  const resolutionRate = report.summary.resolutionRate || 0;
  const averageSentiment = report.summary.averageSentiment || 0;
  const totalMessages = report.summary.totalMessages || 0;
  
  const sentimentData = [
    { name: 'Positive', value: report.sentimentAnalysis?.distribution?.positive || 0 },
    { name: 'Neutral', value: report.sentimentAnalysis?.distribution?.neutral || 0 },
    { name: 'Negative', value: report.sentimentAnalysis?.distribution?.negative || 0 }
  ];
  
  const topIntents = report.sentimentAnalysis?.topIntents || [];
  const dailyMetrics = report.dailyMetrics || [];
  const topIssues = report.topIssues || [];
  const recommendations = report.recommendations || [];
  
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CRM Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">AI-powered insights from customer conversations</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={exportReport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-900">{totalConversations}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolution Rate</p>
              <p className="text-2xl font-bold text-gray-900">{resolutionRate.toFixed(1)}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Sentiment</p>
              <p className="text-2xl font-bold text-gray-900">{averageSentiment.toFixed(2)}</p>
            </div>
            {averageSentiment > 0 ? (
              <TrendingUp className="w-8 h-8 text-green-500" />
            ) : averageSentiment < 0 ? (
              <TrendingDown className="w-8 h-8 text-red-500" />
            ) : (
              <MessageSquare className="w-8 h-8 text-yellow-500" />
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{totalMessages}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
          {sentimentData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No sentiment data available yet
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Intents</h3>
          {topIntents.length > 0 ? (
            <div className="space-y-3">
              {topIntents.map((intent: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">{intent.intent}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 rounded-full h-2"
                        style={{ width: `${(intent.count / topIntents[0]?.count) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{intent.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-400">
              No intent data available yet
            </div>
          )}
        </div>
      </div>
      
      {/* Daily Metrics */}
      <div className="bg-white rounded-lg shadow p-4 border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Performance</h3>
        {dailyMetrics.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="conversations" stroke="#3b82f6" name="Conversations" />
              <Line yAxisId="right" type="monotone" dataKey="averageSentiment" stroke="#10b981" name="Avg Sentiment" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            No daily metrics available yet
          </div>
        )}
      </div>
      
      {/* Top Issues */}
      {topIssues.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Mentioned Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topIssues.slice(0, 10).map((issue: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{issue.issue}</span>
                <span className="text-xs font-semibold text-gray-500">{issue.count} mentions</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow p-4 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🤖 AI Recommendations</h3>
          <ul className="space-y-2">
            {recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-purple-600 mt-1">•</span>
                <span className="text-sm text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Empty State */}
      {totalConversations === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500">Start chatting with customers to see analytics here</p>
        </div>
      )}
    </div>
  );
}