import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserPlus, Building, Users, DollarSign, CheckCircle, XCircle, Eye, ArrowLeft } from 'lucide-react';

export default function RegistrationsOverview() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingProviders, setPendingProviders] = useState<any[]>([]);
  const [pendingFunders, setPendingFunders] = useState<any[]>([]);
  const [pendingMentors, setPendingMentors] = useState<any[]>([]);
  const [pendingAdvisors, setPendingAdvisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
      .eq('role', 'admin')
      .single();

    if (error || !data) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    setIsAdmin(true);
    fetchAllPendingRegistrations();
  };

  const fetchAllPendingRegistrations = async () => {
    setLoading(true);

    // Fetch pending service providers
    const { data: providers } = await supabase
      .from('service_providers')
      .select('*')
      .eq('vetting_status', 'pending')
      .order('created_at', { ascending: false });

    // Fetch pending mentors (those without approval)
    const { data: mentors } = await supabase
      .from('mentors')
      .select('*')
      .eq('status', 'unavailable')
      .order('created_at', { ascending: false });

    // Fetch new funders (created recently, is_verified = false)
    const { data: funders } = await supabase
      .from('funders')
      .select('*')
      .eq('is_verified', false)
      .order('created_at', { ascending: false });

    // Fetch pending advisors
    const { data: advisors } = await supabase
      .from('advisors')
      .select('*')
      .eq('vetting_status', 'pending')
      .order('created_at', { ascending: false });

    setPendingProviders(providers || []);
    setPendingMentors(mentors || []);
    setPendingFunders(funders || []);
    setPendingAdvisors(advisors || []);
    setLoading(false);
  };

  const handleProviderApproval = async (providerId: string, approved: boolean) => {
    // First get the provider details
    const { data: provider, error: fetchError } = await supabase
      .from('service_providers')
      .select('user_id, contact_person, company_name')
      .eq('id', providerId)
      .single();

    if (fetchError || !provider) {
      toast.error('Failed to fetch provider details');
      return;
    }

    // Validate user_id
    const isValidUserId = provider.user_id && provider.user_id !== '00000000-0000-0000-0000-000000000000';
    
    if (!isValidUserId) {
      toast.error('Invalid user account. Provider must have a valid registered account before approval.');
      console.error('Invalid user_id:', provider.user_id);
      return;
    }

    const { error } = await supabase
      .from('service_providers')
      .update({
        vetting_status: approved ? 'approved' : 'rejected'
      })
      .eq('id', providerId);

    if (error) {
      toast.error('Failed to update provider');
      console.error(error);
    } else {
      toast.success(`Provider ${approved ? 'approved' : 'rejected'}`);
      
      // Send notification message if approved
      if (approved) {
        // Create or get conversation with the provider
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            conversation_type: 'direct',
            title: 'Application Status Update'
          })
          .select()
          .single();

        if (conversation && !convError) {
          // Add provider as participant
          await supabase.from('conversation_participants').insert({
            conversation_id: conversation.id,
            user_id: provider.user_id
          });

          // Send approval message
          await supabase.from('conversation_messages').insert({
            conversation_id: conversation.id,
            sender_id: user!.id,
            content: `🎉 Congratulations ${provider.contact_person || provider.company_name}!\n\nYour application has been approved, and you can now start creating your listings on the platform.\n\n📋 Next Steps:\n• Please read and accept the platform terms and conditions\n• Visit your dashboard to view and manage your listings\n• Start showcasing your services to our community\n\nWelcome to the platform!`,
            message_type: 'text'
          });
        }
      }
      
      fetchAllPendingRegistrations();
    }
  };

  const handleMentorApproval = async (mentorId: string, approved: boolean) => {
    const { error } = await supabase
      .from('mentors')
      .update({
        status: approved ? 'available' : 'unavailable'
      })
      .eq('id', mentorId);

    if (error) {
      toast.error('Failed to update mentor');
      console.error(error);
    } else {
      toast.success(`Mentor ${approved ? 'approved' : 'rejected'}`);
      fetchAllPendingRegistrations();
    }
  };

  const handleFunderApproval = async (funderId: string, approved: boolean) => {
    const { error } = await supabase
      .from('funders')
      .update({
        is_verified: approved
      })
      .eq('id', funderId);

    if (error) {
      toast.error('Failed to update funder');
      console.error(error);
    } else {
      toast.success(`Funder ${approved ? 'verified' : 'rejected'}`);
      fetchAllPendingRegistrations();
    }
  };

  const handleAdvisorApproval = async (advisorId: string, approved: boolean) => {
    // First get the advisor details
    const { data: advisor, error: fetchError } = await supabase
      .from('advisors')
      .select('user_id')
      .eq('id', advisorId)
      .single();

    if (fetchError || !advisor) {
      toast.error('Failed to fetch advisor details');
      return;
    }

    // Validate user_id
    const isValidUserId = advisor.user_id && advisor.user_id !== '00000000-0000-0000-0000-000000000000';
    
    if (!isValidUserId) {
      toast.error('Invalid user account. Advisor must have a valid registered account before approval.');
      console.error('Invalid user_id:', advisor.user_id);
      return;
    }

    const { error } = await supabase
      .from('advisors')
      .update({
        vetting_status: approved ? 'approved' : 'rejected',
        status: approved ? 'available' : 'unavailable'
      })
      .eq('id', advisorId);

    if (error) {
      toast.error('Failed to update advisor');
      console.error(error);
    } else {
      toast.success(`Advisor ${approved ? 'approved' : 'rejected'}`);
      
      // Assign advisor role if approved
      if (approved) {
        await supabase.from('user_roles').insert({
          user_id: advisor.user_id,
          role: 'advisor'
        });
      }
      
      fetchAllPendingRegistrations();
    }
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
          <h1 className="text-4xl font-bold mb-2">New Registrations</h1>
          <p className="text-muted-foreground">Review and approve new registrations across all personas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Providers</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingProviders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Advisors</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAdvisors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Mentors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingMentors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unverified Funders</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingFunders.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="providers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="providers">Service Providers</TabsTrigger>
            <TabsTrigger value="advisors">Advisors</TabsTrigger>
            <TabsTrigger value="mentors">Mentors</TabsTrigger>
            <TabsTrigger value="funders">Funders</TabsTrigger>
          </TabsList>

          <TabsContent value="providers">
            <Card>
              <CardHeader>
                <CardTitle>Pending Service Providers</CardTitle>
                <CardDescription>Review and approve service provider applications</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : pendingProviders.length === 0 ? (
                  <p className="text-muted-foreground">No pending providers</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingProviders.map((provider) => (
                        <TableRow key={provider.id}>
                          <TableCell>
                            {provider.contact_person || 'N/A'}
                          </TableCell>
                          <TableCell>{provider.contact_email}</TableCell>
                          <TableCell>{provider.company_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{provider.vetting_status}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(provider.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleProviderApproval(provider.id, true)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleProviderApproval(provider.id, false)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
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

          <TabsContent value="advisors">
            <Card>
              <CardHeader>
                <CardTitle>Pending Advisors</CardTitle>
                <CardDescription>Review and approve advisor applications</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : pendingAdvisors.length === 0 ? (
                  <p className="text-muted-foreground">No pending advisors</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingAdvisors.map((advisor) => (
                        <TableRow key={advisor.id}>
                          <TableCell>
                            {advisor.full_name || 'N/A'}
                          </TableCell>
                          <TableCell>{advisor.title}</TableCell>
                          <TableCell>{advisor.company}</TableCell>
                          <TableCell>{advisor.years_experience} years</TableCell>
                          <TableCell>
                            {new Date(advisor.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleAdvisorApproval(advisor.id, true)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleAdvisorApproval(advisor.id, false)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
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

          <TabsContent value="mentors">
            <Card>
              <CardHeader>
                <CardTitle>Pending Mentors</CardTitle>
                <CardDescription>Review and approve mentor applications</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : pendingMentors.length === 0 ? (
                  <p className="text-muted-foreground">No pending mentors</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingMentors.map((mentor) => (
                        <TableRow key={mentor.id}>
                          <TableCell>
                            {mentor.full_name || 'N/A'}
                          </TableCell>
                          <TableCell>{mentor.email}</TableCell>
                          <TableCell>{mentor.title}</TableCell>
                          <TableCell>{mentor.company}</TableCell>
                          <TableCell>
                            {new Date(mentor.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleMentorApproval(mentor.id, true)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleMentorApproval(mentor.id, false)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
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

          <TabsContent value="funders">
            <Card>
              <CardHeader>
                <CardTitle>Unverified Funders</CardTitle>
                <CardDescription>Review and verify funder registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : pendingFunders.length === 0 ? (
                  <p className="text-muted-foreground">No unverified funders</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingFunders.map((funder) => (
                        <TableRow key={funder.id}>
                          <TableCell>
                            Contact Person
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>{funder.organization_name}</TableCell>
                          <TableCell>{funder.organization_type}</TableCell>
                          <TableCell>
                            {new Date(funder.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleFunderApproval(funder.id, true)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleFunderApproval(funder.id, false)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
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
        </Tabs>
      </div>
    </Layout>
  );
}
