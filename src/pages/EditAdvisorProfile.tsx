import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SETA_SECTORS } from "@/constants/setaSectors";
import { ArrowLeft, Save } from "lucide-react";

const EditAdvisorProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  
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

  useEffect(() => {
    if (user) {
      fetchAdvisorProfile();
    }
  }, [user]);

  const fetchAdvisorProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No advisor profile found
          toast({
            title: "No Profile Found",
            description: "Please create an advisor profile first.",
            variant: "destructive"
          });
          navigate('/become-advisor');
          return;
        }
        throw error;
      }

      if (data) {
        setAdvisorId(data.id);
        setFormData({
          title: data.title || "",
          company: data.company || "",
          experienceYears: data.years_experience?.toString() || "",
          hourlyRate: data.hourly_rate?.toString() || "",
          isPremium: data.is_premium || false,
          bio: data.bio || "",
          specialization: data.specializations || []
        });
        setSelectedSectors(data.expertise_areas || []);
      }
    } catch (error: any) {
      console.error('Failed to load advisor profile:', error);
      toast({
        title: "Error",
        description: "Failed to load advisor profile",
        variant: "destructive"
      });
    } finally {
      setInitialLoading(false);
    }
  };

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
    
    if (!user || !advisorId) {
      toast({
        title: "Error",
        description: "User not authenticated or advisor profile not found.",
        variant: "destructive"
      });
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
      const { error } = await supabase
        .from('advisors')
        .update({
          title: formData.title,
          company: formData.company,
          years_experience: parseInt(formData.experienceYears),
          hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
          is_premium: formData.isPremium,
          expertise_areas: selectedSectors,
          specializations: formData.specialization,
          bio: formData.bio
        })
        .eq('id', advisorId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your advisor profile has been updated successfully.",
      });

      navigate(`/advisor/${advisorId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update advisor profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="bg-background min-h-screen py-8 px-4">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => advisorId ? navigate(`/advisor/${advisorId}`) : navigate('/find-advisor')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Advisor Profile</h1>
              <p className="text-muted-foreground">Update your professional information</p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Professional Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Business Strategy Advisor"
                    required
                  />
                </div>

                {/* Company */}
                <div>
                  <Label htmlFor="company">Company / Organization</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Your company name"
                  />
                </div>

                {/* Experience Years */}
                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Select 
                    value={formData.experienceYears}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, experienceYears: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select years of experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1-2 years</SelectItem>
                      <SelectItem value="3">3-5 years</SelectItem>
                      <SelectItem value="6">6-10 years</SelectItem>
                      <SelectItem value="11">10+ years</SelectItem>
                      <SelectItem value="15">15+ years</SelectItem>
                      <SelectItem value="20">20+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Industry Focus */}
                <div>
                  <Label>Industry Focus *</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Select the industries you advise in
                  </p>
                  <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-md p-4">
                    {SETA_SECTORS.map((sector) => (
                      <div key={sector} className="flex items-center space-x-2">
                        <Checkbox
                          id={sector}
                          checked={selectedSectors.includes(sector)}
                          onCheckedChange={() => handleSectorToggle(sector)}
                        />
                        <Label htmlFor={sector} className="text-sm cursor-pointer">
                          {sector}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Specializations */}
                <div>
                  <Label>Service Specializations *</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Select areas where you provide advisory services
                  </p>
                  <div className="grid gap-2">
                    {specializations.map((spec) => (
                      <div key={spec} className="flex items-center space-x-2">
                        <Checkbox
                          id={spec}
                          checked={formData.specialization.includes(spec)}
                          onCheckedChange={() => handleSpecializationToggle(spec)}
                        />
                        <Label htmlFor={spec} className="text-sm cursor-pointer">
                          {spec}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio">Professional Bio *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about your professional background and expertise..."
                    rows={6}
                    required
                  />
                </div>

                {/* Premium Services */}
                <Card variant="glass">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="premium">Premium Services</Label>
                        <p className="text-sm text-muted-foreground">
                          Offer premium consulting services with custom rates
                        </p>
                      </div>
                      <Switch
                        id="premium"
                        checked={formData.isPremium}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPremium: checked }))}
                      />
                    </div>

                    {formData.isPremium && (
                      <div>
                        <Label htmlFor="rate">Hourly Rate (ZAR)</Label>
                        <Input
                          id="rate"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                          placeholder="150.00"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => advisorId ? navigate(`/advisor/${advisorId}`) : navigate('/find-advisor')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EditAdvisorProfile;
