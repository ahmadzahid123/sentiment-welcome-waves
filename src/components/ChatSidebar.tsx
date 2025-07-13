
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus, LogOut, User, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface ChatSidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string | null) => void;
  onNewChat: () => void;
}

const ChatSidebar = ({ currentSessionId, onSessionSelect, onNewChat }: ChatSidebarProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user's chat sessions - only those with actual messages and meaningful titles
  useEffect(() => {
    const loadSessions = async () => {
      if (!user) return;

      try {
        // Get sessions that have messages and meaningful titles (not "New Chat" or null)
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .not('title', 'is', null)
          .neq('title', 'New Chat')
          .neq('title', '')
          .order('updated_at', { ascending: false });

        if (sessionsError) throw sessionsError;

        // Filter sessions that have actual messages and get message counts
        const sessionsWithCounts = await Promise.all(
          (sessionsData || []).map(async (session) => {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', session.id);

            return {
              ...session,
              message_count: count || 0
            };
          })
        );

        // Only show sessions that have at least 2 messages (user + AI response)
        const validSessions = sessionsWithCounts.filter(session => session.message_count >= 2);
        setSessions(validSessions);
      } catch (error: any) {
        console.error('Error loading sessions:', error);
        toast({
          title: "Error",
          description: "Failed to load chat sessions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [user, currentSessionId, toast]);

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Delete messages first
      await supabase
        .from('messages')
        .delete()
        .eq('session_id', sessionId);

      // Delete session
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If deleting current session, reset to null
      if (sessionId === currentSessionId) {
        onSessionSelect(null);
      }

      toast({
        title: "Session deleted",
        description: "Chat session has been deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  const truncateTitle = (title: string, maxLength: number = 25) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  return (
    <Sidebar className="w-64 border-r bg-card/50 backdrop-blur-sm">
      <SidebarHeader className="p-3 border-b">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-base text-gradient-primary">Islamic AI</h2>
        </div>
        
        <Button 
          onClick={onNewChat}
          className="w-full bg-gradient-primary hover:opacity-90 text-sm py-2"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent className="flex-1">
        <ScrollArea className="h-full px-3 py-2">
          <SidebarMenu>
            {loading ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Loading...
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-xs">
                No conversations yet.<br />
                <span className="text-xs">Start chatting to see history!</span>
              </div>
            ) : (
              sessions.map((session) => (
                <SidebarMenuItem key={session.id}>
                  <SidebarMenuButton
                    onClick={() => onSessionSelect(session.id)}
                    className={`w-full text-left p-2 rounded-md transition-colors group relative text-sm ${
                      currentSessionId === session.id 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'hover:bg-muted/80'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="font-medium text-xs mb-1">
                        {truncateTitle(session.title || 'Chat')}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-2.5 h-2.5" />
                        <span className="text-xs">
                          {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 h-5 w-5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium">
            {user?.email?.split('@')[0] || 'User'}
          </span>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={signOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground text-xs"
        >
          <LogOut className="w-3 h-3 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ChatSidebar;
