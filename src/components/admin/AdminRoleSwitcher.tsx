import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const AdminRoleSwitcher = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState(() => {
    return localStorage.getItem('adminMode') === 'true';
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    setIsAdmin(!!data);
    setLoading(false);
  };

  const toggleAdminMode = () => {
    const newMode = !adminMode;
    setAdminMode(newMode);
    localStorage.setItem('adminMode', String(newMode));
    toast.success(`Switched to ${newMode ? 'Admin' : 'User'} mode`);
    
    // Navigate without full reload to preserve session
    navigate(newMode ? '/admin' : '/', { replace: true });
  };

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={adminMode ? 'default' : 'outline'}>
        {adminMode ? (
          <>
            <Shield className="w-3 h-3 mr-1" />
            Admin Mode
          </>
        ) : (
          <>
            <User className="w-3 h-3 mr-1" />
            User Mode
          </>
        )}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleAdminMode}
        className="text-xs"
      >
        Switch to {adminMode ? 'User' : 'Admin'}
      </Button>
    </div>
  );
};
