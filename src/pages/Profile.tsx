import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", aadhar_number: "", pan_number: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setProfile(data);
        setForm({
          full_name: data.full_name || "",
          phone: data.phone || "",
          address: data.address || "",
          aadhar_number: data.aadhar_number || "",
          pan_number: data.pan_number || "",
        });
      }
    });
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update(form).eq("user_id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated successfully");
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-display font-bold text-primary mb-6">My Profile</h1>
        <Card className="shadow-bank">
          <CardHeader>
            <CardTitle className="font-display">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Enter your address" />
              </div>
              <div className="space-y-2">
                <Label>Aadhar Number</Label>
                <Input value={form.aadhar_number} onChange={(e) => setForm({ ...form, aadhar_number: e.target.value })} placeholder="XXXX XXXX XXXX" maxLength={12} />
              </div>
              <div className="space-y-2">
                <Label>PAN Number</Label>
                <Input value={form.pan_number} onChange={(e) => setForm({ ...form, pan_number: e.target.value })} placeholder="ABCDE1234F" maxLength={10} />
              </div>
              <Button type="submit" className="w-full gradient-saffron text-saffron-foreground font-semibold" disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
