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
import { Send, MessageCircle, Clock, User, AlertCircle, CheckCircle2, RefreshCw, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  message_count?: number;
  last_message?: string;
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

const AdminSupportConsole = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatChannel, setChatChannel] = useState<any>(null);
  const [sessionsChannel, setSessionsChannel] = useState<any>(null);

  // Check admin/support_agent role
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user has admin or support_agent role
    const checkRole = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'support_agent']);

      if (error) {
        console.error('Error checking roles:', error);
        toast.error('Error checking permissions.');
        navigate('/');
        return;
      }

      if (!data || data.length === 0) {
        toast.error('Access denied. Admin or support agent role required.');
        navigate('/');
        return;
      }

      // User has permission, load data
      loadSessions();
      subscribeToSessions();
    };

    checkRole();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedSession) {
      loadMessages();
      subscribeToMessages();
      markSessionAsAssigned();
    }
    return () => {
      if (chatChannel) {
        supabase.removeChannel(chatChannel);
      }
    };
  }, [selectedSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (sessionsChannel) {
        supabase.removeChannel(sessionsChannel);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadSessions = async () => {
    try {
      let query = supabase
        .from('chat_sessions')
        .select('*')
        .order('last_activity_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      } else {
        query = query.in('status', ['active', 'waiting', 'assigned']);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get message counts and last message for each session
      const sessionsWithDetails = await Promise.all(
        (data || []).map(async (session) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          const { data: lastMsg } = await supabase
            .from('chat_messages')
            .select('message')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...session,
            message_count: count || 0,
            last_message: lastMsg?.message || 'No messages yet',
          };
        })
      );

      setSessions(sessionsWithDetails);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load chat sessions');
    }
  };

  const subscribeToSessions = () => {
    const channel = supabase
      .channel('admin_sessions_monitor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions',
        },
        (payload) => {
          console.log('Session changed:', payload);
          loadSessions();
        }
      )
      .subscribe();

    setSessionsChannel(channel);
  };

  const markSessionAsAssigned = async () => {
    if (!selectedSession || !user) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          assigned_to: user.id,
          status: 'assigned',
        })
        .eq('id', selectedSession.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error assigning session:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedSession) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', selectedSession.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('chat_messages')
        .update({ is_read_by_support: true })
        .eq('session_id', selectedSession.id)
        .eq('sender_type', 'user');

    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedSession) return;

    const channel = supabase
      .channel(`admin_chat_${selectedSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${selectedSession.id}`,
        },
        (payload) => {
          console.log('New message:', payload);
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMsg]);
          
          // Show notification if message is from user
          if (newMsg.sender_type === 'user') {
            toast.info('New message received');
            // Mark as read
            supabase
              .from('chat_messages')
              .update({ is_read_by_support: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    setChatChannel(channel);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSession || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: selectedSession.id,
          sender_id: user.id,
          sender_type: 'support_agent',
          message: newMessage.trim(),
          is_internal: false,
        });

      if (error) throw error;

      setNewMessage("");
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      const supabaseError = (error as { message?: string; details?: string }) || {};
      const errorMessage = supabaseError.details
        ? `${supabaseError.message ?? 'Failed to send message'}: ${supabaseError.details}`
        : supabaseError.message ?? 'Failed to send message';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!selectedSession) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ status: 'closed' })
        .eq('id', selectedSession.id);

      if (error) throw error;

      toast.success('Session closed');
      setSelectedSession(null);
      setMessages([]);
      loadSessions();
    } catch (error) {
      console.error('Error closing session:', error);
      toast.error('Failed to close session');
    }
  };

  const handleResolveSession = async () => {
    if (!selectedSession) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ status: 'resolved' })
        .eq('id', selectedSession.id);

      if (error) throw error;

      toast.success('Session resolved');
      setSelectedSession(null);
      setMessages([]);
      loadSessions();
    } catch (error) {
      console.error('Error resolving session:', error);
      toast.error('Failed to resolve session');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'waiting':
        return 'bg-yellow-500';
      case 'assigned':
        return 'bg-blue-500';
      case 'resolved':
        return 'bg-gray-500';
      case 'closed':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageCircle className="w-8 h-8" />
              Admin Support Console
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and respond to customer support chats
            </p>
          </div>
          <Button onClick={loadSessions} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Chat Sessions</span>
                <Badge variant="secondary">{sessions.length}</Badge>
              </CardTitle>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setTimeout(loadSessions, 100);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Active</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {sessions.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No active sessions</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`p-4 border-b cursor-pointer transition-colors hover:bg-accent ${
                        selectedSession?.id === session.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {session.user_name?.[0] || session.user_email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {session.user_name || session.user_email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {session.session_number}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getPriorityColor(session.priority)} className="text-xs">
                          {session.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {session.last_message}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(session.status)}`} />
                          <span className="text-xs text-muted-foreground capitalize">
                            {session.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MessageCircle className="w-3 h-3" />
                          {session.message_count}
                          <Clock className="w-3 h-3 ml-1" />
                          {formatTimestamp(session.last_activity_at)}
                        </div>
                      </div>

                      {session.security_flagged && (
                        <Badge variant="destructive" className="text-xs mt-2">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Security Flagged
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-2">
            {!selectedSession ? (
              <CardContent className="flex items-center justify-center h-[700px]">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium mb-2">No session selected</p>
                  <p className="text-sm">Select a chat session from the list to start responding</p>
                </div>
              </CardContent>
            ) : (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {selectedSession.user_name?.[0] || selectedSession.user_email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {selectedSession.user_name || selectedSession.user_email}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {selectedSession.session_number} • {selectedSession.category || 'General'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(selectedSession.priority)}>
                        {selectedSession.priority}
                      </Badge>
                      <Badge variant="outline">
                        <div className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(selectedSession.status)}`} />
                        {selectedSession.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Messages */}
                  <ScrollArea className="h-[450px] pr-4">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No messages in this session yet
                        </p>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_type === 'support_agent' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.sender_type === 'support_agent'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(message.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="space-y-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your response..."
                      className="min-h-[80px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResolveSession}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Resolve
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCloseSession}
                        >
                          Close Session
                        </Button>
                      </div>
                      <Button type="submit" disabled={loading || !newMessage.trim()}>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSupportConsole;
