import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface Event {
  id: string; title: string; description: string; location: string;
  event_date: string; image_url?: string; slug?: string; status?: string;
}

const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const { t, lang } = useLanguage();

  useEffect(() => {
    supabase.from("events").select("*").order("event_date", { ascending: true }).limit(4).then(({ data }) => {
      if (data) setEvents(data);
    });
  }, []);

  const dateLocale = lang === "bn" ? "bn-BD" : "en-US";

  return (
    <section id="events" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">{t("events_upcoming")}</span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2 mb-4">{t("events_title")}</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {events.map((e, i) => (
            <ScrollReveal key={e.id} delay={i * 120}>
              <Link to={`/events/${e.slug || e.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full group">
                  {e.image_url ? (
                    <div className="relative h-52 overflow-hidden">
                      <img src={e.image_url} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {e.event_date && (
                        <Badge className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(e.event_date).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" })}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="absolute top-3 right-3 backdrop-blur-sm">
                        {e.status === "completed" ? t("events_completed") : t("events_upcoming_badge")}
                      </Badge>
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <Calendar className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold font-heading text-lg mb-2 group-hover:text-primary transition-colors">{e.title}</h3>
                    {e.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{e.description}</p>}
                    <div className="flex items-center justify-between">
                      {e.location && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary/70" />
                          <span>{e.location}</span>
                        </div>
                      )}
                      <span className="text-xs text-primary font-medium flex items-center gap-1">
                        {t("events_details")} <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {events.length === 0 && <div className="text-center text-muted-foreground py-8">{t("events_no_data")}</div>}
        {events.length > 0 && (
          <div className="text-center mt-10">
            <Link to="/events">
              <Button variant="outline" className="gap-2">
                {t("events_view_all")} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
