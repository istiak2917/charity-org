import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Palette, Save } from "lucide-react";

const ThemeCustomizer = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("settings").select("key, value");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s) => { map[s.key] = typeof s.value === "string" ? s.value : JSON.stringify(s.value); });
        setSettings(map);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const updateSetting = async (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const saveAll = async () => {
    const promises = Object.entries(settings).map(([key, value]) =>
      supabase.from("settings").upsert({ key, value: JSON.stringify(value) }, { onConflict: "key" })
    );
    await Promise.all(promises);
    toast({ title: "সেটিংস সেভ হয়েছে!" });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const fields = [
    { key: "site_title", label: "সাইট টাইটেল" },
    { key: "hero_headline", label: "হিরো হেডলাইন" },
    { key: "hero_subtext", label: "হিরো সাবটেক্সট" },
    { key: "primary_color", label: "প্রাইমারি কালার (HSL)" },
    { key: "accent_color", label: "অ্যাক্সেন্ট কালার (HSL)" },
    { key: "footer_text", label: "ফুটার টেক্সট" },
    { key: "social_facebook", label: "Facebook URL" },
    { key: "social_youtube", label: "YouTube URL" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Palette className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">থিম কাস্টমাইজার</h1>
      </div>
      <Card className="p-6 space-y-4">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1">
            <label className="text-sm font-medium">{f.label}</label>
            <Input value={settings[f.key]?.replace(/^"|"$/g, "") || ""} onChange={(e) => updateSetting(f.key, e.target.value)} />
          </div>
        ))}
        <Button onClick={saveAll} className="gap-2"><Save className="h-4 w-4" /> সব সেভ করুন</Button>
      </Card>
    </div>
  );
};

export default ThemeCustomizer;
