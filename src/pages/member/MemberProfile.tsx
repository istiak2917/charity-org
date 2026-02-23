import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const MemberProfile = () => {
  const { user, roles } = useAuth();
  const [profile, setProfile] = useState({ full_name: "", phone: "", address: "", avatar_url: "" });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setProfile({ full_name: data.full_name || "", phone: data.phone || "", address: data.address || "", avatar_url: data.avatar_url || "" });
      setLoading(false);
    };
    fetch();
  }, [user]);

  const save = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ ...profile, updated_at: new Date().toISOString() }).eq("id", user.id);
    if (error) { toast({ title: "সেভ ব্যর্থ", description: error.message, variant: "destructive" }); }
    else { toast({ title: "প্রোফাইল আপডেট হয়েছে!" }); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">আমার প্রোফাইল</h1>
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => <Badge key={r} variant={r === "super_admin" ? "destructive" : "default"}>{r}</Badge>)}
        </div>
        <div className="text-sm text-muted-foreground">{user?.email}</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1"><label className="text-sm font-medium">পুরো নাম</label><Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-sm font-medium">ফোন</label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
        </div>
        <div className="space-y-1"><label className="text-sm font-medium">ঠিকানা</label><Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} /></div>
        <div className="space-y-1"><label className="text-sm font-medium">প্রোফাইল ছবি URL</label><Input value={profile.avatar_url} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} /></div>
        <Button onClick={save} className="gap-2"><Save className="h-4 w-4" /> সেভ করুন</Button>
      </Card>
    </div>
  );
};

export default MemberProfile;
