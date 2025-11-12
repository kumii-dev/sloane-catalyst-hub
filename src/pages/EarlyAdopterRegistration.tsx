import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Building2, Users, Wallet, Briefcase, GraduationCap, Building, ArrowRight, ArrowLeft } from 'lucide-react';
interface RegistrationData {
  full_name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  stakeholder_category?: string;
  other_category?: string;
  in_programme?: 'yes' | 'no' | 'not_applicable';
  programme_name?: string;
  other_programme?: string;
  company_description?: string;
  consent?: boolean;
}

const stakeholderCategories = [
  { id: 'smme_startup', label: 'Entrepreneur / Startup Founder', icon: Building2, persona: 'smme_startup' },
  { id: 'funder', label: 'Investor', icon: Wallet, persona: 'funder' },
  { id: 'mentor', label: 'Mentor / Business Advisor / Coach', icon: GraduationCap, persona: 'mentor_advisor' },
  { id: 'service_provider', label: 'Professional Services', icon: Briefcase, persona: 'service_provider' },
  { id: 'it_provider', label: 'IT Service Provider', icon: Briefcase, persona: 'service_provider' },
  { id: 'graduate', label: 'Graduate', icon: Users, persona: 'job_seeker' },
  { id: 'corporate', label: 'Corporate', icon: Building, persona: 'public_private_entity' },
  { id: 'government', label: 'Government', icon: Building, persona: 'public_private_entity' },
  { id: 'other', label: 'Other', icon: Users, persona: 'unassigned' },
];

const programmes = [
  { id: 'microsoft_ct', label: 'Microsoft EEIP Programme (Cape Town Cohort)', cohort: 'microsoft_eeip_ct' },
  { id: 'microsoft_jhb', label: 'Microsoft EEIP Programme (Johannesburg Cohort)', cohort: 'microsoft_eeip_jhb' },
  { id: 'african_bank_jhb', label: 'African Bank Capacity Building Programme FY25 (Johannesburg)', cohort: 'african_bank_jhb' },
  { id: 'african_bank_ct', label: 'African Bank Women Enterprise Development Programme (Cape Town)', cohort: 'african_bank_women_ct' },
  { id: 'other', label: 'Other', cohort: null },
];

