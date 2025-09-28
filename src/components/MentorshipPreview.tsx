import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
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
  const stats = [
    { icon: CheckCircle, label: "Free Sessions", count: "Available" },
    { icon: Crown, label: "Premium Sessions", count: "Expert Level" },
    { icon: UsersRound, label: "Active Mentors", count: "8K+" }
  ];

  const featuredMentors = [
    {
      name: "Sarah J.",
      title: "Product Manager",
      company: "Google",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1494790108755-2616b2a53c8c?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "David C.",
      title: "Full Stack Dev",
      company: "Microsoft", 
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Emily R.",
      title: "UX Lead",
      company: "Airbnb",
      rating: 5.0,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-muted/30 via-background to-muted/50">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Accelerate Your Growth with 
            <span className="block mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
              <div key={index} className="flex items-center gap-3 bg-background/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border">
                <Icon className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold text-sm">{stat.count}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Featured Mentors */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {featuredMentors.map((mentor, index) => (
            <Card key={index} className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
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
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link to="/find-mentor">
              <Button size="lg" className="w-full sm:w-auto">
                <Calendar className="mr-2 h-5 w-5" />
                Find a Mentor
              </Button>
            </Link>
            <Link to="/become-mentor">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Users className="mr-2 h-5 w-5" />
                Become a Mentor
              </Button>
            </Link>
          </div>
          
          <Link to="/mentorship" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
            Explore all mentorship features
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MentorshipPreview;