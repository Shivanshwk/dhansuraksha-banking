import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LoanCalculator = () => {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [tenureType, setTenureType] = useState("years");
  const [result, setResult] = useState<{
    emi: number; totalInterest: number; totalAmount: number;
  } | null>(null);

  const calculate = () => {
    const P = parseFloat(principal);
    const annualRate = parseFloat(rate);
    const T = parseFloat(tenure);
    if (!P || !annualRate || !T) return;

    const months = tenureType === "years" ? T * 12 : T;
    const r = annualRate / 12 / 100;
    const emi = (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    const totalAmount = emi * months;
    const totalInterest = totalAmount - P;

    setResult({ emi, totalInterest, totalAmount });
  };

  const formatRs = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-display font-bold text-primary">Loan & Interest Calculator</h1>

        <Card className="shadow-bank">
          <CardHeader>
            <CardTitle className="font-display">EMI Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Loan Amount (₹)</Label>
              <Input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="e.g. 500000" />
            </div>
            <div className="space-y-2">
              <Label>Annual Interest Rate (%)</Label>
              <Input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g. 8.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loan Tenure</Label>
                <Input type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} placeholder="e.g. 5" />
              </div>
              <div className="space-y-2">
                <Label>Tenure Type</Label>
                <Select value={tenureType} onValueChange={setTenureType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="years">Years</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full gradient-saffron text-saffron-foreground font-semibold" onClick={calculate}>
              Calculate EMI
            </Button>

            {result && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm text-muted-foreground mb-1">Monthly EMI</p>
                  <p className="text-xl font-bold font-display text-primary">{formatRs(result.emi)}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
                  <p className="text-xl font-bold font-display text-secondary">{formatRs(result.totalInterest)}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-xl font-bold font-display text-success">{formatRs(result.totalAmount)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LoanCalculator;
