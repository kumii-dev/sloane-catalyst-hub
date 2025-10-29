import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface CreditScoreAssessmentProps {
  onScoreGenerated?: (score: any) => void;
}

const CreditScoreAssessment = ({ onScoreGenerated }: CreditScoreAssessmentProps) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [startupProfile, setStartupProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const { data: p } = await supabase
          .from('profiles')
          .select('profile_completion_percentage')
          .eq('user_id', user.id)
          .maybeSingle();
        setUserProfile(p);

        const { data: sp } = await supabase
          .from('startup_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        setStartupProfile(sp);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Credit Score Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        {loading ? (
          <p className="text-muted-foreground mb-6">Loading...</p>
        ) : !startupProfile ? (
          <>
            <p className="text-muted-foreground mb-6">
              Create your startup profile to access credit assessment.
            </p>
            <Button asChild>
              <Link to="/edit-profile?tab=startup&edit=1">
                Create Startup Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </>
        ) : (userProfile?.profile_completion_percentage ?? 0) < 100 ? (
          <>
            <p className="text-muted-foreground mb-6">
              Complete your profile to unlock credit assessment.
            </p>
            <Button asChild>
              <Link to="/edit-profile?edit=1">
                Complete Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground mb-6">
              The credit assessment feature is being finalized. Check back soon!
            </p>
            <Button asChild>
              <Link to="/funding/startup-dashboard">
                View Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditScoreAssessment;