import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PersonaSelector from '@/components/onboarding/PersonaSelector';
import ProgressiveProfiling from '@/components/onboarding/ProgressiveProfiling';
import { toast } from '@/hooks/use-toast';

const Onboarding = () => {
  const [step, setStep] = useState<'persona' | 'profiling' | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Temporarily disabled redirects for preview
      // if (!user) {
      //   navigate('/auth');
      //   return;
      // }

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('persona_type, persona_completed, onboarding_step')
          .eq('user_id', user.id)
          .single();

        // Temporarily disabled redirect for preview
        // if (profile?.persona_completed) {
        //   navigate('/');
        // } else 
        if (profile?.persona_type && profile.persona_type !== 'unassigned') {
          setSelectedPersona(profile.persona_type);
          setStep('profiling');
        } else {
          setStep('persona');
        }
      } else {
        // Show persona selector even without login for preview
        setStep('persona');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setStep('persona');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaSelection = async (persona: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase.from('profiles').update({
        persona_type: persona as any,
        onboarding_step: 2,
      }).eq('user_id', user.id);

      setSelectedPersona(persona);
      setStep('profiling');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSkipPersona = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({
        onboarding_step: 2,
      }).eq('user_id', user.id);
    }
    navigate('/');
  };

  const handleComplete = () => {
    navigate('/');
  };

  const handleSkipProfiling = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({
        persona_completed: true,
      }).eq('user_id', user.id);
    }
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (step === 'persona') {
    return (
      <PersonaSelector
        onSelectPersona={handlePersonaSelection}
        onSkip={handleSkipPersona}
      />
    );
  }

  if (step === 'profiling' && selectedPersona) {
    return (
      <ProgressiveProfiling
        personaType={selectedPersona}
        onComplete={handleComplete}
        onSkip={handleSkipProfiling}
      />
    );
  }

  return null;
};

export default Onboarding;
