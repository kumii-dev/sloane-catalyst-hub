import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { 
  Users, 
  Star, 
  Calendar, 
  Code, 
  Briefcase, 
  Palette, 
  TrendingUp, 
  User, 
  DollarSign,
  CheckCircle,
  Crown,
  UsersRound
} from "lucide-react";

const Mentorship = () => {
  const [featuredMentors, setFeaturedMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = [
    { icon: CheckCircle, label: "Free Sessions Available", color: "text-green-600" },
    { icon: Crown, label: "Premium Expert Sessions", color: "text-purple-600" },
    { icon: UsersRound, label: "8K+ Active Mentors", color: "text-blue-600" }
  ];

  const categories = [
    { icon: Code, name: "Technology", description: "Software development, AI, data science" },
    { icon: Briefcase, name: "Business", description: "Strategy, entrepreneurship, leadership" },
    { icon: Palette, name: "Design", description: "UI/UX, graphic design, product design" },
    { icon: TrendingUp, name: "Marketing", description: "Digital marketing, growth, branding" },
    { icon: User, name: "Career", description: "Career transitions, interviews, networking" },
    { icon: DollarSign, name: "Finance", description: "Investment, financial planning, fintech" }
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
            total_sessions,
            expertise_areas,
            is_premium,
            status,
            user_id,
            profiles:user_id (
              first_name,
              last_name,
              profile_picture_url
            )
          `)
          .eq('status', 'available')
          .order('is_premium', { ascending: false })
          .limit(6);

        if (error) throw error;

        const formattedMentors = mentors?.map((mentor: any) => ({
          id: mentor.id,
          name: `${mentor.profiles?.first_name || ''} ${mentor.profiles?.last_name || ''}`.trim(),
          title: mentor.title,
          company: mentor.company,
          rating: mentor.rating || 0,
          sessions: mentor.total_sessions || 0,
          expertise: mentor.expertise_areas || [],
          isPremium: mentor.is_premium,
          image: mentor.profiles?.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.user_id}`
        })) || [];

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
    <Layout showSidebar={true}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-15 px-4 bg-gradient-to-br from-background via-background/95 to-muted/20">
        <div className="absolute inset-0 hero-gradient opacity-20" />
        <div className="relative mx-auto max-w-6xl text-center z-10">
          <div className="mb-8 flex justify-center gap-4">
            <Link to="/find-mentor">
              <Button variant="hero" size="lg" className="rounded-full">
                Find a Mentor
              </Button>
            </Link>
            <Link to="/become-mentor">
              <Button size="lg" variant="outline" className="rounded-full border-accent/30 hover:bg-accent/10 text-foreground">
                Become a Mentor
              </Button>
            </Link>
          </div>
          
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
            Unlock Your Potential,
            <br />
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              Faster.
            </span>
            <br />
            Expert Mentors Await.
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Connect 1:1 with industry leaders for personalized guidance and career acceleration. 
            Choose from <strong>free community mentorship</strong> or <strong>premium professional sessions</strong>.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-6 py-3 shadow-sm border border-white/20">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="font-medium text-foreground">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Explore Mentoring Categories</h2>
            <p className="text-muted-foreground">Find mentors in your field of interest</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="group cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-lg bg-accent/10 p-3 transition-colors group-hover:bg-accent/20">
                        <Icon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Mentors Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Professional Mentoring Sessions</h2>
            <p className="text-muted-foreground">
              Being serious with your career progression? Some of our mentors offer professional 
              coaching and mentoring services. Have a look and grow!
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading mentors...</p>
            </div>
          ) : featuredMentors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No mentors available yet. Be the first to join!</p>
              <Link to="/become-mentor" className="mt-4 inline-block">
                <Button>Become a Mentor</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredMentors.map((mentor) => (
              <Card key={mentor.id} className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6">
                  {mentor.isPremium && (
                    <Badge className="mb-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      PREMIUM
                    </Badge>
                  )}
                  
                  <div className="mb-4 flex items-start gap-4">
                    <img
                      src={mentor.image}
                      alt={mentor.name}
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-background"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{mentor.name}</h3>
                      <p className="text-sm text-muted-foreground">{mentor.title}</p>
                      <p className="text-xs text-muted-foreground">{mentor.company}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{mentor.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{mentor.sessions} sessions</span>
                    </div>
                  </div>
                  
                  <div className="mb-4 flex flex-wrap gap-1">
                    {mentor.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Available
                    </Badge>
                  <Link to={`/mentor/${mentor.id}`}>
                    <Button size="sm">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center">
            <Link to="/find-mentor">
              <Button size="lg" variant="outline">
                View All Mentors
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-15 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold">Ready to Accelerate Your Growth?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of professionals who have transformed their careers through mentorship.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/find-mentor">
              <Button size="lg" className="w-full sm:w-auto">
                <Calendar className="mr-2 h-5 w-5" />
                Book a Session
              </Button>
            </Link>
            <Link to="/become-mentor">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Users className="mr-2 h-5 w-5" />
                Share Your Expertise
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Mentorship;