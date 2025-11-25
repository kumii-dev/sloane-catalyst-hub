import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Construction } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MentorProfileEditorProps {
  userId: string;
}

const MentorProfileEditor = ({ userId }: MentorProfileEditorProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [userId]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 text-center py-8">
      <div className="flex justify-center">
        <Construction className="h-12 w-12 text-rating" />
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-2">Feature Coming Soon</h3>
        <p className="text-muted-foreground">
          Mentor profile editing functionality is currently under development. For now, please use the dedicated Edit Mentor Profile page.
        </p>
      </div>
      <div className="flex justify-center">
        <Button onClick={() => window.location.href = '/edit-mentor-profile'}>
          Go to Edit Mentor Profile
        </Button>
      </div>
    </div>
  );
};

export default MentorProfileEditor;