import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Users, 
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