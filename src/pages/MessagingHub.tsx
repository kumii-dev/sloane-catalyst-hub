import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { ConversationList } from '@/components/messaging/ConversationList';
import { MessageThread } from '@/components/messaging/MessageThread';
import { ContactPanel } from '@/components/messaging/ContactPanel';
import { MessagingTabs } from '@/components/messaging/MessagingTabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, X, Menu, PanelLeftClose } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MessagingHub = () => {
  const [selectedTab, setSelectedTab] = useState<'recent' | 'contacts' | 'teams' | 'pinned' | 'insights'>('recent');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showContactPanel, setShowContactPanel] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSecondarySidebar, setShowSecondarySidebar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle userId parameter from URL to open conversation with specific user
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    if (userId) {
      // Simulate selecting a conversation with this user
      setSelectedConversation(userId);
      setShowSecondarySidebar(true);
      // Clear the URL parameter
      navigate('/messaging-hub', { replace: true });
    }
  }, [location.search, navigate]);

  return (
    <Layout showSidebar={true} hideSecondarySidebar={true}>
      <div className="flex h-[calc(100vh-4rem)] bg-background relative">
        {/* Toggle Button - Visible on Mobile/Tablet */}
        {!showSecondarySidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSecondarySidebar(true)}
            className="absolute top-4 left-4 z-10 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Overlay for mobile */}
        {showSecondarySidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setShowSecondarySidebar(false)}
          />
        )}

        {/* Secondary Sidebar - Tabs & Folders */}
        <div className={`
          w-80 border-r border-border flex-col bg-card
          md:flex
          ${showSecondarySidebar ? 'flex fixed inset-y-0 left-0 z-40' : 'hidden'}
        `}>
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-foreground">Messaging Hub</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSecondarySidebar(false)}
                className="md:hidden"
              >
                <PanelLeftClose className="h-5 w-5" />
              </Button>
            </div>
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
