import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TriangleAvatar } from "@/components/ui/triangle-avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Briefcase,
  MapPin,
  Mail,
  Linkedin,
  Calendar,
  Clock,
  MessageSquare,
  Crown,
  Award,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookSessionDialog } from "@/components/booking/BookSessionDialog";

const AdvisorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [advisor, setAdvisor] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAdvisorProfile();
    }
  }, [id]);

  const fetchAdvisorProfile = async () => {
    try {
      // Fetch advisor details
      const { data: advisorData, error: advisorError } = await supabase
        .from('advisors')
        .select('*')
        .eq('id', id)
        .eq('vetting_status', 'approved')
        .single();

      if (advisorError) throw advisorError;

      if (!advisorData) {
        toast({
          title: "Not Found",
          description: "Advisor profile not found",
          variant: "destructive"
        });
        navigate('/find-advisor');
        return;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', advisorData.user_id)
        .single();

      if (profileError) throw profileError;

      // Fetch advisor categories
      const { data: categoriesData } = await supabase
        .from('advisor_categories')
        .select(`
          service_categories:category_id (
            id,
            name,
            slug
          )
        `)
        .eq('advisor_id', id);

      setAdvisor({
        ...advisorData,
        categories: categoriesData?.map((c: any) => c.service_categories).filter(Boolean) || []
      });
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load advisor profile:', error);
      toast({
        title: "Error",
        description: "Failed to load advisor profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-rating text-rating"
                : "fill-rating-muted text-rating-muted"
            }`}
          />
        ))}
        <span className="ml-2 text-lg font-semibold">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading advisor profile...</p>
        </div>
      </div>
    );
  }

  if (!advisor || !profile) {
    return null;
  }

  return (
    <Layout showSidebar={true}>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <Card variant={advisor.is_premium ? "premium" : "glass"} className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col items-center md:items-start">
                  <TriangleAvatar
                    src={profile.profile_picture_url}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    fallback={`${profile.first_name?.[0]}${profile.last_name?.[0]}`}
                    className="w-32 h-32 mb-4"
                    style={{ width: '128px', height: '128px' }}
                  />
                  {advisor.is_premium && (
                    <Badge className="bg-gradient-to-r from-rating to-primary text-rating-foreground">
                      <Crown className="w-4 h-4 mr-1" />
                      Premium Advisor
                    </Badge>
                  )}
                </div>

                {/* Profile Details */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">
                        {profile.first_name} {profile.last_name}
                      </h1>
                      <p className="text-xl text-primary font-semibold mb-2">{advisor.title}</p>
                      {advisor.company && (
                        <p className="text-lg text-muted-foreground flex items-center gap-2">
                          <Briefcase className="w-5 h-5" />
                          {advisor.company}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 mt-4 md:mt-0">
                      <Button 
                        size="lg" 
                        onClick={() => setShowBookingDialog(true)}
                        disabled={advisor.status !== 'available'}
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        {advisor.status === 'available' ? 'Book Session' : 'Not Available'}
                      </Button>
                      <Button size="lg" variant="outline">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      {renderStars(advisor.rating || 0)}
                      <span className="text-sm text-muted-foreground">
                        ({advisor.total_reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-5 h-5" />
                      <span>{advisor.total_sessions} sessions completed</span>
                    </div>
                    {advisor.hourly_rate && (
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <Clock className="w-5 h-5" />
                        <span>${advisor.hourly_rate}/hour</span>
                      </div>
                    )}
                  </div>

                  {/* Location & Contact */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {profile.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {profile.location}
                      </div>
                    )}
                    {profile.linkedin_url && (
                      <a 
                        href={profile.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="expertise">Expertise</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>About {profile.first_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {advisor.bio && (
                    <div>
                      <h3 className="font-semibold mb-2">Biography</h3>
                      <p className="text-muted-foreground leading-relaxed">{advisor.bio}</p>
                    </div>
                  )}

                  {advisor.years_experience && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        Experience
                      </h3>
                      <p className="text-muted-foreground">{advisor.years_experience}+ years of professional experience</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Expertise Tab */}
            <TabsContent value="expertise">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Areas of Expertise</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {advisor.expertise_areas && advisor.expertise_areas.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Expertise Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        {advisor.expertise_areas.map((area: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-sm">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {advisor.specializations && advisor.specializations.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Specializations</h3>
                      <div className="flex flex-wrap gap-2">
                        {advisor.specializations.map((spec: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-sm">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {advisor.categories && advisor.categories.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Service Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {advisor.categories.map((category: any, idx: number) => (
                          <Badge key={idx} className="text-sm">
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Client Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {advisor.total_reviews > 0 ? (
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          Reviews will be displayed here once available
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reviews yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Booking Dialog */}
      {showBookingDialog && advisor && (
        <BookSessionDialog
          open={showBookingDialog}
          onOpenChange={setShowBookingDialog}
          mentor={{
            id: advisor.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            hourly_rate: advisor.hourly_rate,
            profile_picture_url: profile.profile_picture_url,
            title: advisor.title
          }}
        />
      )}
    </Layout>
  );
};

export default AdvisorProfile;
