import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface TransactionFormProps {
  traderId: string;
  onSuccess?: () => void;
  onTransactionAdded?: () => void;
}

const TransactionForm = ({ traderId, onSuccess, onTransactionAdded }: TransactionFormProps) => {
  const [amount, setAmount] = useState("");
  const [txnType, setTxnType] = useState<string>("sale");
  const [channel, setChannel] = useState<string>("app");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("transactions").insert([{
        trader_id: traderId,
        amount: parseFloat(amount),
        txn_type: txnType as any,
        channel: channel as any,
        description,
        provenance: { source: "manual_entry" },
      }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Transaction logged successfully.",
      });

      setAmount("");
      setDescription("");
      
      // Trigger score calculation immediately
      const { data, error: scoreError } = await supabase.functions.invoke("calculate-score");
      if (scoreError) {
        console.error("Score calculation error:", scoreError);
      } else {
        console.log("Score calculated:", data);
      }
      
      onTransactionAdded?.();
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-lg p-4 bg-muted/30">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (ZAR)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="120.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="txn-type">Type</Label>
          <Select value={txnType} onValueChange={setTxnType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="supplier_purchase">Supplier Purchase</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="channel">Channel</Label>
        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="app">App</SelectItem>
            <SelectItem value="ussd">USSD</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="qr">QR Code</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="e.g., Sold 2 loaves of bread"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Logging..." : "Log Transaction"}
      </Button>
    </form>
  );
};

export default TransactionForm;
