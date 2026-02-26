import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, RefreshCw, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PLANS = [
  { id: "monthly_500", amount: 500, frequency: "monthly", label_bn: "মাসিক ৳৫০০", label_en: "Monthly ৳500" },
  { id: "monthly_1000", amount: 1000, frequency: "monthly", label_bn: "মাসিক ৳১,০০০", label_en: "Monthly ৳1,000" },
  { id: "monthly_2500", amount: 2500, frequency: "monthly", label_bn: "মাসিক ৳২,৫০০", label_en: "Monthly ৳2,500" },
  { id: "monthly_5000", amount: 5000, frequency: "monthly", label_bn: "মাসিক ৳৫,০০০", label_en: "Monthly ৳5,000" },
  { id: "yearly_5000", amount: 5000, frequency: "yearly", label_bn: "বার্ষিক ৳৫,০০০", label_en: "Yearly ৳5,000" },
  { id: "yearly_12000", amount: 12000, frequency: "yearly", label_bn: "বার্ষিক ৳১২,০০০", label_en: "Yearly ৳12,000" },
];

const RecurringDonationPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<"monthly" | "yearly">("monthly");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("site_settings").select("*").then(({ data }) => {
      if (!data) return;
      const map: Record<string, string> = {};
      data.forEach((s: any) => {
        const k = s.setting_key || s.key || "";
        const v = s.setting_value || s.value || "";
        if (k) map[k] = typeof v === "string" ? v.replace(/^"|"$/g, "") : "";
      });
      setSettings(map);
    });
  }, []);

  const handleSubmit = async () => {
    const amount = selectedPlan ? PLANS.find(p => p.id === selectedPlan)?.amount : Number(customAmount);
    if (!amount || !form.name) {
      toast({ title: "নাম ও পরিমাণ দিন", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    // Create donation record
    const { data: donation } = await supabase.from("donations").insert({
      donor_name: form.name,
      donor_email: form.email,
      amount,
      method: "recurring",
      status: "pending",
      source: "subscription",
      metadata: { frequency, plan_id: selectedPlan || "custom", phone: form.phone },
    }).select().single();

    // If payment gateway configured, redirect
    const gatewayUrl = settings.payment_gateway_url;
    const gatewayKey = settings.payment_gateway_key;

    if (gatewayUrl && gatewayKey) {
      try {
        const res = await fetch(gatewayUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${gatewayKey}` },
          body: JSON.stringify({
            amount,
            name: form.name,
            email: form.email,
            phone: form.phone,
            donation_id: donation?.id,
            type: "recurring",
            frequency,
            redirect_url: `${window.location.origin}/donations?status=success`,
            cancel_url: `${window.location.origin}/donations?status=cancel`,
          }),
        });
        const data = await res.json();
        if (data.payment_url) {
          window.location.href = data.payment_url;
          return;
        }
      } catch { /* fallback to manual */ }
    }

    setSuccess(true);
    setSubmitting(false);
    toast({ title: "সাবস্ক্রিপশন রিকোয়েস্ট জমা হয়েছে! ✅" });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <SEOHead title="সাবস্ক্রিপশন সফল" />
        <main className="container mx-auto px-4 py-20 text-center max-w-lg">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-heading mb-3">ধন্যবাদ!</h1>
          <p className="text-muted-foreground mb-6">আপনার সাবস্ক্রিপশন ভিত্তিক দানের অনুরোধ সফলভাবে জমা হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।</p>
          <Button onClick={() => setSuccess(false)} variant="outline">আরেকটি সাবস্ক্রিপশন করুন</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SEOHead title="মাসিক/বার্ষিক দান" description="নিয়মিত দানের মাধ্যমে শিশুদের জীবন পরিবর্তন করুন" />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10">
          <RefreshCw className="h-12 w-12 text-primary mx-auto mb-3" />
          <h1 className="text-3xl font-bold font-heading mb-3">সাবস্ক্রিপশন ভিত্তিক দান</h1>
          <p className="text-muted-foreground">মাসিক বা বার্ষিক নিয়মিত দানে শিশুদের ভবিষ্যৎ গড়ুন</p>
        </div>

        {/* Frequency Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          <Button variant={frequency === "monthly" ? "default" : "outline"} onClick={() => { setFrequency("monthly"); setSelectedPlan(""); }}>মাসিক</Button>
          <Button variant={frequency === "yearly" ? "default" : "outline"} onClick={() => { setFrequency("yearly"); setSelectedPlan(""); }}>বার্ষিক</Button>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {PLANS.filter(p => p.frequency === frequency).map(plan => (
            <Card
              key={plan.id}
              className={`p-5 text-center cursor-pointer transition-all hover:shadow-md ${selectedPlan === plan.id ? "ring-2 ring-primary bg-primary/5" : ""}`}
              onClick={() => { setSelectedPlan(plan.id); setCustomAmount(""); }}
            >
              <div className="text-2xl font-bold text-primary mb-1">৳{plan.amount.toLocaleString("bn-BD")}</div>
              <div className="text-xs text-muted-foreground">{plan.frequency === "monthly" ? "প্রতি মাসে" : "প্রতি বছরে"}</div>
              {selectedPlan === plan.id && <Badge className="mt-2">নির্বাচিত</Badge>}
            </Card>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="mb-8">
          <label className="text-sm font-medium mb-2 block">অথবা কাস্টম পরিমাণ লিখুন</label>
          <Input
            type="number"
            placeholder="৳ পরিমাণ"
            value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); setSelectedPlan(""); }}
          />
        </div>

        {/* Donor Info */}
        <Card className="p-6 space-y-4 mb-6">
          <h3 className="font-semibold">আপনার তথ্য</h3>
          <Input placeholder="আপনার নাম *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="ইমেইল" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="ফোন নম্বর" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </Card>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2 py-6 text-lg" size="lg">
          <Heart className="h-5 w-5" /> {submitting ? "প্রসেসিং..." : "সাবস্ক্রাইব করুন"}
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default RecurringDonationPage;
