import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save } from "lucide-react";

const SettingsPage = () => {
  const [org, setOrg] = useState<any>({});
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsRows, setSettingsRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAll = async () => {
      const [orgRes, settingsRes] = await Promise.all([
        supabase.from("organizations").select("*").limit(1).maybeSingle(),
        supabase.from("site_settings").select("*"),
      ]);
      if (orgRes.data) setOrg(orgRes.data);
      if (settingsRes.data) {
        setSettingsRows(settingsRes.data);
        const map: Record<string, string> = {};
        settingsRes.data.forEach((s: any) => {
          const k = s.key || s.setting_key || s.name || "";
          const raw = s.value || s.setting_value || "";
          if (k) map[k] = typeof raw === "string" ? raw.replace(/^"|"$/g, "") : JSON.stringify(raw).replace(/^"|"$/g, "");
        });
        setSettings(map);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const saveOrg = async () => {
    if (!org.id) return;
    const { error } = await supabase.from("organizations").update(org).eq("id", org.id);
    if (error) toast({ title: "সেভ ব্যর্থ", description: error.message, variant: "destructive" });
    else toast({ title: "সংগঠনের তথ্য সেভ হয়েছে!" });
  };

  const saveSiteSettings = async () => {
    // Detect column names from existing rows
    const sample = settingsRows[0] || {};
    const keyCol = "key" in sample ? "key" : "setting_key" in sample ? "setting_key" : "name";
    const valCol = "value" in sample ? "value" : "setting_value";
    
    const promises = Object.entries(settings).map(([key, value]) =>
      supabase.from("site_settings").upsert({ [keyCol]: key, [valCol]: JSON.stringify(value) }, { onConflict: keyCol })
    );
    await Promise.all(promises);
    toast({ title: "সাইট সেটিংস সেভ হয়েছে!" });
  };

  const updateSetting = (key: string, value: string) => setSettings({ ...settings, [key]: value });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const orgField = (label: string, key: string, type: "text" | "textarea" | "number" = "text") => (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {type === "textarea" ? (
        <Textarea rows={3} value={org[key] || ""} onChange={(e) => setOrg({ ...org, [key]: e.target.value })} />
      ) : (
        <Input type={type} value={org[key] || ""} onChange={(e) => setOrg({ ...org, [key]: type === "number" ? Number(e.target.value) : e.target.value })} />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">সেটিংস</h1>
      </div>

      <Tabs defaultValue="org">
        <TabsList>
          <TabsTrigger value="org">সংগঠন</TabsTrigger>
          <TabsTrigger value="site">সাইট সেটিংস</TabsTrigger>
          <TabsTrigger value="theme">থিম</TabsTrigger>
        </TabsList>

        <TabsContent value="org" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">মৌলিক তথ্য</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {orgField("সংগঠনের নাম", "name")}
              {orgField("ফোন", "phone")}
              {orgField("ওয়েবসাইট", "website")}
              {orgField("প্রতিষ্ঠার সাল", "founded_year", "number")}
              {orgField("ঠিকানা", "address")}
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">বিবরণ</h2>
            {orgField("বিবরণ", "description", "textarea")}
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">ছবি ও সোশ্যাল মিডিয়া</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {orgField("লোগো URL", "logo_url")}
              {orgField("Facebook", "facebook")}
              {orgField("YouTube", "youtube")}
            </div>
          </Card>
          <Button onClick={saveOrg} className="gap-2"><Save className="h-4 w-4" /> সংগঠন সেভ করুন</Button>
        </TabsContent>

        <TabsContent value="site" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">হিরো সেকশন</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">হিরো হেডলাইন</label>
                <Input value={settings.hero_headline || ""} onChange={(e) => updateSetting("hero_headline", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">হিরো সাবটেক্সট</label>
                <Input value={settings.hero_subtext || ""} onChange={(e) => updateSetting("hero_subtext", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">CTA বাটন টেক্সট</label>
                <Input value={settings.cta_button_text || ""} onChange={(e) => updateSetting("cta_button_text", e.target.value)} />
              </div>
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">ফুটার ও পেমেন্ট</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">ফুটার টেক্সট</label>
                <Input value={settings.footer_text || ""} onChange={(e) => updateSetting("footer_text", e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">বিকাশ নম্বর</label>
                  <Input value={settings.payment_bkash || ""} onChange={(e) => updateSetting("payment_bkash", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">নগদ নম্বর</label>
                  <Input value={settings.payment_nagad || ""} onChange={(e) => updateSetting("payment_nagad", e.target.value)} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium">ব্যাংক তথ্য</label>
                  <Input value={settings.payment_bank || ""} onChange={(e) => updateSetting("payment_bank", e.target.value)} />
                </div>
              </div>
            </div>
          </Card>
          <Button onClick={saveSiteSettings} className="gap-2"><Save className="h-4 w-4" /> সেটিংস সেভ করুন</Button>
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">রঙ কাস্টমাইজেশন</h2>
            <p className="text-xs text-muted-foreground">HSL ফরম্যাটে দিন। যেমন: 142 71% 45%</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">প্রাইমারি কালার (HSL)</label>
                <div className="flex gap-2">
                  <Input value={settings.primary_color || ""} onChange={(e) => updateSetting("primary_color", e.target.value)} />
                  <div className="w-10 h-10 rounded-lg border" style={{ background: `hsl(${settings.primary_color || "142 71% 45%"})` }} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">অ্যাক্সেন্ট কালার (HSL)</label>
                <div className="flex gap-2">
                  <Input value={settings.accent_color || ""} onChange={(e) => updateSetting("accent_color", e.target.value)} />
                  <div className="w-10 h-10 rounded-lg border" style={{ background: `hsl(${settings.accent_color || "24 95% 53%"})` }} />
                </div>
              </div>
            </div>
          </Card>
          <Button onClick={saveSiteSettings} className="gap-2"><Save className="h-4 w-4" /> থিম সেভ করুন</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
