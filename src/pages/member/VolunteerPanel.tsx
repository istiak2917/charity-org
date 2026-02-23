import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Volunteer { id: string; full_name: string; email: string; phone: string; skills: string; status: string; hours_logged: number; availability: string; badge: string; }

const VolunteerPanel = () => {
  const { user } = useAuth();
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", skills: "", availability: "" });
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from("volunteers").select("*").eq("user_id", user.id).single();
      if (data) { setVolunteer(data); setForm({ full_name: data.full_name, email: data.email || "", phone: data.phone || "", skills: data.skills || "", availability: data.availability || "" }); }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const apply = async () => {
    if (!user || !form.full_name) return;
    const { error } = await supabase.from("volunteers").insert({ ...form, user_id: user.id });
    if (error) { toast({ title: "আবেদন ব্যর্থ", description: error.message, variant: "destructive" }); }
    else { toast({ title: "আবেদন সফল!" }); window.location.reload(); }
  };

  const updateInfo = async () => {
    if (!volunteer) return;
    const { error } = await supabase.from("volunteers").update(form).eq("id", volunteer.id);
    if (error) { toast({ title: "আপডেট ব্যর্থ", description: error.message, variant: "destructive" }); }
    else { toast({ title: "তথ্য আপডেট হয়েছে!" }); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  if (!volunteer) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold font-heading">স্বেচ্ছাসেবক হোন</h1>
        <Card className="p-6 space-y-4">
          <p className="text-muted-foreground">স্বেচ্ছাসেবক হিসেবে আবেদন করুন</p>
          <Input placeholder="পুরো নাম" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input placeholder="ইমেইল" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="ফোন" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Textarea placeholder="দক্ষতা" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <Textarea placeholder="সময়সূচি" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} />
          <Button onClick={apply} className="w-full">আবেদন করুন</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">স্বেচ্ছাসেবক প্যানেল</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-primary">{volunteer.hours_logged}h</div><div className="text-sm text-muted-foreground">কাজের ঘণ্টা</div></Card>
        <Card className="p-4 text-center"><Badge variant={volunteer.status === "approved" ? "default" : "secondary"} className="text-lg px-4 py-1">{volunteer.status}</Badge><div className="text-sm text-muted-foreground mt-1">স্ট্যাটাস</div></Card>
        <Card className="p-4 text-center"><div className="text-lg font-medium">{volunteer.badge || "কোনো ব্যাজ নেই"}</div><div className="text-sm text-muted-foreground">ব্যাজ</div></Card>
      </div>
      <Card className="p-6 space-y-4">
        <h2 className="font-bold">তথ্য আপডেট করুন</h2>
        <Input placeholder="ফোন" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Textarea placeholder="দক্ষতা" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        <Textarea placeholder="সময়সূচি" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} />
        <Button onClick={updateInfo}>আপডেট করুন</Button>
      </Card>
    </div>
  );
};

export default VolunteerPanel;
