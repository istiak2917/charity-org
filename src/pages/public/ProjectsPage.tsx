import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("projects").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setProjects(data || []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">প্রকল্পসমূহ</h1>
          <p className="text-muted-foreground">আমাদের চলমান ও সম্পন্ন প্রকল্প</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {projects.map((p) => {
              const progress = p.budget ? Math.min(100, Math.round(((p.raised || 0) / p.budget) * 100)) : 0;
              return (
                <Link key={p.id} to={`/projects/${p.slug || p.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    {p.image_url && <img src={p.image_url} alt={p.title} className="w-full h-48 object-cover" loading="lazy" />}
                    <div className="p-5">
                      <Badge variant={p.status === "active" ? "default" : "secondary"} className="mb-2">{p.status || "active"}</Badge>
                      <h3 className="font-bold font-heading text-lg mb-2">{p.title}</h3>
                      {p.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.description}</p>}
                      {p.budget > 0 && (
                        <div>
                          <Progress value={progress} className="h-2 mb-1" />
                          <div className="text-xs text-muted-foreground">{progress}% অর্জিত</div>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
            {projects.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12">কোনো প্রকল্প নেই</div>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProjectsPage;
