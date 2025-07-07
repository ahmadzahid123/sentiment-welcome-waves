import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import ChatInterface from "@/components/ChatInterface";
import ChatSidebar from "@/components/ChatSidebar";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import islamicLogo from "@/assets/islamic-ai-logo.png";

const Index = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // No automatic session creation - sessions are created when user first chats

  const handleNewChat = async () => {
    setCurrentSessionId(null); // Reset to null so next message creates new session
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
      <div className="min-h-screen flex w-full">
        <ChatSidebar 
          currentSessionId={currentSessionId}
          onSessionSelect={setCurrentSessionId}
          onNewChat={handleNewChat}
        />
        
        <SidebarInset className="flex flex-col flex-1">
          {/* Mobile header with sidebar trigger */}
          <div className="md:hidden bg-card/90 backdrop-blur-sm border-b px-4 py-2 flex items-center gap-2 flex-shrink-0">
            <SidebarTrigger />
            <img src={islamicLogo} alt="Islamic AI" className="w-6 h-6" />
            <span className="font-bold text-gradient-primary">Islamic AI</span>
          </div>
          
          <div className="flex-1 flex flex-col min-h-0">
            <ChatInterface 
              currentSessionId={currentSessionId}
              onSessionIdChange={setCurrentSessionId}
            />
          </div>
        </SidebarInset>
        
        <PWAInstallPrompt />
      </div>
    </SidebarProvider>
  );
};

export default Index;
