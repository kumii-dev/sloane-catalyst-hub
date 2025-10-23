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

interface FunderProfileEditorProps {
  userId: string;
}

const FunderProfileEditor = ({ userId }: FunderProfileEditorProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [funderId, setFunderId] = useState<string | null>(null);
  const [sectorPreferences, setSectorPreferences] = useState<string[]>([]);
  const [stagePreferences, setStagePreferences] = useState<string[]>([]);
  const [geoPreferences, setGeoPreferences] = useState('');

  const { register, handleSubmit, setValue, watch } = useForm();

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('funders')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFunderId(data.id);
        Object.keys(data).forEach((key) => {
          setValue(key, data[key]);
        });
        setSectorPreferences(data.sector_preferences || []);
        setStagePreferences(data.stage_preferences || []);
        setGeoPreferences(data.geographic_preferences?.join(', ') || '');
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
        sector_preferences: sectorPreferences.length > 0 ? sectorPreferences : null,
        stage_preferences: stagePreferences.length > 0 ? stagePreferences : null,
        geographic_preferences: geoPreferences ? geoPreferences.split(',').map(s => s.trim()).filter(Boolean) : null,
      };

      if (funderId) {
        const { error } = await supabase
          .from('funders')
          .update(profileData)
          .eq('id', funderId);
        if (error) throw error;
      } else {
        const { data: newProfile, error } = await supabase
          .from('funders')
          .insert([profileData])
          .select()
          .single();
        if (error) throw error;
        setFunderId(newProfile.id);
      }

      toast({
        title: 'Success',
        description: 'Funder profile updated successfully',
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

  const stages = ['Ideation', 'MVP', 'Early Stage', 'Growth', 'Scale-up'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Organization Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Organization Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="organization_name">Organization Name *</Label>
            <Input id="organization_name" {...register('organization_name')} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization_type">Organization Type</Label>
            <Select onValueChange={(value) => setValue('organization_type', value)} value={watch('organization_type') || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Venture Capital">Venture Capital</SelectItem>
                <SelectItem value="Angel Investor">Angel Investor</SelectItem>
                <SelectItem value="Grant Provider">Grant Provider</SelectItem>
                <SelectItem value="Development Finance">Development Finance</SelectItem>
                <SelectItem value="Corporate Investor">Corporate Investor</SelectItem>
                <SelectItem value="Government">Government</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" {...register('website')} placeholder="https://example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input id="linkedin_url" type="url" {...register('linkedin_url')} placeholder="https://linkedin.com/company/..." />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Organization Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Describe your organization and investment focus..."
            rows={4}
          />
        </div>
      </div>

      {/* Investment Criteria */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Investment Criteria</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_funding_amount">Minimum Funding Amount (ZAR)</Label>
            <Input
              id="min_funding_amount"
              type="number"
              {...register('min_funding_amount', { valueAsNumber: true })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_funding_amount">Maximum Funding Amount (ZAR)</Label>
            <Input
              id="max_funding_amount"
              type="number"
              {...register('max_funding_amount', { valueAsNumber: true })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="funding_model">Funding Model</Label>
            <Select onValueChange={(value) => setValue('funding_model', value)} value={watch('funding_model') || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select funding model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Grant">Grant</SelectItem>
                <SelectItem value="Loan">Loan</SelectItem>
                <SelectItem value="Equity">Equity</SelectItem>
                <SelectItem value="Convertible Note">Convertible Note</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="decision_timeline">Decision Timeline</Label>
            <Select onValueChange={(value) => setValue('decision_timeline', value)} value={watch('decision_timeline') || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                <SelectItem value="1-2 months">1-2 months</SelectItem>
                <SelectItem value="2-3 months">2-3 months</SelectItem>
                <SelectItem value="3+ months">3+ months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="investment_criteria">Investment Criteria</Label>
          <Textarea
            id="investment_criteria"
            {...register('investment_criteria')}
            placeholder="What do you look for in investments?"
            rows={3}
          />
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Investment Preferences</h3>
        
        <div className="space-y-2">
          <Label>Sector Preferences</Label>
          <SectorMultiSelect
            value={sectorPreferences}
            onChange={setSectorPreferences}
          />
        </div>

        <div className="space-y-2">
          <Label>Stage Preferences</Label>
          <div className="flex flex-wrap gap-2">
            {stages.map((stage) => (
              <Button
                key={stage}
                type="button"
                variant={stagePreferences.includes(stage) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStagePreferences(prev =>
                    prev.includes(stage)
                      ? prev.filter(s => s !== stage)
                      : [...prev, stage]
                  );
                }}
              >
                {stage}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Geographic Preferences (comma-separated)</Label>
          <Input
            value={geoPreferences}
            onChange={(e) => setGeoPreferences(e.target.value)}
            placeholder="e.g., Gauteng, Western Cape, National"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Funder Profile'}
        </Button>
      </div>
    </form>
  );
};

export default FunderProfileEditor;