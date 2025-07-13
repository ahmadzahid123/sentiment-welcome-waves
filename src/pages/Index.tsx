
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from "@/components/ChatInterface";
import ChatSidebar from "@/components/ChatSidebar";
import Dashboard from "@/components/Dashboard";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { MessageSquare, Home } from "lucide-react";
import islamicLogo from "@/assets/islamic-ai-logo.png";

const Index = () => {
  const { user, loading } = useAuth();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  // Set dashboard as the default active tab so users see all features immediately
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleNewChat = async () => {
    setCurrentSessionId(null);
    setActiveTab('chat');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <img src={islamicLogo} alt="Islamic AI" className="w-24 h-24 mx-auto mb-4 animate-pulse" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading Islamic AI Assistant...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden">
        <ChatSidebar 
          currentSessionId={currentSessionId}
          onSessionSelect={(sessionId) => {
            setCurrentSessionId(sessionId);
            setActiveTab('chat');
          }}
          onNewChat={handleNewChat}
        />
        
        <SidebarInset className="flex flex-col flex-1 h-full">
          {/* Mobile header with sidebar trigger */}
          <div className="md:hidden bg-card/90 backdrop-blur-sm border-b px-4 py-2 flex items-center gap-2 flex-shrink-0">
            <SidebarTrigger />
            <img src={islamicLogo} alt="Islamic AI" className="w-6 h-6" />
            <span className="font-bold text-gradient-primary">Islamic AI</span>
          </div>
          
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Tab Navigation - Make it more prominent */}
              <div className="border-b bg-card/50 backdrop-blur-sm px-4 py-3 flex-shrink-0">
                <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
                  <TabsTrigger value="dashboard" className="flex items-center gap-2 text-base">
                    <Home className="w-5 h-5" />
                    <span>Islamic Features</span>
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center gap-2 text-base">
                    <MessageSquare className="w-5 h-5" />
                    <span>AI Chat</span>
                  </TabsTrigger>
                </TabsList>
                
                {/* Add a helpful description */}
                <div className="mt-2 text-sm text-muted-foreground">
                  {activeTab === 'dashboard' ? 
                    "🕌 Access Prayer Times, Islamic Calendar, Daily Verses & More" : 
                    "💬 Chat with your Islamic AI Assistant"
                  }
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                <TabsContent value="dashboard" className="h-full mt-0 overflow-auto">
                  <Dashboard />
                </TabsContent>
                
                <TabsContent value="chat" className="h-full mt-0 flex flex-col">
                  <ChatInterface 
                    currentSessionId={currentSessionId}
                    onSessionIdChange={setCurrentSessionId}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </SidebarInset>
        
        <PWAInstallPrompt />
      </div>
    </SidebarProvider>
  );
};

export default Index;
