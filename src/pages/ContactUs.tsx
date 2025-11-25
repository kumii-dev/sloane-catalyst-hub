import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const ContactUs = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });

  const handleStartChat = () => {
    // Find and click the floating AI chat button
    const chatButton = document.querySelector('[aria-label="Open AI Chat"]') as HTMLButtonElement;
    if (chatButton) {
      chatButton.click();
    } else {
      // Fallback: scroll to bottom where chat button typically is
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      // Try to find the button after a short delay
      setTimeout(() => {
        const btn = document.querySelector('button[class*="MessageCircle"]') as HTMLButtonElement;
        if (btn) btn.click();
      }, 300);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", subject: "", category: "", message: "" });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "info@kumii.africa",
      action: "mailto:info@kumii.africa"
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+27 11 123 4567",
      action: "tel:+27111234567"
    },
    {
      icon: MapPin,
      title: "Office",
      details: "Johannesburg, South Africa",
      action: "#"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Mon - Fri: 9am - 5pm SAST",
      action: "#"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have a question or need assistance? We're here to help!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              {contactInfo.map((item) => (
                <Card key={item.title}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <a 
                      href={item.action} 
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.details}
                    </a>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5" />
                    <CardTitle className="text-lg">Live Chat</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-primary-foreground/80 mb-4">
                    Chat with our support team in real-time
                  </p>
                  <Button variant="secondary" className="w-full" onClick={handleStartChat}>
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll respond within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="billing">Billing & Payments</SelectItem>
                            <SelectItem value="partnerships">Partnerships</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          placeholder="Brief description"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUs;
