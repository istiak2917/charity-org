import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Settings, Save, Upload, Trash2, Type, Globe, Coins } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CustomFont {
  id: string;
  name: string;
  url: string;
  applyTo: ("body" | "heading" | "nav" | "button")[];
}

const FONT_TARGETS = [
  { key: "body" as const, label_bn: "বডি টেক্সট", label_en: "Body Text" },
  { key: "heading" as const, label_bn: "হেডিং", label_en: "Headings" },
  { key: "nav" as const, label_bn: "নেভিগেশন", label_en: "Navigation" },
  { key: "button" as const, label_bn: "বাটন", label_en: "Buttons" },
];

const SettingsPage = () => {
  const [org, setOrg] = useState<any>({});
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsRows, setSettingsRows] = useState<any[]>([]);
  const [settingsTable, setSettingsTable] = useState("site_settings");
  const [loading, setLoading] = useState(true);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [newFontName, setNewFontName] = useState("");
  const [newFontUrl, setNewFontUrl] = useState("");
  const [newFontTargets, setNewFontTargets] = useState<CustomFont["applyTo"]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t, lang } = useLanguage();
  const { currency, setCurrencyCode, allCurrencies } = useCurrency();

  useEffect(() => {
    const fetchAll = async () => {
      const orgRes = await supabase.from("organizations").select("*").limit(1).maybeSingle();
      if (orgRes.data) setOrg(orgRes.data);

      let sRes = await supabase.from("site_settings").select("*");
      if (sRes.error && sRes.error.message?.includes("schema cache")) {
        sRes = await supabase.from("settings").select("*");
        setSettingsTable("settings");
      }
      if (sRes.data) {
        setSettingsRows(sRes.data);
        const map: Record<string, string> = {};
        sRes.data.forEach((s: any) => {
          const k = s.key || s.setting_key || s.name || "";
          const raw = s.value || s.setting_value || "";
          if (k) map[k] = typeof raw === "string" ? raw.replace(/^"|"$/g, "") : JSON.stringify(raw).replace(/^"|"$/g, "");
        });
        setSettings(map);
        // Load custom fonts from settings
        try {
          const fonts = JSON.parse(map.custom_fonts || "[]");
          setCustomFonts(Array.isArray(fonts) ? fonts : []);
        } catch { setCustomFonts([]); }
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const saveOrg = async () => {
    if (!org.id) {
      const { error } = await supabase.from("organizations").insert(org);
      if (error) toast({ title: lang === "bn" ? "সেভ ব্যর্থ" : "Save failed", description: error.message, variant: "destructive" });
      else toast({ title: lang === "bn" ? "সংগঠনের তথ্য সেভ হয়েছে!" : "Organization saved!" });
      return;
    }
    const { error } = await supabase.from("organizations").update(org).eq("id", org.id);
    if (error) toast({ title: lang === "bn" ? "সেভ ব্যর্থ" : "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: lang === "bn" ? "সংগঠনের তথ্য সেভ হয়েছে!" : "Organization saved!" });
  };

  const saveSiteSettings = async () => {
    const sample = settingsRows[0] || {};
    const keyCol = "key" in sample ? "key" : "setting_key" in sample ? "setting_key" : "key";
    const valCol = "value" in sample ? "value" : "setting_value" in sample ? "setting_value" : "value";
    const promises = Object.entries(settings).map(([key, value]) =>
      supabase.from(settingsTable).upsert({ [keyCol]: key, [valCol]: JSON.stringify(value) }, { onConflict: keyCol })
    );
    await Promise.all(promises);
    toast({ title: t("settings_saved") });
  };

  const updateSetting = (key: string, value: string) => setSettings({ ...settings, [key]: value });

  // Font management
  const addFont = () => {
    if (!newFontName || !newFontUrl) {
      toast({ title: lang === "bn" ? "ফন্টের নাম ও URL দিন" : "Provide font name & URL", variant: "destructive" });
      return;
    }
    const font: CustomFont = { id: Date.now().toString(), name: newFontName, url: newFontUrl, applyTo: newFontTargets };
    const updated = [...customFonts, font];
    setCustomFonts(updated);
    setSettings({ ...settings, custom_fonts: JSON.stringify(updated) });
    setNewFontName(""); setNewFontUrl(""); setNewFontTargets([]);
    toast({ title: lang === "bn" ? "ফন্ট যোগ হয়েছে" : "Font added" });
  };

  const removeFont = (id: string) => {
    const updated = customFonts.filter(f => f.id !== id);
    setCustomFonts(updated);
    setSettings({ ...settings, custom_fonts: JSON.stringify(updated) });
  };

  const toggleFontTarget = (fontId: string, target: CustomFont["applyTo"][number]) => {
    const updated = customFonts.map(f => {
      if (f.id !== fontId) return f;
      const has = f.applyTo.includes(target);
      return { ...f, applyTo: has ? f.applyTo.filter(t => t !== target) : [...f.applyTo, target] };
    });
    setCustomFonts(updated);
    setSettings({ ...settings, custom_fonts: JSON.stringify(updated) });
  };

  const handleFontFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Create object URL for local preview; in production this would upload to storage
    const url = URL.createObjectURL(file);
    setNewFontUrl(url);
    if (!newFontName) setNewFontName(file.name.replace(/\.(ttf|otf|woff2?|eot)$/i, ""));
  };

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

  const lb = (bn: string, en: string) => lang === "bn" ? bn : en;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">{t("settings_title")}</h1>
      </div>

      <Tabs defaultValue="org">
        <TabsList className="flex-wrap">
          <TabsTrigger value="org">{t("settings_org")}</TabsTrigger>
          <TabsTrigger value="site">{t("settings_site")}</TabsTrigger>
          <TabsTrigger value="theme">{t("settings_theme")}</TabsTrigger>
          <TabsTrigger value="language" className="gap-1"><Globe className="h-3.5 w-3.5" /> {t("settings_language")}</TabsTrigger>
          <TabsTrigger value="currency" className="gap-1"><Coins className="h-3.5 w-3.5" /> {t("settings_currency")}</TabsTrigger>
          <TabsTrigger value="fonts" className="gap-1"><Type className="h-3.5 w-3.5" /> {t("settings_fonts")}</TabsTrigger>
        </TabsList>

        {/* ===== Organization Tab ===== */}
        <TabsContent value="org" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">{lb("মৌলিক তথ্য", "Basic Info")}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {orgField(lb("সংগঠনের নাম", "Organization Name"), "name")}
              {orgField(lb("ফোন", "Phone"), "phone")}
              {orgField(lb("ওয়েবসাইট", "Website"), "website")}
              {orgField(lb("প্রতিষ্ঠার সাল", "Founded Year"), "founded_year", "number")}
              {orgField(lb("ঠিকানা", "Address"), "address")}
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">{lb("বিবরণ", "Description")}</h2>
            {orgField(lb("বিবরণ", "Description"), "description", "textarea")}
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">{lb("ছবি ও সোশ্যাল মিডিয়া", "Images & Social Media")}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {orgField(lb("লোগো URL", "Logo URL"), "logo_url")}
              {orgField("Facebook", "facebook")}
              {orgField("YouTube", "youtube")}
            </div>
          </Card>
          <Button onClick={saveOrg} className="gap-2"><Save className="h-4 w-4" /> {lb("সংগঠন সেভ করুন", "Save Organization")}</Button>
        </TabsContent>

        {/* ===== Site Settings Tab ===== */}
        <TabsContent value="site" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">{lb("হিরো সেকশন", "Hero Section")}</h2>
            <div className="space-y-3">
              <div className="space-y-1"><label className="text-sm font-medium">{lb("হিরো হেডলাইন", "Hero Headline")}</label><Input value={settings.hero_headline || ""} onChange={(e) => updateSetting("hero_headline", e.target.value)} /></div>
              <div className="space-y-1"><label className="text-sm font-medium">{lb("হিরো সাবটেক্সট", "Hero Subtext")}</label><Input value={settings.hero_subtext || ""} onChange={(e) => updateSetting("hero_subtext", e.target.value)} /></div>
              <div className="space-y-1"><label className="text-sm font-medium">{lb("CTA বাটন টেক্সট", "CTA Button Text")}</label><Input value={settings.cta_button_text || ""} onChange={(e) => updateSetting("cta_button_text", e.target.value)} /></div>
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">{lb("ফুটার ও পেমেন্ট", "Footer & Payment")}</h2>
            <div className="space-y-3">
              <div className="space-y-1"><label className="text-sm font-medium">{lb("ফুটার টেক্সট", "Footer Text")}</label><Input value={settings.footer_text || ""} onChange={(e) => updateSetting("footer_text", e.target.value)} /></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm font-medium">{lb("বিকাশ নম্বর", "bKash Number")}</label><Input value={settings.payment_bkash || ""} onChange={(e) => updateSetting("payment_bkash", e.target.value)} /></div>
                <div className="space-y-1"><label className="text-sm font-medium">{lb("নগদ নম্বর", "Nagad Number")}</label><Input value={settings.payment_nagad || ""} onChange={(e) => updateSetting("payment_nagad", e.target.value)} /></div>
              </div>
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">{lb("সোশ্যাল মিডিয়া লিংক", "Social Media Links")}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {["facebook", "youtube", "instagram", "twitter", "linkedin", "whatsapp", "telegram"].map(s => (
                <div key={s} className="space-y-1">
                  <label className="text-sm font-medium capitalize">{s === "twitter" ? "Twitter/X" : s}</label>
                  <Input value={settings[`social_${s}`] || ""} onChange={(e) => updateSetting(`social_${s}`, e.target.value)} />
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">{lb("গুগল ম্যাপ", "Google Map")}</h2>
            <div className="space-y-3">
              <div className="space-y-1"><label className="text-sm font-medium">{lb("ম্যাপ এম্বেড URL", "Map Embed URL")}</label><Input value={settings.map_embed_url || ""} onChange={(e) => updateSetting("map_embed_url", e.target.value)} /></div>
              <div className="space-y-1"><label className="text-sm font-medium">{lb("ম্যাপ লিংক (বাহ্যিক)", "Map Link (External)")}</label><Input value={settings.map_url || ""} onChange={(e) => updateSetting("map_url", e.target.value)} /></div>
            </div>
          </Card>
          <Button onClick={saveSiteSettings} className="gap-2"><Save className="h-4 w-4" /> {t("common_save")}</Button>
        </TabsContent>

        {/* ===== Theme Tab ===== */}
        <TabsContent value="theme" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">{lb("রঙ কাস্টমাইজেশন", "Color Customization")}</h2>
            <p className="text-xs text-muted-foreground">{lb("HSL ফরম্যাটে দিন। যেমন: 142 71% 45%", "Enter in HSL format. Example: 142 71% 45%")}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("প্রাইমারি কালার (HSL)", "Primary Color (HSL)")}</label>
                <div className="flex gap-2">
                  <Input value={settings.primary_color || ""} onChange={(e) => updateSetting("primary_color", e.target.value)} />
                  <div className="w-10 h-10 rounded-lg border" style={{ background: `hsl(${settings.primary_color || "142 71% 45%"})` }} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("অ্যাক্সেন্ট কালার (HSL)", "Accent Color (HSL)")}</label>
                <div className="flex gap-2">
                  <Input value={settings.accent_color || ""} onChange={(e) => updateSetting("accent_color", e.target.value)} />
                  <div className="w-10 h-10 rounded-lg border" style={{ background: `hsl(${settings.accent_color || "24 95% 53%"})` }} />
                </div>
              </div>
            </div>
          </Card>
          <Button onClick={saveSiteSettings} className="gap-2"><Save className="h-4 w-4" /> {lb("থিম সেভ করুন", "Save Theme")}</Button>
        </TabsContent>

        {/* ===== Language Tab ===== */}
        <TabsContent value="language" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2"><Globe className="h-5 w-5" /> {lb("ভাষা সেটিংস", "Language Settings")}</h2>
            <p className="text-sm text-muted-foreground">{lb("সাইটের ডিফল্ট ভাষা নির্বাচন করুন। ব্যবহারকারীরা নেভবার থেকেও ভাষা পরিবর্তন করতে পারবে।", "Select the default site language. Users can also switch language from the navbar.")}</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("ডিফল্ট ভাষা", "Default Language")}</label>
                <Select value={settings.default_language || "bn"} onValueChange={(v) => updateSetting("default_language", v)}>
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={settings.show_language_switcher !== "false"} onCheckedChange={(v) => updateSetting("show_language_switcher", v.toString())} />
                <Label>{lb("নেভবারে ভাষা সুইচার দেখান", "Show language switcher in navbar")}</Label>
              </div>
            </div>
          </Card>
          <Button onClick={saveSiteSettings} className="gap-2"><Save className="h-4 w-4" /> {t("common_save")}</Button>
        </TabsContent>

        {/* ===== Currency Tab ===== */}
        <TabsContent value="currency" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2"><Coins className="h-5 w-5" /> {lb("কারেন্সি সেটিংস", "Currency Settings")}</h2>
            <p className="text-sm text-muted-foreground">{lb("সাইটে প্রদর্শিত ডিফল্ট কারেন্সি নির্বাচন করুন। মোট ৫৫+ কারেন্সি সাপোর্টেড।", "Select the default currency displayed on the site. 55+ currencies supported.")}</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("ডিফল্ট কারেন্সি", "Default Currency")}</label>
                <Select value={currency.code} onValueChange={setCurrencyCode}>
                  <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {allCurrencies.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} {c.code} — {lang === "bn" ? c.name_bn : c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">{lb("প্রিভিউ", "Preview")}</p>
                <p className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat(currency.code === "BDT" ? "bn-BD" : "en-US", { style: "currency", currency: currency.code, minimumFractionDigits: 0 }).format(25000)}
                </p>
              </div>
            </div>
          </Card>
          <Button onClick={saveSiteSettings} className="gap-2"><Save className="h-4 w-4" /> {t("common_save")}</Button>
        </TabsContent>

        {/* ===== Fonts Tab ===== */}
        <TabsContent value="fonts" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2"><Type className="h-5 w-5" /> {lb("কাস্টম ফন্ট ম্যানেজমেন্ট", "Custom Font Management")}</h2>
            <p className="text-sm text-muted-foreground">{lb("Google Fonts URL বা ফন্ট ফাইল আপলোড করুন এবং কোথায় ব্যবহার হবে তা নির্ধারণ করুন।", "Add Google Fonts URL or upload font files and specify where they should be used.")}</p>

            {/* Add new font */}
            <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
              <h3 className="text-sm font-semibold">{lb("নতুন ফন্ট যোগ করুন", "Add New Font")}</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">{lb("ফন্টের নাম", "Font Name")}</label>
                  <Input placeholder="e.g. Roboto, Bangla Custom" value={newFontName} onChange={(e) => setNewFontName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">{lb("ফন্ট URL (Google Fonts বা CDN)", "Font URL (Google Fonts or CDN)")}</label>
                  <Input placeholder="https://fonts.googleapis.com/css2?family=..." value={newFontUrl} onChange={(e) => setNewFontUrl(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input ref={fileRef} type="file" accept=".ttf,.otf,.woff,.woff2,.eot" className="hidden" onChange={handleFontFileSelect} />
                <Button variant="outline" size="sm" className="gap-1" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5" /> {lb("ফাইল আপলোড", "Upload File")}
                </Button>
                <span className="text-xs text-muted-foreground">.ttf, .otf, .woff, .woff2</span>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">{lb("কোথায় ব্যবহার হবে", "Apply To")}</label>
                <div className="flex flex-wrap gap-3">
                  {FONT_TARGETS.map(target => (
                    <label key={target.key} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={newFontTargets.includes(target.key)}
                        onChange={(e) => setNewFontTargets(e.target.checked ? [...newFontTargets, target.key] : newFontTargets.filter(t => t !== target.key))}
                        className="rounded border-border" />
                      {lang === "bn" ? target.label_bn : target.label_en}
                    </label>
                  ))}
                </div>
              </div>
              <Button size="sm" className="gap-1" onClick={addFont}><Type className="h-3.5 w-3.5" /> {lb("ফন্ট যোগ করুন", "Add Font")}</Button>
            </div>

            {/* Existing fonts */}
            {customFonts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">{lb("যোগ করা ফন্ট", "Added Fonts")}</h3>
                {customFonts.map(font => (
                  <div key={font.id} className="border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium">{font.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[300px]">{font.url}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {FONT_TARGETS.map(target => (
                        <label key={target.key} className="flex items-center gap-1 text-xs cursor-pointer">
                          <input type="checkbox" checked={font.applyTo.includes(target.key)}
                            onChange={() => toggleFontTarget(font.id, target.key)}
                            className="rounded border-border" />
                          {lang === "bn" ? target.label_bn : target.label_en}
                        </label>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeFont(font.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Button onClick={saveSiteSettings} className="gap-2"><Save className="h-4 w-4" /> {t("common_save")}</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
