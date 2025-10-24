import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";

interface BusinessHealthReportProps {
  traderId: string;
  refreshTrigger?: number;
}

const BusinessHealthReport = ({ traderId, refreshTrigger }: BusinessHealthReportProps) => {
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScore();
  }, [traderId, refreshTrigger]);

  const loadScore = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("business_scores")
      .select("*")
      .eq("trader_id", traderId)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error loading score:", error);
    } else {
      setScore(data);
    }
    setLoading(false);
  };

  const tierColors = {
    A: "text-green-600",
    B: "text-blue-600",
    C: "text-yellow-600",
    D: "text-orange-600",
    E: "text-red-600",
  };

  const tierDescriptions = {
    A: "Excellent - Your business shows strong financial health with healthy profits and sustainable operations.",
    B: "Good - Your business demonstrates solid performance with positive indicators and growth potential.",
    C: "Fair - Your business shows moderate health. Consider improving profit margins and expense management.",
    D: "Poor - Your business is struggling. Focus on increasing revenue and reducing expenses urgently.",
    E: "Critical - Your business requires immediate attention. Significant financial challenges detected.",
  };

  const getScoreColor = (score: number) => {
    if (score >= 850) return "text-green-600";
    if (score >= 700) return "text-blue-600";
    if (score >= 500) return "text-yellow-600";
    if (score >= 300) return "text-orange-600";
    return "text-red-600";
  };

  const getInsights = (drivers: any) => {
    const insights = [];
    
    const profitMargin = parseFloat(drivers?.profit_margin || "0");
    const expenseRatio = parseFloat(drivers?.expense_ratio || "0");
    
    if (profitMargin > 25) {
      insights.push({
        type: "positive",
        text: "Strong profit margins indicate efficient operations",
      });
    } else if (profitMargin < 0) {
      insights.push({
        type: "negative",
        text: "Negative profit margins - expenses exceed revenue",
      });
    }

    if (expenseRatio > 100) {
      insights.push({
        type: "warning",
        text: "Expenses are higher than revenue - reduce costs urgently",
      });
    } else if (expenseRatio < 70) {
      insights.push({
        type: "positive",
        text: "Good expense management with healthy ratios",
      });
    }

    const netPosition = parseFloat(drivers?.net_position?.replace(/[^0-9.-]/g, '') || "0");
    if (netPosition > 0) {
      insights.push({
        type: "positive",
        text: "Positive net position shows business is accumulating value",
      });
    } else {
      insights.push({
        type: "warning",
        text: "Negative net position - withdrawals and expenses exceed income",
      });
    }

    return insights;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Business Health Report
          </CardTitle>
          <CardDescription>Detailed analysis of your business creditworthiness</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : score ? (
            <div className="space-y-6">
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(score.score)}`}>
                  {score.score}
                </div>
                <div className="text-sm text-muted-foreground mb-4">out of 1000</div>
                <Progress value={(score.score / 1000) * 100} className="h-3 mb-4" />
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium">Credit Tier:</span>
                  <span className={`text-3xl font-bold ${tierColors[score.credit_tier as keyof typeof tierColors]}`}>
                    {score.credit_tier}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2">What This Means</h4>
                <p className="text-sm text-muted-foreground">
                  {tierDescriptions[score.credit_tier as keyof typeof tierDescriptions]}
                </p>
              </div>

              {score.top_drivers && (
                <>
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-medium mb-3">Key Financial Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(score.top_drivers).map(([key, value]) => (
                        <div key={key} className="p-3 bg-muted/30 rounded-lg">
                          <div className="text-xs text-muted-foreground capitalize mb-1">
                            {key.replace(/_/g, " ")}
                          </div>
                          <div className="text-lg font-semibold text-foreground">
                            {String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-medium mb-3">Insights & Recommendations</h4>
                    <div className="space-y-3">
                      {getInsights(score.top_drivers).map((insight, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          {insight.type === "positive" ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : insight.type === "negative" ? (
                            <TrendingDown className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          )}
                          <span className="text-sm text-muted-foreground">{insight.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Last calculated: {new Date(score.calculated_at).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl font-bold text-muted-foreground mb-4">-</div>
              <p className="text-sm text-muted-foreground">
                No business health score available. Start logging transactions to generate your report.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessHealthReport;
