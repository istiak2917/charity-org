import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Target, Eye, Heart, Users, Calendar, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";

const AboutPage = () => {
  const { t, lang } = useLanguage();
  const [org, setOrg] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("organizations").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data) setOrg(data);
    });
    supabase.from("team_members").select("*").order("created_at").then(({ data }) => {
      if (data) setTeam(data);
    });
  }, []);

  const cards = [
    { icon: Heart, title: t("about_goal"), desc: lang === "bn" ? (org?.description || t("about_goal_desc")) : t("about_goal_desc"), color: "from-rose-500/10 to-pink-500/10" },
    { icon: Target, title: t("about_mission"), desc: lang === "bn" ? (org?.mission || t("about_mission_desc")) : t("about_mission_desc"), color: "from-primary/10 to-accent/10" },
    { icon: Eye, title: t("about_vision"), desc: lang === "bn" ? (org?.vision || t("about_vision_desc")) : t("about_vision_desc"), color: "from-emerald-500/10 to-teal-500/10" },
  ];

  return (
    <>
      <SEOHead title={`${t("about_us_page_title")} | শিশুফুল`} description={org?.description || t("about_default_desc")} />
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero Banner */}
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent blur-3xl" />
          </div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <ScrollReveal>
              <span className="text-primary text-sm font-medium tracking-wider uppercase">{t("about_identity")}</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground mt-3 mb-6">{t("about_us_page_title")}</h1>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-6" />
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {lang === "bn" ? (org?.description || t("about_default_desc")) : t("about_default_desc")}
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Mission, Vision, Goal */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cards.map((item, i) => (
                <ScrollReveal key={item.title} delay={i * 150}>
                  <div className="group bg-card rounded-2xl p-8 text-center border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 h-full">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} text-primary mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold font-heading mb-3 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        {team.length > 0 && (
          <section className="py-16 md:py-20 bg-card/50">
            <div className="container mx-auto px-4">
              <ScrollReveal>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4">{t("about_our_team")}</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {team.map((m, i) => (
                  <ScrollReveal key={m.id} delay={i * 100}>
                    <div className="text-center group">
                      {m.image_url ? (
                        <img src={m.image_url} alt={m.name} className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-border group-hover:border-primary transition-colors mb-3" />
                      ) : (
                        <div className="w-24 h-24 rounded-full mx-auto bg-muted flex items-center justify-center mb-3">
                          <Users className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      <h4 className="font-semibold text-foreground">{m.name}</h4>
                      {m.role && <p className="text-sm text-muted-foreground">{m.role}</p>}
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default AboutPage;
