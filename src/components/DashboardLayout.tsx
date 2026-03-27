import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import bankLogo from "@/assets/bank-logo.png";
import { 
  LayoutDashboard, Wallet, ArrowLeftRight, History, 
  Calculator, UserCircle, LogOut, Shield, PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Open Account", icon: PlusCircle, path: "/open-account" },
  { label: "Deposit / Withdraw", icon: Wallet, path: "/transactions" },
  { label: "Transfer Money", icon: ArrowLeftRight, path: "/transfer" },
  { label: "Transaction History", icon: History, path: "/history" },
  { label: "Loan Calculator", icon: Calculator, path: "/loan-calculator" },
  { label: "My Profile", icon: UserCircle, path: "/profile" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 gradient-navy flex flex-col shrink-0">
        <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
          <img src={bankLogo} alt="Logo" className="h-10 w-10" />
          <div>
            <h1 className="text-sm font-display font-bold text-sidebar-primary">BHARTIYA</h1>
            <p className="text-xs text-sidebar-foreground">DHANSURAKSHA BANK</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname === "/admin"
                  ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/70 mb-2 truncate px-3">{user?.email}</p>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:text-destructive hover:bg-sidebar-accent/50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
