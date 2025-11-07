import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, TrendingUp, Target, Shield, Zap, Globe, Award, DollarSign, GraduationCap, Network, FileCheck } from "lucide-react";
import kumiiLogo from '@/assets/kumii-logo.png';

export const KumiiProfile = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto" id="kumii-profile">
      {/* Header Section */}
      <div className="text-center space-y-6 p-8 rounded-xl hero-gradient">
        <img 
          src={kumiiLogo} 
          alt="Kumii Logo" 
          className="h-24 mx-auto"
        />
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Building Your Business
        </h1>
        <p className="text-xl text-white/90 max-w-3xl mx-auto">
          Africa's All-In-One Platform for SMMEs, Startups, and the Ecosystem that Supports Them
        </p>
      </div>

      {/* Executive Summary */}
      <Card className="shadow-strong">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-lg">
          <p>
            <strong>Kumii</strong> is a comprehensive digital ecosystem designed to democratize access to opportunities for African SMMEs and startups. 
            We address the critical gap in the entrepreneurial journey by providing integrated tools, connections, and resources that typically cost tens 
            of thousands of rand—all in one accessible platform.
          </p>
          <div className="grid md:grid-cols-3 gap-4 pt-4">
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <div className="text-3xl font-bold text-primary">70%</div>
              <div className="text-sm text-muted-foreground">Startup Failure Rate Reduced</div>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <div className="text-3xl font-bold text-primary">R0</div>
              <div className="text-sm text-muted-foreground">Upfront Cost to Start</div>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <div className="text-3xl font-bold text-primary">All-In-One</div>
              <div className="text-sm text-muted-foreground">Integrated Platform</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problem Statement */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary" />
            The Problem We Solve
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Lack of Access:</strong> 70% of startups fail due to limited access to funding, markets, and guidance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Fragmented Resources:</strong> Entrepreneurs juggle multiple platforms and services, wasting time and money</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>High Costs:</strong> Professional tools and services are prohibitively expensive for early-stage businesses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Information Gap:</strong> Businesses don't know their readiness level or what steps to take next</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Our Solution */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Zap className="h-7 w-7 text-primary" />
            Our Comprehensive Solution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Access to Market */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Access to Market
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Credit Score Assessment:</strong> Standardized readiness evaluation trusted by funders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>AI Document Generator:</strong> Professional business plans, pitch decks, and financial reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Financial Model Builder:</strong> 3-statement models with IFRS and US GAAP support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Valuation Model:</strong> DCF, comparables, and multiple methodologies</span>
                </li>
              </ul>
            </div>

            {/* Smart Matching */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Network className="h-6 w-6 text-primary" />
                Smart Matching & Funding
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>AI-Powered Matching:</strong> Connect with right suppliers, buyers, and funders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Funding Opportunities:</strong> Browse hundreds of grants, loans, and equity options</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Funder Directory:</strong> Verified banks, impact investors, and venture funds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Direct Applications:</strong> Apply to opportunities through the platform</span>
                </li>
              </ul>
            </div>

            {/* Mentorship & Learning */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                Mentorship & Learning
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Expert Mentors:</strong> Connect with experienced business leaders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Resource Library:</strong> Guides, templates, case studies, and training</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Learning Paths:</strong> Structured programs for business growth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>1-on-1 Sessions:</strong> Personalized guidance on key challenges</span>
                </li>
              </ul>
            </div>

            {/* Services Marketplace */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Services Marketplace
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Vetted Service Providers:</strong> Legal, accounting, marketing, and technical experts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Transparent Pricing:</strong> Know costs upfront, no hidden fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Startup-Friendly:</strong> Services designed for early-stage businesses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Ratings & Reviews:</strong> Community-verified quality</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            Who We Serve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <h4 className="font-semibold text-lg">Startups & SMMEs</h4>
              <p className="text-sm text-muted-foreground">Access tools, funding, and guidance to grow your business</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <h4 className="font-semibold text-lg">Funders & Investors</h4>
              <p className="text-sm text-muted-foreground">Discover and evaluate high-potential businesses efficiently</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <h4 className="font-semibold text-lg">Mentors & Advisors</h4>
              <p className="text-sm text-muted-foreground">Share expertise and build your legacy</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <h4 className="font-semibold text-lg">Service Providers</h4>
              <p className="text-sm text-muted-foreground">Reach clients actively building the future</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Value Proposition */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Award className="h-7 w-7 text-primary" />
            Why Choose Kumii?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">For Entrepreneurs</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Save R50,000+ on professional tools and services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Access everything in one platform—no more juggling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Get matched with relevant funders and opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Build credibility with standardized assessments</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">For Funders & Partners</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Standardized assessment for faster due diligence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Access pre-screened, investment-ready businesses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Reduce screening costs and time to decision</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Portfolio tracking and reporting tools</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partnerships */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Globe className="h-7 w-7 text-primary" />
            Trusted Partnerships
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            Kumii is trusted by leading organizations across Africa who believe in democratizing access to opportunity:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="h-20 flex items-center justify-center bg-muted/50 rounded-lg">
                <span className="text-lg font-semibold">Microsoft for Startups</span>
              </div>
              <p className="text-sm text-muted-foreground">Technology & Cloud Partner</p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-20 flex items-center justify-center bg-muted/50 rounded-lg">
                <span className="text-lg font-semibold">22 On Sloane</span>
              </div>
              <p className="text-sm text-muted-foreground">Innovation Hub Partner</p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-20 flex items-center justify-center bg-muted/50 rounded-lg">
                <span className="text-lg font-semibold">Leading Banks & VCs</span>
              </div>
              <p className="text-sm text-muted-foreground">Financial Ecosystem Partners</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Metrics */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <TrendingUp className="h-7 w-7 text-primary" />
            Our Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
              <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-sm text-muted-foreground">Active Entrepreneurs</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
              <div className="text-4xl font-bold text-primary mb-2">R500M+</div>
              <div className="text-sm text-muted-foreground">Funding Connections</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
              <div className="text-4xl font-bold text-primary mb-2">200+</div>
              <div className="text-sm text-muted-foreground">Verified Mentors</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
              <div className="text-4xl font-bold text-primary mb-2">150+</div>
              <div className="text-sm text-muted-foreground">Service Providers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="shadow-strong hero-gradient text-white">
        <CardContent className="py-12 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Join the Ecosystem Today
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Whether you're a startup looking to grow, a funder seeking opportunities, a mentor ready to give back, 
            or a service provider wanting to support entrepreneurs—Kumii is your platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <div className="px-6 py-3 bg-white text-primary rounded-lg font-semibold">
              No Hidden Fees
            </div>
            <div className="px-6 py-3 bg-white text-primary rounded-lg font-semibold">
              No Gatekeepers
            </div>
            <div className="px-6 py-3 bg-white text-primary rounded-lg font-semibold">
              All-In-One Platform
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <FileCheck className="h-7 w-7 text-primary" />
            Get Started with Kumii
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            Ready to transform your entrepreneurial journey? Contact us to learn more about partnership opportunities, 
            enterprise solutions, or how Kumii can support your organization's ecosystem development.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Platform Access</h4>
              <p className="text-sm text-muted-foreground">Visit kumii.co.za to create your free account</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Partnership Inquiries</h4>
              <p className="text-sm text-muted-foreground">Contact: partnerships@kumii.co.za</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
