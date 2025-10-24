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
  const [isEditing, setIsEditing] = useState(false);

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
      
      await fetchProfile();
      setIsEditing(false);
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
              <h1 className="text-3xl font-bold">{isEditing ? 'Edit Profile' : 'My Profile'}</h1>
              <p className="text-muted-foreground mt-1">
                {isEditing ? 'Complete your profile for better matching opportunities' : 'View and manage your profile information'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {profile && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Profile Completion</p>
                  <div className="flex items-center gap-3">
                    <Progress value={profile.profile_completion_percentage || 0} className="w-32" />
                    <span className="font-semibold text-lg">{profile.profile_completion_percentage || 0}%</span>
                  </div>
                </div>
              )}
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  <Save className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
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
                {isEditing ? (
                  <BasicProfileEditor
                    profile={profile}
                    onSave={handleSaveBasic}
                    saving={saving}
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="text-lg mt-1">{profile?.full_name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-lg mt-1">{profile?.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-lg mt-1">{profile?.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        <p className="text-lg mt-1">{profile?.location || 'Not provided'}</p>
                      </div>
                    </div>
                    {profile?.bio && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Bio</label>
                        <p className="text-lg mt-1">{profile.bio}</p>
                      </div>
                    )}
                    {profile?.skills?.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Skills</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {profile.skills.map((skill: string) => (
                            <span key={skill} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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