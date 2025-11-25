import { Rocket, Building, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const UserTypes = () => {
  const navigate = useNavigate();
  
  const userTypes = [
    {
      icon: Rocket,
      title: "Startups & SMMEs",
      description: "Access essential business tools, funding opportunities, and expert guidance to accelerate your growth.",
      features: [
        "Discounted business software",
        "Funding matching",
        "Mentor connections",
        "Investor readiness programs"
      ],
      buttonText: "Start Growing",
      buttonVariant: "hero" as const,
      gradient: "from-primary to-primary-light",
      link: "/funding/startup-dashboard"
    },
    {
      icon: Building,
      title: "Service Providers",
      description: "Reach thousands of growing businesses looking for your expertise and solutions.",
      features: [
        "Access to SMME market",
        "Flexible pricing models",
        "Marketing support",
        "Revenue opportunities"
      ],
      buttonText: "Join Marketplace",
      buttonVariant: "premium" as const,
      gradient: "from-accent to-accent-light",
      link: "/become-provider"
    },
    {
      icon: Briefcase,
      title: "Funders & Investors",
      description: "Discover vetted investment-ready startups and SMMEs with comprehensive due diligence support.",
      features: [
        "Curated deal flow",
        "Due diligence reports",
        "Investment tracking",
        "Portfolio management"
      ],
      buttonText: "Find Opportunities",
      buttonVariant: "success" as const,
      gradient: "from-success to-green-400",
      link: "/funding-hub"
    },
    {
      icon: Users,
      title: "Mentors & Advisors",
      description: "Share your expertise with the next generation of entrepreneurs and build your advisory portfolio.",
      features: [
        "Flexible scheduling",
        "Skill-based matching",
        "Session management",
        "Impact tracking"
      ],
      buttonText: "Become Mentor",
      buttonVariant: "default" as const,
      gradient: "from-primary-light to-primary",
      link: "/become-mentor"
    }
  ];

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built for <span className="text-primary">Everyone</span> in the Ecosystem
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're a startup seeking growth, a provider offering services, 
            or an investor looking for opportunities - we've got you covered.
          </p>
        </div>

        {/* User Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {userTypes.map((userType, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden group hover:shadow-strong transition-all duration-300 hover:-translate-y-2 border-0 shadow-medium"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${userType.gradient} opacity-5`} />
              
              <CardContent className="p-8 relative">
                {/* Icon */}
                <div className="mb-6">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${userType.gradient}`}>
                    <userType.icon className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold mb-4">{userType.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {userType.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {userType.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button 
                  variant={userType.buttonVariant} 
                  className="w-full"
                  onClick={() => navigate(userType.link)}
                >
                  {userType.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">1,000+</div>
            <div className="text-muted-foreground">Active Startups</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">Service Providers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">150+</div>
            <div className="text-muted-foreground">Mentors & Advisors</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">50+</div>
            <div className="text-muted-foreground">Active Funders</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserTypes;