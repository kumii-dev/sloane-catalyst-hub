import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowRight } from "lucide-react";

interface CreditScoreDashboardProps {
  assessmentId?: string;
}

const CreditScoreDashboard = ({ assessmentId }: CreditScoreDashboardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Credit Score Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <p className="text-muted-foreground mb-6">
          Your credit score dashboard will be available once you complete the assessment.
        </p>
        <Button asChild>
          <a href="/funding/startup-dashboard">
            View Profile
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreditScoreDashboard;