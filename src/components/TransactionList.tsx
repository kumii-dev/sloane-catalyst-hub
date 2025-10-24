import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  txn_type: string;
  channel: string;
  description: string | null;
  created_at: string;
}

interface TransactionListProps {
  traderId: string;
  refreshTrigger?: number;
}

const TransactionList = ({ traderId, refreshTrigger }: TransactionListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();

    const channel = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `trader_id=eq.${traderId}`,
        },
        () => {
          loadTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [traderId, refreshTrigger]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("trader_id", traderId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error loading transactions:", error);
        setTransactions([]);
      } else {
        console.log("Loaded transactions:", data);
        setTransactions(data || []);
      }
    } catch (err) {
      console.error("Exception loading transactions:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions yet. Start by logging your first sale!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((txn) => (
        <div
          key={txn.id}
          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                txn.txn_type === "sale" || txn.txn_type === "deposit"
                  ? "bg-secondary/20 text-secondary"
                  : "bg-destructive/20 text-destructive"
              }`}
            >
              {txn.txn_type === "sale" || txn.txn_type === "deposit" ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownRight className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="font-medium capitalize">{txn.txn_type.replace("_", " ")}</p>
              {txn.description && (
                <p className="text-sm text-muted-foreground">{txn.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(txn.created_at), { addSuffix: true })} · via{" "}
                {txn.channel}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={`font-bold ${
                txn.txn_type === "sale" || txn.txn_type === "deposit"
                  ? "text-secondary"
                  : "text-destructive"
              }`}
            >
              {txn.txn_type === "sale" || txn.txn_type === "deposit" ? "+" : "-"}
              R{txn.amount.toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
