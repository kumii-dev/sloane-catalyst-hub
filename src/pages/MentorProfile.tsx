import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  Calendar,
  Globe,
  Share2,
  CheckCircle2,
  User,
  BookOpen,
  Users,
  Lightbulb,
  ArrowLeft,
  Edit
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookSessionDialog } from "@/components/booking/BookSessionDialog";

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchMentorProfile();
    }
  }, [id]);

  const fetchMentorProfile = async () => {
    try {
      // Check if this is the user's own profile
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: mentorData, error: mentorError } = await supabase
        .from('mentors')
        .select('*')
        .eq('id', id)
        .single();

      if (mentorError) throw mentorError;
      
      if (user && mentorData.user_id === user.id) {
        setIsOwnProfile(true);
      }

      if (mentorData) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, profile_picture_url, bio')
          .eq('user_id', mentorData.user_id)
          .single();

        if (profileError) throw profileError;

        // Fetch mentor categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('mentor_categories')
          .select(`
            mentoring_categories (
              id,
              name,
              icon
            )
          `)
          .eq('mentor_id', id);

        if (!categoriesError && categoriesData) {
          setCategories(categoriesData.map((mc: any) => mc.mentoring_categories));
        }

        setMentor({
          ...mentorData,
          profiles: profileData
        });
      }
    } catch (error) {
      console.error('Failed to load mentor profile:', error);
      toast({
        title: "Error",
        description: "Failed to load mentor profile",
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
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
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
          <p className="mt-4 text-muted-foreground">Loading mentor profile...</p>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <Layout showSidebar={true}>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">Mentor not found</p>
            <Button className="mt-4" onClick={() => navigate('/find-mentor')}>
              Back to Find Mentors
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur">
          <div className="container mx-auto px-4 py-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/find-mentor')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Mentors
            </Button>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-32 w-32 ring-4 ring-primary/20">
                <AvatarImage 
                  src={mentor.profiles?.profile_picture_url} 
                  alt={`${mentor.profiles?.first_name || 'Mentor'}`}
                />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/20 to-accent/20">
                  {mentor.profiles?.first_name?.[0]}
                  {mentor.profiles?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold">
                        {mentor.profiles?.first_name} {mentor.profiles?.last_name}
                      </h1>
                      {mentor.is_premium && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                          PREMIUM
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg text-primary font-medium">{mentor.title}</p>
                    {mentor.company && (
                      <p className="text-muted-foreground">Speaker at {mentor.company}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <Badge variant="secondary">English</Badge>
                      {renderStars(mentor.rating || 0)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isOwnProfile && (
                      <Button
                        variant="outline"
                        onClick={() => navigate('/edit-mentor-profile')}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                    <Button variant="outline" size="icon">
                      <Calendar className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Globe className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                  <TabsTrigger value="profile" className="rounded-none border-b-2 data-[state=active]:border-primary">
                    <User className="w-4 h-4 mr-2" />
                    Mentor Profile
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-none border-b-2 data-[state=active]:border-primary">
                    <Star className="w-4 h-4 mr-2" />
                    Reviews
                    <Badge variant="secondary" className="ml-2">8</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="bookshelf" className="rounded-none border-b-2 data-[state=active]:border-primary">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Bookshelf
                    <Badge variant="secondary" className="ml-2">9</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="similar" className="rounded-none border-b-2 data-[state=active]:border-primary">
                    <Users className="w-4 h-4 mr-2" />
                    Similar Mentors
                  </TabsTrigger>
                  <TabsTrigger value="nuggets" className="rounded-none border-b-2 data-[state=active]:border-primary">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Learning Nuggets
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="rounded-none border-b-2 data-[state=active]:border-primary">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                    <div className="ml-2 w-2 h-2 bg-green-500 rounded-full"></div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="mb-6">
                        <h2 className="text-4xl font-bold text-primary mb-4" style={{ fontFamily: 'cursive' }}>
                          Profile
                        </h2>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <div 
                            className="text-muted-foreground leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
                            dangerouslySetInnerHTML={{ 
                              __html: mentor.profiles?.bio || "I think being a mentor is an honour and a mission because it gives a chance to build a valuable relationship between the mentor and the mentee but also to build a positive and deep impact on this latter's private and professional life." 
                            }}
                          />
                        </div>

                        {mentor.expertise_areas && mentor.expertise_areas.length > 0 && (
                          <div>
                            <h3 className="text-xl font-semibold mb-3">Expertise Areas</h3>
                            <div className="flex flex-wrap gap-2">
                              {mentor.expertise_areas.map((area: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-sm">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {mentor.experience_years && (
                          <div>
                            <h3 className="text-xl font-semibold mb-3">Experience</h3>
                            <p className="text-muted-foreground">
                              {mentor.experience_years}+ years of professional experience
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground text-center py-8">
                        No reviews yet
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="bookshelf" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground text-center py-8">
                        No books shared yet
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="similar" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground text-center py-8">
                        Finding similar mentors...
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="nuggets" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground text-center py-8">
                        No learning nuggets yet
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="schedule" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground text-center py-8">
                        Schedule a session to see availability
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Certified Mentor Badge */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-500 rounded-full p-2">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Certified Mentor</h3>
                      <p className="text-sm text-muted-foreground">
                        Provided {mentor.total_sessions || 0}+ hours of successful mentorship on this platform.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Availability Status */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Badge 
                      variant={mentor.status === 'available' ? 'default' : 'secondary'}
                      className="text-base px-4 py-2"
                    >
                      {mentor.status === 'available' ? '✓ Available' : 'Not Available'}
                    </Badge>
                    
                    {mentor.hourly_rate && (
                      <div className="text-2xl font-bold">
                        ${mentor.hourly_rate}/hour
                      </div>
                    )}
                    
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => setBookingDialogOpen(true)}
                    >
                      Book Session
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              {categories.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category: any) => (
                        <Badge key={category.id} variant="secondary">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <BookSessionDialog 
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        mentor={mentor}
      />
    </Layout>
  );
};

export default MentorProfile;
