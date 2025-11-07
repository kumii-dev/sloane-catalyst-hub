import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import Footer from "@/components/Footer";
import { Target, Users, Zap, Shield, Rocket, TrendingUp, Globe, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <Layout showSidebar={true}>
      <div className="flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                About Kumii
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Empowering African SMMEs and startups with the tools, connections, and support they need to succeed
              </p>
            </div>

            {/* Mission Section */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary rounded-lg">
                    <Target className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
                </div>
                <div className="space-y-4 text-foreground/90 leading-relaxed">
                  <p className="text-lg">
                    Every day, thousands of brilliant entrepreneurs across Africa have game-changing ideas. But <strong>70% of startups fail</strong>—not because they lack potential, but because they lack access. Access to funding. Access to markets. Access to the right guidance at the right time.
                  </p>
                  <p className="text-lg">
                    <strong className="text-primary">Kumii</strong> is the all-in-one ecosystem designed specifically for African SMMEs and startups. We've built a platform that doesn't just connect you to opportunities—it prepares you for them, matches you with the right partners, and gives you the tools to succeed.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Key Statistics */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 hover:border-primary/40 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl font-bold text-primary mb-2">70%</div>
                  <p className="text-sm text-muted-foreground">Startup Failure Rate We're Reducing</p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-primary/40 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl font-bold text-primary mb-2">4</div>
                  <p className="text-sm text-muted-foreground">User Types Served</p>
                  <p className="text-xs text-muted-foreground mt-1">(Startups, Funders, Mentors, Providers)</p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-primary/40 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">All-In-One</div>
                  <p className="text-sm text-muted-foreground">Ecosystem Approach</p>
                </CardContent>
              </Card>
            </div>

            {/* What We Do */}
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">What We Do</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Access to Capital
                      </h3>
                      <p className="text-foreground/80">
                        Connect with verified funders, browse hundreds of funding opportunities, and get your business investment-ready with our standardized credit scoring system.
                      </p>
                    </div>
                    <div className="bg-primary/5 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Market Access
                      </h3>
                      <p className="text-foreground/80">
                        AI-powered tools for document generation, financial modeling, and business valuation. Get investor-ready in minutes, not months.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Expert Advisory & Mentorship
                      </h3>
                      <p className="text-foreground/80">
                        Connect with experienced mentors and advisors who've walked your path. Get guidance on strategy, fundraising, operations, and growth.
                      </p>
                    </div>
                    <div className="bg-primary/5 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
                        <Rocket className="w-5 h-5" />
                        Business Tools & Resources
                      </h3>
                      <p className="text-foreground/80">
                        Comprehensive resource library, services marketplace, and learning hub. Everything you need to build and grow your business.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Who We Serve */}
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">Who We Serve</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Rocket className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Startups</h3>
                    <p className="text-sm text-muted-foreground">Get the tools and connections you need to grow</p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Funders</h3>
                    <p className="text-sm text-muted-foreground">Discover and evaluate high-potential businesses efficiently</p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Mentors</h3>
                    <p className="text-sm text-muted-foreground">Share your expertise and build your legacy</p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Service Providers</h3>
                    <p className="text-sm text-muted-foreground">Reach clients actively building the future</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Why Choose Kumii */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary rounded-lg">
                    <Heart className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">Why Choose Kumii</h2>
                </div>
                <div className="space-y-4 text-foreground/90">
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong>One-Stop Platform:</strong> Everything you need in one place—no more juggling multiple platforms</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong>AI-Powered Tools:</strong> Professional-grade documents and financial models at a fraction of the cost</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong>Smart Matching:</strong> Connect with the right funders, mentors, and partners for your specific needs</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong>Trusted Network:</strong> Verified funders, mentors, and service providers actively looking to support businesses like yours</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong>No Hidden Fees:</strong> Transparent pricing with tools that used to cost tens of thousands</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-12 text-center space-y-6">
                <h2 className="text-3xl font-bold text-foreground">Ready to Start Your Journey?</h2>
                <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                  Join thousands of entrepreneurs who are already building their future on our platform. Create your free account and unlock access to tools, funding, and connections.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/register')}
                    className="gap-2"
                  >
                    <Rocket className="w-5 h-5" />
                    Get Started Free
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/contact-us')}
                  >
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </Layout>
  );
};

export default About;
