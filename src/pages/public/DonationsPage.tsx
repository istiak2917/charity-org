import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, TrendingUp, RefreshCw, CreditCard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import QRCodeGenerator from "@/components/QRCodeGenerator";

const DonationsPage = () => {
  const [stats, setStats] = useState({ total: 0, count: 0, campaigns: 0 });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [oneTimeForm, setOneTimeForm] = useState({ name: "", email: "", phone: "", amount: "" });
  const [paying, setPaying] = useState(false);
  const { lang } = useLanguage();
  const { toast } = useToast();
  const lb = (bn: string, en: string) => lang === "bn" ? bn : en;

  useEffect(() => {
    Promise.all([
      supabase.from("donations").select("*"),
      supabase.from("donation_campaigns").select("*").eq("status", "active"),
      supabase.from("site_settings").select("*"),
    ]).then(([donRes, campRes, settRes]) => {
      const donations = donRes.data || [];
      const total = donations.reduce((s: number, d: any) => s + (d.amount || 0), 0);
      setStats({ total, count: donations.length, campaigns: (campRes.data || []).length });
      setCampaigns(campRes.data || []);
      if (settRes.data) {
        const map: Record<string, string> = {};
        settRes.data.forEach((s: any) => {
          const k = s.setting_key || s.key || "";
          const v = s.setting_value || s.value || "";
          if (k) map[k] = typeof v === "string" ? v.replace(/^"|"$/g, "") : "";
        });
        setSettings(map);
      }
      setLoading(false);
    });
  }, []);

  const handleOnlinePay = async () => {
    const amount = Number(oneTimeForm.amount);
    if (!amount || !oneTimeForm.name) {
      toast({ title: lb("নাম ও পরিমাণ দিন", "Provide name and amount"), variant: "destructive" });
      return;
    }
    setPaying(true);

    // Create donation record
    const { data: donation } = await supabase.from("donations").insert({
      donor_name: oneTimeForm.name,
      donor_email: oneTimeForm.email,
      amount,
      method: "online",
      status: "pending",
      source: "website",
    }).select().single();

    const gatewayUrl = settings.payment_gateway_url;
    const gatewayKey = settings.payment_gateway_key;

    if (gatewayUrl && gatewayKey) {
      try {
        const res = await fetch(gatewayUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${gatewayKey}` },
          body: JSON.stringify({
            amount,
            name: oneTimeForm.name,
            email: oneTimeForm.email,
            phone: oneTimeForm.phone,
            donation_id: donation?.id,
            redirect_url: `${window.location.origin}/payment/result?status=success`,
            cancel_url: `${window.location.origin}/payment/result?status=cancel`,
          }),
        });
        const data = await res.json();
        if (data.payment_url) {
          window.location.href = data.payment_url;
          return;
        }
      } catch {
        toast({ title: lb("পেমেন্ট গেটওয়ে ত্রুটি", "Payment gateway error"), variant: "destructive" });
      }
    } else {
      toast({ title: lb("অনুদান রেকর্ড হয়েছে ✅", "Donation recorded ✅"), description: lb("ম্যানুয়াল পেমেন্ট করুন", "Make manual payment") });
    }
    setPaying(false);
  };

  const presets = [100, 500, 1000, 5000];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SEOHead title={lb("অনুদান", "Donations")} description={lb("আপনার সাহায্য পরিবর্তন আনে", "Your help makes a difference")} />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Heart className="h-12 w-12 text-primary mx-auto mb-3" />
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">{lb("অনুদান", "Donations")}</h1>
          <p className="text-muted-foreground">{lb("আপনার সাহায্য পরিবর্তন আনে", "Your help makes a difference")}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary">৳{stats.total.toLocaleString(lang === "bn" ? "bn-BD" : "en-US")}</div>
                <div className="text-sm text-muted-foreground">{lb("মোট অনুদান", "Total Donations")}</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary">{stats.count.toLocaleString(lang === "bn" ? "bn-BD" : "en-US")}</div>
                <div className="text-sm text-muted-foreground">{lb("মোট দাতা", "Total Donors")}</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary">{stats.campaigns.toLocaleString(lang === "bn" ? "bn-BD" : "en-US")}</div>
                <div className="text-sm text-muted-foreground">{lb("চলমান ক্যাম্পেইন", "Active Campaigns")}</div>
              </Card>
            </div>

            {/* Online Donation Form */}
            <Card className="max-w-2xl mx-auto p-6 mb-8">
              <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> {lb("অনলাইনে দান করুন", "Donate Online")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {presets.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setOneTimeForm({ ...oneTimeForm, amount: String(amt) })}
                    className={`rounded-xl border-2 py-3 text-lg font-bold transition-all ${oneTimeForm.amount === String(amt) ? "border-primary bg-primary text-primary-foreground" : "border-primary/20 bg-background text-primary hover:bg-primary/10"}`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <Input placeholder={lb("আপনার নাম *", "Your Name *")} value={oneTimeForm.name} onChange={e => setOneTimeForm({ ...oneTimeForm, name: e.target.value })} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input placeholder={lb("ইমেইল", "Email")} type="email" value={oneTimeForm.email} onChange={e => setOneTimeForm({ ...oneTimeForm, email: e.target.value })} />
                  <Input placeholder={lb("ফোন", "Phone")} value={oneTimeForm.phone} onChange={e => setOneTimeForm({ ...oneTimeForm, phone: e.target.value })} />
                </div>
                <Input placeholder={lb("পরিমাণ (৳)", "Amount (৳)")} type="number" value={oneTimeForm.amount} onChange={e => setOneTimeForm({ ...oneTimeForm, amount: e.target.value })} />
                <Button onClick={handleOnlinePay} disabled={paying} className="w-full gap-2" size="lg">
                  <Heart className="h-5 w-5" /> {paying ? lb("প্রসেসিং...", "Processing...") : lb("দান করুন", "Donate Now")}
                </Button>
              </div>
              {/* Manual payment info */}
              <div className="mt-4 bg-muted rounded-xl p-4 text-sm space-y-1">
                <h4 className="font-bold">{lb("ম্যানুয়াল পেমেন্ট", "Manual Payment")}</h4>
                <p><strong>{lb("বিকাশ", "bKash")}:</strong> {settings.payment_bkash || "01XXX-XXXXXX"}</p>
                <p><strong>{lb("নগদ", "Nagad")}:</strong> {settings.payment_nagad || "01XXX-XXXXXX"}</p>
                <p><strong>{lb("ব্যাংক", "Bank")}:</strong> {settings.payment_bank || lb("অ্যাকাউন্ট নং সেট করুন", "Set account number")}</p>
              </div>
            </Card>

            {/* QR Code */}
            <div className="flex justify-center mb-10">
              <QRCodeGenerator
                defaultUrl={`${window.location.origin}/donations`}
                title={lb("ডোনেশন QR কোড", "Donation QR Code")}
              />
            </div>

            {/* Recurring donation link */}
            <div className="text-center mb-10">
              <Link to="/recurring-donation">
                <Button variant="outline" className="gap-2" size="lg">
                  <RefreshCw className="h-5 w-5" /> {lb("মাসিক/বার্ষিক সাবস্ক্রিপশন দান", "Monthly/Yearly Subscription Donation")}
                </Button>
              </Link>
            </div>

            {campaigns.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-xl font-bold font-heading mb-4 text-center">{lb("চলমান ক্যাম্পেইন", "Active Campaigns")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaigns.map((c) => (
                    <Card key={c.id} className="p-5">
                      <h3 className="font-bold font-heading mb-1">{c.title}</h3>
                      {c.description && <p className="text-sm text-muted-foreground mb-2">{c.description}</p>}
                      {c.goal_amount && (
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span>{lb("লক্ষ্য", "Goal")}: ৳{c.goal_amount.toLocaleString(lang === "bn" ? "bn-BD" : "en-US")}</span>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DonationsPage;
