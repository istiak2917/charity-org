import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const EventDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      // Try slug first, then id
      let { data } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();
      if (!data) {
        const r = await supabase.from("events").select("*").eq("id", slug).maybeSingle();
        data = r.data;
      }
      if (data) setEvent(data); else setNotFound(true);
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (notFound) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-muted-foreground mb-4">ইভেন্ট পাওয়া যায়নি</p>
        <Link to="/events"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> সব ইভেন্ট</Button></Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link to="/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> সব ইভেন্ট
        </Link>
        {event.image_url && <img src={event.image_url} alt={event.title} className="w-full rounded-xl mb-6 max-h-96 object-cover" />}
        <Badge variant="secondary" className="mb-3">{event.status || "upcoming"}</Badge>
        <h1 className="text-3xl font-bold font-heading mb-4">{event.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
          {event.event_date && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(event.event_date).toLocaleDateString("bn-BD")}</span>}
          {event.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {event.location}</span>}
        </div>
        <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">{event.description || event.content}</div>
      </main>
      <Footer />
    </div>
  );
};

export default EventDetailPage;
