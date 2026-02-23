import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Palette, Save, RotateCcw } from "lucide-react";

const FONTS = [
  { value: "Hind Siliguri", label: "Hind Siliguri (বাংলা)" },
  { value: "Noto Sans Bengali", label: "Noto Sans Bengali" },
  { value: "Kalpurush", label: "কালপুরুষ" },
  { value: "Inter", label: "Inter (English)" },
  { value: "Poppins", label: "Poppins" },
];

const ThemeCustomizer = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("settings").select("key, value");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s) => { map[s.key] = typeof s.value === "string" ? s.value.replace(/^"|"$/g, "") : JSON.stringify(s.value).replace(/^"|"$/g, ""); });
        setSettings(map);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const saveAll = async () => {
    const promises = Object.entries(settings).map(([key, value]) =>
      supabase.from("settings").upsert({ key, value: JSON.stringify(value) }, { onConflict: "key" })
    );
    await Promise.all(promises);
    toast({ title: "সেটিংস সেভ হয়েছে! পেজ রিফ্রেশ করলে পরিবর্তন দেখবেন।" });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Palette className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">থিম কাস্টমাইজার</h1>
      </div>

      {/* Site Identity */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">সাইট পরিচিতি</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">সাইট টাইটেল</label>
            <Input value={settings.site_title || ""} onChange={(e) => updateSetting("site_title", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">CTA বাটন টেক্সট</label>
            <Input value={settings.cta_button_text || ""} onChange={(e) => updateSetting("cta_button_text", e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Hero Section */}
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
        </div>
      </Card>

      {/* Colors */}
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

      {/* Typography & Layout */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">টাইপোগ্রাফি ও লেআউট</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">ফন্ট ফ্যামিলি</label>
            <Select value={settings.font_family || "Hind Siliguri"} onValueChange={(v) => updateSetting("font_family", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FONTS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">বর্ডার রেডিয়াস</label>
            <Select value={settings.border_radius || "0.5rem"} onValueChange={(v) => updateSetting("border_radius", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">কোনো রাউন্ড নেই (0)</SelectItem>
                <SelectItem value="0.25rem">ছোট (0.25rem)</SelectItem>
                <SelectItem value="0.5rem">মাঝারি (0.5rem)</SelectItem>
                <SelectItem value="0.75rem">বড় (0.75rem)</SelectItem>
                <SelectItem value="1rem">খুব বড় (1rem)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Mode & Background */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">মোড ও ব্যাকগ্রাউন্ড</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">ব্যাকগ্রাউন্ড টোন</label>
            <Select value={settings.background_tone || "light"} onValueChange={(v) => updateSetting("background_tone", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">লাইট মোড</SelectItem>
                <SelectItem value="dark">ডার্ক মোড</SelectItem>
                <SelectItem value="warm">ওয়ার্ম টোন</SelectItem>
                <SelectItem value="cool">কুল টোন</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Footer & Social */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">ফুটার ও সোশ্যাল লিংক</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">ফুটার টেক্সট</label>
            <Input value={settings.footer_text || ""} onChange={(e) => updateSetting("footer_text", e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Facebook URL</label>
              <Input value={settings.social_facebook || ""} onChange={(e) => updateSetting("social_facebook", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">YouTube URL</label>
              <Input value={settings.social_youtube || ""} onChange={(e) => updateSetting("social_youtube", e.target.value)} />
            </div>
          </div>
        </div>
      </Card>

      <Button onClick={saveAll} size="lg" className="gap-2"><Save className="h-4 w-4" /> সব সেভ করুন</Button>
    </div>
  );
};

export default ThemeCustomizer;
