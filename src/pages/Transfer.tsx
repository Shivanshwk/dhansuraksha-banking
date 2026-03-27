import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Transfer = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [fromAccount, setFromAccount] = useState("");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("bank_accounts").select("*").eq("user_id", user.id).then(({ data }) => {
      if (data) setAccounts(data);
    });
  }, [user]);

  const formatRs = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccount || !toAccountNumber || !amount) {
      toast.error("Please fill all fields");
      return;
    }

    const amt = parseFloat(amount);
    if (amt <= 0) { toast.error("Amount must be positive"); return; }

    setLoading(true);
    const senderAccount = accounts.find((a) => a.id === fromAccount);
    if (!senderAccount) { toast.error("Sender account not found"); setLoading(false); return; }

    if (amt > Number(senderAccount.balance)) {
      toast.error("Insufficient balance");
      setLoading(false);
      return;
    }

    if (senderAccount.account_number === toAccountNumber) {
      toast.error("Cannot transfer to the same account");
      setLoading(false);
      return;
    }

    // Check if recipient exists
    const { data: recipient } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("account_number", toAccountNumber)
      .maybeSingle();

    if (!recipient) {
      toast.error("Recipient account not found");
      setLoading(false);
      return;
    }

    const senderNewBalance = Number(senderAccount.balance) - amt;
    const recipientNewBalance = Number(recipient.balance) + amt;

    // Debit sender
    await supabase.from("transactions").insert({
      account_id: senderAccount.id,
      type: "transfer_out" as any,
      amount: amt,
      balance_after: senderNewBalance,
      description: description || `Transfer to ${toAccountNumber}`,
      reference_account: toAccountNumber,
    });
    await supabase.from("bank_accounts").update({ balance: senderNewBalance }).eq("id", senderAccount.id);

    // Credit recipient
    await supabase.from("transactions").insert({
      account_id: recipient.id,
      type: "transfer_in" as any,
      amount: amt,
      balance_after: recipientNewBalance,
      description: `Transfer from ${senderAccount.account_number}`,
      reference_account: senderAccount.account_number,
    });
    await supabase.from("bank_accounts").update({ balance: recipientNewBalance }).eq("id", recipient.id);

    setAccounts((prev) => prev.map((a) => a.id === senderAccount.id ? { ...a, balance: senderNewBalance } : a));
    toast.success(`₹${amt.toLocaleString("en-IN")} transferred successfully`);
    setAmount("");
    setToAccountNumber("");
    setDescription("");
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-display font-bold text-primary mb-6">Transfer Money</h1>
        <Card className="shadow-bank">
          <CardHeader>
            <CardTitle className="font-display">Fund Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="space-y-2">
                <Label>From Account</Label>
                <Select value={fromAccount} onValueChange={setFromAccount}>
                  <SelectTrigger><SelectValue placeholder="Select your account" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.account_number} - {formatRs(Number(a.balance))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Beneficiary Account Number</Label>
                <Input value={toAccountNumber} onChange={(e) => setToAccountNumber(e.target.value)} placeholder="Enter recipient's account number" required />
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" required />
              </div>
              <div className="space-y-2">
                <Label>Remarks (optional)</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Rent payment" />
              </div>
              <Button type="submit" className="w-full gradient-saffron text-saffron-foreground font-semibold" disabled={loading}>
                {loading ? "Processing..." : "Transfer Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transfer;
