import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Send, Paperclip, Smile, MoreVertical, Phone, Video, 
  Calendar, DollarSign, ThumbsUp, Heart, CheckCheck 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessageThreadProps {
  conversationId: string;
  onClose: () => void;
}

// Mock messages - replace with real data
const mockMessages = [
  {
    id: '1',
    sender: 'Sarah Johnson',
    senderId: 'user1',
    content: 'Hi! I reviewed your business plan and I think there are some great opportunities we can explore together.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isCurrentUser: false,
    reactions: [{ emoji: '👍', count: 1 }],
  },
  {
    id: '2',
    sender: 'You',
    senderId: 'current',
    content: 'Thank you so much! I\'d love to hear your thoughts. When would be a good time to schedule a call?',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    isCurrentUser: true,
    reactions: [],
  },
  {
    id: '3',
    sender: 'Sarah Johnson',
    senderId: 'user1',
    content: 'That sounds great! Let\'s schedule a call next week. I\'ll send you some available time slots.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isCurrentUser: false,
    reactions: [],
  },
];

export const MessageThread: React.FC<MessageThreadProps> = ({ conversationId }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    // Send message logic here
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <div className="p-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>SJ</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-foreground">Sarah Johnson</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Mentor - Business Strategy</span>
              <span>•</span>
              <Badge variant="secondary" className="text-xs">Active</Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <DollarSign className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
        {mockMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.isCurrentUser ? 'flex-row-reverse' : ''}`}
          >
            {!msg.isCurrentUser && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">SJ</AvatarFallback>
              </Avatar>
            )}
            
            <div className={`flex flex-col ${msg.isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
              {!msg.isCurrentUser && (
                <span className="text-xs font-semibold mb-1 text-foreground">{msg.sender}</span>
              )}
              
              <div
                className={`rounded-lg px-4 py-2 ${
                  msg.isCurrentUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                </span>
                {msg.isCurrentUser && (
                  <CheckCheck className="h-3 w-3 text-primary" />
                )}
                {msg.reactions.length > 0 && (
                  <div className="flex gap-1">
                    {msg.reactions.map((reaction, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {reaction.emoji} {reaction.count}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Suggestions */}
      <div className="px-4 py-2 border-t border-border bg-card/50">
        <div className="flex gap-2 overflow-x-auto">
          <Button variant="outline" size="sm" onClick={() => setMessage("Thanks, I'll review this.")}>
            Thanks, I'll review this.
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMessage("Let's set up a meeting.")}>
            Let's set up a meeting.
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMessage("Can you share more details?")}>
            Can you share more details?
          </Button>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[80px] resize-none pr-20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="absolute bottom-2 right-2 flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <Smile className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button onClick={handleSend} className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    </div>
  );
};
