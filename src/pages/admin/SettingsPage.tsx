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
import { useTheme } from "next-themes";
import { Settings, Save, Upload, Trash2, Type, Globe, Coins, Moon, Sun, Palette, CreditCard, MessageCircle, Mail, Plug, Plus, X } from "lucide-react";
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

const COLOR_FIELDS = [
  { key: "theme_primary", cssVar: "--primary", labelKey: "theme_primary" as const },
  { key: "theme_accent", cssVar: "--accent", labelKey: "theme_accent" as const },
  { key: "theme_background", cssVar: "--background", labelKey: "theme_background" as const },
  { key: "theme_foreground", cssVar: "--foreground", labelKey: "theme_foreground" as const },
  { key: "theme_card", cssVar: "--card", labelKey: "theme_card" as const },
  { key: "theme_muted", cssVar: "--muted", labelKey: "theme_muted" as const },
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
  const { theme, setTheme } = useTheme();

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
      if (error) toast({ title: lb("সেভ ব্যর্থ", "Save failed"), description: error.message, variant: "destructive" });
      else toast({ title: lb("সংগঠনের তথ্য সেভ হয়েছে!", "Organization saved!") });
      return;
    }
    const { error } = await supabase.from("organizations").update(org).eq("id", org.id);
    if (error) toast({ title: lb("সেভ ব্যর্থ", "Save failed"), description: error.message, variant: "destructive" });
    else toast({ title: lb("সংগঠনের তথ্য সেভ হয়েছে!", "Organization saved!") });
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
      toast({ title: lb("ফন্টের নাম ও URL দিন", "Provide font name & URL"), variant: "destructive" });
      return;
    }
    const font: CustomFont = { id: Date.now().toString(), name: newFontName, url: newFontUrl, applyTo: newFontTargets };
    const updated = [...customFonts, font];
    setCustomFonts(updated);
    setSettings({ ...settings, custom_fonts: JSON.stringify(updated) });
    setNewFontName(""); setNewFontUrl(""); setNewFontTargets([]);
    toast({ title: lb("ফন্ট যোগ হয়েছে", "Font added") });
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
    const url = URL.createObjectURL(file);
    setNewFontUrl(url);
    if (!newFontName) setNewFontName(file.name.replace(/\.(ttf|otf|woff2?|eot)$/i, ""));
  };

  const applyThemeColors = () => {
    const root = document.documentElement;
    COLOR_FIELDS.forEach(({ key, cssVar }) => {
      const val = settings[key];
      if (val && val.trim()) root.style.setProperty(cssVar, val.trim());
    });
    toast({ title: t("theme_applied") });
  };

  const saveTheme = async () => { applyThemeColors(); await saveSiteSettings(); };

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
          <TabsTrigger value="theme" className="gap-1"><Palette className="h-3.5 w-3.5" /> {t("settings_theme")}</TabsTrigger>
          <TabsTrigger value="payment" className="gap-1"><CreditCard className="h-3.5 w-3.5" /> {lb("পেমেন্ট", "Payment")}</TabsTrigger>
          <TabsTrigger value="messaging" className="gap-1"><MessageCircle className="h-3.5 w-3.5" /> {lb("মেসেজিং", "Messaging")}</TabsTrigger>
          <TabsTrigger value="language" className="gap-1"><Globe className="h-3.5 w-3.5" /> {t("settings_language")}</TabsTrigger>
          <TabsTrigger value="currency" className="gap-1"><Coins className="h-3.5 w-3.5" /> {t("settings_currency")}</TabsTrigger>
          <TabsTrigger value="fonts" className="gap-1"><Type className="h-3.5 w-3.5" /> {t("settings_fonts")}</TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1"><Plug className="h-3.5 w-3.5" /> {lb("ইন্টিগ্রেশন", "Integrations")}</TabsTrigger>
          <TabsTrigger value="chat" className="gap-1"><MessageCircle className="h-3.5 w-3.5" /> {lb("চ্যাট", "Chat")}</TabsTrigger>
          <TabsTrigger value="profile_fields" className="gap-1"><Plus className="h-3.5 w-3.5" /> {lb("প্রোফাইল ফিল্ড", "Profile Fields")}</TabsTrigger>
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
              <div className="space-y-1"><label className="text-sm font-medium">{lb("ব্যাংক তথ্য", "Bank Info")}</label><Input value={settings.payment_bank || ""} onChange={(e) => updateSetting("payment_bank", e.target.value)} /></div>
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
            <h2 className="font-semibold text-lg flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              {lb("ডার্ক/লাইট মোড", "Dark/Light Mode")}
            </h2>
            <div className="flex items-center gap-4">
              <Button variant={theme === "light" ? "default" : "outline"} className="gap-2" onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4" /> {t("theme_light_mode")}
              </Button>
              <Button variant={theme === "dark" ? "default" : "outline"} className="gap-2" onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4" /> {t("theme_dark_mode")}
              </Button>
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2"><Palette className="h-5 w-5" /> {t("theme_colors")}</h2>
            <p className="text-sm text-muted-foreground">{t("theme_colors_desc")}</p>
            <p className="text-xs text-muted-foreground">{lb("HSL ফরম্যাট: H S% L% (যেমন: 330 80% 55%)", "HSL format: H S% L% (e.g. 330 80% 55%)")}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {COLOR_FIELDS.map(({ key, labelKey }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-sm font-medium">{t(labelKey)}</label>
                  <div className="flex gap-2">
                    <Input value={settings[key] || ""} onChange={(e) => updateSetting(key, e.target.value)} placeholder="330 80% 55%" className="flex-1" />
                    <div className="w-10 h-10 rounded-lg border border-border shrink-0" style={{ background: settings[key] ? `hsl(${settings[key]})` : "transparent" }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="border border-border rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold">{t("theme_preview")}</h3>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: settings.theme_primary ? `hsl(${settings.theme_primary})` : "hsl(var(--primary))", color: "white" }}>{lb("প্রাইমারি বাটন", "Primary Button")}</div>
                <div className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: settings.theme_accent ? `hsl(${settings.theme_accent})` : "hsl(var(--accent))", color: "white" }}>{lb("অ্যাক্সেন্ট", "Accent")}</div>
                <div className="px-4 py-2 rounded-lg text-sm border" style={{ background: settings.theme_background ? `hsl(${settings.theme_background})` : "hsl(var(--background))", color: settings.theme_foreground ? `hsl(${settings.theme_foreground})` : "hsl(var(--foreground))" }}>{lb("ব্যাকগ্রাউন্ড + টেক্সট", "Background + Text")}</div>
                <div className="px-4 py-2 rounded-lg text-sm" style={{ background: settings.theme_card ? `hsl(${settings.theme_card})` : "hsl(var(--card))", color: settings.theme_foreground ? `hsl(${settings.theme_foreground})` : "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}>{lb("কার্ড", "Card")}</div>
              </div>
            </div>
          </Card>
          <Button onClick={saveTheme} className="gap-2"><Save className="h-4 w-4" /> {t("theme_apply")}</Button>
        </TabsContent>

        {/* ===== Payment Gateway Tab ===== */}
        <TabsContent value="payment" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2"><CreditCard className="h-5 w-5" /> {lb("পেমেন্ট গেটওয়ে কনফিগারেশন", "Payment Gateway Configuration")}</h2>
            <p className="text-sm text-muted-foreground">{lb("আপনার নিজস্ব পেমেন্ট গেটওয়ে (নাগরিক পে, UddoktaPay, SSLCommerz ইত্যাদি) কনফিগার করুন।", "Configure your own payment gateway (NagorikPay, UddoktaPay, SSLCommerz etc).")}</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("গেটওয়ে নাম", "Gateway Name")}</label>
                <Input placeholder="e.g. NagorikPay, UddoktaPay" value={settings.payment_gateway_name || ""} onChange={(e) => updateSetting("payment_gateway_name", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("API URL (Checkout এন্ডপয়েন্ট)", "API URL (Checkout Endpoint)")}</label>
                <Input placeholder="https://api.gateway.com/checkout" value={settings.payment_gateway_url || ""} onChange={(e) => updateSetting("payment_gateway_url", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("API Key", "API Key")}</label>
                <Input placeholder="sk_live_xxx..." value={settings.payment_gateway_key || ""} onChange={(e) => updateSetting("payment_gateway_key", e.target.value)} type="password" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("Verify URL (ঐচ্ছিক)", "Verify URL (Optional)")}</label>
                <Input placeholder="https://api.gateway.com/verify" value={settings.payment_gateway_verify_url || ""} onChange={(e) => updateSetting("payment_gateway_verify_url", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("Webhook Secret (ঐচ্ছিক)", "Webhook Secret (Optional)")}</label>
                <Input placeholder="whsec_xxx..." value={settings.payment_gateway_webhook_secret || ""} onChange={(e) => updateSetting("payment_gateway_webhook_secret", e.target.value)} type="password" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={settings.payment_gateway_enabled === "true"} onCheckedChange={(v) => updateSetting("payment_gateway_enabled", v.toString())} />
                <Label>{lb("পেমেন্ট গেটওয়ে সচল করুন", "Enable Payment Gateway")}</Label>
              </div>
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">{lb("সাবস্ক্রিপশন ভিত্তিক দান", "Subscription Donations")}</h2>
            <div className="flex items-center gap-3">
              <Switch checked={settings.recurring_donations_enabled !== "false"} onCheckedChange={(v) => updateSetting("recurring_donations_enabled", v.toString())} />
              <Label>{lb("মাসিক/বার্ষিক সাবস্ক্রিপশন দান সচল করুন", "Enable recurring subscription donations")}</Label>
            </div>
          </Card>
          <Button onClick={saveSiteSettings} className="gap-2"><Save className="h-4 w-4" /> {t("common_save")}</Button>
        </TabsContent>

        {/* ===== Messaging Tab (WhatsApp + Email) ===== */}
        <TabsContent value="messaging" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2"><MessageCircle className="h-5 w-5 text-green-600" /> {lb("WhatsApp সেটিংস", "WhatsApp Settings")}</h2>
            <p className="text-sm text-muted-foreground">{lb("ফ্লোটিং WhatsApp বাটন সেটআপ করুন। নম্বর দিলেই সাইটে WhatsApp আইকন দেখাবে।", "Set up floating WhatsApp button. Add a number and the icon will appear on the site.")}</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("WhatsApp নম্বর (দেশ কোড সহ)", "WhatsApp Number (with country code)")}</label>
                <Input placeholder="8801XXXXXXXXX" value={settings.whatsapp_number || ""} onChange={(e) => updateSetting("whatsapp_number", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("ডিফল্ট মেসেজ", "Default Message")}</label>
                <Input placeholder={lb("আসসালামু আলাইকুম...", "Hello, I'm contacting you from your website...")} value={settings.whatsapp_message || ""} onChange={(e) => updateSetting("whatsapp_message", e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={settings.whatsapp_enabled !== "false"} onCheckedChange={(v) => updateSetting("whatsapp_enabled", v.toString())} />
                <Label>{lb("WhatsApp ফ্লোটিং বাটন দেখান", "Show floating WhatsApp button")}</Label>
              </div>
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2"><Mail className="h-5 w-5" /> {lb("ইমেইল সেটিংস", "Email Settings")}</h2>
            <p className="text-sm text-muted-foreground">{lb("ইমেইল পাঠানোর জন্য Resend API ব্যবহার করা হয়। কনফিগার না করলে ইমেইল কিউতে জমা হবে।", "Resend API is used for emails. If not configured, emails will be queued.")}</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("From ইমেইল", "From Email")}</label>
                <Input placeholder="noreply@example.org" value={settings.from_email || ""} onChange={(e) => updateSetting("from_email", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("অটো ইমেইল টেমপ্লেট (দানের পর)", "Auto Email Template (After Donation)")}</label>
                <Textarea rows={4} placeholder={lb("প্রিয় {{name}}, আপনার ৳{{amount}} অনুদানের জন্য ধন্যবাদ...", "Dear {{name}}, thank you for your ৳{{amount}} donation...")} value={settings.donation_email_template || ""} onChange={(e) => updateSetting("donation_email_template", e.target.value)} />
                <p className="text-xs text-muted-foreground">{lb("ভেরিয়েবল: {{name}}, {{email}}, {{amount}}, {{project}}, {{date}}", "Variables: {{name}}, {{email}}, {{amount}}, {{project}}, {{date}}")}</p>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={settings.auto_donation_email === "true"} onCheckedChange={(v) => updateSetting("auto_donation_email", v.toString())} />
                <Label>{lb("দানের পর অটো ইমেইল পাঠান", "Send auto email after donation")}</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={settings.auto_whatsapp_donation === "true"} onCheckedChange={(v) => updateSetting("auto_whatsapp_donation", v.toString())} />
                <Label>{lb("দানের পর অটো WhatsApp মেসেজ পাঠান", "Send auto WhatsApp after donation")}</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={settings.auto_welcome_email === "true"} onCheckedChange={(v) => updateSetting("auto_welcome_email", v.toString())} />
                <Label>{lb("নতুন সদস্যকে স্বাগতম ইমেইল পাঠান", "Send welcome email to new members")}</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={settings.auto_volunteer_email === "true"} onCheckedChange={(v) => updateSetting("auto_volunteer_email", v.toString())} />
                <Label>{lb("স্বেচ্ছাসেবক অনুমোদনে ইমেইল পাঠান", "Send email on volunteer approval")}</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={settings.auto_event_reminder === "true"} onCheckedChange={(v) => updateSetting("auto_event_reminder", v.toString())} />
                <Label>{lb("ইভেন্টের আগে রিমাইন্ডার ইমেইল", "Send event reminder email")}</Label>
              </div>
            </div>
          </Card>
          <Button onClick={saveSiteSettings} className="gap-2"><Save className="h-4 w-4" /> {t("common_save")}</Button>
        </TabsContent>

        {/* ===== Language Tab ===== */}
        <TabsContent value="language" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2"><Globe className="h-5 w-5" /> {lb("ভাষা সেটিংস", "Language Settings")}</h2>
            <p className="text-sm text-muted-foreground">{lb("সাইটের ডিফল্ট ভাষা নির্বাচন করুন।", "Select the default site language.")}</p>
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
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("ডিফল্ট কারেন্সি", "Default Currency")}</label>
                <Select value={currency.code} onValueChange={setCurrencyCode}>
                  <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {allCurrencies.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code} — {lang === "bn" ? c.name_bn : c.name}</SelectItem>
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
            <p className="text-sm text-muted-foreground">{lb("Google Fonts URL বা ফন্ট ফাইল আপলোড করুন।", "Add Google Fonts URL or upload font files.")}</p>
            <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
              <h3 className="text-sm font-semibold">{lb("নতুন ফন্ট যোগ করুন", "Add New Font")}</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">{lb("ফন্টের নাম", "Font Name")}</label>
                  <Input placeholder="e.g. Roboto" value={newFontName} onChange={(e) => setNewFontName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">{lb("ফন্ট URL", "Font URL")}</label>
                  <Input placeholder="https://fonts.googleapis.com/css2?family=..." value={newFontUrl} onChange={(e) => setNewFontUrl(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input ref={fileRef} type="file" accept=".ttf,.otf,.woff,.woff2,.eot" className="hidden" onChange={handleFontFileSelect} />
                <Button variant="outline" size="sm" className="gap-1" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5" /> {lb("ফাইল আপলোড", "Upload File")}
                </Button>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">{lb("কোথায় ব্যবহার হবে", "Apply To")}</label>
                <div className="flex flex-wrap gap-3">
                  {FONT_TARGETS.map(target => (
                    <label key={target.key} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={newFontTargets.includes(target.key)} onChange={(e) => setNewFontTargets(e.target.checked ? [...newFontTargets, target.key] : newFontTargets.filter(t => t !== target.key))} className="rounded border-border" />
                      {lang === "bn" ? target.label_bn : target.label_en}
                    </label>
                  ))}
                </div>
              </div>
              <Button size="sm" className="gap-1" onClick={addFont}><Type className="h-3.5 w-3.5" /> {lb("ফন্ট যোগ করুন", "Add Font")}</Button>
            </div>
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
                          <input type="checkbox" checked={font.applyTo.includes(target.key)} onChange={() => toggleFontTarget(font.id, target.key)} className="rounded border-border" />
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

        {/* ===== Integrations Tab ===== */}
        <TabsContent value="integrations" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2"><Plug className="h-5 w-5" /> {lb("থার্ড-পার্টি ইন্টিগ্রেশন", "Third-Party Integrations")}</h2>
            <p className="text-sm text-muted-foreground">{lb("বিভিন্ন বাইরের সেবা ইন্টিগ্রেট করুন।", "Configure external service integrations.")}</p>
            
            <div className="space-y-6">
              {/* Google OAuth */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">🔐 Google OAuth {lb("লগইন", "Login")}</h3>
                <p className="text-xs text-muted-foreground">{lb("Google একাউন্ট দিয়ে লগইন সচল করতে Supabase Dashboard → Authentication → Providers → Google এ গিয়ে Google Client ID ও Secret সেট করুন।", "To enable Google login, go to Supabase Dashboard → Authentication → Providers → Google and set your Client ID & Secret.")}</p>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Google Client ID</label>
                    <Input placeholder="xxx.apps.googleusercontent.com" value={settings.google_client_id || ""} onChange={(e) => updateSetting("google_client_id", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Google Analytics */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">📊 Google Analytics</h3>
                <div className="space-y-1">
                  <label className="text-sm font-medium">GA Measurement ID</label>
                  <Input placeholder="G-XXXXXXXXXX" value={settings.google_analytics_id || ""} onChange={(e) => updateSetting("google_analytics_id", e.target.value)} />
                </div>
              </div>

              {/* Facebook Pixel */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">📱 Facebook Pixel</h3>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Pixel ID</label>
                  <Input placeholder="123456789" value={settings.facebook_pixel_id || ""} onChange={(e) => updateSetting("facebook_pixel_id", e.target.value)} />
                </div>
              </div>

              {/* SEO */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">🔍 SEO</h3>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{lb("সাইট টাইটেল", "Site Title")}</label>
                    <Input value={settings.seo_title || ""} onChange={(e) => updateSetting("seo_title", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{lb("মেটা ডেসক্রিপশন", "Meta Description")}</label>
                    <Textarea rows={2} value={settings.seo_description || ""} onChange={(e) => updateSetting("seo_description", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">OG Image URL</label>
                    <Input value={settings.seo_og_image || ""} onChange={(e) => updateSetting("seo_og_image", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{lb("কীওয়ার্ড", "Keywords")}</label>
                    <Input placeholder={lb("চ্যারিটি, এনজিও, অনুদান", "charity, NGO, donation")} value={settings.seo_keywords || ""} onChange={(e) => updateSetting("seo_keywords", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Custom Script */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">⚡ {lb("কাস্টম হেড স্ক্রিপ্ট", "Custom Head Script")}</h3>
                <Textarea rows={4} placeholder="<script>...</script>" value={settings.custom_head_script || ""} onChange={(e) => updateSetting("custom_head_script", e.target.value)} />
              </div>
            </div>
          </Card>
          <Button onClick={saveSiteSettings} className="gap-2"><Save className="h-4 w-4" /> {t("common_save")}</Button>
        </TabsContent>

        {/* ===== Chat Settings Tab ===== */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2"><MessageCircle className="h-5 w-5" /> {lb("চ্যাট সেটিংস", "Chat Settings")}</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch checked={settings.chat_enabled !== "false"} onCheckedChange={(v) => updateSetting("chat_enabled", v.toString())} />
                <Label>{lb("রিয়েল-টাইম চ্যাট সচল", "Enable real-time chat")}</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={settings.support_chat_enabled !== "false"} onCheckedChange={(v) => updateSetting("support_chat_enabled", v.toString())} />
                <Label>{lb("সাপোর্ট চ্যাট উইজেট দেখান", "Show support chat widget")}</Label>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("সাপোর্ট চ্যাটের ওয়েলকাম মেসেজ", "Support chat welcome message")}</label>
                <Input value={settings.support_welcome_message || ""} onChange={(e) => updateSetting("support_welcome_message", e.target.value)} placeholder={lb("আমরা সবসময় আপনার পাশে আছি", "We're here to help")} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("প্রিসেট মেসেজ (কমা দিয়ে আলাদা)", "Preset messages (comma separated)")}</label>
                <Textarea rows={3} value={settings.support_preset_messages || ""} onChange={(e) => updateSetting("support_preset_messages", e.target.value)} placeholder={lb("আমি অনুদান দিতে চাই, স্বেচ্ছাসেবক হতে চাই, ধন্যবাদ", "I want to donate, I want to volunteer, Thank you")} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Messenger URL</label>
                <Input value={settings.messenger_url || ""} onChange={(e) => updateSetting("messenger_url", e.target.value)} placeholder="https://m.me/pagename" />
              </div>
            </div>
          </Card>
          <Button onClick={saveSiteSettings} className="gap-2"><Save className="h-4 w-4" /> {t("common_save")}</Button>
        </TabsContent>

        {/* ===== Profile Custom Fields Tab ===== */}
        <TabsContent value="profile_fields" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">{lb("প্রোফাইল কাস্টম ফিল্ড", "Profile Custom Fields")}</h2>
            <p className="text-sm text-muted-foreground">{lb("ইউজার প্রোফাইলে অতিরিক্ত ফিল্ড যোগ করুন।", "Add extra fields to user profiles.")}</p>
            <ProfileCustomFieldsEditor settings={settings} updateSetting={updateSetting} lb={lb} />
          </Card>
          <Button onClick={saveSiteSettings} className="gap-2"><Save className="h-4 w-4" /> {t("common_save")}</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Sub-component for profile custom fields
const ProfileCustomFieldsEditor = ({ settings, updateSetting, lb }: { settings: Record<string, string>; updateSetting: (k: string, v: string) => void; lb: (bn: string, en: string) => string }) => {
  const [fields, setFields] = useState<{ key: string; label: string }[]>([]);
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    try {
      const parsed = JSON.parse(settings.profile_custom_fields || "[]");
      if (Array.isArray(parsed)) setFields(parsed);
    } catch { setFields([]); }
  }, [settings.profile_custom_fields]);

  const addField = () => {
    if (!newKey || !newLabel) return;
    const updated = [...fields, { key: newKey.toLowerCase().replace(/\s+/g, "_"), label: newLabel }];
    setFields(updated);
    updateSetting("profile_custom_fields", JSON.stringify(updated));
    setNewKey(""); setNewLabel("");
  };

  const removeField = (idx: number) => {
    const updated = fields.filter((_, i) => i !== idx);
    setFields(updated);
    updateSetting("profile_custom_fields", JSON.stringify(updated));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input placeholder={lb("ফিল্ড কী (ইংরেজি)", "Field key")} value={newKey} onChange={(e) => setNewKey(e.target.value)} className="flex-1" />
        <Input placeholder={lb("লেবেল", "Label")} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="flex-1" />
        <Button size="sm" onClick={addField} className="gap-1"><Plus className="h-3.5 w-3.5" /> {lb("যোগ", "Add")}</Button>
      </div>
      {fields.map((f, i) => (
        <div key={i} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <span className="text-xs font-mono text-muted-foreground">{f.key}</span>
          <span className="text-sm font-medium flex-1">{f.label}</span>
          <Button variant="ghost" size="sm" onClick={() => removeField(i)}><X className="h-3.5 w-3.5 text-destructive" /></Button>
        </div>
      ))}
    </div>
  );
};

export default SettingsPage;
