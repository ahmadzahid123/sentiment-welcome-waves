import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/ChatInterface";
import { LogOut, User } from "lucide-react";

const Index = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading Islamic AI Assistant...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header with user info */}
      <div className="bg-card/90 backdrop-blur-sm border-b px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Welcome back!</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={signOut}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
      
      <ChatInterface />
    </div>
  );
};

export default Index;
