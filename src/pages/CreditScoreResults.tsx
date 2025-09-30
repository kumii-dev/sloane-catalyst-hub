import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AssessmentResults } from "@/components/assessment/AssessmentResults";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CreditScoreResults = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('credit_assessments')
          .select('*')
          .eq('id', assessmentId)
          .maybeSingle();

        if (error) throw error;
        setAssessment(data);
      } catch (error: any) {
        console.error('Error fetching assessment:', error);
        toast({
          title: "Error",
          description: "Failed to load assessment results",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/credit-score')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Credit Score
          </Button>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : assessment ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">Your Credit Assessment Results</h1>
                <p className="text-lg text-muted-foreground">
                  Assessed on {new Date(assessment.assessed_at).toLocaleDateString()}
                </p>
              </div>
              <AssessmentResults assessment={assessment} />
              
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/credit-score/assessment')}
                >
                  Retake Assessment
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Assessment not found</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreditScoreResults;