import { TrendingUp, PieChart, BarChart3 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import CountUp from "@/components/CountUp";

const TransparencySection = () => {
  const fundItems = [
    { label: "শিক্ষা", pct: 40 },
    { label: "পুষ্টি", pct: 30 },
    { label: "স্বাস্থ্য", pct: 20 },
    { label: "প্রশাসন", pct: 10 },
  ];

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
              <p className="text-3xl font-bold text-primary">৳<CountUp target={147000} /></p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="bg-background rounded-2xl p-8 border border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-4 mx-auto">
                <PieChart className="h-7 w-7 text-primary" />
              </div>
              <h4 className="font-bold font-heading text-center mb-5">তহবিল ব্যবহার</h4>
              <div className="space-y-4">
                {fundItems.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground">{item.pct}%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full animated-progress"
                        style={{ "--target-width": `${item.pct}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="bg-background rounded-2xl p-8 border border-border/50 text-center hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-soft-green/10 to-primary/10 mb-4">
                <BarChart3 className="h-7 w-7 text-soft-green" />
              </div>
              <h4 className="font-bold font-heading mb-2">ব্যয় দক্ষতা</h4>
              <p className="text-4xl font-bold text-soft-green"><CountUp target={90} suffix="%" /></p>
              <p className="text-sm text-muted-foreground mt-2">সংগৃহীত তহবিলের ৯০% সরাসরি শিশুদের কল্যাণে ব্যয় হয়</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default TransparencySection;
