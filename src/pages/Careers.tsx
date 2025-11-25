import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, Users, TrendingUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import Footer from "@/components/Footer";

const Careers = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Users,
      title: "Collaborative Team",
      description: "Work with talented professionals passionate about empowering African entrepreneurs"
    },
    {
      icon: TrendingUp,
      title: "Growth Opportunities",
      description: "Continuous learning and career development in a fast-growing startup"
    },
    {
      icon: Heart,
      title: "Impact-Driven",
      description: "Make a real difference in the lives of SMMEs and startups across Africa"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-12">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Join Our Team
              </h1>
              <p className="text-xl text-muted-foreground">
                Help us empower the next generation of African entrepreneurs
              </p>
            </div>

            <Card className="p-8 mb-12">
              <div className="flex items-center gap-4 mb-6">
                <Briefcase className="h-12 w-12 text-primary" />
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Work at Kumii</h2>
                  <p className="text-muted-foreground">Building Africa's premier SMME ecosystem</p>
                </div>
              </div>
              
              <p className="text-foreground mb-6">
                At Kumii, we're on a mission to transform the African entrepreneurial landscape by connecting 
                SMMEs and startups with the resources, funding, and expertise they need to thrive. We're looking 
                for passionate individuals who want to make a real impact.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="text-center">
                    <benefit.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-6 text-foreground">Current Opportunities</h2>
              
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-6">
                  We're always looking for talented individuals to join our team. 
                  Currently, we don't have any open positions, but we'd love to hear from you!
                </p>
                <Button 
                  onClick={() => navigate("/contact-us")}
                  size="lg"
                >
                  Get in Touch
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default Careers;
