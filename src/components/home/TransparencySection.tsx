import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TrendingUp, PieChart, BarChart3 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import CountUp from "@/components/CountUp";
import { useLanguage } from "@/contexts/LanguageContext";

const TransparencySection = () => {
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categories, setCategories] = useState<{ label: string; pct: number }[]>([]);
  const [visibility, setVisibility] = useState({ donations: true, fund_usage: true, expenses: true });
  const [customTitle, setCustomTitle] = useState("");
  const [customSubtitle, setCustomSubtitle] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      const [donRes, expRes, settingsRes] = await Promise.all([
        supabase.from("donations").select("amount"),
        supabase.from("expenses").select("amount, category"),
        supabase.from("site_settings").select("*"),
      ]);

      // Parse visibility settings
      if (settingsRes.data) {
        settingsRes.data.forEach((s: any) => {
          const k = s.setting_key || s.key || "";
          const raw = s.setting_value || s.value || "";
          const val = typeof raw === "string" ? raw.replace(/^"|"$/g, "") : String(raw);
          if (k === "transparency_show_donations") setVisibility(p => ({ ...p, donations: val !== "false" }));
          if (k === "transparency_show_fund_usage") setVisibility(p => ({ ...p, fund_usage: val !== "false" }));
          if (k === "transparency_show_expenses") setVisibility(p => ({ ...p, expenses: val !== "false" }));
          if (k === "transparency_custom_title" && val) setCustomTitle(val);
          if (k === "transparency_custom_subtitle" && val) setCustomSubtitle(val);
        });
      }

      const donTotal = (donRes.data || []).reduce((s, d) => s + (d.amount || 0), 0);
      setTotalDonations(donTotal);

      const expenses = expRes.data || [];
      const expTotal = expenses.reduce((s, e) => s + (e.amount || 0), 0);
      setTotalExpenses(expTotal);

      const catMap: Record<string, number> = {};
      expenses.forEach((e) => {
        const cat = e.category || t("transparency_other");
        catMap[cat] = (catMap[cat] || 0) + (e.amount || 0);
      });
      const cats = Object.entries(catMap).map(([label, amount]) => ({
        label, pct: expTotal > 0 ? Math.round((amount / expTotal) * 100) : 0,
      })).sort((a, b) => b.pct - a.pct).slice(0, 4);
      setCategories(cats);
    };
    fetchData();
  }, []);

  const visibleCards = [
    visibility.donations ? "donations" : null,
    visibility.fund_usage ? "fund_usage" : null,
    visibility.expenses ? "expenses" : null,
  ].filter(Boolean);

  if (visibleCards.length === 0) return null;

  return (
    <section className="py-20 bg-card relative overflow-hidden">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">{t("transparency_label")}</span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2 mb-4">{customTitle || t("transparency_title")}</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4">{customSubtitle || t("transparency_subtitle")}</p>
          </div>
        </ScrollReveal>
        <div className={`grid grid-cols-1 ${visibleCards.length === 1 ? "md:grid-cols-1 max-w-md mx-auto" : visibleCards.length === 2 ? "md:grid-cols-2 max-w-2xl mx-auto" : "md:grid-cols-3"} gap-6`}>
          {visibility.donations && (
            <ScrollReveal delay={0}>
              <div className="bg-background rounded-2xl p-8 border border-border/50 text-center hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-4">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h4 className="font-bold font-heading mb-2">{t("transparency_collected")}</h4>
                <p className="text-3xl font-bold text-primary">৳<CountUp target={totalDonations} /></p>
              </div>
            </ScrollReveal>
          )}
          {visibility.fund_usage && (
            <ScrollReveal delay={100}>
              <div className="bg-background rounded-2xl p-8 border border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-4 mx-auto">
                  <PieChart className="h-7 w-7 text-primary" />
                </div>
                <h4 className="font-bold font-heading text-center mb-5">{t("transparency_fund_usage")}</h4>
                <div className="space-y-4">
                  {categories.length > 0 ? categories.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">{item.pct}%</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full animated-progress" style={{ "--target-width": `${item.pct}%` } as React.CSSProperties} />
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center">{t("transparency_no_data")}</p>
                  )}
                </div>
              </div>
            </ScrollReveal>
          )}
          {visibility.expenses && (
            <ScrollReveal delay={200}>
              <div className="bg-background rounded-2xl p-8 border border-border/50 text-center hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-soft-green/10 to-primary/10 mb-4">
                  <BarChart3 className="h-7 w-7 text-soft-green" />
                </div>
                <h4 className="font-bold font-heading mb-2">{t("transparency_total_expense")}</h4>
                <p className="text-3xl font-bold text-soft-green">৳<CountUp target={totalExpenses} /></p>
                <p className="text-sm text-muted-foreground mt-2">{t("transparency_efficient_usage")}</p>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
};

export default TransparencySection;
