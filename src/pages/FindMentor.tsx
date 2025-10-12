import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Star, 
  Search, 
  Filter, 
  Crown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FindMentor = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMentors();
    fetchCategories();
  }, []);

  const fetchMentors = async () => {
    try {
      const { data: mentorsData, error: mentorsError } = await supabase
        .from('mentors')
        .select('*')
        .eq('status', 'available')
        .order('rating', { ascending: false });

      if (mentorsError) throw mentorsError;

      const mentorList = mentorsData || [];
      if (mentorList.length === 0) {
        setMentors([]);
        setLoading(false);
        return;
      }

      const userIds = mentorList.map((m: any) => m.user_id).filter(Boolean);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, profile_picture_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      const profileByUserId = Object.fromEntries(
        (profilesData || []).map((p: any) => [p.user_id, p])
      );

      const merged = mentorList.map((m: any) => ({
        ...m,
        profiles: profileByUserId[m.user_id] || null,
      }));

      setMentors(merged);
    } catch (error) {
      console.error('Failed to load mentors:', error);
      toast({
        title: "Error",
        description: "Failed to load mentors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('mentoring_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = !searchQuery || 
      mentor.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.profiles?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.profiles?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise_areas?.some((area: string) => area.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-rating text-rating"
                : "fill-rating-muted text-rating-muted"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-semibold">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading mentors...</p>
        </div>
      </div>
    );
  }

  const premiumMentors = filteredMentors.filter((m: any) => m.is_premium);
  const regularMentors = filteredMentors.filter((m: any) => !m.is_premium);

  return (
    <Layout showSidebar={true}>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background border-b">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Unlock Your Potential, Faster
              </h1>
              <p className="text-xl md:text-2xl font-semibold mb-2">
                Expert Mentors Await
              </p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Connect 1:1 with industry leaders for personalized guidance and career acceleration. 
                Choose from <span className="font-semibold text-foreground">free community mentorship</span> or{" "}
                <span className="font-semibold text-primary">premium professional sessions</span>.
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  ✓ Free Sessions Available
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  ⭐ Premium Expert Sessions
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  👥 {mentors.length}+ Active Mentors
                </Badge>
              </div>
            </div>
          </div>
        </div>

          {/* Search and Filters */}
        <div className="container mx-auto px-4 py-8">
          <Card variant="glass" className="mb-8 shadow-lg">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Main Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="What do you need help with? E.g., improving React testing with Jest..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-base"
                  />
                </div>
                
                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-[250px]">
                      <SelectValue placeholder="Topic (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All topics</SelectItem>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="sessions">Most Sessions</SelectItem>
                      <SelectItem value="recent">Recently Joined</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" className="w-full md:w-auto">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Mentors Section */}
          {premiumMentors.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Crown className="w-6 h-6 text-rating" />
                Meet our premium mentors!
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {premiumMentors.map((mentor: any) => (
                  <Card 
                    key={mentor.id}
                    variant="premium"
                    className="relative hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/mentor/${mentor.id}`)}
                  >
                    <div className="absolute top-0 right-0 bg-gradient-to-br from-rating to-primary text-rating-foreground px-3 py-1 rounded-bl-lg text-xs font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      PREMIUM
                    </div>
                    <CardHeader className="pt-8 pb-4">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <Avatar className="h-24 w-24 ring-2 ring-primary/20">
                          <AvatarImage 
                            src={mentor.profiles?.profile_picture_url} 
                            alt={`${mentor.profiles?.first_name || 'Mentor'}`}
                          />
                          <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                            {mentor.profiles?.first_name?.[0]}
                            {mentor.profiles?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        {renderStars(mentor.rating || 0)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <h3 className="font-bold text-lg mb-1">
                          {mentor.profiles?.first_name} {mentor.profiles?.last_name}
                        </h3>
                        <p className="text-sm font-medium text-primary">{mentor.title}</p>
                        {mentor.company && (
                          <p className="text-sm text-muted-foreground">{mentor.company}</p>
                        )}
                      </div>

                      {mentor.expertise_areas && mentor.expertise_areas.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {mentor.expertise_areas.slice(0, 3).map((area: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-center">
                        <Badge 
                          className={`text-xs ${mentor.status === 'available' ? 'bg-success text-success-foreground' : ''}`}
                          variant={mentor.status === 'available' ? 'default' : 'secondary'}
                        >
                          {mentor.status === 'available' ? '✓ Available' : 'Not Available'}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/mentor/${mentor.id}`);
                        }}
                      >
                        Book Session
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular Mentors Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {premiumMentors.length > 0 
                ? "Get inspired by some of our best mentors!" 
                : "Available Mentors"}
            </h2>
            
            {filteredMentors.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">No mentors found matching your criteria</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
              </Card>
            ) : regularMentors.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">All mentors showing are premium</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {regularMentors.map((mentor: any) => (
                  <Card 
                    key={mentor.id}
                    variant="glass"
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/mentor/${mentor.id}`)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <Avatar className="h-20 w-20">
                          <AvatarImage 
                            src={mentor.profiles?.profile_picture_url} 
                            alt={`${mentor.profiles?.first_name || 'Mentor'}`}
                          />
                          <AvatarFallback className="text-xl">
                            {mentor.profiles?.first_name?.[0]}
                            {mentor.profiles?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        {renderStars(mentor.rating || 0)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <h3 className="font-semibold text-lg mb-1">
                          {mentor.profiles?.first_name} {mentor.profiles?.last_name}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground">{mentor.title}</p>
                        {mentor.company && (
                          <p className="text-sm text-muted-foreground">{mentor.company}</p>
                        )}
                      </div>

                      {mentor.expertise_areas && mentor.expertise_areas.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {mentor.expertise_areas.slice(0, 3).map((area: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-center">
                        <Badge 
                          className={`text-xs ${mentor.status === 'available' ? 'bg-success text-success-foreground' : ''}`}
                          variant={mentor.status === 'available' ? 'default' : 'secondary'}
                        >
                          {mentor.status === 'available' ? '✓ Available' : 'Not Available'}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/mentor/${mentor.id}`);
                        }}
                      >
                        View Profile
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FindMentor;
