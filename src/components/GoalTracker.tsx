import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ScrollReveal from "@/components/ScrollReveal";

interface GoalItem {
  id: string;
  title: string;
  target_amount?: number;
  current_amount?: number;
  goal_amount?: number;
  budget?: number;
  spent?: number;
}

const GoalTracker = () => {
  const [campaigns, setCampaigns] = useState<GoalItem[]>([]);
  const [projects, setProjects] = useState<GoalItem[]>([]);
  const { lang } = useLanguage();
  const lb = (bn: string, en: string) => lang === "bn" ? bn : en;

  useEffect(() => {
    Promise.all([
      supabase.from("donation_campaigns").select("id,title,target_amount,current_amount,goal_amount").eq("is_active", true),
      supabase.from("projects").select("id,title,budget,spent").eq("status", "active"),
    ]).then(([campRes, projRes]) => {
      setCampaigns(campRes.data || []);
      setProjects(projRes.data || []);
    });
  }, []);

  const items = [
    ...campaigns.map(c => ({
      id: c.id,
      title: c.title,
      current: c.current_amount || 0,
      target: c.target_amount || c.goal_amount || 0,
      type: "campaign" as const,
    })),
    ...projects.filter(p => p.budget && p.budget > 0).map(p => ({
      id: p.id,
      title: p.title,
      current: p.spent || 0,
      target: p.budget || 0,
      type: "project" as const,
    })),
  ];

  if (items.length === 0) return null;

  return (
    <section id="goals" className="py-16">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-10">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">
              {lb("লক্ষ্য ও অগ্রগতি", "Goals & Progress")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2 mb-4">
              {lb("আমাদের লক্ষ্য", "Our Goals")}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {items.map((item, i) => {
            const pct = item.target > 0 ? Math.min(100, Math.round((item.current / item.target) * 100)) : 0;
            return (
              <ScrollReveal key={item.id} delay={i * 100}>
                <Card className="p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      <h3 className="font-bold font-heading text-sm">{item.title}</h3>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      {item.type === "campaign" ? lb("ক্যাম্পেইন", "Campaign") : lb("প্রকল্প", "Project")}
                    </span>
                  </div>
                  <Progress value={pct} className="h-3 mb-3" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ৳{item.current.toLocaleString(lang === "bn" ? "bn-BD" : "en-US")}
                    </span>
                    <span className="font-medium flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> {pct}%
                    </span>
                    <span className="text-muted-foreground">
                      {lb("লক্ষ্য", "Goal")}: ৳{item.target.toLocaleString(lang === "bn" ? "bn-BD" : "en-US")}
                    </span>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GoalTracker;
