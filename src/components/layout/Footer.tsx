import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Heart, Mail, Phone, MapPin, Facebook, Youtube, Instagram, Send, MessageCircle, Linkedin, Download, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/shishuful-logo.jpg";

const SOCIAL_ICONS: Record<string, any> = {
  social_facebook: Facebook,
  social_youtube: Youtube,
  social_instagram: Instagram,
  social_twitter: () => <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  social_linkedin: Linkedin,
  social_whatsapp: () => <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  social_telegram: Send,
};

const Footer = () => {
  const [org, setOrg] = useState<any>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [policyPages, setPolicyPages] = useState<any[]>([]);
  const [nlEmail, setNlEmail] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    Promise.all([
      supabase.from("organizations").select("*").limit(1).maybeSingle(),
      supabase.from("site_settings").select("*"),
      supabase.from("pages").select("id,title,slug").eq("status", "published").eq("type", "policy"),
    ]).then(([orgRes, settingsRes, pagesRes]) => {
      if (orgRes.data) setOrg(orgRes.data);
      if (pagesRes.data) setPolicyPages(pagesRes.data);
      if (settingsRes.data) {
        const map: Record<string, string> = {};
        settingsRes.data.forEach((s: any) => {
          const k = s.key || s.setting_key || s.name || "";
          const raw = s.value || s.setting_value || "";
          if (k) map[k] = typeof raw === "string" ? raw.replace(/^"|"$/g, "") : JSON.stringify(raw).replace(/^"|"$/g, "");
        });
        setSettings(map);
      }
    });
  }, []);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail) return;
    setNlLoading(true);
    try {
      try {
        await supabase.functions.invoke("newsletter-subscribe", { body: { email: nlEmail, action: "subscribe" } });
      } catch {
        await supabase.from("newsletter_subscribers").upsert({ email: nlEmail, status: "active" }, { onConflict: "email" });
      }
      toast({ title: t("footer_newsletter_success") });
      setNlEmail("");
    } catch (err: any) {
      toast({ title: t("footer_newsletter_fail"), description: err.message, variant: "destructive" });
    }
    setNlLoading(false);
  };

  const orgName = org?.name || "শিশুফুল";
  const footerText = settings.footer_text || `© ${new Date().getFullYear()} ${orgName}`;

  const socialKeys = ["social_facebook", "social_youtube", "social_instagram", "social_twitter", "social_linkedin", "social_whatsapp", "social_telegram"];
  const socialLinks = socialKeys
    .map(key => ({ key, url: settings[key] || (key === "social_facebook" ? org?.facebook : key === "social_youtube" ? org?.youtube : "") }))
    .filter(s => s.url && s.url !== "#" && s.url.length > 3);

  const quickLinks = [
    { label: t("footer_projects"), href: "/projects" },
    { label: t("footer_donations"), href: "/donations" },
    { label: t("footer_events"), href: "/events" },
    { label: t("footer_blog"), href: "/blog" },
    { label: t("footer_blood"), href: "/blood" },
    { label: t("footer_gallery"), href: "/gallery" },
    { label: t("footer_transparency"), href: "/transparency" },
  ];

  return (
    <footer id="contact" className="relative overflow-hidden">
      <div className="relative h-16 bg-background">
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
          <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,40 1440,30 L1440,60 L0,60Z" fill="hsl(var(--foreground))" />
        </svg>
      </div>
      <div className="bg-foreground text-background relative">
        <div className="absolute top-10 right-20 w-24 h-24 rounded-full bg-primary/10 floating-shape" />
        <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-accent/10 floating-shape-reverse" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Org Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={org?.logo_url || logo} alt={orgName} className="h-12 rounded-xl shadow-lg" />
                <span className="text-xl font-bold font-heading">{orgName}</span>
              </div>
              <p className="text-sm opacity-70 leading-relaxed">{org?.description?.slice(0, 120) || t("footer_default_desc")}</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold font-heading mb-4 text-lg">{t("footer_quick_links")}</h4>
              <ul className="space-y-2.5 text-sm">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="opacity-70 hover:opacity-100 hover:text-primary transition-all duration-200 inline-block hover:translate-x-1">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policy Pages */}
            <div>
              <h4 className="font-bold font-heading mb-4 text-lg">{t("footer_policies")}</h4>
              <ul className="space-y-2.5 text-sm">
                {policyPages.map((p) => (
                  <li key={p.id}>
                    <Link to={`/page/${p.slug}`} className="opacity-70 hover:opacity-100 hover:text-primary transition-all duration-200 inline-block hover:translate-x-1">{p.title}</Link>
                  </li>
                ))}
                {policyPages.length === 0 && (
                  <li className="opacity-50 text-xs">{t("footer_no_policies")}</li>
                )}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold font-heading mb-4 text-lg">{t("footer_contact")}</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 opacity-70"><Mail className="h-4 w-4 text-primary" /> {org?.email || org?.contact_email || "info@shishuful.org"}</li>
                <li className="flex items-center gap-2 opacity-70"><Phone className="h-4 w-4 text-primary" /> {org?.phone || org?.contact_phone || "+880 1XXX-XXXXXX"}</li>
                <li className="flex items-center gap-2 opacity-70"><MapPin className="h-4 w-4 text-primary" /> {org?.address || "বাংলাদেশ"}</li>
              </ul>
              {settings.map_url && (
                <a href={settings.map_url} target="_blank" rel="noopener noreferrer"
                   className="mt-3 inline-flex items-center gap-2 text-xs opacity-70 hover:opacity-100 hover:text-primary transition-all">
                  <MapPin className="h-3 w-3" /> {t("footer_view_map")}
                </a>
              )}
            </div>

            {/* Newsletter + Social */}
            <div>
              <h4 className="font-bold font-heading mb-4 text-lg">{t("footer_newsletter")}</h4>
              <form onSubmit={handleNewsletterSubscribe} className="flex gap-2 mb-5">
                <Input
                  type="email"
                  placeholder={t("footer_email_placeholder")}
                  value={nlEmail}
                  onChange={(e) => setNlEmail(e.target.value)}
                  required
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50 text-sm"
                />
                <Button type="submit" size="sm" disabled={nlLoading} className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              <h4 className="font-bold font-heading mb-3 text-lg">{t("footer_social_media")}</h4>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map(({ key, url }) => {
                  const IconComp = SOCIAL_ICONS[key];
                  if (!IconComp) return null;
                  return (
                    <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                       className="p-2.5 rounded-xl bg-background/10 hover:bg-primary hover:scale-110 transition-all duration-300"
                       title={key.replace("social_", "")}>
                      {typeof IconComp === "function" && !IconComp.prototype ? <IconComp /> : <IconComp className="h-5 w-5" />}
                    </a>
                  );
                })}
                {socialLinks.length === 0 && (
                  <>
                    <a href="#" className="p-2.5 rounded-xl bg-background/10 hover:bg-primary hover:scale-110 transition-all duration-300"><Facebook className="h-5 w-5" /></a>
                    <a href="#" className="p-2.5 rounded-xl bg-background/10 hover:bg-primary hover:scale-110 transition-all duration-300"><Youtube className="h-5 w-5" /></a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* App Download CTA */}
          <div className="border-t border-background/10 mt-10 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-3 rounded-2xl">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">{t("footer_app_download")}</p>
                  <p className="text-xs opacity-60">{t("footer_app_desc")}</p>
                </div>
              </div>
              <Button
                onClick={() => { window.dispatchEvent(new Event("show-pwa-install")); }}
                className="gap-2"
                size="sm"
              >
                <Download className="h-4 w-4" /> {t("footer_install")}
              </Button>
            </div>
          </div>

          <div className="border-t border-background/10 mt-6 pt-6 text-center text-sm opacity-50">
            <p className="flex items-center justify-center gap-1">
              {footerText} {t("footer_made_with")} <Heart className="h-3 w-3 text-primary" /> {t("footer_with")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
