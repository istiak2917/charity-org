import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";

const EventsPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("events").select("*").order("event_date", { ascending: false })
      .then(({ data }) => { setEvents(data || []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">ইভেন্টসমূহ</h1>
          <p className="text-muted-foreground">আমাদের আসন্ন ও সম্পন্ন সকল ইভেন্ট</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {events.map((e) => (
              <Link key={e.id} to={`/events/${e.slug || e.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  {e.image_url && <img src={e.image_url} alt={e.title} className="w-full h-48 object-cover" loading="lazy" />}
                  <div className="p-5">
                    <Badge variant="secondary" className="mb-2">{e.status || "upcoming"}</Badge>
                    <h3 className="font-bold font-heading text-lg mb-2">{e.title}</h3>
                    {e.event_date && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3" /> {new Date(e.event_date).toLocaleDateString("bn-BD")}
                      </div>
                    )}
                    {e.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {e.location}
                      </div>
                    )}
                    {e.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{e.description}</p>}
                  </div>
                </Card>
              </Link>
            ))}
            {events.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12">কোনো ইভেন্ট নেই</div>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EventsPage;
