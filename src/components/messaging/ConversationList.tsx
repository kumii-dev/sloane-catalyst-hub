import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Pin, CheckCheck } from 'lucide-react';

interface ConversationListProps {
  selectedTab: string;
  searchQuery: string;
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
}

// Mock data - replace with real data from Supabase
const mockConversations = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Mentor - Business Strategy',
    lastMessage: 'That sounds great! Let\'s schedule a call next week.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    unread: 2,
    avatar: null,
    isPinned: true,
    isOnline: true,
  },
  {
    id: '2',
    name: 'African Bank Fintech Cohort',
    role: 'Team • 24 members',
    lastMessage: 'John: Thanks for sharing the resources!',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    unread: 5,
    avatar: null,
    isPinned: false,
    isOnline: false,
  },
  {
    id: '3',
    name: 'David Chen',
    role: 'Funder - Venture Capital',
    lastMessage: 'I reviewed your pitch deck. Very impressive work!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unread: 0,
    avatar: null,
    isPinned: false,
    isOnline: false,
  },
  {
    id: '4',
    name: 'TechStart Mentorship Group',
    role: 'Team • 12 members',
    lastMessage: 'Meeting scheduled for tomorrow at 2 PM',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    unread: 1,
    avatar: null,
    isPinned: true,
    isOnline: false,
  },
];

export const ConversationList: React.FC<ConversationListProps> = ({
  selectedTab,
  searchQuery,
  selectedConversation,
  onSelectConversation,
}) => {
  const filteredConversations = mockConversations.filter((conv) => {
    if (selectedTab === 'pinned' && !conv.isPinned) return false;
    if (selectedTab === 'teams' && !conv.role.includes('Team')) return false;
    if (searchQuery && !conv.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (selectedTab === 'insights') {
    return (
      <div className="p-4 space-y-4">
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <h3 className="font-semibold text-sm mb-2 text-foreground">Message Activity</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Total Conversations</span>
              <span className="font-semibold text-foreground">24</span>
            </div>
            <div className="flex justify-between">
              <span>Unread Messages</span>
              <span className="font-semibold text-foreground">8</span>
            </div>
            <div className="flex justify-between">
              <span>Active Teams</span>
              <span className="font-semibold text-foreground">6</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-secondary">
          <h3 className="font-semibold text-sm mb-2 text-foreground">Top Collaborators</h3>
          <div className="space-y-2">
            {['Sarah Johnson', 'David Chen', 'Maria Garcia'].map((name, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">{name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {filteredConversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation.id)}
          className={`w-full p-4 text-left hover:bg-accent transition-colors ${
            selectedConversation === conversation.id ? 'bg-accent' : ''
          }`}
        >
          <div className="flex gap-3">
            <div className="relative">
              <Avatar>
                <AvatarImage src={conversation.avatar || undefined} />
                <AvatarFallback>{conversation.name[0]}</AvatarFallback>
              </Avatar>
              {conversation.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm truncate text-foreground">
                    {conversation.name}
                  </h3>
                  {conversation.isPinned && (
                    <Pin className="h-3 w-3 text-primary flex-shrink-0" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatDistanceToNow(conversation.timestamp, { addSuffix: true })}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground mb-1">{conversation.role}</p>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate flex-1">
                  {conversation.lastMessage}
                </p>
                {conversation.unread > 0 && (
                  <Badge variant="default" className="ml-2 flex-shrink-0">
                    {conversation.unread}
                  </Badge>
                )}
                {conversation.unread === 0 && (
                  <CheckCheck className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
