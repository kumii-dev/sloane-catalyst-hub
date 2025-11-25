import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, MessageCircle, Book, Video, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HelpCenter = () => {
  const navigate = useNavigate();
  
  const faqs = [
    {
      question: "How do I register on the Kumii platform?",
      answer: "Click on the 'Sign Up' button on the homepage, choose your user type (Startup, Service Provider, Mentor, or Funder), and complete the registration form with your details."
    },
    {
      question: "How do I book a mentorship session?",
      answer: "Navigate to the Mentorship section, browse available mentors, select your preferred mentor, and use the booking calendar to schedule a session at your convenience."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept all major credit cards, debit cards, and EFT payments. All transactions are processed securely through our payment gateway."
    },
    {
      question: "How do I list my services on the marketplace?",
      answer: "After registering as a Service Provider, go to your dashboard and click 'Create Listing'. Fill in the service details, pricing, and upload relevant images to publish your listing."
    },
    {
      question: "Can I get a refund for a cancelled session?",
      answer: "Yes, if you cancel a session at least 48 hours in advance, you'll receive a full refund. Cancellations within 48 hours may be subject to our cancellation policy."
    },
    {
      question: "How do I apply for funding opportunities?",
      answer: "Browse the Funding Hub, find opportunities that match your business, and click 'Apply'. You'll need to complete the application form and upload required documents."
    },
    {
      question: "What is the AI Copilot feature?",
      answer: "The AI Copilot is your intelligent assistant that helps with business queries, provides recommendations, and guides you through platform features using natural language."
    },
    {
      question: "How do I upgrade my KYC level?",
      answer: "Go to your profile settings, click on 'KYC Verification', and follow the prompts to upload the required documents for your desired verification level."
    },
    {
      question: "How do I update my profile information?",
      answer: "Navigate to your dashboard and click on 'Edit Profile'. From there, you can update your personal information, bio, profile picture, and other relevant details. Make sure to save your changes before leaving the page."
    }
  ];

  const resources = [
    {
      icon: Book,
      title: "User Guides",
      description: "Step-by-step guides for all platform features",
      action: "Browse Guides"
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch comprehensive video walkthroughs",
      action: "Watch Videos"
    },
    {
      icon: MessageCircle,
      title: "Live Chat Support",
      description: "Chat with our support team in real-time",
      action: "Start Chat"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us your questions via email",
      action: "Contact Us"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find answers to common questions and get the support you need
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="search"
                placeholder="Search for help articles, features, or questions..."
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {resources.map((resource) => (
              <Card key={resource.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <resource.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    {resource.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQs */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-card px-6 rounded-lg border">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Still Need Help */}
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <Card>
              <CardHeader>
                <CardTitle>Still need help?</CardTitle>
                <CardDescription>
                  Our support team is available Monday to Friday, 9am - 5pm SAST
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button variant="default" onClick={() => navigate('/contact-us')}>Contact Support</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HelpCenter;
