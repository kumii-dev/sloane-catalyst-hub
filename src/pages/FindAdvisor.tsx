import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TriangleAvatar } from "@/components/ui/triangle-avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Star, 
  Search, 
  Filter, 
  Crown,
  Briefcase
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FindAdvisor = () => {
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdvisors();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // @ts-ignore - Supabase type inference issue
      const { data } = await supabase
        .from('service_categories')
        .select('id, name, slug')
        .eq('status', 'active')
        .is('parent_id', null);
      
      setCategories((data || []) as any[]);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const fetchAdvisors = async () => {
    try {
      const { data: advisorsData, error: advisorsError } = await supabase
        .from('mentors')
        .select('*')
        .eq('status', 'available')
        .order('rating', { ascending: false });

      if (advisorsError) throw advisorsError;

      const advisorList = advisorsData || [];
      if (advisorList.length === 0) {
        setAdvisors([]);
        setLoading(false);
        return;
      }

      const userIds = advisorList.map((a: any) => a.user_id).filter(Boolean);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, profile_picture_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      const profileByUserId = Object.fromEntries(
        (profilesData || []).map((p: any) => [p.user_id, p])
      );

      const merged = advisorList.map((a: any) => ({
        ...a,
        profiles: profileByUserId[a.user_id] || null,
      }));

      setAdvisors(merged);
    } catch (error) {
      console.error('Failed to load advisors:', error);
      toast({
        title: "Error",
        description: "Failed to load advisors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAdvisors = advisors.filter((advisor: any) => {
    const matchesSearch = !searchQuery || 
      advisor.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advisor.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advisor.profiles?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advisor.profiles?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advisor.expertise_areas?.some((area: string) => area.toLowerCase().includes(searchQuery.toLowerCase())) ||
      advisor.specializations?.some((spec: string) => spec.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || 
      advisor.specializations?.some((spec: string) => 
        spec.toLowerCase().includes(selectedCategory.toLowerCase())
      ) ||
      advisor.expertise_areas?.some((area: string) => 
        area.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    
    return matchesSearch && matchesCategory;
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
          <p className="mt-4 text-muted-foreground">Loading advisors & coaches...</p>
        </div>
      </div>
    );
  }

  const premiumAdvisors = filteredAdvisors.filter((a: any) => a.is_premium);
  const regularAdvisors = filteredAdvisors.filter((a: any) => !a.is_premium);

  return (
    <Layout showSidebar={true}>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background border-b">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Professional Advisory & Coaching
              </h1>
              <p className="text-xl md:text-2xl font-semibold mb-2">
                Expert Business Advisors & Coaches
              </p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Connect with experienced professionals for strategic business guidance, coaching, and consulting services. 
                Choose from <span className="font-semibold text-foreground">community advisory sessions</span> or{" "}
                <span className="font-semibold text-primary">premium consulting services</span>.
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Business Strategy
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  ⭐ Premium Consulting
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  👥 {advisors.length}+ Active Advisors
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
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by specialization, industry, or advisor name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-base"
                  />
                </div>
                
                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-[250px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="all">All Categories</SelectItem>
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
                    <SelectContent className="bg-background">
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

          {/* Premium Advisors Section */}
          {premiumAdvisors.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Crown className="w-6 h-6 text-rating" />
                Premium Advisors & Coaches
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {premiumAdvisors.map((advisor: any) => (
                  <Card 
                    key={advisor.id}
                    variant="premium"
                    className="relative hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/mentor/${advisor.id}`)}
                  >
                    <div className="absolute top-0 right-0 bg-gradient-to-br from-rating to-primary text-rating-foreground px-3 py-1 rounded-bl-lg text-xs font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      PREMIUM
                    </div>
                    <CardHeader className="pt-8 pb-4">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <TriangleAvatar
                          src={advisor.profiles?.profile_picture_url}
                          alt={`${advisor.profiles?.first_name || 'Advisor'}`}
                          fallback={`${advisor.profiles?.first_name?.[0] || ''}${advisor.profiles?.last_name?.[0] || ''}`}
                          className="w-24 h-24"
                          style={{ width: '96px', height: '96px' }}
                        />
                        {renderStars(advisor.rating || 0)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <h3 className="font-bold text-lg mb-1">
                          {advisor.profiles?.first_name} {advisor.profiles?.last_name}
                        </h3>
                        <p className="text-sm font-medium text-primary">{advisor.title}</p>
                        {advisor.company && (
                          <p className="text-sm text-muted-foreground">{advisor.company}</p>
                        )}
                      </div>

                      {advisor.specializations && advisor.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {advisor.specializations.slice(0, 2).map((spec: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-center">
                        <Badge 
                          className={`text-xs ${advisor.status === 'available' ? 'bg-success text-success-foreground' : ''}`}
                          variant={advisor.status === 'available' ? 'default' : 'secondary'}
                        >
                          {advisor.status === 'available' ? '✓ Available' : 'Not Available'}
                        </Badge>
                      </div>

                      {advisor.hourly_rate && (
                        <p className="text-center text-sm font-semibold text-primary">
                          ${advisor.hourly_rate}/hour
                        </p>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/mentor/${advisor.id}`);
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

          {/* Regular Advisors Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {premiumAdvisors.length > 0 
                ? "Community Advisors & Coaches" 
                : "Available Advisors & Coaches"}
            </h2>
            
            {filteredAdvisors.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">No advisors found matching your criteria</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
                <Button className="mt-4" onClick={() => navigate('/become-advisor')}>
                  Become an Advisor
                </Button>
              </Card>
            ) : regularAdvisors.length === 0 && premiumAdvisors.length > 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">All advisors showing are premium</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {regularAdvisors.map((advisor: any) => (
                  <Card 
                    key={advisor.id}
                    variant="glass"
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/mentor/${advisor.id}`)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <TriangleAvatar
                          src={advisor.profiles?.profile_picture_url}
                          alt={`${advisor.profiles?.first_name || 'Advisor'}`}
                          fallback={`${advisor.profiles?.first_name?.[0] || ''}${advisor.profiles?.last_name?.[0] || ''}`}
                          className="w-20 h-20"
                          style={{ width: '80px', height: '80px' }}
                        />
                        {renderStars(advisor.rating || 0)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <h3 className="font-semibold text-lg mb-1">
                          {advisor.profiles?.first_name} {advisor.profiles?.last_name}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground">{advisor.title}</p>
                        {advisor.company && (
                          <p className="text-sm text-muted-foreground">{advisor.company}</p>
                        )}
                      </div>

                      {advisor.specializations && advisor.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {advisor.specializations.slice(0, 2).map((spec: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-center">
                        <Badge 
                          className={`text-xs ${advisor.status === 'available' ? 'bg-success text-success-foreground' : ''}`}
                          variant={advisor.status === 'available' ? 'default' : 'secondary'}
                        >
                          {advisor.status === 'available' ? '✓ Available' : 'Not Available'}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/mentor/${advisor.id}`);
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

export default FindAdvisor;
