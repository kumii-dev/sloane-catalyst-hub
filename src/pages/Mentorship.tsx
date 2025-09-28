import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
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

  const featuredMentors = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Senior Product Manager",
      company: "Google",
      rating: 4.9,
      sessions: 120,
      expertise: ["Product Strategy", "Leadership"],
      isPremium: true,
      image: "https://images.unsplash.com/photo-1494790108755-2616b2a53c8c?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "David Chen",
      title: "Full Stack Developer",
      company: "Microsoft",
      rating: 4.8,
      sessions: 85,
      expertise: ["React", "Node.js", "System Design"],
      isPremium: false,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      title: "UX Design Lead",
      company: "Airbnb",
      rating: 5.0,
      sessions: 200,
      expertise: ["UX Research", "Design Systems"],
      isPremium: true,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ];

  return (
    <Layout showSidebar={true}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 bg-gradient-to-br from-background via-background/95 to-muted/20">
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
                    <Button size="sm">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
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
      <section className="py-20 px-4">
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