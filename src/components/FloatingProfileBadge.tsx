import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function FloatingProfileBadge() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completion, setCompletion] = useState<number | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    async function fetchProfileCompletion() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_completion_percentage')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && !error) {
        setCompletion(data.profile_completion_percentage ?? 0);
      }
    }

    fetchProfileCompletion();
  }, [user]);

  if (!user || completion === null || completion === 100 || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 animate-in slide-in-from-bottom-4 duration-500">
      <div className="relative bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl shadow-2xl p-4 md:p-6 max-w-[280px] md:max-w-sm">
        {/* Close button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          aria-label="Dismiss profile reminder"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon and Badge */}
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-primary-foreground/20 rounded-full p-2">
            <User className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm md:text-base">Profile Status</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="bg-primary-foreground/20 rounded-full px-2 py-0.5">
                <span className="text-xs md:text-sm font-bold">{completion}%</span>
              </div>
              <span className="text-xs text-primary-foreground/80">Complete</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs md:text-sm text-primary-foreground/90 mb-4 leading-relaxed">
          Complete your profile to unlock all platform features and get better matches.
        </p>

        {/* CTA Button */}
        <Button
          onClick={() => navigate('/edit-profile')}
          className="w-full bg-background text-foreground hover:bg-background/90 font-medium shadow-sm text-sm"
          size="sm"
        >
          Complete Profile
        </Button>
      </div>
    </div>
  );
}
