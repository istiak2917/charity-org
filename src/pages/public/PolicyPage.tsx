import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PolicyPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      let { data } = await supabase.from("pages").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
      if (!data) {
        const r = await supabase.from("pages").select("*").eq("id", slug).maybeSingle();
        data = r.data;
      }
      if (data) setPage(data); else setNotFound(true);
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
        <p className="text-muted-foreground mb-4">পেজ পাওয়া যায়নি</p>
        <Link to="/"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> হোম</Button></Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {page.meta_title && (
        <title>{page.meta_title}</title>
      )}
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold font-heading mb-6">{page.title}</h1>
        <div className="prose prose-sm max-w-none text-foreground/90" dangerouslySetInnerHTML={{ __html: page.content || "" }} />
        {page.updated_at && (
          <div className="text-xs text-muted-foreground mt-8 border-t border-border pt-4">
            সর্বশেষ আপডেট: {new Date(page.updated_at).toLocaleDateString("bn-BD")}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PolicyPage;
