// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  BarChart3, 
  Users, 
  LogOut, 
  Bot, 
  Menu, 
  X,
  Home,
  Settings,
  HelpCircle
} from 'lucide-react';
import { AIChatInterface } from '@/app/components/AIchatinterface';
import { CRMDashboard } from '@/app/components/CRMdashboard';
import { ConversationList } from '@/app/components/Conversation';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'conversations'>('chat');
  const [authenticated, setAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkAuth = async () => {
    const res = await fetch('/api/admin/login');
    const data = await res.json();
    if (!data.authenticated) {
      router.push('/login');
    } else {
      setAuthenticated(true);
    }
  };

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
    if (window.innerWidth >= 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/login');
  };

  const menuItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, color: 'blue' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'green' },
    { id: 'conversations', label: 'History', icon: Users, color: 'purple' },
  ];

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Support
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">AI Support</span>
              <p className="text-xs text-gray-500">v1.0.0</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? `bg-${item.color}-50 text-${item.color}-600 shadow-sm` 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? `text-${item.color}-600` : 'text-gray-500'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-${item.color}-600`} />
                )}
              </button>
            );
          })}
          
          <div className="pt-4 mt-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">AI Support</span>
              <p className="text-xs text-gray-500">Customer Service Platform</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? `bg-${item.color}-50 text-${item.color}-600 shadow-sm` 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? `text-${item.color}-600` : 'text-gray-500'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-${item.color}-600`} />
                )}
              </button>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Powered by</p>
            <p className="text-sm font-semibold text-gray-900">Llama 3.3 70B</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Mobile Header Spacing */}
            <div className="h-4 md:h-0" />
            
            {/* Tab Indicator for Mobile */}
            <div className="md:hidden mb-4">
              <div className="bg-white rounded-xl shadow-sm p-2 flex gap-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`
                        flex-1 flex flex-col items-center py-2 rounded-lg transition-all
                        ${isActive 
                          ? `bg-${item.color}-50 text-${item.color}-600` 
                          : 'text-gray-500 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Content */}
            {activeTab === 'chat' && (
              <div className="animate-fade-in">
                <AIChatInterface />
              </div>
            )}
            {activeTab === 'analytics' && (
              <div className="animate-fade-in">
                <CRMDashboard />
              </div>
            )}
            {activeTab === 'conversations' && (
              <div className="animate-fade-in">
                <ConversationList />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}