import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const MapPage = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("site_settings").select("*"),
      supabase.from("organizations").select("*").limit(1).maybeSingle(),
    ]).then(([sRes, orgRes]) => {
      if (sRes.data) {
        const map: Record<string, string> = {};
        sRes.data.forEach((s: any) => {
          const k = s.key || s.setting_key || s.name || "";
          const raw = s.value || s.setting_value || "";
          if (k) map[k] = typeof raw === "string" ? raw.replace(/^"|"$/g, "") : String(raw);
        });
        setSettings(map);
      }
      if (orgRes.data) setOrg(orgRes.data);
      setLoading(false);
    });
  }, []);

  const embedUrl = settings.map_embed_url;
  const mapUrl = settings.map_url || "https://maps.google.com";
  const orgName = org?.name || "শিশুফুল ফাউন্ডেশন";
  const address = org?.address || "ঢাকা, বাংলাদেশ";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <MapPin className="h-10 w-10 text-primary mx-auto mb-2" />
          <h1 className="text-3xl font-bold font-heading">{orgName} - অবস্থান</h1>
          <p className="text-muted-foreground mt-1">{address}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : embedUrl ? (
          <div className="rounded-xl overflow-hidden border border-border shadow-lg" style={{ height: "calc(100vh - 280px)", minHeight: "400px" }}>
            <iframe src={embedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Map" />
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>ম্যাপ কনফিগার করা হয়নি। অ্যাডমিন সেটিংসে map_embed_url যোগ করুন।</p>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <a href={mapUrl} target="_blank" rel="noopener noreferrer">
            <Button className="gap-2">
              <ExternalLink className="h-4 w-4" /> গুগল ম্যাপে খুলুন
            </Button>
          </a>
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2">
              <MapPin className="h-4 w-4" /> দিকনির্দেশনা
            </Button>
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MapPage;
