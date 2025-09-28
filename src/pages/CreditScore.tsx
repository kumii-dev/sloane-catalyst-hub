import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  TrendingUp, 
  FileText, 
  Users,
  ArrowRight,
  CheckCircle,
  Target
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

const CreditScore = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Shield,
      title: "360° Credit Scoring",
      description: "Beyond traditional metrics - we evaluate digital presence, training, and growth potential",
      color: "bg-blue-50 text-blue-600 border-blue-200"
    },
    {
      icon: TrendingUp,
      title: "Alternative Data Sources", 
      description: "Mentorship participation, professional services usage, and customer traction analysis",
      color: "bg-green-50 text-green-600 border-green-200"
    },
    {
      icon: FileText,
      title: "Funder-Grade Reports",
      description: "Bank-ready credit reports with clear justifications and improvement recommendations",
      color: "bg-purple-50 text-purple-600 border-purple-200"
    },
    {
      icon: Users,
      title: "Trusted by Funders",
      description: "Scores recognized by South African banks, DFIs, and major sponsors like AWS & Microsoft",
      color: "bg-orange-50 text-orange-600 border-orange-200"
    }
  ];

  const scoringCategories = [
    { name: "Financial Health", weight: "25%", description: "Revenue consistency, cash flow, banking history" },
    { name: "Governance", weight: "20%", description: "Legal compliance, risk management, documentation" },
    { name: "Skills & Capabilities", weight: "15%", description: "Team expertise, training completion, mentorship" },
    { name: "Market Access", weight: "20%", description: "Customer base, market position, growth trajectory" },
    { name: "Compliance", weight: "10%", description: "Regulatory adherence, tax compliance, data protection" },
    { name: "Growth Readiness", weight: "10%", description: "Scalability, investment readiness, strategic planning" }
  ];

  const benefits = [
    "Access funding opportunities typically unavailable to SMMEs",
    "Benchmark your business against industry standards", 
    "Receive actionable recommendations for improvement",
    "Build credibility with potential investors and partners",
    "Track your progress over time with regular assessments",
    "Get matched with relevant funders based on your score"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Credit Assessment Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Business Credit Score for SMMEs
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Get a comprehensive credit assessment that goes beyond traditional metrics. 
              Our 360° scoring system evaluates your business using alternative data sources 
              trusted by leading South African funders.
            </p>
            
            {!user ? (
              <Button size="lg" asChild>
                <a href="/auth">
                  Get Started - Free Assessment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            ) : (
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild>
                  <a href="/auth">
                    Start Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/funding/startup-dashboard">
                    View My Profile
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Credit Scoring?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Traditional credit scoring fails SMMEs. Our platform evaluates the full picture 
              of your business potential using data that matters.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <div className={`w-16 h-16 mx-auto rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Scoring Methodology */}
          <div className="bg-card rounded-lg p-8 mb-16">
            <h3 className="text-2xl font-bold mb-6 text-center">Our Scoring Methodology</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scoringCategories.map((category, index) => (
                <div key={category.name} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{category.name}</h4>
                    <Badge variant="secondary">{category.weight}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-8">Benefits for Your Business</h3>
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-left">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Application - Coming Soon */}
      {user && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Credit Assessment Platform</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                  The credit assessment platform is being finalized. 
                  Complete your startup profile to be ready when it launches.
                </p>
                <Button asChild>
                  <a href="/funding/startup-dashboard">
                    Complete Startup Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Your Credit Score?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of SMMEs who have improved their funding prospects through our comprehensive credit assessment.
          </p>
          {!user && (
            <Button size="lg" asChild>
              <a href="/auth">
                Start Free Assessment
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CreditScore;