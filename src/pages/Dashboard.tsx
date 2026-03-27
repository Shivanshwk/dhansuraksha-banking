import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface AccountSummary {
  totalBalance: number;
  totalAccounts: number;
  recentDeposits: number;
  recentWithdrawals: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AccountSummary>({
    totalBalance: 0, totalAccounts: 0, recentDeposits: 0, recentWithdrawals: 0,
  });
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: accs } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user.id);

      if (accs) {
        setAccounts(accs);
        const totalBalance = accs.reduce((s, a) => s + Number(a.balance), 0);
        setSummary((prev) => ({ ...prev, totalBalance, totalAccounts: accs.length }));

        // Get recent transactions
        const accountIds = accs.map((a) => a.id);
        if (accountIds.length > 0) {
          const { data: txns } = await supabase
            .from("transactions")
            .select("*")
            .in("account_id", accountIds)
            .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString());

          if (txns) {
            const deposits = txns.filter((t) => t.type === "deposit" || t.type === "transfer_in").reduce((s, t) => s + Number(t.amount), 0);
            const withdrawals = txns.filter((t) => t.type === "withdrawal" || t.type === "transfer_out").reduce((s, t) => s + Number(t.amount), 0);
            setSummary((prev) => ({ ...prev, recentDeposits: deposits, recentWithdrawals: withdrawals }));
          }
        }
      }
    };
    fetchData();
  }, [user]);

  const formatRs = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  const cards = [
    { title: "Total Balance", value: formatRs(summary.totalBalance), icon: Wallet, color: "text-primary" },
    { title: "Accounts", value: summary.totalAccounts.toString(), icon: TrendingUp, color: "text-secondary" },
    { title: "Deposits (30d)", value: formatRs(summary.recentDeposits), icon: ArrowDownLeft, color: "text-success" },
    { title: "Withdrawals (30d)", value: formatRs(summary.recentWithdrawals), icon: ArrowUpRight, color: "text-destructive" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Welcome Back</h1>
          <p className="text-muted-foreground">Here's your banking overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card key={card.title} className="shadow-bank border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-body font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-display">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-bank">
          <CardHeader>
            <CardTitle className="font-display">Your Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No accounts yet. Open your first account to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div>
                      <p className="font-semibold">{acc.account_number}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {acc.account_type.replace("_", " ")} • {acc.branch_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold font-display">{formatRs(Number(acc.balance))}</p>
                      <p className="text-xs text-muted-foreground">IFSC: {acc.ifsc_code}</p>
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

export default Dashboard;
