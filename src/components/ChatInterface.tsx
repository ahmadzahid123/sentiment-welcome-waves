import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  currentSessionId: string | null;
  onSessionIdChange: (sessionId: string) => void;
}

const ChatInterface = ({ currentSessionId, onSessionIdChange }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load messages when session changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentSessionId) {
        setMessages([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('session_id', currentSessionId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formattedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));

        setMessages(formattedMessages);
      } catch (error: any) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    };

    loadMessages();
  }, [currentSessionId, toast]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    // Create session if none exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert([
            {
              user_id: user.id,
              title: generateSessionTitle(input.trim()),
            }
          ])
          .select()
          .single();

        if (error) throw error;
        sessionId = data.id;
        onSessionIdChange(sessionId);
      } catch (error: any) {
        console.error('Error creating session:', error);
        toast({
          title: "Error",
          description: "Failed to create chat session",
          variant: "destructive",
        });
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Save user message to database
      await supabase
        .from('messages')
        .insert([
          {
            session_id: sessionId,
            user_id: user.id,
            content: userMessage.content,
            role: 'user',
          }
        ]);

      // Update session title based on first user message if it's still default
      if (messages.length === 0) {
        const title = generateSessionTitle(userMessage.content);
        await supabase
          .from('chat_sessions')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', sessionId);
      }

      // Call AI function
      const { data, error } = await supabase.functions.invoke('islamic-ai-chat', {
        body: {
          message: userMessage.content,
          session_id: sessionId,
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message to database
      await supabase
        .from('messages')
        .insert([
          {
            session_id: sessionId,
            user_id: user.id,
            content: assistantMessage.content,
            role: 'assistant',
          }
        ]);

    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try asking your question again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSessionTitle = (firstMessage: string): string => {
    const message = firstMessage.toLowerCase();
    
    if (message.includes('hadith') || message.includes('prophet') || message.includes('muhammad') || message.includes('pbuh')) {
      return 'Hadith Discussion';
    } else if (message.includes('quran') || message.includes('verse') || message.includes('surah') || message.includes('ayah')) {
      return 'Quran Study';
    } else if (message.includes('prayer') || message.includes('salah') || message.includes('namaz') || message.includes('dua')) {
      return 'Prayer Guidance';
    } else if (message.includes('fasting') || message.includes('ramadan') || message.includes('sawm')) {
      return 'Fasting Questions';
    } else if (message.includes('hajj') || message.includes('pilgrimage') || message.includes('mecca')) {
      return 'Hajj & Pilgrimage';
    } else if (message.includes('zakat') || message.includes('charity') || message.includes('giving')) {
      return 'Zakat & Charity';
    } else if (message.includes('marriage') || message.includes('family') || message.includes('relationship')) {
      return 'Family & Marriage';
    } else if (message.includes('halal') || message.includes('haram') || message.includes('permissible')) {
      return 'Islamic Rulings';
    } else {
      // Use first few words of the message for generic topics
      const words = firstMessage.split(' ').slice(0, 3).join(' ');
      return words.length > 30 ? words.substring(0, 30) + '...' : words;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm p-3 md:p-4 flex-shrink-0">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-lg md:text-2xl font-bold text-gradient-primary">Islamic AI Assistant</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Ask me anything about Islam, Quran, Hadith, or Islamic guidance</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-4xl space-y-3 md:space-y-4 p-3 md:p-4">
          {messages.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <div className="text-3xl md:text-4xl mb-4">🌙</div>
              <h2 className="text-lg md:text-xl font-semibold mb-2 text-gradient-primary">
                السلام عليكم ورحمة الله وبركاته
              </h2>
              <p className="text-sm text-muted-foreground px-4">
                Welcome to your Islamic AI Assistant. How can I help you today with Islamic knowledge, prayers, or spiritual guidance?
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 md:gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-6 h-6 md:w-8 md:h-8 bg-primary/10 flex-shrink-0 mt-1">
                  <AvatarFallback className="bg-transparent">
                    <Bot className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <Card className={`max-w-[85%] md:max-w-[70%] p-3 md:p-4 ${
                message.role === 'user' 
                  ? 'bg-gradient-primary text-primary-foreground' 
                  : 'bg-card shadow-islamic'
              }`}>
                <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                  {message.content}
                </p>
                <p className={`text-xs mt-2 ${
                  message.role === 'user' 
                    ? 'text-primary-foreground/70' 
                    : 'text-muted-foreground'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </Card>

              {message.role === 'user' && (
                <Avatar className="w-6 h-6 md:w-8 md:h-8 bg-secondary/10 flex-shrink-0 mt-1">
                  <AvatarFallback className="bg-transparent">
                    <User className="w-3 h-3 md:w-4 md:h-4 text-secondary" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-2 md:gap-3 justify-start">
              <Avatar className="w-6 h-6 md:w-8 md:h-8 bg-primary/10 mt-1">
                <AvatarFallback className="bg-transparent">
                  <Bot className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              <Card className="p-3 md:p-4 bg-card shadow-islamic">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Thinking...</p>
                </div>
              </Card>
            </div>
          )}

          {/* Bottom padding for better scrolling */}
          <div className="h-4"></div>
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card/50 backdrop-blur-sm p-3 md:p-4 flex-shrink-0">
        <div className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Islamic teachings, Quran verses, Hadith..."
              className="flex-1 bg-background text-sm md:text-base min-h-[44px] h-[44px]"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-primary hover:opacity-90 px-3 md:px-4 min-h-[44px] h-[44px] min-w-[44px]"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;