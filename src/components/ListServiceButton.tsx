import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Loader2 } from 'lucide-react';

interface ListServiceButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const ListServiceButton = ({ 
  variant = 'default', 
  size = 'default',
  className = '' 
}: ListServiceButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [providerStatus, setProviderStatus] = useState<'checking' | 'approved' | 'pending' | 'not_provider'>('checking');

  useEffect(() => {
    if (user) {
      checkProviderStatus();
    } else {
      setProviderStatus('not_provider');
    }
  }, [user]);

  const checkProviderStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('vetting_status')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        setProviderStatus('not_provider');
      } else if (data.vetting_status === 'approved') {
        setProviderStatus('approved');
      } else {
        setProviderStatus('pending');
      }
    } catch (error) {
      setProviderStatus('not_provider');
    }
  };

  const handleClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Direct to advisor/coach registration
    navigate('/become-advisor');
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant={variant}
        size={size}
        className={className}
        disabled={providerStatus === 'checking'}
      >
        {providerStatus === 'checking' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Become an Advisor / Coach
          </>
        )}
      </Button>

    </>
  );
};
