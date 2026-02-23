import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save } from "lucide-react";

interface Organization { id: string; name: string; description: string; email: string; phone: string; address: string; website: string; facebook: string; youtube: string; founded_year: number; }

const SettingsPage = () => {
  const [org, setOrg] = useState<Partial<Organization>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("organizations").select("*").limit(1).single();
      if (data) setOrg(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const save = async () => {
    if (!org.id) return;
    const { error } = await supabase.from("organizations").update(org).eq("id", org.id);
    if (error) { toast({ title: "সেভ ব্যর্থ", description: error.message, variant: "destructive" }); }
    else { toast({ title: "সেটিংস সেভ হয়েছে!" }); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">সংগঠন সেটিংস</h1>
      </div>
      <Card className="p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1"><label className="text-sm font-medium">নাম</label><Input value={org.name || ""} onChange={(e) => setOrg({ ...org, name: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-sm font-medium">ইমেইল</label><Input value={org.email || ""} onChange={(e) => setOrg({ ...org, email: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-sm font-medium">ফোন</label><Input value={org.phone || ""} onChange={(e) => setOrg({ ...org, phone: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-sm font-medium">ওয়েবসাইট</label><Input value={org.website || ""} onChange={(e) => setOrg({ ...org, website: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-sm font-medium">Facebook</label><Input value={org.facebook || ""} onChange={(e) => setOrg({ ...org, facebook: e.target.value })} /></div>
          <div className="space-y-1"><label className="text-sm font-medium">YouTube</label><Input value={org.youtube || ""} onChange={(e) => setOrg({ ...org, youtube: e.target.value })} /></div>
        </div>
        <div className="space-y-1"><label className="text-sm font-medium">ঠিকানা</label><Input value={org.address || ""} onChange={(e) => setOrg({ ...org, address: e.target.value })} /></div>
        <div className="space-y-1"><label className="text-sm font-medium">বিবরণ</label><Textarea rows={4} value={org.description || ""} onChange={(e) => setOrg({ ...org, description: e.target.value })} /></div>
        <Button onClick={save} className="gap-2"><Save className="h-4 w-4" /> সেভ করুন</Button>
      </Card>
    </div>
  );
};

export default SettingsPage;
