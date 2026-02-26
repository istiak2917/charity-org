import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEOHead";
import SocialShare from "@/components/SocialShare";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const EventDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
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
        <p className="text-muted-foreground mb-4">{lang === "bn" ? "ইভেন্ট পাওয়া যায়নি" : "Event not found"}</p>
        <Link to="/events"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> {lang === "bn" ? "সব ইভেন্ট" : "All Events"}</Button></Link>
      </div>
      <Footer />
    </div>
  );

  const title = (lang === "en" && event.title_en) ? event.title_en : event.title;
  const desc = (lang === "en" && event.description_en) ? event.description_en : (event.description || event.content);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SEOHead title={title} description={desc?.slice(0, 160)} image={event.image_url} type="event" />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link to="/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> {lang === "bn" ? "সব ইভেন্ট" : "All Events"}
        </Link>
        {event.image_url && <img src={event.image_url} alt={title} className="w-full rounded-xl mb-6 max-h-96 object-cover" />}
        <Badge variant="secondary" className="mb-3">{event.status || "upcoming"}</Badge>
        <h1 className="text-3xl font-bold font-heading mb-4">{title}</h1>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {event.event_date && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(event.event_date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}</span>}
            {event.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {event.location}</span>}
          </div>
          <SocialShare title={title} description={desc?.slice(0, 100)} />
        </div>
        <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">{desc}</div>
      </main>
      <Footer />
    </div>
  );
};

export default EventDetailPage;
