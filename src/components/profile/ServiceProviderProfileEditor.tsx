import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ServiceProviderProfileEditorProps {
  userId: string;
}

const ServiceProviderProfileEditor = ({ userId }: ServiceProviderProfileEditorProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [userId]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Service Provider profile editing functionality coming soon. For now, please use the Become Provider flow.
      </p>
      <div className="flex justify-end">
        <Button onClick={() => window.location.href = '/become-provider'}>
          Go to Become Provider
        </Button>
      </div>
    </div>
  );
};

export default ServiceProviderProfileEditor;