import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, TrendingUp, Gift } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RewardsManagementProps {
  traderId: string;
  refreshTrigger?: number;
}

const RewardsManagement = ({ traderId, refreshTrigger }: RewardsManagementProps) => {
  const [rewards, setRewards] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, [traderId, refreshTrigger]);

  const loadRewards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rewards")
      .select("*")
      .eq("trader_id", traderId)
      .single();

    if (error) {
      console.error("Error loading rewards:", error);
    } else {
      setRewards(data);
    }
    setLoading(false);
  };

  const nextMilestone = Math.ceil((rewards?.points || 0) / 100) * 100;
  const progressToNextMilestone = rewards?.points ? ((rewards.points % 100) / 100) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Rewards Overview
          </CardTitle>
          <CardDescription>Track your points and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Gift className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold text-primary">
                    {rewards?.points || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Available Points</div>
                </div>

                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-3xl font-bold text-foreground">
                    {rewards?.lifetime_points || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Lifetime Earned</div>
                </div>

                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Award className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-3xl font-bold text-foreground">
                    {((rewards?.lifetime_points || 0) - (rewards?.points || 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">Points Redeemed</div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress to Next Milestone</span>
                  <span className="text-sm text-muted-foreground">
                    {rewards?.points || 0} / {nextMilestone}
                  </span>
                </div>
                <Progress value={progressToNextMilestone} className="h-2" />
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-3">How to Earn Points</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">+10</span>
                    <span>Log any transaction (sale, expense, deposit, withdrawal)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">+50</span>
                    <span>Complete KYC verification (coming soon)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">+100</span>
                    <span>Maintain positive business health for 30 days (coming soon)</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsManagement;
