import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SectorMultiSelect } from '@/components/onboarding/SectorMultiSelect';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  organization: z.string().optional(),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitter_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface BasicProfileEditorProps {
  profile: any;
  onSave: (data: any) => Promise<void>;
  saving: boolean;
}

const BasicProfileEditor = ({ profile, onSave, saving }: BasicProfileEditorProps) => {
  const [uploading, setUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(profile?.profile_picture_url || '');
  const [selectedSectors, setSelectedSectors] = useState<string[]>(profile?.industry_sectors || []);
  const [skills, setSkills] = useState(profile?.skills?.join(', ') || '');
  const [interests, setInterests] = useState(profile?.interests?.join(', ') || '');

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      bio: profile?.bio || '',
      organization: profile?.organization || '',
      linkedin_url: profile?.linkedin_url || '',
      twitter_url: profile?.twitter_url || '',
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.user_id}-${Date.now()}.${fileExt}`;
      const filePath = `${profile?.user_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      setProfilePicture(publicUrl);
      
      // Update profile immediately
      await onSave({ profile_picture_url: publicUrl });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    const updateData = {
      ...data,
      industry_sectors: selectedSectors.length > 0 ? selectedSectors : null,
      skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : null,
      interests: interests ? interests.split(',').map(i => i.trim()).filter(Boolean) : null,
    };

    await onSave(updateData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profilePicture} />
          <AvatarFallback className="text-2xl">
            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <Label htmlFor="profile-picture" className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Change Photo'}
            </div>
            <Input
              id="profile-picture"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </Label>
          <p className="text-xs text-muted-foreground mt-2">
            JPG, PNG or GIF. Max size 2MB
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input id="first_name" {...register('first_name')} />
          {errors.first_name && (
            <p className="text-sm text-destructive">{errors.first_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input id="last_name" {...register('last_name')} />
          {errors.last_name && (
            <p className="text-sm text-destructive">{errors.last_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" placeholder="City, Country" {...register('location')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization">Organization</Label>
          <Input id="organization" {...register('organization')} />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          {...register('bio')}
          placeholder="Tell us about yourself..."
          rows={4}
        />
      </div>

      {/* Industry Sectors */}
      <div className="space-y-2">
        <Label>Industry Sectors</Label>
        <SectorMultiSelect
          value={selectedSectors}
          onChange={setSelectedSectors}
        />
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label htmlFor="skills">Skills</Label>
        <Input
          id="skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g., Marketing, Finance, Technology (comma-separated)"
        />
      </div>

      {/* Interests */}
      <div className="space-y-2">
        <Label htmlFor="interests">Interests</Label>
        <Input
          id="interests"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="e.g., Innovation, Sustainability, Growth (comma-separated)"
        />
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="linkedin_url">LinkedIn URL</Label>
          <Input id="linkedin_url" {...register('linkedin_url')} placeholder="https://linkedin.com/in/username" />
          {errors.linkedin_url && (
            <p className="text-sm text-destructive">{errors.linkedin_url.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter_url">Twitter URL</Label>
          <Input id="twitter_url" {...register('twitter_url')} placeholder="https://twitter.com/username" />
          {errors.twitter_url && (
            <p className="text-sm text-destructive">{errors.twitter_url.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default BasicProfileEditor;