import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";

interface TeamMember { id: string; name: string; role: string; image_url: string; bio: string; }

const TeamSection = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    supabase.from("team_members").select("*").order("created_at", { ascending: true }).then(({ data }) => {
      if (data) setMembers(data);
    });
  }, []);

  return (
    <section className="py-20 bg-card relative overflow-hidden">
      <div className="absolute top-0 left-1/2 w-[500px] h-[500px] rounded-full bg-primary/3 -translate-x-1/2 -translate-y-1/2" />
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">{t("team_our_people")}</span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2 mb-4">{t("team_title")}</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4">{t("team_subtitle")}</p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {members.map((m, i) => (
            <ScrollReveal key={m.id} delay={i * 100}>
              <div className="text-center group">
                <div className="relative mx-auto w-28 h-28 md:w-32 md:h-32 mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/40 group-hover:to-accent/40 transition-all duration-300 scale-100 group-hover:scale-110" />
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.name} className="absolute inset-1 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <div className="absolute inset-1 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl md:text-4xl text-primary font-bold font-heading group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground transition-all duration-500">
                      {m.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h4 className="font-bold font-heading text-foreground">{m.name}</h4>
                <p className="text-sm text-primary">{m.role}</p>
                {m.bio && <p className="text-xs text-muted-foreground mt-1">{m.bio}</p>}
              </div>
            </ScrollReveal>
          ))}
        </div>
        {members.length === 0 && <div className="text-center text-muted-foreground py-8">{t("team_no_data")}</div>}
      </div>
    </section>
  );
};

export default TeamSection;
