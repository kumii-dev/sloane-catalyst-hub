import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Save } from 'lucide-react';
import BasicProfileEditor from '@/components/profile/BasicProfileEditor';
import StartupProfileEditor from '@/components/profile/StartupProfileEditor';
import FunderProfileEditor from '@/components/profile/FunderProfileEditor';
import MentorProfileEditor from '@/components/profile/MentorProfileEditor';
import ServiceProviderProfileEditor from '@/components/profile/ServiceProviderProfileEditor';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setProfile(data || {
        id: user?.id,
        user_id: user?.id,
        profile_completion_percentage: 0
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBasic = async (data: any) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      
      fetchProfile();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Please sign in to view your profile.</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Edit Profile</h1>
              <p className="text-muted-foreground mt-1">
                Complete your profile for better matching opportunities
              </p>
            </div>
            {profile && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Profile Completion</p>
                <div className="flex items-center gap-3">
                  <Progress value={profile.profile_completion_percentage || 0} className="w-32" />
                  <span className="font-semibold text-lg">{profile.profile_completion_percentage || 0}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your persona: {profile?.persona_type?.replace('_', ' ').toUpperCase() || 'Not selected'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                {profile?.persona_type === 'smme_startup' && (
                  <TabsTrigger value="startup">Business Profile</TabsTrigger>
                )}
                {profile?.persona_type === 'funder' && (
                  <TabsTrigger value="funder">Funder Profile</TabsTrigger>
                )}
                {profile?.persona_type === 'professional' && (
                  <TabsTrigger value="mentor">Professional Profile</TabsTrigger>
                )}
                {profile?.persona_type === 'service_provider' && (
                  <TabsTrigger value="provider">Provider Profile</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-6">
                <BasicProfileEditor
                  profile={profile}
                  onSave={handleSaveBasic}
                  saving={saving}
                />
              </TabsContent>

              {profile?.persona_type === 'smme_startup' && (
                <TabsContent value="startup" className="space-y-4 mt-6">
                  <StartupProfileEditor userId={user?.id || ''} />
                </TabsContent>
              )}

              {profile?.persona_type === 'funder' && (
                <TabsContent value="funder" className="space-y-4 mt-6">
                  <FunderProfileEditor userId={user?.id || ''} />
                </TabsContent>
              )}

              {profile?.persona_type === 'professional' && (
                <TabsContent value="mentor" className="space-y-4 mt-6">
                  <MentorProfileEditor userId={user?.id || ''} />
                </TabsContent>
              )}

              {profile?.persona_type === 'service_provider' && (
                <TabsContent value="provider" className="space-y-4 mt-6">
                  <ServiceProviderProfileEditor userId={user?.id || ''} />
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditProfile;