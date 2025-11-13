import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { SETA_SECTORS } from "@/constants/setaSectors";

const mentorSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  company: z.string().trim().max(100, "Company must be less than 100 characters").optional(),
  hourly_rate: z.string().optional(),
  experience_years: z.string().optional(),
});

const EditMentorProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  
  // Basic info from profiles table (read-only)
  const [profileInfo, setProfileInfo] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    profile_picture_url: "",
  });

  // Mentor-specific data (editable)
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    hourly_rate: "",
    experience_years: "",
    status: "available" as "available" | "unavailable" | "busy",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to edit your profile",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      setUserId(user.id);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch mentor data
      const { data: mentorData, error: mentorError } = await supabase
        .from('mentors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (mentorError && mentorError.code !== 'PGRST116') throw mentorError;

      if (mentorData) {
        setMentorId(mentorData.id);
        // Set selected sectors from expertise_areas
        if (mentorData.expertise_areas) {
          setSelectedSectors(mentorData.expertise_areas);
        }
      }

      // Set basic profile info (read-only)
      setProfileInfo({
        first_name: profileData?.first_name || "",
        last_name: profileData?.last_name || "",
        bio: profileData?.bio || "",
        profile_picture_url: profileData?.profile_picture_url || "",
      });

      // Set mentor-specific data (editable)
      setFormData({
        title: mentorData?.title || "",
        company: mentorData?.company || "",
        hourly_rate: mentorData?.hourly_rate?.toString() || "",
        experience_years: mentorData?.experience_years?.toString() || "",
        status: mentorData?.status || "available",
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSectorToggle = (sector: string) => {
    setSelectedSectors(prev => 
      prev.includes(sector)
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate mentor-specific data only
    try {
      mentorSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
        return;
      }
    }

    if (selectedSectors.length === 0) {
      toast({
        title: "Sector Required",
        description: "Please select at least one sector.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      if (!userId) throw new Error("User not authenticated");

      // Update only mentor-specific data
      const mentorData = {
        user_id: userId,
        title: formData.title,
        company: formData.company || null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        status: formData.status,
        expertise_areas: selectedSectors,
      };

      let currentMentorId = mentorId;

      if (mentorId) {
        const { error: mentorError } = await supabase
          .from('mentors')
          .update(mentorData)
          .eq('id', mentorId);

        if (mentorError) throw mentorError;
      } else {
        const { data: newMentor, error: mentorError } = await supabase
          .from('mentors')
          .insert(mentorData)
          .select()
          .single();

        if (mentorError) throw mentorError;
        currentMentorId = newMentor.id;
        setMentorId(newMentor.id);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });

      navigate(`/mentor/${currentMentorId}`);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Mentor Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Profile Info (Read-only) */}
              <div className="border-b pb-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">Basic Profile Information</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/edit-profile')}
                  >
                    Edit Basic Info
                  </Button>
                </div>
                <div className="flex items-start gap-6 bg-muted/30 p-4 rounded-lg">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileInfo.profile_picture_url} alt="Profile" className="object-cover" />
                    <AvatarFallback className="text-2xl">
                      {profileInfo.first_name?.[0]}{profileInfo.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="font-medium">{profileInfo.first_name} {profileInfo.last_name}</p>
                    </div>
                    {profileInfo.bio && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Bio</Label>
                        <div className="text-sm" dangerouslySetInnerHTML={{ __html: profileInfo.bio }} />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Basic information is shared across all your profiles. Edit it from your main profile page.
                </p>
              </div>

              {/* Mentor Information */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Mentor Information</h3>
                
                <div>
                  <Label htmlFor="title">Professional Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Financial Analyst"
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g., Kumii"
                    maxLength={100}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hourly_rate">Hourly Rate (ZAR)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min="0"
                      value={formData.experience_years}
                      onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Availability Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as "available" | "unavailable" | "busy" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Mentoring Focus Areas * (Select at least one)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SETA_SECTORS.map((sector) => (
                      <div
                        key={sector}
                        className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={`edit-${sector}`}
                          checked={selectedSectors.includes(sector)}
                          onCheckedChange={() => handleSectorToggle(sector)}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`edit-${sector}`}
                            className="font-medium cursor-pointer"
                          >
                            {sector}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditMentorProfile;
