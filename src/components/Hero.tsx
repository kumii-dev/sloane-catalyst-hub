import { ArrowRight, TrendingUp, Shield, DollarSign, FileCheck, Users, Briefcase, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="Modern business district representing startup success" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient opacity-90" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-up">
            <Shield className="h-4 w-4 text-accent" />
            Trusted by 1000+ SMMEs & Startups
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-up text-white">
            Empowering SMMEs &<br />
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              Startup Success
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto animate-fade-up">
            Your comprehensive marketplace connecting startups with essential services, 
            funding opportunities, expert mentorship, and investor readiness programs.
          </p>

          {/* Platform Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10 animate-fade-up">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-accent rounded-lg p-2 flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-medium">Access To Market</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-accent rounded-lg p-2 flex-shrink-0">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-medium">Access To Capital</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-accent rounded-lg p-2 flex-shrink-0">
                  <FileCheck className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-medium">Credit Scoring</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-accent rounded-lg p-2 flex-shrink-0">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-medium">Mentorship</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-accent rounded-lg p-2 flex-shrink-0">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-medium">Professional Services</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-accent rounded-lg p-2 flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-medium">Resources</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 text-white border-white/30 hover:bg-white/10">
              Explore Services
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 text-center animate-fade-up">
            <p className="text-sm text-white/70 mb-4">Trusted by leading organizations</p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="text-white font-semibold">Microsoft</div>
              <div className="text-white font-semibold">AWS</div>
              <div className="text-white font-semibold">African Bank</div>
              <div className="text-white font-semibold">Nedbank</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-accent/20 rounded-full animate-float" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
    </section>
  );
};

export default Hero;