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
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle2, Clock, MessageSquare, Search, Send, User, Star, TrendingUp, AlertTriangle } from 'lucide-react';
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
  user_name: string;
  assigned_to: string | null;
  customer_rating: number | null;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: string;
  message: string;
  created_at: string;
  is_internal: boolean;
  is_read: boolean;
}

interface TicketStats {
  open_count: number;
  in_progress_count: number;
  resolved_count: number;
  closed_count: number;
  urgent_count: number;
  avg_resolution_hours: number;
  tickets_last_24h: number;
  avg_rating: number;
}

const AdminSupportDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [assigningToSelf, setAssigningToSelf] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
    fetchTickets();
  }, [user]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
      subscribeToMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'support_agent'])
        .single();

      if (error || !data) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this page',
          variant: 'destructive'
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('support_ticket_stats')
        .select('*')
        .single();

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('last_activity_at', { ascending: false });

      // Apply status filter
      if (filterStatus === 'active') {
        query = query.not('status', 'in', '(resolved,closed)');
      } else if (filterStatus === 'resolved') {
        query = query.eq('status', 'resolved');
      } else if (filterStatus === 'closed') {
        query = query.eq('status', 'closed');
      }

      // Apply category filter
      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }

      // Apply priority filter
      if (filterPriority !== 'all') {
        query = query.eq('priority', filterPriority);
      }

      const { data, error } = await query;

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

  useEffect(() => {
    fetchTickets();
  }, [filterCategory, filterPriority, filterStatus]);

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
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
      .channel(`admin-ticket-messages-${ticketId}`)
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
          sender_type: 'admin',
          message: newMessage.trim(),
          is_internal: isInternalNote
        });

      if (error) throw error;

      setNewMessage('');
      setIsInternalNote(false);
      toast({
        title: isInternalNote ? 'Internal note added' : 'Message sent',
        description: isInternalNote ? 'Note is only visible to support team' : 'Customer will be notified'
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

  const handleAssignToSelf = async () => {
    if (!selectedTicket || !user) return;

    setAssigningToSelf(true);
    try {
      const { error } = await supabase.rpc('assign_ticket', {
        ticket_id: selectedTicket.id,
        assignee_id: user.id,
        actor_id: user.id
      });

      if (error) throw error;

      // Update local state
      setSelectedTicket({ ...selectedTicket, assigned_to: user.id });
      fetchTickets();

      toast({
        title: 'Ticket assigned',
        description: 'You are now assigned to this ticket'
      });
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign ticket',
        variant: 'destructive'
      });
    } finally {
      setAssigningToSelf(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicket || !user) return;

    try {
      const { error } = await supabase.rpc('update_ticket_status', {
        ticket_id: selectedTicket.id,
        new_status: newStatus,
        actor_id: user.id
      });

      if (error) throw error;

      setSelectedTicket({ ...selectedTicket, status: newStatus });
      fetchTickets();
      fetchStats();

      toast({
        title: 'Status updated',
        description: `Ticket status changed to ${newStatus.replace('_', ' ')}`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update ticket status',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any, text: string, icon: any }> = {
      open: { variant: 'default', text: 'Open', icon: AlertCircle },
      in_progress: { variant: 'default', text: 'In Progress', icon: Clock },
      waiting_on_customer: { variant: 'outline', text: 'Waiting on Customer', icon: Clock },
      waiting_on_admin: { variant: 'secondary', text: 'Waiting on Admin', icon: Clock },
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
    ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Open Tickets</CardDescription>
                <CardTitle className="text-3xl">{stats.open_count}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stats.tickets_last_24h} in last 24h
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>In Progress</CardDescription>
                <CardTitle className="text-3xl">{stats.in_progress_count}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  Being handled
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg Resolution</CardDescription>
                <CardTitle className="text-3xl">{stats.avg_resolution_hours.toFixed(1)}h</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  {stats.resolved_count} resolved
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Urgent Tickets</CardDescription>
                <CardTitle className="text-3xl text-red-600">{stats.urgent_count}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-muted-foreground">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Requires immediate attention
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex h-[calc(100vh-20rem)] bg-background rounded-lg border border-border overflow-hidden">
          {/* Sidebar - Ticket List */}
          <div className="w-96 border-r border-border flex flex-col">
            <div className="p-4 border-b border-border space-y-4">
              <h2 className="text-xl font-bold">Support Console</h2>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs value={filterStatus} onValueChange={setFilterStatus}>
                <TabsList className="w-full">
                  <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
                  <TabsTrigger value="resolved" className="flex-1">Resolved</TabsTrigger>
                  <TabsTrigger value="closed" className="flex-1">Closed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : filteredTickets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tickets found
                  </div>
                ) : (
                  filteredTickets.map(ticket => (
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
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="w-3 h-3" />
                            {ticket.user_name || ticket.user_email}
                          </div>
                          <div className="text-muted-foreground">
                            Updated {formatDistanceToNow(new Date(ticket.last_activity_at), { addSuffix: true })}
                          </div>
                          {ticket.customer_rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              <span>{ticket.customer_rating}/5</span>
                            </div>
                          )}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content - Ticket Messages */}
          <div className="flex-1 flex flex-col">
            {selectedTicket ? (
              <>
                {/* Ticket Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold mb-1">{selectedTicket.subject}</h2>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="font-mono">{selectedTicket.ticket_number}</span>
                        <span>•</span>
                        <Badge variant="outline">{selectedTicket.category}</Badge>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {selectedTicket.user_name || selectedTicket.user_email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedTicket.status)}
                      <Select value={selectedTicket.status} onValueChange={handleUpdateStatus}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="waiting_on_customer">Waiting on Customer</SelectItem>
                          <SelectItem value="waiting_on_admin">Waiting on Admin</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="escalated">Escalated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {!selectedTicket.assigned_to && (
                    <Button onClick={handleAssignToSelf} disabled={assigningToSelf} size="sm">
                      Assign to Me
                    </Button>
                  )}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.map((message) => {
                      const isInternalNote = message.is_internal;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${message.sender_type === 'admin' ? 'ml-auto' : 'mr-auto'}`}>
                            <div
                              className={`rounded-lg p-4 ${
                                isInternalNote
                                  ? 'bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-500'
                                  : message.sender_type === 'admin'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {isInternalNote && (
                                  <Badge variant="outline" className="text-xs">Internal Note</Badge>
                                )}
                                <span className="text-sm font-medium">
                                  {message.sender_type === 'admin' ? 'Support Team' : 'Customer'}
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
                <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox
                        id="internal"
                        checked={isInternalNote}
                        onCheckedChange={(checked) => setIsInternalNote(checked as boolean)}
                      />
                      <Label htmlFor="internal" className="text-sm cursor-pointer">
                        Internal note (not visible to customer)
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder={isInternalNote ? "Add internal note..." : "Type your message..."}
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
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a ticket to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSupportDashboard;
