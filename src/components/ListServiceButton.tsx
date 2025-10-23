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

    if (providerStatus === 'approved') {
      navigate('/create-listing');
    } else if (providerStatus === 'pending') {
      navigate('/provider-dashboard');
    } else {
      setShowDialog(true);
    }
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
            List a Software Service
          </>
        )}
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="text-2xl text-destructive">Not a Provider</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground space-y-3">
              <p>
                To list software services, you must first register as a verified Software Service Provider.
              </p>
              <p>
                Registration requires vetting and approval for security and trust. 
                Would you like to start your provider journey?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel>Maybe Later</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowDialog(false);
              navigate('/become-provider');
            }}>
              Register as Provider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
