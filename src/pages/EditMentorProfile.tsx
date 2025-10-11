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
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  last_name: z.string().trim().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  bio: z.string().trim().max(1000, "Bio must be less than 1000 characters").optional(),
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
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    profile_picture_url: "",
    title: "",
    company: "",
    hourly_rate: "",
    experience_years: "",
    status: "available" as "available" | "unavailable" | "busy",
  });

  useEffect(() => {
    fetchProfile();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('mentoring_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

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

        // Fetch mentor categories
        const { data: mentorCategories } = await supabase
          .from('mentor_categories')
          .select('category_id')
          .eq('mentor_id', mentorData.id);

        if (mentorCategories) {
          setSelectedCategories(mentorCategories.map(mc => mc.category_id));
        }
      }

      setFormData({
        first_name: profileData?.first_name || "",
        last_name: profileData?.last_name || "",
        bio: profileData?.bio || "",
        profile_picture_url: profileData?.profile_picture_url || "",
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, profile_picture_url: publicUrl }));

      toast({
        title: "Success",
        description: "Profile picture uploaded successfully"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      profileSchema.parse(formData);
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

    if (selectedCategories.length === 0) {
      toast({
        title: "Category Required",
        description: "Please select at least one mentoring category.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      if (!userId) throw new Error("User not authenticated");

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
          profile_picture_url: formData.profile_picture_url,
        })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Update or create mentor profile
      const mentorData = {
        user_id: userId,
        title: formData.title,
        company: formData.company || null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        status: formData.status,
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

      // Update mentor categories
      if (currentMentorId) {
        // Delete existing category associations
        await supabase
          .from('mentor_categories')
          .delete()
          .eq('mentor_id', currentMentorId);

        // Insert new category associations
        const categoryInserts = selectedCategories.map(categoryId => ({
          mentor_id: currentMentorId,
          category_id: categoryId
        }));

        const { error: categoriesError } = await supabase
          .from('mentor_categories')
          .insert(categoryInserts);

        if (categoriesError) throw categoriesError;
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
              {/* Profile Picture */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={formData.profile_picture_url} alt="Profile" className="object-cover" />
                  <AvatarFallback className="text-4xl">
                    {formData.first_name?.[0]}{formData.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Input
                    id="picture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <Label htmlFor="picture">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => document.getElementById('picture')?.click()}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </>
                      )}
                    </Button>
                  </Label>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Bio</Label>
                <RichTextEditor
                  value={formData.bio}
                  onChange={(value) => setFormData(prev => ({ ...prev, bio: value }))}
                  placeholder="Tell us about yourself..."
                  maxLength={1000}
                />
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
                    <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
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
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={`edit-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`edit-${category.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {category.name}
                          </Label>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {category.description}
                            </p>
                          )}
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
                  disabled={saving || uploading}
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
                  disabled={saving || uploading}
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
