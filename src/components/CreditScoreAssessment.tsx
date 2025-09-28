import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";

interface CreditScoreAssessmentProps {
  onScoreGenerated?: (score: any) => void;
}

const CreditScoreAssessment = ({ onScoreGenerated }: CreditScoreAssessmentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Credit Score Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <p className="text-muted-foreground mb-6">
          The credit assessment feature is being finalized. 
          Please complete your startup profile to be ready when it launches.
        </p>
        <Button asChild>
          <a href="/funding/startup-dashboard">
            Complete Profile
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreditScoreAssessment;