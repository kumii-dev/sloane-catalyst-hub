import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface BusinessScoreProps {
  traderId: string;
  refreshTrigger?: number;
}

const BusinessScore = ({ traderId, refreshTrigger }: BusinessScoreProps) => {
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadScore();
    console.log("BusinessScore loading, refreshTrigger:", refreshTrigger);
  }, [traderId, refreshTrigger]);

  const loadScore = async () => {
    setLoading(true);
    console.log("Loading score for trader:", traderId);
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
      console.log("Score data loaded:", data);
      setScore(data);
    }
    setLoading(false);
  };

  const handleCalculateScore = async () => {
    setCalculating(true);
    try {
      const { data, error } = await supabase.functions.invoke("calculate-score");
      if (error) {
        console.error("Score calculation error:", error);
        toast.error(error.message || "Failed to calculate score");
      } else {
        console.log("Score calculated:", data);
        toast.success("Score calculated successfully!");
        await loadScore();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Failed to calculate score");
    } finally {
      setCalculating(false);
    }
  };

  const tierColors = {
    A: "text-green-600",
    B: "text-blue-600",
    C: "text-yellow-600",
    D: "text-orange-600",
    E: "text-red-600",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Business Health Score
        </CardTitle>
        <CardDescription>Your creditworthiness rating</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : score ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">{score.score}</div>
              <div className="text-sm text-muted-foreground">out of 1000</div>
            </div>
            <Progress value={(score.score / 1000) * 100} className="h-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Credit Tier</span>
              <span className={`text-2xl font-bold ${tierColors[score.credit_tier as keyof typeof tierColors]}`}>
                {score.credit_tier}
              </span>
            </div>
            {score.top_drivers && (
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2">Top Factors</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {Object.entries(score.top_drivers).slice(0, 3).map(([key, value]) => (
                    <li key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace("_", " ")}</span>
                      <span>{String(value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4 py-8">
            <div className="text-6xl font-bold text-muted-foreground">-</div>
            <p className="text-sm text-muted-foreground mb-4">
              Log at least 2 revenue and 2 expense transactions to calculate your business health score
            </p>
            <Button 
              onClick={handleCalculateScore} 
              disabled={calculating}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${calculating ? 'animate-spin' : ''}`} />
              {calculating ? "Calculating..." : "Calculate Score Now"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessScore;
