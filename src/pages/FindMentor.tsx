import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Star, 
  Users, 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FindMentor = () => {
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
      // Fetch mentors first (no embedded relations to avoid FK dependency)
      const { data: mentorsData, error: mentorsError } = await supabase
        .from('mentors')
        .select('*')
        .eq('status', 'available')
        .order('rating', { ascending: false });

      if (mentorsError) throw mentorsError;

      const mentorList = mentorsData || [];
      if (mentorList.length === 0) {
        setMentors([]);
        return;
      }

      // Fetch related profiles in a separate query using user_id list
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
      mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.profiles?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.profiles?.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

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

  return (
    <Layout showSidebar={true}>
      <div className="bg-background">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-background via-background/95 to-muted/20 py-12 px-4 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-20" />
        <div className="mx-auto max-w-6xl relative z-10">
          <h1 className="mb-4 text-4xl font-bold">Find Your Perfect Mentor</h1>
          <p className="text-lg text-muted-foreground">
            Discover industry experts ready to guide your career journey
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 border-b">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search mentors, skills, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="sessions">Most Sessions</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Mentors Grid */}
      <section className="py-8 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              {filteredMentors.length} mentors found
            </p>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>

          {filteredMentors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No mentors found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMentors.map((mentor) => (
                <Card key={mentor.id} className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    {mentor.is_premium && (
                      <Badge className="mb-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        PREMIUM
                      </Badge>
                    )}
                    
                    <div className="mb-4 flex items-start gap-4">
                      <img
                        src={mentor.profiles?.profile_picture_url || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`}
                        alt={`${mentor.profiles?.first_name} ${mentor.profiles?.last_name}`}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-background"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {mentor.profiles?.first_name} {mentor.profiles?.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{mentor.title}</p>
                        {mentor.company && (
                          <p className="text-xs text-muted-foreground">{mentor.company}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{mentor.rating || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{mentor.total_sessions || 0} sessions</span>
                      </div>
                      {mentor.experience_years && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{mentor.experience_years}y exp</span>
                        </div>
                      )}
                    </div>
                    
                    {mentor.expertise_areas && (
                      <div className="mb-4 flex flex-wrap gap-1">
                        {mentor.expertise_areas.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {mentor.expertise_areas.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{mentor.expertise_areas.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Available
                        </Badge>
                        {mentor.hourly_rate && (
                          <div className="flex items-center gap-1 text-sm font-semibold">
                            <DollarSign className="h-4 w-4" />
                            {mentor.hourly_rate}/hr
                          </div>
                        )}
                      </div>
                      <Button variant="hero" size="sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      </div>
    </Layout>
  );
};

export default FindMentor;