import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Clock, MessageSquare, Plus, Search, Send, Paperclip, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  last_activity_at: string;
  user_email: string;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: string;
  message: string;
  created_at: string;
  is_internal: boolean;
  sender_profile?: {
    full_name: string;
    avatar_url: string;
  };
}

const CustomerSupport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  
  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    description: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchTickets();
  }, [user]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
      subscribeToMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_activity_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load support tickets',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select(`
          *,
          sender_profile:sender_id (
            full_name,
            avatar_url
          )
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = (ticketId: string) => {
    const channel = supabase
      .channel(`ticket-messages-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as SupportMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTicket.subject || !newTicket.description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user?.id,
          user_email: user?.email,
          user_name: user?.user_metadata?.full_name,
          subject: newTicket.subject,
          category: newTicket.category,
          priority: newTicket.priority,
          status: 'open'
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Create initial message
      const { error: messageError } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticket.id,
          sender_id: user?.id,
          sender_type: 'customer',
          message: newTicket.description
        });

      if (messageError) throw messageError;

      toast({
        title: 'Success',
        description: `Ticket ${ticket.ticket_number} created successfully`
      });

      setShowNewTicketForm(false);
      setNewTicket({ subject: '', category: 'general', priority: 'medium', description: '' });
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to create ticket',
        variant: 'destructive'
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedTicket) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender_id: user?.id,
          sender_type: 'customer',
          message: newMessage.trim()
        });

      if (error) throw error;

      // Update ticket last_activity_at
      await supabase
        .from('support_tickets')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', selectedTicket.id);

      setNewMessage('');
      toast({
        title: 'Message sent',
        description: 'Your message has been sent to support'
      });
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any, text: string, icon: any }> = {
      open: { variant: 'default', text: 'Open', icon: AlertCircle },
      in_progress: { variant: 'default', text: 'In Progress', icon: Clock },
      waiting_on_customer: { variant: 'outline', text: 'Waiting on You', icon: Clock },
      waiting_on_admin: { variant: 'secondary', text: 'Waiting on Support', icon: Clock },
      resolved: { variant: 'default', text: 'Resolved', icon: CheckCircle2 },
      closed: { variant: 'secondary', text: 'Closed', icon: CheckCircle2 },
      escalated: { variant: 'destructive', text: 'Escalated', icon: AlertCircle }
    };
    
    const config = variants[status] || variants.open;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-blue-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTickets = filteredTickets.filter(t => !['resolved', 'closed'].includes(t.status));
  const closedTickets = filteredTickets.filter(t => ['resolved', 'closed'].includes(t.status));

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        {/* Sidebar - Ticket List */}
        <div className="w-96 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Support</h1>
              <Button onClick={() => setShowNewTicketForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Tabs defaultValue="active" className="flex-1 flex flex-col">
            <TabsList className="m-4 mb-0">
              <TabsTrigger value="active" className="flex-1">
                Active ({activeTickets.length})
              </TabsTrigger>
              <TabsTrigger value="closed" className="flex-1">
                Closed ({closedTickets.length})
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="active" className="p-4 space-y-2 mt-0">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : activeTickets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active tickets
                  </div>
                ) : (
                  activeTickets.map(ticket => (
                    <Card
                      key={ticket.id}
                      className={`cursor-pointer hover:bg-accent transition-colors ${
                        selectedTicket?.id === ticket.id ? 'border-primary bg-accent' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-sm font-medium line-clamp-1">
                            {ticket.subject}
                          </CardTitle>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <CardDescription className="text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono">{ticket.ticket_number}</span>
                            <span className={getPriorityColor(ticket.priority)}>
                              {ticket.priority.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            Updated {formatDistanceToNow(new Date(ticket.last_activity_at), { addSuffix: true })}
                          </div>
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="closed" className="p-4 space-y-2 mt-0">
                {closedTickets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No closed tickets
                  </div>
                ) : (
                  closedTickets.map(ticket => (
                    <Card
                      key={ticket.id}
                      className={`cursor-pointer hover:bg-accent transition-colors ${
                        selectedTicket?.id === ticket.id ? 'border-primary bg-accent' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-sm font-medium line-clamp-1">
                            {ticket.subject}
                          </CardTitle>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <CardDescription className="text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono">{ticket.ticket_number}</span>
                            <span>
                              {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Main Content - Ticket Messages */}
        <div className="flex-1 flex flex-col">
          {selectedTicket ? (
            <>
              {/* Ticket Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-mono">{selectedTicket.ticket_number}</span>
                      <span>•</span>
                      <Badge variant="outline">{selectedTicket.category}</Badge>
                      <span>•</span>
                      <span>Created {formatDistanceToNow(new Date(selectedTicket.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((message) => {
                    const isOwnMessage = message.sender_id === user?.id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
                          <div
                            className={`rounded-lg p-4 ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">
                                {isOwnMessage ? 'You' : message.sender_type === 'admin' ? 'Support Team' : 'Customer'}
                              </span>
                              <span className="text-xs opacity-70">
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{message.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Message Input */}
              {!['resolved', 'closed'].includes(selectedTicket.status) && (
                <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="resize-none"
                      rows={3}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <Button type="submit" disabled={sending || !newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a ticket to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create Support Ticket</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowNewTicketForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                Describe your issue and our team will respond as soon as possible
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateTicket}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief summary of your issue"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newTicket.category}
                      onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing & Payments</SelectItem>
                        <SelectItem value="account">Account Management</SelectItem>
                        <SelectItem value="feature_request">Feature Request</SelectItem>
                        <SelectItem value="bug_report">Bug Report</SelectItem>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="security">Security Concern</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide as much detail as possible..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    rows={6}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewTicketForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Ticket
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default CustomerSupport;
