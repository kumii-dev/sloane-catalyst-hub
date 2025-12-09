import { Building2, Users, Lightbulb, TrendingUp, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: Building2,
      title: "Services Marketplace",
      description: "Access affordable CRM, ERP, HR, marketing tools and professional services from verified providers.",
      color: "text-primary",
      bgColor: "bg-primary/10",
      benefits: ["Affordable SaaS tools", "Vetted service providers", "Flexible subscription plans"]
    },
    {
      icon: TrendingUp,
      title: "Funding Connect",
      description: "Connect with banks, VCs, sponsors, and grant providers through our AI-powered matching system.",
      color: "text-success",
      bgColor: "bg-success/10",
      benefits: ["Smart funder matching", "Application guidance", "Due diligence support"]
    },
    {
      icon: Users,
      title: "Mentorship Network",
      description: "Access experienced mentors and advisors for guidance, strategic planning, and skills development.",
      color: "text-accent",
      bgColor: "bg-accent/10",
      benefits: ["Expert mentorship", "Industry connections", "Skills development"]
    },
    {
      icon: Lightbulb,
      title: "Investor Readiness",
      description: "Structured journey with legal, accounting, compliance, and technical advisory services.",
      color: "text-primary-light",
      bgColor: "bg-primary/5",
      benefits: ["Compliance guidance", "Legal support", "Technical advisory"]
    }
  ];

  return (
    <section className="py-24 bg-background overflow-x-hidden">
      <div className="container mx-auto px-6 max-w-full">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            Platform Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to <span className="text-primary">Succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive ecosystem designed to accelerate SMME and startup growth through 
            strategic connections, essential services, and expert guidance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="card-gradient rounded-2xl p-8 shadow-medium hover:shadow-strong transition-smooth border border-border/50"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`${feature.bgColor} p-3 rounded-xl flex-shrink-0`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Benefits */}
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-success flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-8 text-white shadow-strong">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h3>
            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              Join thousands of successful SMMEs and startups who've accelerated their growth through our platform.
            </p>
            <div className="flex justify-center">
              <Button variant="hero" size="lg" onClick={() => navigate('/auth')}>
                Get Started Today
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;