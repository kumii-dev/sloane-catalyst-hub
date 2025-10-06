import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ConversationList } from '@/components/messaging/ConversationList';
import { MessageThread } from '@/components/messaging/MessageThread';
import { ContactPanel } from '@/components/messaging/ContactPanel';
import { MessagingTabs } from '@/components/messaging/MessagingTabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, X } from 'lucide-react';

const MessagingHub = () => {
  const [selectedTab, setSelectedTab] = useState<'recent' | 'contacts' | 'teams' | 'pinned' | 'insights'>('recent');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showContactPanel, setShowContactPanel] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Layout showSidebar={true} hideSecondarySidebar={true}>
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        {/* Secondary Sidebar - Tabs & Folders */}
        <div className="w-80 border-r border-border flex flex-col bg-card">
          <div className="p-4 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground mb-4">Messaging Hub</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages, contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>
          
          <MessagingTabs selectedTab={selectedTab} onTabChange={setSelectedTab} />
          
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              selectedTab={selectedTab}
              searchQuery={searchQuery}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
          </div>
          
          <div className="p-3 border-t border-border">
            <Button className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        {/* Main Messaging Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedConversation ? (
            <MessageThread
              conversationId={selectedConversation}
              onClose={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Search className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Select a conversation</h3>
                <p>Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>

        {/* Context Panel - Right Sidebar */}
        {selectedConversation && showContactPanel && (
          <div className="w-80 border-l border-border bg-card overflow-y-auto relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowContactPanel(false)}
              className="absolute top-2 right-2 z-10"
            >
              <X className="h-4 w-4" />
            </Button>
            <ContactPanel conversationId={selectedConversation} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MessagingHub;
