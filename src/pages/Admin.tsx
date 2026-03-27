import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Admin = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("profiles").select("*").then(({ data }) => { if (data) setUsers(data); });
    supabase.from("bank_accounts").select("*").then(({ data }) => { if (data) setAccounts(data); });
    supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => { if (data) setTransactions(data); });
  }, [isAdmin]);

  const formatRs = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-display font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You do not have admin privileges.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold text-primary">Admin Panel</h1>

        <div className="grid grid-cols-3 gap-4">
          <Card className="shadow-bank">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground font-body">Total Users</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold font-display">{users.length}</p></CardContent>
          </Card>
          <Card className="shadow-bank">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground font-body">Total Accounts</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold font-display">{accounts.length}</p></CardContent>
          </Card>
          <Card className="shadow-bank">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground font-body">Total Deposits</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold font-display">{formatRs(accounts.reduce((s, a) => s + Number(a.balance), 0))}</p></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <Card className="shadow-bank">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div>
                        <p className="font-medium">{u.full_name || "Unnamed"}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {u.phone && <p>{u.phone}</p>}
                        <p>{new Date(u.created_at).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="accounts">
            <Card className="shadow-bank">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {accounts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div>
                        <p className="font-medium">{a.account_number}</p>
                        <p className="text-sm text-muted-foreground capitalize">{a.account_type.replace("_", " ")} • {a.branch_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatRs(Number(a.balance))}</p>
                        <Badge variant={a.is_active ? "default" : "destructive"} className="text-xs">
                          {a.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="transactions">
            <Card className="shadow-bank">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div>
                        <p className="font-medium text-sm capitalize">{tx.type.replace("_", " ")}</p>
                        <p className="text-xs text-muted-foreground">{tx.description}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${
                          tx.type === "deposit" || tx.type === "transfer_in" ? "text-success" : "text-destructive"
                        }`}>
                          {formatRs(Number(tx.amount))}
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
