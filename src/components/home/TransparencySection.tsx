import { TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const TransparencySection = () => {
  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading mb-3">স্বচ্ছতা প্রতিবেদন</h2>
          <p className="text-muted-foreground">আমাদের তহবিলের ব্যবহার সম্পূর্ণ স্বচ্ছ</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background rounded-xl p-6 border border-border text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="font-bold font-heading mb-2">মোট সংগৃহীত</h4>
            <p className="text-3xl font-bold text-primary">৳১,৪৭,০০০</p>
          </div>
          <div className="bg-background rounded-xl p-6 border border-border">
            <PieChart className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="font-bold font-heading text-center mb-4">তহবিল ব্যবহার</h4>
            <div className="space-y-3">
              {[
                { label: "শিক্ষা", pct: 40 },
                { label: "পুষ্টি", pct: 30 },
                { label: "স্বাস্থ্য", pct: 20 },
                { label: "প্রশাসন", pct: 10 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.pct}%</span>
                  </div>
                  <Progress value={item.pct} className="h-2" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-background rounded-xl p-6 border border-border text-center">
            <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="font-bold font-heading mb-2">ব্যয় দক্ষতা</h4>
            <p className="text-3xl font-bold text-soft-green">৯০%</p>
            <p className="text-sm text-muted-foreground mt-1">সংগৃহীত তহবিলের ৯০% সরাসরি শিশুদের কল্যাণে ব্যয় হয়</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransparencySection;
