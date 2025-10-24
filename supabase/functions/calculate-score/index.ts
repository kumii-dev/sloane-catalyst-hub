import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Get transactions
    const { data: transactions, error: txnError } = await supabaseClient
      .from("transactions")
      .select("*")
      .eq("trader_id", user.id);

    if (txnError) throw txnError;

    // Calculate financial components
    const totalRevenue = transactions
      ?.filter(t => t.txn_type === "sale" || t.txn_type === "deposit")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    
    const totalExpenses = transactions
      ?.filter(t => t.txn_type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const totalWithdrawals = transactions
      ?.filter(t => t.txn_type === "withdrawal")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const transactionVolume = transactions?.length || 0;
    const revenueCount = transactions?.filter(t => t.txn_type === "sale" || t.txn_type === "deposit").length || 0;

    // Calculate net position (revenue - expenses - withdrawals)
    const netPosition = totalRevenue - totalExpenses - totalWithdrawals;
    const profitMargin = totalRevenue > 0 ? (netPosition / totalRevenue) * 100 : -100;
    const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) : 10;
    const withdrawalRatio = totalRevenue > 0 ? (totalWithdrawals / totalRevenue) : 10;
    const averageTransactionSize = revenueCount > 0 ? totalRevenue / revenueCount : 0;

    // Conservative scoring model - start at 300 (Poor rating)
    let score = 300;

    // Profit margin component (-400 to +400 points) - MOST IMPORTANT
    if (profitMargin > 40) score += 400;
    else if (profitMargin > 25) score += 300;
    else if (profitMargin > 15) score += 200;
    else if (profitMargin > 5) score += 100;
    else if (profitMargin > 0) score += 50;
    else if (profitMargin > -10) score -= 100;
    else if (profitMargin > -25) score -= 200;
    else score -= 400; // Severe penalty for major losses

    // Expense ratio penalty (0 to -300 points)
    if (expenseRatio > 5) score -= 300; // Expenses 5x revenue = severe penalty
    else if (expenseRatio > 2) score -= 200; // Expenses 2x revenue = major penalty
    else if (expenseRatio > 1.5) score -= 150; // Expenses 1.5x revenue = significant penalty
    else if (expenseRatio > 1) score -= 100; // Expenses exceed revenue = penalty
    else if (expenseRatio > 0.8) score -= 50; // High expense ratio = minor penalty

    // Withdrawal ratio penalty (0 to -250 points)
    if (withdrawalRatio > 3) score -= 250; // Withdrawals 3x revenue = severe penalty
    else if (withdrawalRatio > 1.5) score -= 150; // Withdrawals 1.5x revenue = major penalty
    else if (withdrawalRatio > 1) score -= 100; // Withdrawals exceed revenue = significant penalty
    else if (withdrawalRatio > 0.5) score -= 50; // High withdrawals = minor penalty

    // Transaction volume component (0-150 points)
    if (transactionVolume >= 20) score += 150;
    else if (transactionVolume >= 10) score += 100;
    else if (transactionVolume >= 5) score += 50;
    else score += 25;

    // Revenue scale component (0-100 points)
    if (totalRevenue > 10000) score += 100;
    else if (totalRevenue > 5000) score += 75;
    else if (totalRevenue > 1000) score += 50;
    else if (totalRevenue > 100) score += 25;

    // Ensure score is between 0 and 1000
    score = Math.max(0, Math.min(1000, score));

    // Conservative credit tier thresholds
    let creditTier: "A" | "B" | "C" | "D" | "E";
    if (score >= 850) creditTier = "A"; // Excellent - strong profits
    else if (score >= 700) creditTier = "B"; // Good - healthy business
    else if (score >= 500) creditTier = "C"; // Fair - moderate health
    else if (score >= 300) creditTier = "D"; // Poor - struggling
    else creditTier = "E"; // Critical - severe issues

    // Top drivers
    const topDrivers = {
      profit_margin: `${profitMargin.toFixed(1)}%`,
      net_position: `$${netPosition.toFixed(2)}`,
      expense_ratio: `${(expenseRatio * 100).toFixed(1)}%`,
      total_transactions: transactionVolume,
      revenue: `$${totalRevenue.toFixed(2)}`,
      expenses: `$${totalExpenses.toFixed(2)}`,
      withdrawals: `$${totalWithdrawals.toFixed(2)}`,
    };

    // Insert or update score
    const { error: scoreError } = await supabaseClient
      .from("business_scores")
      .upsert({
        trader_id: user.id,
        score: Math.round(score),
        credit_tier: creditTier,
        top_drivers: topDrivers,
        calculated_at: new Date().toISOString(),
      });

    if (scoreError) throw scoreError;

    return new Response(
      JSON.stringify({ 
        score: Math.round(score), 
        credit_tier: creditTier, 
        top_drivers: topDrivers 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error calculating score:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
