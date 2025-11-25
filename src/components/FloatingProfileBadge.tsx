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
      <div className="relative bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-xl shadow-lg p-3 max-w-[200px]">
        {/* Close button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-1.5 right-1.5 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          aria-label="Dismiss profile reminder"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Icon and Badge */}
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-primary-foreground/20 rounded-full p-1.5">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <div className="bg-primary-foreground/20 rounded-full px-1.5 py-0.5">
                <span className="text-xs font-bold">{completion}%</span>
              </div>
              <span className="text-[10px] text-primary-foreground/80">Profile</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="text-[10px] text-primary-foreground/90 mb-2 leading-tight">
          Complete profile to unlock features
        </p>

        {/* CTA Button */}
        <Button
          onClick={() => navigate('/edit-profile')}
          className="w-full bg-background text-foreground hover:bg-background/90 font-medium shadow-sm text-xs h-7"
        >
          Update
        </Button>
      </div>
    </div>
  );
}
