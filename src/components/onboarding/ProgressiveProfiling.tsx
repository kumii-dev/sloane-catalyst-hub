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
            { name: 'business_status', label: 'Business Registration Status', type: 'select', options: ['Registered', 'Informal', 'In Process'] },
            { name: 'industry', label: 'Industry/Sector', type: 'text' },
          ]},
          { step: 2, questions: [
            { name: 'stage', label: 'Business Stage', type: 'select', options: ['Idea', 'Early Growth', 'Scaling'] },
            { name: 'employee_count', label: 'Number of Employees', type: 'number' },
          ]},
          { step: 3, questions: [
            { name: 'funding_needs', label: 'Do you need funding?', type: 'select', options: ['Yes', 'No', 'Maybe'] },
          ]},
        ];
      case 'funder':
        return [
          { step: 1, questions: [
            { name: 'funding_type', label: 'Type of Funding', type: 'select', options: ['Grant', 'Loan', 'Equity', 'Other'] },
            { name: 'funding_range', label: 'Funding Range (Min-Max)', type: 'text' },
          ]},
          { step: 2, questions: [
            { name: 'target_sectors', label: 'Target Sectors', type: 'text' },
            { name: 'preferred_stage', label: 'Preferred Stage', type: 'select', options: ['Early Stage', 'Scale-up', 'Both'] },
          ]},
        ];
      case 'service_provider':
        return [
          { step: 1, questions: [
            { name: 'service_category', label: 'Service Category', type: 'select', options: ['Accounting', 'Legal', 'GRC', 'Technology', 'Marketing', 'Other'] },
            { name: 'services_offered', label: 'Services Offered', type: 'text' },
          ]},
          { step: 2, questions: [
            { name: 'pricing_model', label: 'Pricing Model', type: 'select', options: ['Hourly', 'Fixed', 'Subscription'] },
          ]},
        ];
      case 'mentor_advisor':
        return [
          { step: 1, questions: [
            { name: 'expertise_areas', label: 'Expertise Areas', type: 'text' },
            { name: 'availability', label: 'Hours Available per Month', type: 'number' },
          ]},
          { step: 2, questions: [
            { name: 'preferred_mentee_stage', label: 'Preferred Mentee Stage', type: 'select', options: ['Early Stage', 'Growth', 'Scale-up', 'Any'] },
          ]},
        ];
      case 'job_seeker':
        return [
          { step: 1, questions: [
            { name: 'skills', label: 'Your Skills', type: 'text' },
            { name: 'experience_level', label: 'Experience Level', type: 'select', options: ['Entry', 'Mid', 'Senior', 'Executive'] },
          ]},
          { step: 2, questions: [
            { name: 'interests', label: 'Areas of Interest', type: 'select', options: ['Startup', 'Corporate', 'Freelancing'] },
          ]},
        ];
      case 'public_private_entity':
        return [
          { step: 1, questions: [
            { name: 'organization_type', label: 'Organization Type', type: 'select', options: ['Government', 'NGO', 'Corporate'] },
            { name: 'engagement_interest', label: 'Engagement Interest', type: 'text' },
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
    <div className="min-h-screen flex items-center justify-center p-4 main-gradient-light">
      <Card className="w-full max-w-2xl shadow-strong">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Step {step} of {totalSteps}
          </CardDescription>
          <Progress value={progress} className="mt-2" />
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
