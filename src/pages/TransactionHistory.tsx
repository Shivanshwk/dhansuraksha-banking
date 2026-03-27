import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";

const TransactionHistory = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("bank_accounts").select("*").eq("user_id", user.id).then(({ data }) => {
      if (data) {
        setAccounts(data);
        if (data.length > 0) setSelectedAccount(data[0].id);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!selectedAccount) return;
    supabase
      .from("transactions")
      .select("*")
      .eq("account_id", selectedAccount)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setTransactions(data);
      });
  }, [selectedAccount]);

  const formatRs = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);

  const getIcon = (type: string) => {
    switch (type) {
      case "deposit": case "transfer_in": return <ArrowDownLeft className="h-4 w-4 text-success" />;
      case "withdrawal": case "transfer_out": return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      default: return <ArrowLeftRight className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "deposit": return "Deposit";
      case "withdrawal": return "Withdrawal";
      case "transfer_in": return "Transfer In";
      case "transfer_out": return "Transfer Out";
      default: return type;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold text-primary">Transaction History</h1>

        <div className="max-w-sm">
          <Label>Select Account</Label>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger><SelectValue placeholder="Choose account" /></SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.account_number}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="shadow-bank">
          <CardHeader>
            <CardTitle className="font-display">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No transactions found</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-3">
                      {getIcon(tx.type)}
                      <div>
                        <p className="font-medium text-sm">{tx.description || getTypeLabel(tx.type)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString("en-IN")}
                          {tx.reference_account && ` • Ref: ${tx.reference_account}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${
                        tx.type === "deposit" || tx.type === "transfer_in" ? "text-success" : "text-destructive"
                      }`}>
                        {tx.type === "deposit" || tx.type === "transfer_in" ? "+" : "-"}{formatRs(Number(tx.amount))}
                      </p>
                      <p className="text-xs text-muted-foreground">Bal: {formatRs(Number(tx.balance_after))}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TransactionHistory;
