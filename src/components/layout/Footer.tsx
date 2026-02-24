import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Heart, Mail, Phone, MapPin, Facebook, Youtube } from "lucide-react";
import logo from "@/assets/shishuful-logo.jpg";

const Footer = () => {
  const [org, setOrg] = useState<any>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [policyPages, setPolicyPages] = useState<any[]>([]);

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

  const orgName = org?.name || "শিশুফুল";
  const fbUrl = settings.social_facebook || org?.facebook || "#";
  const ytUrl = settings.social_youtube || org?.youtube || "#";
  const footerText = settings.footer_text || `© ${new Date().getFullYear()} ${orgName}। সর্বস্বত্ব সংরক্ষিত।`;

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={org?.logo_url || logo} alt={orgName} className="h-12 rounded-xl shadow-lg" />
                <span className="text-xl font-bold font-heading">{orgName}</span>
              </div>
              <p className="text-sm opacity-70 leading-relaxed">{org?.description || "প্রতিটি শিশুর মুখে হাসি ফোটানো আমাদের অঙ্গীকার।"}</p>
            </div>
            <div>
              <h4 className="font-bold font-heading mb-4 text-lg">দ্রুত লিংক</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: "প্রকল্পসমূহ", href: "/projects" },
                  { label: "অনুদান", href: "/donations" },
                  { label: "ইভেন্ট", href: "/events" },
                  { label: "ব্লগ", href: "/blog" },
                  { label: "রক্তদান", href: "/blood" },
                  { label: "গ্যালারি", href: "/gallery" },
                  { label: "রিপোর্ট", href: "/reports" },
                  { label: "স্বচ্ছতা", href: "/transparency" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="opacity-70 hover:opacity-100 hover:text-primary transition-all duration-200 inline-block hover:translate-x-1">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold font-heading mb-4 text-lg">নীতিমালা</h4>
              <ul className="space-y-2.5 text-sm">
                {policyPages.map((p) => (
                  <li key={p.id}>
                    <Link to={`/page/${p.slug}`} className="opacity-70 hover:opacity-100 hover:text-primary transition-all duration-200 inline-block hover:translate-x-1">{p.title}</Link>
                  </li>
                ))}
                {policyPages.length === 0 && (
                  <li className="opacity-50 text-xs">কোনো নীতিমালা প্রকাশিত নেই</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-bold font-heading mb-4 text-lg">যোগাযোগ</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 opacity-70"><Mail className="h-4 w-4 text-primary" /> {org?.email || org?.contact_email || "info@shishuful.org"}</li>
                <li className="flex items-center gap-2 opacity-70"><Phone className="h-4 w-4 text-primary" /> {org?.phone || org?.contact_phone || "+880 1XXX-XXXXXX"}</li>
                <li className="flex items-center gap-2 opacity-70"><MapPin className="h-4 w-4 text-primary" /> {org?.address || "বাংলাদেশ"}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold font-heading mb-4 text-lg">সোশ্যাল মিডিয়া</h4>
              <div className="flex gap-3">
                <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-background/10 hover:bg-primary hover:scale-110 transition-all duration-300">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href={ytUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-background/10 hover:bg-primary hover:scale-110 transition-all duration-300">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-background/10 mt-10 pt-6 text-center text-sm opacity-50">
            <p className="flex items-center justify-center gap-1">
              {footerText} তৈরি করা হয়েছে <Heart className="h-3 w-3 text-primary" /> দিয়ে
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
