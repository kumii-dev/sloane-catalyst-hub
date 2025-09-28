import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Star, 
  DollarSign, 
  Clock, 
  Award, 
  Heart,
  CheckCircle,
  Plus,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const BecomeMentor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    experienceYears: "",
    hourlyRate: "",
    isPremium: false,
    expertiseAreas: [],
    bio: ""
  });

  const benefits = [
    {
      icon: Users,
      title: "Impact Lives",
      description: "Guide the next generation of professionals and make a lasting difference in their careers."
    },
    {
      icon: DollarSign,
      title: "Earn Extra Income",
      description: "Monetize your expertise with flexible pricing for premium mentoring sessions."
    },
    {
      icon: Star,
      title: "Build Your Brand",
      description: "Establish yourself as a thought leader and expand your professional network."
    },
    {
      icon: Clock,
      title: "Flexible Schedule",
      description: "Set your own availability and work around your existing commitments."
    }
  ];

  const handleSkillAdd = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.expertiseAreas.includes(skillInput.trim())) {
        setFormData(prev => ({
          ...prev,
          expertiseAreas: [...prev.expertiseAreas, skillInput.trim()]
        }));
      }
      setSkillInput("");
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to become a mentor.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      // First create or update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          bio: formData.bio
        });

      if (profileError) throw profileError;

      // Create mentor profile
      const { error: mentorError } = await supabase
        .from('mentors')
        .upsert({
          user_id: user.id,
          title: formData.title,
          company: formData.company,
          experience_years: parseInt(formData.experienceYears),
          expertise_areas: formData.expertiseAreas,
          hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
          is_premium: formData.isPremium,
          status: 'available'
        });

      if (mentorError) throw mentorError;

      toast({
        title: "Success!",
        description: "Your mentor profile has been created successfully.",
      });

      navigate("/mentorship");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create mentor profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold">Share Your Expertise</h1>
          <p className="text-lg text-muted-foreground">
            Join thousands of mentors helping professionals accelerate their careers
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Why Become a Mentor?</h2>
            <p className="text-muted-foreground">
              Transform your experience into impact while building your professional legacy
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="rounded-full bg-primary/10 p-4">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="mb-2 font-semibold">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Create Your Mentor Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Software Engineer, Product Manager"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Google, Microsoft, Startup"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, experienceYears: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1-2 years</SelectItem>
                      <SelectItem value="3">3-5 years</SelectItem>
                      <SelectItem value="6">6-10 years</SelectItem>
                      <SelectItem value="11">11-15 years</SelectItem>
                      <SelectItem value="16">16+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Expertise Areas *</Label>
                  <Input
                    id="skills"
                    placeholder="Add a skill and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillAdd}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.expertiseAreas.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleSkillRemove(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell potential mentees about your background, experience, and what you can help them with..."
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Offer Premium Sessions</h4>
                    <p className="text-sm text-muted-foreground">
                      Charge for specialized mentoring sessions
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPremium}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPremium: checked }))}
                  />
                </div>

                {formData.isPremium && (
                  <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="rate"
                        type="number"
                        placeholder="50"
                        className="pl-10"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Profile..." : "Create Mentor Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <Award className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="mb-4 text-3xl font-bold">Join a Trusted Community</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Our mentors are verified professionals committed to helping others succeed. 
            We provide all the tools you need to deliver exceptional mentoring experiences.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Background Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BecomeMentor;