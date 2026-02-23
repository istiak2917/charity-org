import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Calendar, MapPin } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

interface Event { id: string; title: string; description: string; location: string; event_date: string; }

const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    supabase.from("events").select("*").order("event_date", { ascending: true }).limit(4).then(({ data }) => {
      if (data) setEvents(data);
    });
  }, []);

  return (
    <section id="events" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">আসন্ন কার্যক্রম</span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2 mb-4">আসন্ন ইভেন্ট</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          </div>
        </ScrollReveal>
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-accent/40 to-primary/10 md:-translate-x-px" />
          {events.map((e, i) => (
            <ScrollReveal key={e.id} delay={i * 150}>
              <div className={`relative flex flex-col md:flex-row items-start md:items-center gap-4 mb-10 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/30 -translate-x-1/2 mt-6 md:mt-0 z-10" />
                <div className={`ml-10 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                  <div className="group bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                    <div className={`flex items-center gap-2 text-sm text-primary mb-3 ${i % 2 === 0 ? "md:justify-end" : ""}`}>
                      <Calendar className="h-4 w-4" /> {e.event_date ? new Date(e.event_date).toLocaleDateString("bn-BD") : "তারিখ নির্ধারিত হয়নি"}
                    </div>
                    <h3 className="text-lg font-bold font-heading mb-2">{e.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{e.description}</p>
                    {e.location && (
                      <div className={`flex items-center gap-1 text-xs text-muted-foreground ${i % 2 === 0 ? "md:justify-end" : ""}`}>
                        <MapPin className="h-3 w-3" /> {e.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        {events.length === 0 && <div className="text-center text-muted-foreground py-8">কোনো ইভেন্ট নেই</div>}
      </div>
    </section>
  );
};

export default EventsSection;
