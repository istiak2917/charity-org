import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TrendingUp, PieChart, BarChart3 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import CountUp from "@/components/CountUp";

const TransparencySection = () => {
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categories, setCategories] = useState<{ label: string; pct: number }[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [donRes, expRes] = await Promise.all([
        supabase.from("donations").select("amount"),
        supabase.from("expenses").select("amount, category"),
      ]);
      const donTotal = (donRes.data || []).reduce((s, d) => s + (d.amount || 0), 0);
      setTotalDonations(donTotal);

      const expenses = expRes.data || [];
      const expTotal = expenses.reduce((s, e) => s + (e.amount || 0), 0);
      setTotalExpenses(expTotal);

      // Group expenses by category
      const catMap: Record<string, number> = {};
      expenses.forEach((e) => {
        const cat = e.category || "অন্যান্য";
        catMap[cat] = (catMap[cat] || 0) + (e.amount || 0);
      });
      const cats = Object.entries(catMap).map(([label, amount]) => ({
        label,
        pct: expTotal > 0 ? Math.round((amount / expTotal) * 100) : 0,
      })).sort((a, b) => b.pct - a.pct).slice(0, 4);
      setCategories(cats);
    };
    fetch();
  }, []);

  const efficiency = totalDonations > 0 ? Math.round(((totalDonations - totalExpenses) / totalDonations) * 100) : 0;

  return (
    <section className="py-20 bg-card relative overflow-hidden">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">আর্থিক প্রতিবেদন</span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2 mb-4">স্বচ্ছতা প্রতিবেদন</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4">আমাদের তহবিলের ব্যবহার সম্পূর্ণ স্বচ্ছ</p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollReveal delay={0}>
            <div className="bg-background rounded-2xl p-8 border border-border/50 text-center hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-4">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <h4 className="font-bold font-heading mb-2">মোট সংগৃহীত</h4>
              <p className="text-3xl font-bold text-primary">৳<CountUp target={totalDonations} /></p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="bg-background rounded-2xl p-8 border border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-4 mx-auto">
                <PieChart className="h-7 w-7 text-primary" />
              </div>
              <h4 className="font-bold font-heading text-center mb-5">তহবিল ব্যবহার</h4>
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
                  <p className="text-sm text-muted-foreground text-center">ডেটা নেই</p>
                )}
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="bg-background rounded-2xl p-8 border border-border/50 text-center hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-soft-green/10 to-primary/10 mb-4">
                <BarChart3 className="h-7 w-7 text-soft-green" />
              </div>
              <h4 className="font-bold font-heading mb-2">মোট ব্যয়</h4>
              <p className="text-3xl font-bold text-soft-green">৳<CountUp target={totalExpenses} /></p>
              <p className="text-sm text-muted-foreground mt-2">সংগৃহীত তহবিলের সুশৃঙ্খল ব্যবহার</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default TransparencySection;
