import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SectorMultiSelect } from '@/components/onboarding/SectorMultiSelect';

interface StartupProfileEditorProps {
  userId: string;
}

const StartupProfileEditor = ({ userId }: StartupProfileEditorProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [startupId, setStartupId] = useState<string | null>(null);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [marketAccess, setMarketAccess] = useState<string[]>([]);
  const [challenges, setChallenges] = useState('');
  const [support, setSupport] = useState('');
  const [products, setProducts] = useState('');

  const { register, handleSubmit, setValue, watch } = useForm();

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('startup_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setStartupId(data.id);
        // Set form values
        Object.keys(data).forEach((key) => {
          setValue(key, data[key]);
        });
        // Industry sectors are managed in the profiles table
        setMarketAccess(data.market_access_needs || []);
        setChallenges(data.challenges?.join(', ') || '');
        setSupport(data.support_needed?.join(', ') || '');
        setProducts(data.key_products_services?.join(', ') || '');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const profileData = {
        ...data,
        user_id: userId,
        market_access_needs: marketAccess.length > 0 ? marketAccess : null,
        challenges: challenges ? challenges.split(',').map(s => s.trim()).filter(Boolean) : null,
        support_needed: support ? support.split(',').map(s => s.trim()).filter(Boolean) : null,
        key_products_services: products ? products.split(',').map(s => s.trim()).filter(Boolean) : null,
      };

      if (startupId) {
        const { error } = await supabase
          .from('startup_profiles')
          .update(profileData)
          .eq('id', startupId);
        if (error) throw error;
      } else {
        const { data: newProfile, error } = await supabase
          .from('startup_profiles')
          .insert([profileData])
          .select()
          .single();
        if (error) throw error;
        setStartupId(newProfile.id);
      }

      toast({
        title: 'Success',
        description: 'Startup profile updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Business Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Business Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input id="company_name" {...register('company_name')} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">Company Logo URL</Label>
            <Input id="logo_url" {...register('logo_url')} placeholder="https://example.com/logo.png" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_registration_number">Registration Number</Label>
            <Input id="business_registration_number" {...register('business_registration_number')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_age">Business Age</Label>
            <Select onValueChange={(value) => setValue('business_age', value)} value={watch('business_age') || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select business age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pre-launch">Pre-launch</SelectItem>
                <SelectItem value="Less than 1 year">Less than 1 year</SelectItem>
                <SelectItem value="1-3 years">1-3 years</SelectItem>
                <SelectItem value="3-5 years">3-5 years</SelectItem>
                <SelectItem value="5+ years">5+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee_count_range">Employee Count</Label>
            <Select onValueChange={(value) => setValue('employee_count_range', value)} value={watch('employee_count_range') || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Just me">Just me</SelectItem>
                <SelectItem value="2-5">2-5</SelectItem>
                <SelectItem value="6-20">6-20</SelectItem>
                <SelectItem value="21-50">21-50</SelectItem>
                <SelectItem value="50+">50+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenue_range">Annual Revenue (ZAR)</Label>
            <Select onValueChange={(value) => setValue('revenue_range', value)} value={watch('revenue_range') || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select revenue range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="R0-R100k">R0-R100k</SelectItem>
                <SelectItem value="R100k-R500k">R100k-R500k</SelectItem>
                <SelectItem value="R500k-R2M">R500k-R2M</SelectItem>
                <SelectItem value="R2M-R10M">R2M-R10M</SelectItem>
                <SelectItem value="R10M+">R10M+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="growth_stage">Growth Stage</Label>
            <Select onValueChange={(value) => setValue('growth_stage', value)} value={watch('growth_stage') || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select growth stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ideation">Ideation</SelectItem>
                <SelectItem value="MVP">MVP</SelectItem>
                <SelectItem value="Early Stage">Early Stage</SelectItem>
                <SelectItem value="Growth">Growth</SelectItem>
                <SelectItem value="Scale-up">Scale-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Business Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Describe your business..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="key_products_services">Key Products/Services (comma-separated)</Label>
          <Input
            id="key_products_services"
            value={products}
            onChange={(e) => setProducts(e.target.value)}
            placeholder="e.g., SaaS Platform, Consulting, Hardware"
          />
        </div>
      </div>

      {/* Funding Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Funding Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="funding_needs">Funding Needs</Label>
            <Select onValueChange={(value) => setValue('funding_needs', value)} value={watch('funding_needs') || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select funding needs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes, urgently">Yes, urgently</SelectItem>
                <SelectItem value="Yes, within 6 months">Yes, within 6 months</SelectItem>
                <SelectItem value="Planning for future">Planning for future</SelectItem>
                <SelectItem value="Not needed">Not needed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="funding_amount_needed">Funding Amount Needed (ZAR)</Label>
            <Select onValueChange={(value) => setValue('funding_amount_needed', value)} value={watch('funding_amount_needed') || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="R0-R50k">R0-R50k</SelectItem>
                <SelectItem value="R50k-R250k">R50k-R250k</SelectItem>
                <SelectItem value="R250k-R1M">R250k-R1M</SelectItem>
                <SelectItem value="R1M-R5M">R1M-R5M</SelectItem>
                <SelectItem value="R5M+">R5M+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="funding_history">Previous Funding</Label>
            <Select onValueChange={(value) => setValue('funding_history', value)} value={watch('funding_history') || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select funding history" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Friends & Family">Friends & Family</SelectItem>
                <SelectItem value="Grant">Grant</SelectItem>
                <SelectItem value="Loan">Loan</SelectItem>
                <SelectItem value="Equity Investment">Equity Investment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Market & Operations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Market & Operations</h3>
        
        <div className="space-y-2">
          <Label htmlFor="target_market">Target Market</Label>
          <Input
            id="target_market"
            {...register('target_market')}
            placeholder="Describe your target market..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="competitive_advantage">Competitive Advantage</Label>
          <Textarea
            id="competitive_advantage"
            {...register('competitive_advantage')}
            placeholder="What makes your business unique?"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_model">Business Model</Label>
          <Input
            id="business_model"
            {...register('business_model')}
            placeholder="e.g., B2B SaaS, Marketplace, Direct Sales"
          />
        </div>

        <div className="space-y-2">
          <Label>Challenges (comma-separated)</Label>
          <Input
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            placeholder="e.g., Funding, Market Access, Skills"
          />
        </div>

        <div className="space-y-2">
          <Label>Support Needed (comma-separated)</Label>
          <Input
            value={support}
            onChange={(e) => setSupport(e.target.value)}
            placeholder="e.g., Mentorship, Funding, Technology"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Startup Profile'}
        </Button>
      </div>
    </form>
  );
};

export default StartupProfileEditor;