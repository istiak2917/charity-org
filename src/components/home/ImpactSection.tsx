import { useEffect, useState } from "react";
import { Users, Heart, BookOpen, Award } from "lucide-react";
import CountUp from "@/components/CountUp";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";

const ImpactSection = () => {
  const { t } = useLanguage();
  const [values, setValues] = useState({ beneficiaries: 1250, projects: 85, volunteers: 320, experience: 15 });
  const [labels, setLabels] = useState({ l1: "", l2: "", l3: "", l4: "" });

  useEffect(() => {
    supabase.from("site_settings").select("*").then(({ data }) => {
      if (data) {
        data.forEach((s: any) => {
          const k = s.setting_key || s.key || s.name || "";
          const raw = s.setting_value || s.value || "";
          const val = typeof raw === "string" ? raw.replace(/^"|"$/g, "") : String(raw);
          const num = parseInt(val, 10);
          if (k === "impact_beneficiaries_count" && !isNaN(num)) setValues(p => ({ ...p, beneficiaries: num }));
          if (k === "impact_projects_count" && !isNaN(num)) setValues(p => ({ ...p, projects: num }));
          if (k === "impact_volunteers_count" && !isNaN(num)) setValues(p => ({ ...p, volunteers: num }));
          if (k === "impact_experience_years" && !isNaN(num)) setValues(p => ({ ...p, experience: num }));
          if (k === "impact_label_1") setLabels(p => ({ ...p, l1: val }));
          if (k === "impact_label_2") setLabels(p => ({ ...p, l2: val }));
          if (k === "impact_label_3") setLabels(p => ({ ...p, l3: val }));
          if (k === "impact_label_4") setLabels(p => ({ ...p, l4: val }));
        });
      }
    });
  }, []);

  const counters = [
    { icon: Users, target: values.beneficiaries, label: labels.l1 || t("impact_beneficiaries"), suffix: "+" },
    { icon: Heart, target: values.projects, label: labels.l2 || t("impact_projects"), suffix: "+" },
    { icon: BookOpen, target: values.volunteers, label: labels.l3 || t("impact_volunteers"), suffix: "+" },
    { icon: Award, target: values.experience, label: labels.l4 || t("impact_experience"), suffix: "+" },
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground">
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary-foreground/5 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-primary-foreground/5 translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">{t("impact_title")}</h2>
            <div className="w-16 h-1 bg-primary-foreground/30 mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {counters.map((c, i) => (
            <ScrollReveal key={c.label} delay={i * 100}>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/10 mb-4 group-hover:scale-110 group-hover:bg-primary-foreground/20 transition-all duration-300">
                  <c.icon className="h-8 w-8" />
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  <CountUp target={c.target} suffix={c.suffix} />
                </div>
                <div className="text-sm opacity-80">{c.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
