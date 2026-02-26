import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";

const presets = [100, 500, 1000, 5000];

const DonationSection = () => {
  const { t } = useLanguage();
  const [payment, setPayment] = useState({ bkash: "", nagad: "", bank: "" });

  useEffect(() => {
    supabase.from("site_settings").select("*").then(({ data }) => {
      if (data) {
        data.forEach((s: any) => {
          const k = s.key || s.setting_key || s.name || "";
          const raw = s.value || s.setting_value || "";
          const val = typeof raw === "string" ? raw.replace(/^"|"$/g, "") : JSON.stringify(raw).replace(/^"|"$/g, "");
          if (k === "payment_bkash") setPayment(p => ({ ...p, bkash: val }));
          if (k === "payment_nagad") setPayment(p => ({ ...p, nagad: val }));
          if (k === "payment_bank") setPayment(p => ({ ...p, bank: val }));
        });
      }
    });
  }, []);

  return (
    <section id="donate" className="py-20 bg-card relative overflow-hidden">
      <div className="absolute top-10 right-20 w-20 h-20 rounded-full bg-primary/8 floating-shape" />
      <div className="absolute bottom-20 left-10 w-16 h-16 rounded-full bg-warm-gold/10 floating-shape-reverse" />
      <div className="absolute top-1/2 right-5 w-12 h-12 rounded-full bg-accent/8 floating-shape" />
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-18 h-18 rounded-full bg-gradient-to-br from-primary/15 to-accent/15 text-primary mb-5">
              <Heart className="h-10 w-10 donation-pulse" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-3">{t("donation_title")}</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-4" />
            <p className="text-muted-foreground mb-8">{t("donation_subtitle")}</p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {presets.map((amt, i) => (
                <button key={amt} className="btn-press rounded-2xl border-2 border-primary/20 bg-background py-4 text-lg font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/15 hover:-translate-y-0.5" style={{ animationDelay: `${i * 80}ms` }}>
                  ৳{amt}
                </button>
              ))}
            </div>
            <div className="bg-background rounded-2xl p-6 border border-border/50 text-left space-y-3 mb-6 hover:shadow-md transition-shadow duration-300">
              <h4 className="font-bold font-heading">{t("donation_payment_info")}</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>{t("donation_bkash")}:</strong> {payment.bkash || t("donation_bkash_default")}</p>
                <p><strong>{t("donation_nagad")}:</strong> {payment.nagad || t("donation_nagad_default")}</p>
                <p><strong>{t("donation_bank")}:</strong> {payment.bank || t("donation_bank_default")}</p>
              </div>
            </div>
            <div className="text-center">
              <Button className="btn-press gap-2 text-base px-8 py-5 bg-gradient-to-r from-primary to-accent shadow-lg hero-btn-glow" size="lg">
                <Heart className="h-5 w-5" /> {t("donation_learn_more")}
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DonationSection;