const EarlyAdopterRegistration = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<RegistrationData>>({
    in_programme: 'not_applicable',
    consent: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationData, string>>>({});
  const navigate = useNavigate();

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const updateField = (field: keyof RegistrationData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: undefined });
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<Record<keyof RegistrationData, string>> = {};

    if (currentStep === 1) {
      if (!formData.full_name || formData.full_name.length < 2) {
        newErrors.full_name = 'Full name is required';
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        newErrors.email = 'Valid email is required';
      }
      if (!formData.phone || formData.phone.length < 10) {
        newErrors.phone = 'Valid phone number is required';
      }
    }

    if (currentStep === 2) {
      if (!formData.stakeholder_category) {
        newErrors.stakeholder_category = 'Please select a category';
      }
      if (formData.stakeholder_category === 'other' && !formData.other_category) {
        newErrors.other_category = 'Please specify your category';
      }
      if (!formData.company_description || formData.company_description.length < 10) {
        newErrors.company_description = 'Please provide a description';
      }
    }

    if (currentStep === 3) {
      if (formData.in_programme === 'yes' && !formData.programme_name) {
        newErrors.programme_name = 'Please select a programme';
      }
      if (formData.programme_name === 'other' && !formData.other_programme) {
        newErrors.other_programme = 'Please specify the programme';
      }
      if (!formData.consent) {
        newErrors.consent = 'You must consent to participate';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setLoading(true);
    try {
      // Create account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email!,
        password: Math.random().toString(36).slice(-12) + 'A1!', // Temporary password
        options: {
          data: {
            full_name: formData.full_name,
            phone: formData.phone,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Registration failed');

      // Update profile with additional data
      const selectedCategory = stakeholderCategories.find(c => c.id === formData.stakeholder_category);
      
      await supabase.from('profiles').update({
        full_name: formData.full_name,
        phone: formData.phone,
        company_name: formData.company_name || null,
        persona_type: selectedCategory?.persona as any,
        bio: formData.company_description,
        onboarding_step: 1,
      }).eq('user_id', authData.user.id);

      // Store programme info for admin processing
      if (formData.in_programme === 'yes' && formData.programme_name) {
        const selectedProgramme = programmes.find(p => p.id === formData.programme_name);
        const programmeData = {
          programme_id: formData.programme_name,
          programme_label: selectedProgramme?.label || formData.other_programme,
          cohort_slug: selectedProgramme?.cohort,
          registration_date: new Date().toISOString(),
        };

        await supabase.from('progressive_profile_data').insert({
          user_id: authData.user.id,
          persona_type: selectedCategory?.persona as any,
          field_name: 'programme_info',
          field_value: programmeData,
        });
      }

      // Store early adopter metadata
      await supabase.from('progressive_profile_data').insert({
        user_id: authData.user.id,
        persona_type: selectedCategory?.persona as any,
        field_name: 'early_adopter_info',
        field_value: {
          stakeholder_category: formData.stakeholder_category,
          other_category: formData.other_category,
          in_programme: formData.in_programme,
          programme_name: formData.programme_name,
          other_programme: formData.other_programme,
          registration_date: new Date().toISOString(),
        },
      });

      toast({
        title: 'Registration successful!',
        description: 'Please check your email to verify your account and set your password.',
      });

      navigate('/auth');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Name and Surname *</Label>
        <Input
          id="full_name"
          value={formData.full_name || ''}
          onChange={(e) => updateField('full_name', e.target.value)}
          placeholder="Enter your full name"
        />
        {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="your.email@example.com"
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder="+27 XX XXX XXXX"
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_name">Company Name</Label>
        <Input
          id="company_name"
          value={formData.company_name || ''}
          onChange={(e) => updateField('company_name', e.target.value)}
          placeholder="N/A if not applicable"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="stakeholder_category">Stakeholder Category *</Label>
        <Select
          value={formData.stakeholder_category}
          onValueChange={(value) => updateField('stakeholder_category', value)}
        >
          <SelectTrigger id="stakeholder_category">
            <SelectValue placeholder="Select your category" />
          </SelectTrigger>
          <SelectContent>
            {stakeholderCategories.map((category) => {
              const Icon = category.icon;
              return (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {errors.stakeholder_category && (
          <p className="text-sm text-destructive">{errors.stakeholder_category}</p>
        )}
      </div>

      {formData.stakeholder_category === 'other' && (
        <div className="space-y-2">
          <Label htmlFor="other_category">Please Specify *</Label>
          <Input
            id="other_category"
            value={formData.other_category || ''}
            onChange={(e) => updateField('other_category', e.target.value)}
            placeholder="Specify your stakeholder category"
          />
          {errors.other_category && (
            <p className="text-sm text-destructive">{errors.other_category}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="company_description">Company/Role Description *</Label>
        <Textarea
          id="company_description"
          value={formData.company_description || ''}
          onChange={(e) => updateField('company_description', e.target.value)}
          placeholder="Brief description of your company or role in the ecosystem"
          rows={4}
        />
        {errors.company_description && (
          <p className="text-sm text-destructive">{errors.company_description}</p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Are you currently in a programme? *</Label>
        <Select
          value={formData.in_programme}
          onValueChange={(value: any) => updateField('in_programme', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
            <SelectItem value="not_applicable">Not Applicable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.in_programme === 'yes' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="programme_name">Programme Name *</Label>
            <Select
              value={formData.programme_name}
              onValueChange={(value) => updateField('programme_name', value)}
            >
              <SelectTrigger id="programme_name">
                <SelectValue placeholder="Select your programme" />
              </SelectTrigger>
              <SelectContent>
                {programmes.map((programme) => (
                  <SelectItem key={programme.id} value={programme.id}>
                    {programme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.programme_name && (
              <p className="text-sm text-destructive">{errors.programme_name}</p>
            )}
          </div>

          {formData.programme_name === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="other_programme">Specify Programme *</Label>
              <Input
                id="other_programme"
                value={formData.other_programme || ''}
                onChange={(e) => updateField('other_programme', e.target.value)}
                placeholder="Enter programme name"
              />
              {errors.other_programme && (
                <p className="text-sm text-destructive">{errors.other_programme}</p>
              )}
            </div>
          )}
        </>
      )}

      <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-start gap-3">
          <Checkbox
            id="consent"
            checked={formData.consent}
            onCheckedChange={(checked) => updateField('consent', checked)}
          />
          <div className="flex-1">
            <Label htmlFor="consent" className="text-sm font-normal cursor-pointer">
              I confirm that:
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>• I agree to participate in the Kumii pilot testing initiative</li>
                <li>• I understand my participation involves being onboarded onto the Kumii platform</li>
                <li>• I consent to the collection and use of my information for pilot purposes</li>
              </ul>
            </Label>
          </div>
        </div>
        {errors.consent && <p className="text-sm text-destructive">{errors.consent}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 main-gradient-light">
      <Card className="w-full max-w-2xl shadow-strong">
        <CardHeader>
          <CardTitle className="text-2xl">Join Kumii Early Adopter Programme</CardTitle>
          <CardDescription>
            Help us build the future of the entrepreneurship ecosystem
          </CardDescription>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {step} of {totalSteps}
          </p>
        </CardHeader>
        <CardContent>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} disabled={loading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            {step < totalSteps ? (
              <Button onClick={handleNext} className="ml-auto">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="ml-auto">
                {loading ? 'Submitting...' : 'Complete Registration'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarlyAdopterRegistration;
