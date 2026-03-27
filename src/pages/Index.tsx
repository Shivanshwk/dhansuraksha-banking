import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Wallet, ArrowLeftRight, Calculator, Users, History } from "lucide-react";
import bankLogo from "@/assets/bank-logo.png";
import heroBg from "@/assets/bank-hero-bg.jpg";

const features = [
  { icon: Users, title: "Multiple Accounts", desc: "Open Savings, Current, FD & RD accounts" },
  { icon: Wallet, title: "Deposit & Withdraw", desc: "Seamless cash deposit and withdrawal" },
  { icon: ArrowLeftRight, title: "Fund Transfer", desc: "Instant money transfer between accounts" },
  { icon: History, title: "Transaction History", desc: "Complete record of all transactions" },
  { icon: Calculator, title: "Loan Calculator", desc: "Calculate EMI and interest instantly" },
  { icon: Shield, title: "Secure Banking", desc: "Bank-grade security with email authentication" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="absolute inset-0 gradient-navy opacity-75" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <img src={bankLogo} alt="BHARTIYA DHANSURAKSHA BANK" className="h-28 w-28 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gold mb-4 tracking-tight">
            BHARTIYA DHANSURAKSHA BANK
          </h1>
          <p className="text-xl text-navy-foreground/80 font-body mb-2">
            भारतीय धनसुरक्षा बैंक
          </p>
          <p className="text-lg text-navy-foreground/70 font-body mb-8 max-w-xl mx-auto">
            Your trusted partner in secure banking. Experience modern digital banking rooted in Indian values.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              className="gradient-saffron text-saffron-foreground font-semibold text-lg px-8 hover:opacity-90"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gold text-gold hover:bg-gold/10 font-semibold text-lg px-8"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center text-primary mb-12">
            Banking Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl border border-border bg-card shadow-bank hover:shadow-lg transition-shadow"
              >
                <f.icon className="h-10 w-10 text-secondary mb-4" />
                <h3 className="text-lg font-display font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm font-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-navy py-8 px-4 text-center">
        <p className="text-navy-foreground/70 text-sm font-body">
          © 2026 BHARTIYA DHANSURAKSHA BANK. All rights reserved. | RBI Regulated
        </p>
      </footer>
    </div>
  );
};

export default Index;
