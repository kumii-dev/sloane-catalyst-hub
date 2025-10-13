import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, TrendingUp, Users, Pin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ConversationListProps {
  selectedTab: 'recent' | 'contacts' | 'teams' | 'pinned' | 'insights';
  searchQuery: string;
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
}

interface Conversation {
  id: string;
  title: string;
  last_message_at: string;
  conversation_type: string;
  unread_count: number;
  is_pinned: boolean;
  other_participant?: {
    id: string;
    name: string;
    profile_picture_url?: string;
    persona_type: string;
  };
  last_message?: {
    content: string;
    sender_name: string;
  };
}

export const ConversationList: React.FC<ConversationListProps> = ({
  selectedTab,
  searchQuery,
  selectedConversation,
  onSelectConversation
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          loadConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_messages'
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTab]);

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's conversation participants
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          unread_count,
          is_pinned,
          conversations!inner(
            id,
            title,
            last_message_at,
            conversation_type
          )
        `)
        .eq('user_id', user.id)
        .order('conversations.last_message_at', { ascending: false });

      if (participantError) throw participantError;

      // Get conversation details with other participants
      const conversationsWithDetails = await Promise.all(
        (participantData || []).map(async (p: any) => {
          const conv = p.conversations;
          
          // Get other participant for direct conversations
          let otherParticipant = null;
          if (conv.conversation_type === 'direct') {
            const { data: otherUser } = await supabase
              .from('conversation_participants')
              .select(`
                user_id,
                profiles!inner(
                  first_name,
                  last_name,
                  profile_picture_url,
                  persona_type
                )
              `)
              .eq('conversation_id', conv.id)
              .neq('user_id', user.id)
              .single();

            if (otherUser) {
              otherParticipant = {
                id: otherUser.user_id,
                name: `${otherUser.profiles.first_name} ${otherUser.profiles.last_name}`,
                profile_picture_url: otherUser.profiles.profile_picture_url,
                persona_type: otherUser.profiles.persona_type
              };
            }
          }

          // Get last message
          const { data: lastMessage } = await supabase
            .from('conversation_messages')
            .select(`
              content,
              sender_id,
              profiles!inner(first_name, last_name)
            `)
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            id: conv.id,
            title: conv.title || otherParticipant?.name || 'Conversation',
            last_message_at: conv.last_message_at,
            conversation_type: conv.conversation_type,
            unread_count: p.unread_count,
            is_pinned: p.is_pinned,
            other_participant: otherParticipant,
            last_message: lastMessage ? {
              content: lastMessage.content,
              sender_name: lastMessage.sender_id === user.id 
                ? 'You' 
                : `${lastMessage.profiles.first_name} ${lastMessage.profiles.last_name}`
            } : undefined
          };
        })
      );

      // Filter based on tab
      let filtered = conversationsWithDetails;
      if (selectedTab === 'pinned') {
        filtered = filtered.filter(c => c.is_pinned);
      }

      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(c =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.last_message?.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setConversations(filtered);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedTab === 'insights') {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl border border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Message Activity</h3>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Messages Sent</span>
              <span className="font-bold text-lg">{conversations.length * 5}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Conversations</span>
              <span className="font-bold text-lg">{conversations.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Response Rate</span>
              <span className="font-bold text-lg text-green-600">94%</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Collaborators
          </h3>
          {conversations.slice(0, 5).map((conv) => (
            <div
              key={conv.id}
              className="p-3 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all cursor-pointer"
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conv.other_participant?.profile_picture_url} />
                  <AvatarFallback>
                    {conv.title.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.floor(Math.random() * 50) + 10} messages exchanged
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No conversations yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Start a new conversation to get connected
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={cn(
              'w-full p-3 rounded-lg text-left transition-all duration-200 hover:bg-accent group',
              selectedConversation === conversation.id && 'bg-accent border-l-4 border-l-primary'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
                  <AvatarImage src={conversation.other_participant?.profile_picture_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {conversation.title.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {conversation.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                    {conversation.unread_count}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {conversation.title}
                  </h4>
                  {conversation.is_pinned && (
                    <Pin className="h-3 w-3 text-primary fill-primary" />
                  )}
                </div>
                
                {conversation.last_message && (
                  <p className="text-xs text-muted-foreground truncate mb-1">
                    <span className="font-medium">{conversation.last_message.sender_name}:</span>{' '}
                    {conversation.last_message.content}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                  </span>
                  {conversation.other_participant && (
                    <Badge variant="outline" className="text-xs">
                      {conversation.other_participant.persona_type.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};
