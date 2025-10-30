import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, 
  Star, 
  DollarSign, 
  Clock, 
  Award, 
  CheckCircle,
  Briefcase,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SETA_SECTORS } from "@/constants/setaSectors";

const BecomeAdvisor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    experienceYears: "",
    hourlyRate: "",
    isPremium: false,
    bio: "",
    specialization: [] as string[]
  });

  const specializations = [
    "Business Strategy",
    "Financial Planning",
    "Marketing & Sales",
    "Operations Management",
    "Legal & Compliance",
    "HR & Talent",
    "Technology & IT",
    "Product Development"
  ];

  const benefits = [
    {
      icon: Users,
      title: "Guide Startups",
      description: "Share your expertise to help startups overcome challenges and accelerate growth."
    },
    {
      icon: DollarSign,
      title: "Monetize Expertise",
      description: "Earn income by offering professional advisory and coaching services."
    },
    {
      icon: Briefcase,
      title: "Build Reputation",
      description: "Establish yourself as a trusted advisor in your field of expertise."
    },
    {
      icon: Clock,
      title: "Flexible Hours",
      description: "Set your own schedule and availability to fit your lifestyle."
    }
  ];

  const handleSectorToggle = (sector: string) => {
    setSelectedSectors(prev => 
      prev.includes(sector)
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const handleSpecializationToggle = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to become an advisor.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    if (selectedSectors.length === 0) {
      toast({
        title: "Sector Required",
        description: "Please select at least one sector.",
        variant: "destructive"
      });
      return;
    }

    if (formData.specialization.length === 0) {
      toast({
        title: "Specialization Required",
        description: "Please select at least one specialization.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create or update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          bio: formData.bio
        }, { onConflict: 'user_id' });

      if (profileError) throw profileError;

      // Check if advisor profile already exists
      const { data: existingAdvisor } = await supabase
        .from('advisors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingAdvisor) {
        // Update existing advisor profile
        const { error: advisorError } = await supabase
          .from('advisors')
          .update({
            title: formData.title,
            company: formData.company,
            years_experience: parseInt(formData.experienceYears),
            hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
            is_premium: formData.isPremium,
            status: 'available',
            vetting_status: 'pending',
            expertise_areas: selectedSectors,
            specializations: formData.specialization,
            bio: formData.bio
          })
          .eq('user_id', user.id);

        if (advisorError) throw advisorError;
      } else {
        // Create new advisor profile
        const { error: advisorError } = await supabase
          .from('advisors')
          .insert({
            user_id: user.id,
            title: formData.title,
            company: formData.company,
            years_experience: parseInt(formData.experienceYears),
            hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
            is_premium: formData.isPremium,
            status: 'available',
            vetting_status: 'pending',
            expertise_areas: selectedSectors,
            specializations: formData.specialization,
            bio: formData.bio
          });

        if (advisorError) throw advisorError;
      }

      toast({
        title: "Success!",
        description: "Your advisor profile has been submitted for approval.",
      });

      navigate("/find-advisor");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create advisor profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showSidebar={true}>
      <div className="bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background/95 to-muted/20 py-12 px-4 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-20" />
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <h1 className="mb-4 text-4xl font-bold">Become an Advisor / Coach</h1>
          <p className="text-lg text-muted-foreground">
            Join our professional services marketplace and help startups succeed
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Why Offer Advisory Services?</h2>
            <p className="text-muted-foreground">
              Transform your professional experience into impact while building your consulting practice
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="rounded-full bg-accent/10 p-4">
                        <Icon className="h-8 w-8 text-accent" />
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
              <CardTitle className="text-center">Create Your Advisor Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Business Consultant, Financial Advisor, Marketing Strategist"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company / Firm</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Your Consulting Firm"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Select 
                    value={formData.experienceYears}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, experienceYears: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3-5 years</SelectItem>
                      <SelectItem value="6">6-10 years</SelectItem>
                      <SelectItem value="11">11-15 years</SelectItem>
                      <SelectItem value="16">16+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Industry Focus * (Select at least one)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border rounded-lg">
                    {SETA_SECTORS.map((sector) => (
                      <div
                        key={sector}
                        className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded transition-colors"
                      >
                        <Checkbox
                          id={sector}
                          checked={selectedSectors.includes(sector)}
                          onCheckedChange={() => handleSectorToggle(sector)}
                        />
                        <Label
                          htmlFor={sector}
                          className="text-sm cursor-pointer leading-tight"
                        >
                          {sector}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Service Specializations * (Select at least one)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {specializations.map((spec) => (
                      <div
                        key={spec}
                        className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={spec}
                          checked={formData.specialization.includes(spec)}
                          onCheckedChange={() => handleSpecializationToggle(spec)}
                        />
                        <Label
                          htmlFor={spec}
                          className="font-medium cursor-pointer"
                        >
                          {spec}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio *</Label>
                  <Textarea
                    id="bio"
                    placeholder="Describe your background, expertise, and what you can help startups with..."
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Offer Premium Services</h4>
                    <p className="text-sm text-muted-foreground">
                      Charge for specialized advisory and coaching sessions
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
                        placeholder="100"
                        className="pl-10"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Profile..." : "Create Advisor Profile"}
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
          <h2 className="mb-4 text-3xl font-bold">Join a Trusted Professional Network</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Our advisors and coaches are verified professionals committed to helping startups thrive. 
            We provide all the tools you need to deliver exceptional advisory services.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Professional Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Platform Support</span>
            </div>
          </div>
        </div>
      </section>
      </div>
    </Layout>
  );
};

export default BecomeAdvisor;
