import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageCircle, Clock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ChatSession {
  id: string;
  session_number: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  status: string;
  priority: string;
  category: string | null;
  assigned_to: string | null;
  created_at: string;
  last_activity_at: string;
  is_analyzed: boolean;
  ai_risk_score: number | null;
  security_flagged: boolean;
}

interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  sender_type: string;
  message: string;
  created_at: string;
  is_internal: boolean;
}

const LiveChatSupport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [category] = useState("general");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatChannel, setChatChannel] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadOrCreateSession();
  }, [user, navigate]);

  useEffect(() => {
    if (currentSession) {
      loadMessages();
      subscribeToMessages();
    }
    return () => {
      if (chatChannel) {
        supabase.removeChannel(chatChannel);
      }
    };
  }, [currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadOrCreateSession = async () => {
    try {
      const { data: existingSessions, error: fetchError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .in('status', ['active', 'waiting', 'assigned'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingSessions && existingSessions.length > 0) {
        setCurrentSession(existingSessions[0]);
      } else {
        await createNewSession();
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load chat session');
    }
  };

  const createNewSession = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user!.id,
          user_email: user!.email!,
          user_name: user!.user_metadata?.name || null,
          status: 'active',
          priority: 'normal',
          category: category,
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentSession(data);
      toast.success('Chat session started');
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to start chat session');
    }
  };

  const loadMessages = async () => {
    if (!currentSession) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', currentSession.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!currentSession) return;

    const channel = supabase
      .channel(`chat_${currentSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${currentSession.id}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    setChatChannel(channel);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSession) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: currentSession.id,
          sender_id: user!.id,
          sender_type: 'customer',
          message: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage("");
      
      await supabase
        .from('chat_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', currentSession.id);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500",
      waiting: "bg-yellow-500",
      assigned: "bg-blue-500",
      resolved: "bg-gray-500",
      closed: "bg-gray-400"
    };
    return colors[status] || "bg-gray-500";
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      urgent: "destructive",
      high: "default",
      normal: "secondary",
      low: "outline"
    };
    return variants[priority] || "secondary";
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Layout showSidebar={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Chat Support</h1>
          <p className="text-muted-foreground">
            Get real-time help from our support team
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Session Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentSession ? (
                  <>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Session ID</div>
                      <div className="font-mono text-sm">{currentSession.session_number}</div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Status</div>
                      <Badge className={getStatusColor(currentSession.status)}>
                        {currentSession.status}
                      </Badge>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Priority</div>
                      <Badge variant={getPriorityBadge(currentSession.priority)}>
                        {currentSession.priority}
                      </Badge>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Category</div>
                      <div className="text-sm">{currentSession.category || 'General'}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Started</div>
                      <div className="text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(currentSession.created_at)}
                      </div>
                    </div>

                    {currentSession.assigned_to && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Agent</div>
                        <div className="text-sm flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Assigned
                        </div>
                      </div>
                    )}

                    {currentSession.security_flagged && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-medium">
                          <AlertCircle className="w-4 h-4" />
                          Security Flagged
                        </div>
                      </div>
                    )}

                    {currentSession.is_analyzed && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          AI Analyzed
                        </div>
                        {currentSession.ai_risk_score !== null && (
                          <div className="mt-2 text-xs">
                            Risk Score: {currentSession.ai_risk_score}/100
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No active session
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <CardTitle>Chat</CardTitle>
                  </div>
                  {currentSession?.status === 'active' && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                      Online
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Send a message to connect with our support team. We're here to help!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isCustomer = message.sender_type === 'customer';
                        const isInternal = message.is_internal;
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`flex gap-3 max-w-[70%] ${
                                isCustomer ? 'flex-row-reverse' : 'flex-row'
                              }`}
                            >
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback className={isCustomer ? 'bg-primary' : 'bg-accent'}>
                                  {isCustomer ? 'U' : message.sender_type === 'bot' ? 'AI' : 'A'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div>
                                <div
                                  className={`rounded-lg p-3 ${
                                    isCustomer
                                      ? 'bg-primary text-primary-foreground'
                                      : isInternal
                                      ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300'
                                      : 'bg-muted'
                                  }`}
                                >
                                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-1 px-1">
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(message.created_at)}
                                  </span>
                                  {isInternal && (
                                    <Badge variant="outline" className="text-xs">Internal</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={loading || !currentSession}
                      className="min-h-[60px] max-h-[120px] resize-none"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || loading || !currentSession}
                      size="icon"
                      className="h-[60px] w-[60px] flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Press Enter to send, Shift+Enter for new line
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Response Time
              </h3>
              <p className="text-sm text-muted-foreground">
                Average response time: <span className="font-semibold">2-5 minutes</span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Support Hours
              </h3>
              <p className="text-sm text-muted-foreground">
                Monday - Friday: <span className="font-semibold">8AM - 6PM SAST</span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                Urgent Issues
              </h3>
              <p className="text-sm text-muted-foreground">
                For critical issues, call: <span className="font-semibold">011 463 7602</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default LiveChatSupport;
