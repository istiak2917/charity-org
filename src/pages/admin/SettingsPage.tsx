import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save } from "lucide-react";

interface Organization {
  id: string; name: string; description: string; mission: string; vision: string; history: string;
  email: string; phone: string; address: string; website: string; facebook: string; youtube: string;
  logo_url: string; cover_image_url: string; founded_year: number;
}

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
    if (error) toast({ title: "সেভ ব্যর্থ", description: error.message, variant: "destructive" });
    else toast({ title: "সেটিংস সেভ হয়েছে!" });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const field = (label: string, key: keyof Organization, type: "text" | "textarea" | "number" = "text") => (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {type === "textarea" ? (
        <Textarea rows={3} value={(org[key] as string) || ""} onChange={(e) => setOrg({ ...org, [key]: e.target.value })} />
      ) : (
        <Input type={type} value={(org[key] as string) || ""} onChange={(e) => setOrg({ ...org, [key]: type === "number" ? Number(e.target.value) : e.target.value })} />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">সংগঠন সেটিংস</h1>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">মৌলিক তথ্য</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {field("সংগঠনের নাম", "name")}
          {field("ইমেইল", "email")}
          {field("ফোন", "phone")}
          {field("ওয়েবসাইট", "website")}
          {field("প্রতিষ্ঠার সাল", "founded_year", "number")}
          {field("ঠিকানা", "address")}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">মিশন, ভিশন ও ইতিহাস</h2>
        {field("বিবরণ", "description", "textarea")}
        {field("মিশন", "mission", "textarea")}
        {field("ভিশন", "vision", "textarea")}
        {field("ইতিহাস", "history", "textarea")}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">ছবি ও সোশ্যাল মিডিয়া</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {field("লোগো URL", "logo_url")}
          {field("কভার ইমেজ URL", "cover_image_url")}
          {field("Facebook", "facebook")}
          {field("YouTube", "youtube")}
        </div>
      </Card>

      <Button onClick={save} className="gap-2"><Save className="h-4 w-4" /> সেভ করুন</Button>
    </div>
  );
};

export default SettingsPage;
