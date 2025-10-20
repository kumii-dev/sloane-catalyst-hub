import React, { useState, useEffect, useRef } from 'react';
import { TriangleAvatar } from '@/components/ui/triangle-avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phone, Video, MoreVertical, Send, Paperclip, Smile, 
  X, Sparkles, Check, CheckCheck, Loader2 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MessageThreadProps {
  conversationId: string;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  created_at: string;
  is_read: boolean;
  is_own: boolean;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ conversationId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadConversation();
    
    // Real-time subscription for new messages
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          loadConversation();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      generateAISuggestions();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get other participant using secure RPC
      const { data: otherParticipantData, error: participantError } = await supabase
        .rpc('get_other_participant_profiles', { p_conversation_id: conversationId })
        .single();

      if (!participantError && otherParticipantData) {
        setOtherParticipant({
          id: otherParticipantData.user_id,
          name: `${otherParticipantData.first_name} ${otherParticipantData.last_name}`,
          profile_picture_url: otherParticipantData.profile_picture_url,
          persona_type: otherParticipantData.persona_type,
          organization: otherParticipantData.organization,
          bio: otherParticipantData.bio
        });
      }

      // Get messages
      const { data: messagesData, error } = await supabase
        .from('conversation_messages')
        .select('id, content, sender_id, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = await Promise.all(
        (messagesData || []).map(async (msg: any) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('first_name, last_name, profile_picture_url')
            .eq('user_id', msg.sender_id)
            .single();

          return {
            id: msg.id,
            content: msg.content,
            sender_id: msg.sender_id,
            sender_name: senderProfile 
              ? `${senderProfile.first_name} ${senderProfile.last_name}`
              : 'Unknown',
            sender_avatar: senderProfile?.profile_picture_url,
            created_at: msg.created_at,
            is_read: true,
            is_own: msg.sender_id === user.id
          };
        })
      );

      setMessages(formattedMessages);

      // Mark messages as read
      await supabase
        .from('conversation_participants')
        .update({ 
          unread_count: 0,
          last_read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestions = () => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.is_own) return;

    // Simple contextual suggestions
    const suggestions = [
      "Thanks for reaching out!",
      "That sounds interesting. Can you tell me more?",
      "Let's schedule a call to discuss this further."
    ];
    
    setAiSuggestions(suggestions);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
      setAiSuggestions([]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/30 rounded-full mx-auto" />
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto absolute top-0 left-1/2 -translate-x-1/2" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Loading conversation</p>
            <p className="text-xs text-muted-foreground">Please wait a moment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <div className="px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <TriangleAvatar 
              src={otherParticipant?.profile_picture_url}
              alt={otherParticipant?.name || 'User'}
              fallback={otherParticipant?.name.split(' ').map((n: string) => n[0]).join('') || '?'}
              className="h-12 w-12 ring-2 ring-primary/10"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-background" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-foreground">
              {otherParticipant?.name || 'User'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium capitalize">{otherParticipant?.persona_type?.replace('_', ' ') || 'User'}</span>
              {otherParticipant?.organization && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{otherParticipant.organization}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="hover:bg-muted/50">
            <Phone className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-muted/50">
            <Video className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-muted/50">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4 bg-gradient-to-b from-background to-muted/10">
        <div className="space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Send className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Start the conversation</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Send a message to begin chatting with {otherParticipant?.name || 'this user'}
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
            const showTimestamp = index === messages.length - 1 || 
              messages[index + 1]?.sender_id !== message.sender_id;

            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-fade-in',
                  message.is_own && 'flex-row-reverse'
                )}
              >
                {showAvatar ? (
                  <TriangleAvatar 
                    src={message.sender_avatar}
                    alt={message.sender_name}
                    fallback={message.sender_name.split(' ').map(n => n[0]).join('')}
                    className="h-10 w-10 flex-shrink-0 ring-2 ring-border"
                  />
                ) : (
                  <div className="w-10" />
                )}

                <div className={cn('flex-1 max-w-[70%]', message.is_own && 'flex flex-col items-end')}>
                  <div
                    className={cn(
                      'rounded-2xl px-5 py-3 shadow-sm',
                      message.is_own
                        ? 'bg-gradient-to-br from-primary to-primary-dark text-primary-foreground'
                        : 'bg-card text-foreground border border-border'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                  </div>
                  
                  {showTimestamp && (
                    <div className={cn(
                      'flex items-center gap-1 mt-1.5 text-xs text-muted-foreground px-1',
                      message.is_own && 'flex-row-reverse'
                    )}>
                      <span>
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                      {message.is_own && (
                        <CheckCheck className="h-3 w-3 text-primary" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="px-6 py-3 border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Quick Replies</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {aiSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setNewMessage(suggestion)}
                className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-end gap-3">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 resize-none min-h-[100px] bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="h-12 px-6 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
