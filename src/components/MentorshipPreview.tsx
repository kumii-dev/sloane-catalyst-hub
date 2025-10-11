import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Star, 
  Calendar, 
  ArrowRight,
  CheckCircle,
  Crown,
  UsersRound
} from "lucide-react";

const MentorshipPreview = () => {
  const [featuredMentors, setFeaturedMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = [
    { icon: CheckCircle, label: "Free Sessions", count: "Available" },
    { icon: Crown, label: "Premium Sessions", count: "Expert Level" },
    { icon: UsersRound, label: "Active Mentors", count: "8K+" }
  ];

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const { data: mentors, error } = await supabase
          .from('mentors')
          .select(`
            id,
            title,
            company,
            rating,
            status,
            user_id
          `)
          .eq('status', 'available')
          .order('is_premium', { ascending: false })
          .limit(3);

        if (error) throw error;

        if (!mentors || mentors.length === 0) {
          setFeaturedMentors([]);
          setLoading(false);
          return;
        }

        // Fetch profiles separately
        const userIds = mentors.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, profile_picture_url')
          .in('user_id', userIds);

        const formattedMentors = mentors.map((mentor: any) => {
          const profile = profiles?.find(p => p.user_id === mentor.user_id);
          return {
            id: mentor.id,
            name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Anonymous',
            title: mentor.title,
            company: mentor.company,
            rating: mentor.rating || 0,
            image: profile?.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.user_id}`
          };
        });

        setFeaturedMentors(formattedMentors);
      } catch (error) {
        console.error('Error fetching mentors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-muted/30 via-background to-muted/50 overflow-hidden">
      <div className="absolute inset-0 hero-gradient opacity-10" />
      <div className="mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Accelerate Your Growth with 
            <span className="block mt-2 bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              Expert Mentorship
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect 1:1 with industry leaders for personalized guidance. Choose from free community 
            mentorship or premium professional sessions.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border border-white/20">
                <Icon className="h-5 w-5 text-accent" />
                <div>
                  <div className="font-semibold text-sm">{stat.count}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Featured Mentors */}
        {loading ? (
          <div className="text-center py-8 mb-12">
            <p className="text-muted-foreground">Loading mentors...</p>
          </div>
        ) : featuredMentors.length === 0 ? (
          <div className="text-center py-8 mb-12">
            <p className="text-muted-foreground">No mentors available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {featuredMentors.map((mentor) => (
              <Link to={`/mentor/${mentor.id}`} key={mentor.id}>
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <img
                  src={mentor.image}
                  alt={mentor.name}
                  className="h-16 w-16 rounded-full object-cover mx-auto mb-4 ring-2 ring-background shadow-lg"
                />
                <h3 className="font-semibold text-lg mb-1">{mentor.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">{mentor.title}</p>
                <p className="text-xs text-muted-foreground mb-3">{mentor.company}</p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{mentor.rating}</span>
                </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Available
                  </Badge>
                </CardContent>
              </Card>
            </Link>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link to="/find-mentor">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                <Calendar className="mr-2 h-5 w-5" />
                Find a Mentor
              </Button>
            </Link>
            <Link to="/become-mentor">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-accent/30 hover:bg-accent/10">
                <Users className="mr-2 h-5 w-5" />
                Become a Mentor
              </Button>
            </Link>
          </div>
          
          <Link to="/mentorship" className="inline-flex items-center text-accent hover:text-accent/80 transition-colors">
            Explore all mentorship features
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MentorshipPreview;