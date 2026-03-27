import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Transactions = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("bank_accounts").select("*").eq("user_id", user.id).then(({ data }) => {
      if (data) setAccounts(data);
    });
  }, [user]);

  const handleTransaction = async (type: "deposit" | "withdrawal") => {
    if (!selectedAccount || !amount) {
      toast.error("Please select account and enter amount");
      return;
    }

    const amt = parseFloat(amount);
    if (amt <= 0) { toast.error("Amount must be positive"); return; }

    setLoading(true);
    const account = accounts.find((a) => a.id === selectedAccount);
    if (!account) { toast.error("Account not found"); setLoading(false); return; }

    if (type === "withdrawal" && amt > Number(account.balance)) {
      toast.error("Insufficient balance");
      setLoading(false);
      return;
    }

    const newBalance = type === "deposit"
      ? Number(account.balance) + amt
      : Number(account.balance) - amt;

    const { error: txError } = await supabase.from("transactions").insert({
      account_id: selectedAccount,
      type: type as any,
      amount: amt,
      balance_after: newBalance,
      description: description || `${type === "deposit" ? "Cash Deposit" : "Cash Withdrawal"}`,
    });

    if (txError) { toast.error(txError.message); setLoading(false); return; }

    const { error: accError } = await supabase
      .from("bank_accounts")
      .update({ balance: newBalance })
      .eq("id", selectedAccount);

    if (accError) { toast.error(accError.message); setLoading(false); return; }

    setAccounts((prev) => prev.map((a) => a.id === selectedAccount ? { ...a, balance: newBalance } : a));
    toast.success(`₹${amt.toLocaleString("en-IN")} ${type === "deposit" ? "deposited" : "withdrawn"} successfully`);
    setAmount("");
    setDescription("");
    setLoading(false);
  };

  const formatRs = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);

  const AccountSelect = () => (
    <div className="space-y-2">
      <Label>Select Account</Label>
      <Select value={selectedAccount} onValueChange={setSelectedAccount}>
        <SelectTrigger><SelectValue placeholder="Choose an account" /></SelectTrigger>
        <SelectContent>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.account_number} - {formatRs(Number(a.balance))}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-display font-bold text-primary mb-6">Deposit & Withdraw</h1>
        <Card className="shadow-bank">
          <CardContent className="pt-6">
            <Tabs defaultValue="deposit">
              <TabsList className="w-full">
                <TabsTrigger value="deposit" className="flex-1">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw" className="flex-1">Withdraw</TabsTrigger>
              </TabsList>
              <TabsContent value="deposit" className="space-y-4 mt-4">
                <AccountSelect />
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Salary credit" />
                </div>
                <Button className="w-full gradient-saffron text-saffron-foreground font-semibold" onClick={() => handleTransaction("deposit")} disabled={loading}>
                  {loading ? "Processing..." : "Deposit Money"}
                </Button>
              </TabsContent>
              <TabsContent value="withdraw" className="space-y-4 mt-4">
                <AccountSelect />
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. ATM withdrawal" />
                </div>
                <Button className="w-full bg-destructive text-destructive-foreground font-semibold" onClick={() => handleTransaction("withdrawal")} disabled={loading}>
                  {loading ? "Processing..." : "Withdraw Money"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
