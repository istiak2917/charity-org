import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Target, Eye, Heart } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";

const AboutSection = () => {
  const [org, setOrg] = useState<any>(null);
  const { t, lang } = useLanguage();

  useEffect(() => {
    supabase.from("organizations").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data) setOrg(data);
    });
  }, []);

  const items = [
    { icon: Heart, title: t("about_goal"), desc: lang === "bn" ? (org?.description || t("about_goal_desc")) : t("about_goal_desc") },
    { icon: Target, title: t("about_mission"), desc: lang === "bn" ? (org?.mission || t("about_mission_desc")) : t("about_mission_desc") },
    { icon: Eye, title: t("about_vision"), desc: lang === "bn" ? (org?.vision || t("about_vision_desc")) : t("about_vision_desc") },
  ];

  return (
    <section id="about" className="py-20 bg-card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent/5 translate-y-1/2 -translate-x-1/2" />
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">{t("about_identity")}</span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mt-2 mb-4">{t("about_title")}</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              {lang === "bn" ? (org?.description || t("about_default_desc")) : t("about_default_desc")}
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 150}>
              <div className="group bg-background rounded-2xl p-8 text-center border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary mb-5 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
