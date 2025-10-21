import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface ProgressiveProfilingProps {
  personaType: string;
  onComplete: () => void;
  onSkip: () => void;
}

const ProgressiveProfiling = ({ personaType, onComplete, onSkip }: ProgressiveProfilingProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const getQuestions = () => {
    switch (personaType) {
      case 'smme_startup':
        return [
          { step: 1, questions: [
            { name: 'business_status', label: 'Business Registration Status', type: 'select', options: ['Registered Company', 'Sole Proprietor', 'Informal Business', 'In Registration Process'] },
            { name: 'industry', label: 'Industry/Sector', type: 'text' },
            { name: 'business_age', label: 'Years in Operation', type: 'select', options: ['Pre-launch', 'Less than 1 year', '1-3 years', '3-5 years', '5+ years'] },
          ]},
          { step: 2, questions: [
            { name: 'annual_revenue', label: 'Annual Revenue (ZAR)', type: 'select', options: ['R0-R100k', 'R100k-R500k', 'R500k-R2M', 'R2M-R10M', 'R10M+'] },
            { name: 'employee_count', label: 'Number of Employees', type: 'select', options: ['Just me', '2-5', '6-20', '21-50', '50+'] },
            { name: 'funding_history', label: 'Previous Funding Received?', type: 'select', options: ['None', 'Friends & Family', 'Grant', 'Loan', 'Equity Investment'] },
          ]},
          { step: 3, questions: [
            { name: 'funding_needs', label: 'Immediate Funding Needs', type: 'select', options: ['Yes, urgently', 'Yes, within 6 months', 'Planning for future', 'Not needed'] },
            { name: 'funding_amount', label: 'Funding Amount Needed (ZAR)', type: 'select', options: ['R0-R50k', 'R50k-R250k', 'R250k-R1M', 'R1M-R5M', 'R5M+'] },
            { name: 'market_access_needs', label: 'Primary Need', type: 'select', options: ['Funding Access', 'Market Access', 'Skills Development', 'Mentorship', 'All of the above'] },
          ]},
        ];
      case 'funder':
        return [
          { step: 1, questions: [
            { name: 'organization_name', label: 'Organization Name', type: 'text' },
            { name: 'funding_type', label: 'Type of Funding Provided', type: 'select', options: ['Grant', 'Loan', 'Equity Investment', 'Hybrid', 'Other'] },
            { name: 'funding_range', label: 'Typical Funding Range (ZAR)', type: 'select', options: ['R0-R100k', 'R100k-R500k', 'R500k-R2M', 'R2M-R10M', 'R10M+'] },
          ]},
          { step: 2, questions: [
            { name: 'target_sectors', label: 'Target Sectors (comma-separated)', type: 'text' },
            { name: 'preferred_stage', label: 'Preferred Business Stage', type: 'select', options: ['Early Stage/Startup', 'Growth Stage', 'Scale-up', 'All Stages'] },
            { name: 'geographic_focus', label: 'Geographic Focus', type: 'select', options: ['National', 'Provincial', 'Local', 'Pan-African', 'Global'] },
          ]},
        ];
      case 'service_provider':
        return [
          { step: 1, questions: [
            { name: 'company_name', label: 'Company Name', type: 'text' },
            { name: 'service_category', label: 'Primary Service Category', type: 'select', options: ['Cloud Services (AWS/Azure/GCP)', 'Enterprise Software (SAP/Microsoft)', 'Accounting & Finance', 'Legal & Compliance', 'GRC Services', 'Technology & IT', 'Marketing & Growth', 'Other'] },
            { name: 'services_offered', label: 'Specific Services Offered', type: 'text' },
          ]},
          { step: 2, questions: [
            { name: 'company_size', label: 'Company Size', type: 'select', options: ['Solo/Freelancer', 'Small (2-10)', 'Medium (11-50)', 'Large (51-200)', 'Enterprise (200+)'] },
            { name: 'certifications', label: 'Certifications/Partnerships', type: 'text' },
            { name: 'pricing_model', label: 'Pricing Model', type: 'select', options: ['Hourly Rate', 'Project-based', 'Monthly Subscription', 'Usage-based', 'Custom'] },
          ]},
        ];
      case 'professional':
        return [
          { step: 1, questions: [
            { name: 'professional_type', label: 'Professional Type', type: 'select', options: ['Mentor', 'Business Advisor', 'Executive Coach', 'Industry Expert', 'Consultant'] },
            { name: 'expertise_areas', label: 'Expertise Areas (comma-separated)', type: 'text' },
            { name: 'years_experience', label: 'Years of Experience', type: 'select', options: ['5-10 years', '10-15 years', '15-20 years', '20+ years'] },
          ]},
          { step: 2, questions: [
            { name: 'preferred_focus', label: 'Preferred Focus Area', type: 'select', options: ['Strategy & Growth', 'Fundraising & Finance', 'Operations & Scaling', 'Marketing & Sales', 'Technology & Innovation', 'Leadership Development'] },
            { name: 'availability', label: 'Hours Available per Month', type: 'select', options: ['1-5 hours', '6-10 hours', '11-20 hours', '20+ hours'] },
            { name: 'preferred_stage', label: 'Preferred Business Stage', type: 'select', options: ['Early Stage', 'Growth Stage', 'Scale-up', 'All Stages'] },
          ]},
        ];
      case 'skills_development':
        return [
          { step: 1, questions: [
            { name: 'current_status', label: 'Current Status', type: 'select', options: ['Job Seeker', 'Student/Learner', 'Career Switcher', 'Aspiring Entrepreneur', 'Upskilling Professional'] },
            { name: 'skills', label: 'Current Skills (comma-separated)', type: 'text' },
            { name: 'education_level', label: 'Highest Education Level', type: 'select', options: ['High School', 'Certificate/Diploma', 'Undergraduate', 'Postgraduate', 'Professional Qualifications'] },
          ]},
          { step: 2, questions: [
            { name: 'interest_areas', label: 'Primary Interest', type: 'select', options: ['Entrepreneurship Training', 'Technical Skills', 'Business Skills', 'Job Opportunities', 'Career Mentorship'] },
            { name: 'experience_level', label: 'Experience Level', type: 'select', options: ['Entry Level', 'Junior (1-3 years)', 'Mid-Level (3-7 years)', 'Senior (7+ years)'] },
            { name: 'learning_goals', label: 'Learning Goals', type: 'select', options: ['Start a Business', 'Find Employment', 'Career Advancement', 'Skill Enhancement', 'Career Change'] },
          ]},
        ];
      case 'public_private_entity':
        return [
          { step: 1, questions: [
            { name: 'organization_name', label: 'Organization Name', type: 'text' },
            { name: 'organization_type', label: 'Organization Type', type: 'select', options: ['Government Agency', 'Development Finance Institution', 'NGO/NPO', 'Corporate/Enterprise', 'Industry Association'] },
            { name: 'primary_mandate', label: 'Primary Mandate', type: 'text' },
          ]},
          { step: 2, questions: [
            { name: 'engagement_interest', label: 'Engagement Interest', type: 'select', options: ['SMME Support Programs', 'Skills Development', 'Funding Opportunities', 'Market Access', 'Partnership & Collaboration'] },
            { name: 'geographic_scope', label: 'Geographic Scope', type: 'select', options: ['National', 'Provincial', 'Municipal', 'Regional', 'International'] },
          ]},
        ];
      default:
        return [];
    }
  };

  const questions = getQuestions();
  const totalSteps = questions.length;
  const currentQuestions = questions[step - 1]?.questions || [];
  const progress = (step / totalSteps) * 100;

  const handleInputChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save current step data
      for (const question of currentQuestions) {
        const value = formData[question.name];
        if (value) {
          await supabase.from('progressive_profile_data').upsert({
            user_id: user.id,
            persona_type: personaType as any,
            field_name: question.name,
            field_value: { value },
          });
        }
      }

      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        // Mark profiling as complete
        await supabase.from('profiles').update({
          persona_completed: true,
          onboarding_step: totalSteps + 1,
        }).eq('user_id', user.id);
        
        toast({
          title: 'Profile completed!',
          description: 'Thank you for completing your profile.',
        });
        onComplete();
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

  const handleSkipStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onSkip();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <Card className="w-full max-w-2xl shadow-strong border-primary/20 bg-card/95 backdrop-blur">
        <CardHeader className="space-y-4">
          <div className="inline-block">
            <div className="h-1 w-16 bg-gradient-to-r from-primary via-accent to-primary rounded-full" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription className="text-base">
            Step {step} of {totalSteps} - Help us personalize your experience
          </CardDescription>
          <Progress value={progress} className="mt-4 h-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestions.map((question) => (
            <div key={question.name} className="space-y-2">
              <Label htmlFor={question.name}>{question.label}</Label>
              {question.type === 'select' && question.options ? (
                <Select
                  value={formData[question.name] || ''}
                  onValueChange={(value) => handleInputChange(question.name, value)}
                >
                  <SelectTrigger id={question.name}>
                    <SelectValue placeholder={`Select ${question.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={question.name}
                  type={question.type}
                  value={formData[question.name] || ''}
                  onChange={(e) => handleInputChange(question.name, e.target.value)}
                  placeholder={`Enter ${question.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={handleSkipStep}>
            Skip
          </Button>
          <Button onClick={handleNext} disabled={loading}>
            {loading ? 'Saving...' : step < totalSteps ? 'Next' : 'Complete'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProgressiveProfiling;
