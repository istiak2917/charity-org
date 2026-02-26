import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEOHead";
import SocialShare from "@/components/SocialShare";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const ProjectDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      let { data } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();
      if (!data) {
        const r = await supabase.from("projects").select("*").eq("id", slug).maybeSingle();
        data = r.data;
      }
      if (data) setProject(data); else setNotFound(true);
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
        <p className="text-muted-foreground mb-4">{lang === "bn" ? "প্রকল্প পাওয়া যায়নি" : "Project not found"}</p>
        <Link to="/projects"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> {lang === "bn" ? "সব প্রকল্প" : "All Projects"}</Button></Link>
      </div>
      <Footer />
    </div>
  );

  const title = (lang === "en" && project.title_en) ? project.title_en : project.title;
  const desc = (lang === "en" && project.description_en) ? project.description_en : (project.description || project.content);
  const progress = project.budget ? Math.min(100, Math.round(((project.raised || 0) / project.budget) * 100)) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SEOHead title={title} description={desc?.slice(0, 160)} image={project.image_url} />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> {lang === "bn" ? "সব প্রকল্প" : "All Projects"}
        </Link>
        {project.image_url && <img src={project.image_url} alt={title} className="w-full rounded-xl mb-6 max-h-96 object-cover" />}
        <Badge variant={project.status === "active" ? "default" : "secondary"} className="mb-3">{project.status}</Badge>
        <h1 className="text-3xl font-bold font-heading mb-4">{title}</h1>
        <div className="flex justify-end mb-4">
          <SocialShare title={title} description={desc?.slice(0, 100)} />
        </div>
        {project.budget > 0 && (
          <div className="mb-6">
            <Progress value={progress} className="h-3 mb-2" />
            <div className="text-sm text-muted-foreground">
              {lang === "bn" ? `বাজেট: ৳${project.budget?.toLocaleString("bn-BD")} | অর্জিত: ${progress}%` : `Budget: ৳${project.budget?.toLocaleString()} | Raised: ${progress}%`}
            </div>
          </div>
        )}
        <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">{desc}</div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetailPage;
