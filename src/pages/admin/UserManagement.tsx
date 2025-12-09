import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Shield, UserCheck, UserX, Search, Ban, CheckCircle, RefreshCw, MessageSquare, Download, Users, ArrowLeft } from 'lucide-react';

export default function UserManagement() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [personaFilter, setPersonaFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPersona, setNewPersona] = useState<string>('');
  const [showPersonaDialog, setShowPersonaDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; data: any } | null>(null);

  useEffect(() => {
    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'support_agent']);

    if (error || !data || data.length === 0) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    setIsAdmin(true);
    fetchUsers();
  };

  const fetchUsers = async () => {
    setLoading(true);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, email, first_name, last_name, persona_type, created_at, is_active')
      .order('created_at', { ascending: false });

    if (profilesError) {
      toast.error('Failed to load users');
      console.error(profilesError);
      setLoading(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      console.error('Failed to load roles:', rolesError);
    }

    const usersWithRoles = profiles?.map(profile => ({
      ...profile,
      roles: roles?.filter(r => r.user_id === profile.user_id).map(r => r.role) || [],
      is_active: profile.is_active ?? true
    })) || [];

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const approveAdmin = async () => {
    if (!adminEmail) {
      toast.error('Please enter an email address');
      return;
    }

    const targetUser = users.find(u => u.email === adminEmail);
    
    if (!targetUser) {
      toast.error('User not found');
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: targetUser.user_id,
        role: selectedRole as any
      });

    if (error) {
      if (error.code === '23505') {
        toast.error(`User already has ${selectedRole} role`);
      } else {
        toast.error(`Failed to grant ${selectedRole} access`);
        console.error(error);
      }
      return;
    }

    const roleNames: Record<string, string> = {
      admin: 'Admin',
      mentorship_admin: 'Mentorship Admin',
      support_agent: 'Support Agent',
      mentor: 'Mentor',
      advisor: 'Advisor',
      funder: 'Funder',
      startup: 'Startup',
      smme: 'SMME',
      service_provider: 'Service Provider',
      software_provider: 'Software Provider',
      learning_provider: 'Learning Provider'
    };

    toast.success(`${adminEmail} has been granted ${roleNames[selectedRole] || selectedRole} access`);
    setAdminEmail('');
    setSelectedRole('admin');
    fetchUsers();
  };

  const revokeAdmin = (userId: string, email: string) => {
    setConfirmAction({
      type: 'revokeAdmin',
      data: { userId, email, role: 'admin' }
    });
    setShowConfirmDialog(true);
  };

  const revokeRole = (userId: string, email: string, role: string) => {
    setConfirmAction({
      type: 'revokeRole',
      data: { userId, email, role }
    });
    setShowConfirmDialog(true);
  };

  const executeRevokeAdmin = async (userId: string, email: string) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (error) {
      toast.error('Failed to revoke admin access');
      console.error(error);
      return;
    }

    toast.success(`Admin access revoked for ${email}`);
    fetchUsers();
  };

  const executeRevokeRole = async (userId: string, email: string, role: string) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role as any);

    if (error) {
      toast.error(`Failed to revoke ${role} role`);
      console.error(error);
      return;
    }

    const roleNames: Record<string, string> = {
      admin: 'Admin',
      mentorship_admin: 'Mentorship Admin',
      support_agent: 'Support Agent',
      mentor: 'Mentor',
      advisor: 'Advisor',
      funder: 'Funder',
      startup: 'Startup',
      smme: 'SMME',
      service_provider: 'Service Provider',
      software_provider: 'Software Provider',
      learning_provider: 'Learning Provider'
    };

    toast.success(`${roleNames[role] || role} role revoked for ${email}`);
    fetchUsers();
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'toggleStatus') {
      executeToggleUserStatus(confirmAction.data.userId, confirmAction.data.currentStatus, confirmAction.data.email);
    } else if (confirmAction.type === 'revokeAdmin') {
      executeRevokeAdmin(confirmAction.data.userId, confirmAction.data.email);
    } else if (confirmAction.type === 'revokeRole') {
      executeRevokeRole(confirmAction.data.userId, confirmAction.data.email, confirmAction.data.role);
    }

    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const toggleUserStatus = (userId: string, currentStatus: boolean, email: string) => {
    setConfirmAction({
      type: 'toggleStatus',
      data: { userId, currentStatus, email }
    });
    setShowConfirmDialog(true);
  };

  const executeToggleUserStatus = async (userId: string, currentStatus: boolean, email: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to update user status');
      console.error(error);
      return;
    }

    toast.success(`User ${email} ${!currentStatus ? 'enabled' : 'disabled'}`);
    fetchUsers();
  };

  const changeUserPersona = async () => {
    if (!selectedUser || !newPersona) {
      toast.error('Please select a persona');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ persona_type: newPersona as any })
      .eq('user_id', selectedUser.user_id);

    if (error) {
      toast.error('Failed to change user persona');
      console.error(error);
      return;
    }

    toast.success(`Persona updated to ${newPersona} for ${selectedUser.email}`);
    setShowPersonaDialog(false);
    setSelectedUser(null);
    setNewPersona('');
    fetchUsers();
  };

  const sendMessageToUser = async () => {
    if (!selectedUser || !messageContent) {
      toast.error('Please enter a message');
      return;
    }

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        conversation_type: 'direct',
        title: 'Message from Admin'
      })
      .select()
      .single();

    if (conversation && !convError) {
      await supabase.from('conversation_participants').insert({
        conversation_id: conversation.id,
        user_id: selectedUser.user_id
      });

      const { error: msgError } = await supabase.from('conversation_messages').insert({
        conversation_id: conversation.id,
        sender_id: user!.id,
        content: messageContent,
        message_type: 'text'
      });

      if (msgError) {
        toast.error('Failed to send message');
        console.error(msgError);
        return;
      }

      toast.success(`Message sent to ${selectedUser.email}`);
      setShowMessageDialog(false);
      setSelectedUser(null);
      setMessageContent('');
    }
  };

  const exportUsers = () => {
    const csvData = [
      ['Name', 'Email', 'Persona', 'Status', 'Roles', 'Joined'],
      ...filteredUsers.map(u => [
        `${u.first_name || ''} ${u.last_name || ''}`,
        u.email,
        u.persona_type,
        u.is_active ? 'Active' : 'Disabled',
        u.roles.join(', '),
        new Date(u.created_at).toLocaleDateString()
      ])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Users exported successfully');
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPersona = personaFilter === 'all' || u.persona_type === personaFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && u.is_active) ||
      (statusFilter === 'disabled' && !u.is_active);

    return matchesSearch && matchesPersona && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    disabled: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.roles.includes('admin')).length,
    supportAgents: users.filter(u => u.roles.includes('support_agent')).length,
    mentorshipAdmins: users.filter(u => u.roles.includes('mentorship_admin')).length,
    startups: users.filter(u => u.persona_type === 'startup_founder').length,
    mentors: users.filter(u => u.persona_type === 'mentor').length,
    providers: users.filter(u => u.persona_type === 'service_provider').length,
    funders: users.filter(u => u.persona_type === 'funder').length,
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">Comprehensive user and access control</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Disabled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.disabled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Support Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.supportAgents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Mentorship Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mentorshipAdmins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Startups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.startups}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Mentors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mentors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.providers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Funders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.funders}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              All Users
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admin Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>User Directory</CardTitle>
                    <CardDescription>View and manage all platform users</CardDescription>
                  </div>
                  <Button onClick={exportUsers} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="flex items-center gap-2 flex-1">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={personaFilter} onValueChange={setPersonaFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by persona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Personas</SelectItem>
                        <SelectItem value="startup_founder">Startup</SelectItem>
                        <SelectItem value="mentor">Mentor</SelectItem>
                        <SelectItem value="service_provider">Provider</SelectItem>
                        <SelectItem value="funder">Funder</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Persona</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell>
                            {u.first_name && u.last_name 
                              ? `${u.first_name} ${u.last_name}`
                              : 'N/A'}
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{u.persona_type}</Badge>
                          </TableCell>
                          <TableCell>
                            {u.is_active ? (
                              <Badge variant="default" className="bg-green-600">Active</Badge>
                            ) : (
                              <Badge variant="destructive">Disabled</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {u.roles.map((role: string) => (
                                <Badge key={role} variant="secondary" className="cursor-pointer group">
                                  <span>{role}</span>
                                  <button
                                    onClick={() => revokeRole(u.user_id, u.email, role)}
                                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title={`Revoke ${role} role`}
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                              {u.roles.length === 0 && (
                                <span className="text-sm text-muted-foreground">No roles</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(u.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleUserStatus(u.user_id, u.is_active, u.email)}
                                title={u.is_active ? 'Disable user' : 'Enable user'}
                              >
                                {u.is_active ? (
                                  <Ban className="w-4 h-4 text-red-600" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setNewPersona(u.persona_type);
                                  setShowPersonaDialog(true);
                                }}
                                title="Change persona"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setShowMessageDialog(true);
                                }}
                                title="Send message"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                              {u.roles.includes('admin') && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => revokeAdmin(u.user_id, u.email)}
                                  title="Revoke admin"
                                >
                                  <UserX className="w-4 h-4 text-orange-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Administrator Management
                </CardTitle>
                <CardDescription>
                  Grant or revoke admin privileges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="role-select">Role Type</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger id="role-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Full Admin</SelectItem>
                        <SelectItem value="support_agent">Support Agent</SelectItem>
                        <SelectItem value="mentorship_admin">Mentorship Admin</SelectItem>
                        <SelectItem value="mentor">Mentor</SelectItem>
                        <SelectItem value="advisor">Advisor</SelectItem>
                        <SelectItem value="funder">Funder</SelectItem>
                        <SelectItem value="startup">Startup</SelectItem>
                        <SelectItem value="smme">SMME</SelectItem>
                        <SelectItem value="service_provider">Service Provider</SelectItem>
                        <SelectItem value="software_provider">Software Provider</SelectItem>
                        <SelectItem value="learning_provider">Learning Provider</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={approveAdmin}>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Grant Access
                    </Button>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Current Administrators</h3>
                  <div className="space-y-2">
                    {users.filter(u => u.roles.includes('admin')).map(admin => (
                      <div key={admin.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{admin.first_name} {admin.last_name}</p>
                          <p className="text-sm text-muted-foreground">{admin.email}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => revokeAdmin(admin.user_id, admin.email)}
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showPersonaDialog} onOpenChange={setShowPersonaDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Persona</DialogTitle>
              <DialogDescription>
                Update the persona type for {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select value={newPersona} onValueChange={setNewPersona}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new persona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup_founder">Startup Founder</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="service_provider">Service Provider</SelectItem>
                  <SelectItem value="funder">Funder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPersonaDialog(false)}>
                Cancel
              </Button>
              <Button onClick={changeUserPersona}>
                Update Persona
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message to User</DialogTitle>
              <DialogDescription>
                Send a direct message to {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <textarea
                className="w-full min-h-[150px] p-3 border rounded-md"
                placeholder="Type your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                Cancel
              </Button>
              <Button onClick={sendMessageToUser}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>
                {confirmAction?.type === 'toggleStatus' 
                  ? `Are you sure you want to ${confirmAction.data.currentStatus ? 'disable' : 'enable'} ${confirmAction.data.email}?`
                  : confirmAction?.type === 'revokeAdmin'
                  ? `Are you sure you want to revoke admin access for ${confirmAction.data.email}?`
                  : 'Are you sure you want to proceed?'
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmAction}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}