// app/page.tsx - Professional Landing Page
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, MessageSquare, BarChart3, Users, Shield, Zap, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/login');
        const data = await res.json();
        
        if (data.authenticated) {
          router.push('/dashboard');
        } else {
          // Stay on landing page for unauthenticated users
          setIsChecking(false);
        }
      } catch (error) {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-bounce mb-8">
            <Bot className="w-16 h-16 text-blue-600 mx-auto" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 rounded-full p-4 shadow-lg">
                <Bot className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Customer Support
              <span className="text-blue-600"> Assistant</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Transform your customer service with intelligent AI that understands emotions, 
              provides instant responses, and delivers powerful CRM analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/login')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const features = document.getElementById('features');
                  features?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg border border-gray-200"
              >
                View Features
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Support
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to provide exceptional customer service
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-blue-100">AI Response Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">&lt; 2s</div>
              <div className="text-blue-100">Average Response Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100">Always Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to transform your customer support?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of businesses using AI to deliver exceptional customer experiences.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Bot className="w-6 h-6 text-blue-400" />
              <span className="font-semibold">AI Support Assistant</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 AI Support Assistant. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
    title: "AI-Powered Conversations",
    description: "Intelligent responses powered by Llama 3.3 70B that understand context and emotions."
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
    title: "Real-time Analytics",
    description: "Comprehensive CRM reports with sentiment analysis, trends, and actionable insights."
  },
  {
    icon: <Shield className="w-6 h-6 text-blue-600" />,
    title: "Emotion Detection",
    description: "Advanced sentiment analysis detecting 8 different emotions with high accuracy."
  },
  {
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: "Conversation Management",
    description: "Track, manage, and resolve customer conversations with ease."
  },
  {
    icon: <Zap className="w-6 h-6 text-blue-600" />,
    title: "Instant Responses",
    description: "Lightning-fast AI responses with context-aware suggestions."
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
    title: "Smart CRM",
    description: "Full customer relationship management with conversation history and insights."
  }
];