import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, TrendingUp, FileText } from "lucide-react";

interface AssessmentResultsProps {
  assessment: any;
}

const DOMAIN_LABELS = {
  business_profile_score: 'Business Profile & Age',
  financial_health_score: 'Financial Health',
  repayment_behaviour_score: 'Repayment Behaviour',
  governance_score: 'Governance & Compliance',
  market_access_score: 'Market Position & Demand',
  operational_capacity_score: 'Operational Capacity',
  technology_innovation_score: 'Technology & Innovation',
  social_environmental_score: 'Social & Environmental Impact',
  trust_reputation_score: 'Trust & Reputation',
  growth_readiness_score: 'Growth Potential & Strategy',
};

export const AssessmentResults = ({ assessment }: AssessmentResultsProps) => {
  const riskBadgeColor = {
    'Low': 'bg-green-500',
    'Medium': 'bg-yellow-500',
    'High': 'bg-red-500',
  }[assessment.risk_band] || 'bg-gray-500';

  const scorePercentage = (assessment.overall_score / 1000) * 100;

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">{assessment.overall_score}</CardTitle>
          <CardDescription>Credit Score (out of 1000)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={scorePercentage} className="h-4" />
          <div className="flex items-center justify-center gap-4">
            <Badge className={riskBadgeColor}>
              {assessment.risk_band} Risk
            </Badge>
            {assessment.funding_eligibility_range && (
              <Badge variant="outline">
                {assessment.funding_eligibility_range}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Score Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{assessment.score_explanation}</p>
        </CardContent>
      </Card>

      {/* Domain Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Breakdown</CardTitle>
          <CardDescription>Scores across all 10 evaluation domains</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(DOMAIN_LABELS).map(([key, label]) => {
            const score = assessment[key] || 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-sm font-bold">{score}/100</span>
                </div>
                <Progress value={score} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Strengths */}
      {assessment.ai_analysis?.strengths && assessment.ai_analysis.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment.ai_analysis.strengths.map((strength: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Weaknesses & Areas for Improvement */}
      {assessment.improvement_areas && assessment.improvement_areas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment.improvement_areas.map((area: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-1 flex-shrink-0" />
                  <span className="text-sm">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {assessment.recommendations && assessment.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Recommendations
            </CardTitle>
            <CardDescription>Steps to improve your credit score</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};