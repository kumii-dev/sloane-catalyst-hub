import { ArrowRight, TrendingUp, Shield, DollarSign, FileCheck, Users, Briefcase, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import microsoftLogo from "@/assets/microsoft-logo.png";
import nedbankLogo from "@/assets/nedbank-logo.png";

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
      <div className="container mx-auto px-6 relative z-10 max-w-full overflow-x-hidden">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-up">
            <Shield className="h-4 w-4 text-accent" />
            Trusted by 1000+ SMMEs & Startups
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-up text-white">
            Transform Your Business<br />
            <span className="font-bold drop-shadow-lg" style={{ color: 'hsl(15 80% 70%)' }}>
              Journey Into Success
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed max-w-3xl mx-auto animate-fade-up">
            Your all-in-one platform connecting entrepreneurs with funding, 
            expert mentorship, market access, and growth-enabling services.
          </p>

          {/* Platform Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 animate-fade-up px-2">
            <Link to="/access-to-market" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 hover:scale-105 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-xl p-2 sm:p-3 flex-shrink-0 group-hover:shadow-lg transition-all" style={{ backgroundColor: 'hsl(15 80% 70%)' }}>
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-white font-semibold text-base sm:text-lg">Market Access</span>
              </div>
            </Link>
            <Link to="/funding" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 hover:scale-105 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-xl p-2 sm:p-3 flex-shrink-0 group-hover:shadow-lg transition-all" style={{ backgroundColor: 'hsl(15 80% 70%)' }}>
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-white font-semibold text-base sm:text-lg">Funding Hub</span>
              </div>
            </Link>
            <Link to="/credit-score" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 hover:scale-105 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-xl p-2 sm:p-3 flex-shrink-0 group-hover:shadow-lg transition-all" style={{ backgroundColor: 'hsl(15 80% 70%)' }}>
                  <FileCheck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-white font-semibold text-base sm:text-lg">Credit Scoring</span>
              </div>
            </Link>
            <Link to="/mentorship" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 hover:scale-105 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-xl p-2 sm:p-3 flex-shrink-0 group-hover:shadow-lg transition-all" style={{ backgroundColor: 'hsl(15 80% 70%)' }}>
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-white font-semibold text-base sm:text-lg">Expert Mentorship</span>
              </div>
            </Link>
            <Link to="/find-advisor" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 hover:scale-105 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-xl p-2 sm:p-3 flex-shrink-0 group-hover:shadow-lg transition-all" style={{ backgroundColor: 'hsl(15 80% 70%)' }}>
                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-white font-semibold text-base sm:text-lg">Pro Services</span>
              </div>
            </Link>
            <Link to="/resources" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 hover:scale-105 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-xl p-2 sm:p-3 flex-shrink-0 group-hover:shadow-lg transition-all" style={{ backgroundColor: 'hsl(15 80% 70%)' }}>
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-white font-semibold text-base sm:text-lg">Resources Hub</span>
              </div>
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4" asChild>
              <Link to="/auth">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" className="text-lg px-8 py-4" asChild>
              <Link to="/auth">
                Explore Services
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center animate-fade-up">
            <p className="text-base text-white/80 mb-6 font-medium">Trusted by leading organizations</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-lg border border-white/20 hover:bg-white/15 transition-all">
                <img src={microsoftLogo} alt="Microsoft" className="h-8 opacity-90 hover:opacity-100 transition-opacity" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-lg border border-white/20 hover:bg-white/15 transition-all">
                <span className="text-white font-bold text-xl">AWS</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-lg border border-white/20 hover:bg-white/15 transition-all">
                <span className="text-white font-bold text-xl">African Bank</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-lg border border-white/20 hover:bg-white/15 transition-all">
                <img src={nedbankLogo} alt="Nedbank" className="h-8 opacity-90 hover:opacity-100 transition-opacity" />
              </div>
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