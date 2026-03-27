import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const OpenAccount = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<string>("savings");
  const [branchName, setBranchName] = useState("Main Branch");
  const [initialDeposit, setInitialDeposit] = useState("");
  const [loading, setLoading] = useState(false);

  const generateAccountNumber = () => {
    return "BDSK" + Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const deposit = parseFloat(initialDeposit) || 0;
    if (deposit < 500) {
      toast.error("Minimum initial deposit is ₹500");
      setLoading(false);
      return;
    }

    const accountNumber = generateAccountNumber();

    const { data: account, error } = await supabase
      .from("bank_accounts")
      .insert({
        user_id: user.id,
        account_number: accountNumber,
        account_type: accountType as any,
        balance: deposit,
        branch_name: branchName,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to open account: " + error.message);
      setLoading(false);
      return;
    }

    if (deposit > 0 && account) {
      await supabase.from("transactions").insert({
        account_id: account.id,
        type: "deposit" as any,
        amount: deposit,
        balance_after: deposit,
        description: "Initial deposit on account opening",
      });
    }

    toast.success(`Account opened! Your account number is ${accountNumber}`);
    navigate("/dashboard");
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-display font-bold text-primary mb-6">Open New Account</h1>
        <Card className="shadow-bank">
          <CardHeader>
            <CardTitle className="font-display">Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select value={accountType} onValueChange={setAccountType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="current">Current Account</SelectItem>
                    <SelectItem value="fixed_deposit">Fixed Deposit</SelectItem>
                    <SelectItem value="recurring_deposit">Recurring Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Select value={branchName} onValueChange={setBranchName}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Branch">Main Branch - Mumbai</SelectItem>
                    <SelectItem value="Delhi Branch">Delhi Branch</SelectItem>
                    <SelectItem value="Bangalore Branch">Bangalore Branch</SelectItem>
                    <SelectItem value="Chennai Branch">Chennai Branch</SelectItem>
                    <SelectItem value="Kolkata Branch">Kolkata Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Initial Deposit (₹)</Label>
                <Input
                  type="number"
                  min="500"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value)}
                  placeholder="Minimum ₹500"
                  required
                />
              </div>
              <Button type="submit" className="w-full gradient-saffron text-saffron-foreground font-semibold" disabled={loading}>
                {loading ? "Opening Account..." : "Open Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OpenAccount;
