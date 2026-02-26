import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import ScrollReveal from "@/components/ScrollReveal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Heart } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  budget: number;
  raised?: number;
  funding_target: number;
  funding_current: number;
  is_urgent: boolean;
  image_url?: string;
  slug?: string;
}

const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    supabase.from("projects").select("*").order("created_at", { ascending: false }).limit(6).then(({ data }) => {
      if (data) setProjects(data);
    });
  }, []);

  const emojis = ["📚", "🍲", "🧥", "💊", "🏠", "🎓"];

  return (
    <section id="projects" className="py-20 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-warm-gold/10 floating-shape" />
      <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-primary/10 floating-shape-reverse" />
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">আমাদের কাজ</span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2 mb-4">আমাদের প্রকল্পসমূহ</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4">বর্তমানে চলমান এবং সম্পন্ন প্রকল্পসমূহ</p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => {
            const target = p.funding_target || p.budget || 0;
            const current = p.funding_current || p.raised || 0;
            const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

            return (
              <ScrollReveal key={p.id} delay={i * 120}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                  {p.image_url ? (
                    <div className="relative h-44 overflow-hidden">
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <Badge className={`absolute top-3 right-3 ${p.status === "completed" ? "bg-green-600/90" : "bg-primary/90"} backdrop-blur-sm`}>
                        {p.status === "completed" ? "সম্পন্ন" : "চলমান"}
                      </Badge>
                      {p.is_urgent && <Badge variant="destructive" className="absolute top-3 left-3">জরুরি</Badge>}
                    </div>
                  ) : (
                    <div className="relative p-6 pb-0">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl">{emojis[i % emojis.length]}</span>
                        <Badge variant={p.status === "completed" ? "secondary" : "default"}>
                          {p.status === "completed" ? "সম্পন্ন" : "চলমান"}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold font-heading mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
                    {p.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.description}</p>}

                    {target > 0 && (
                      <div className="mt-auto space-y-2">
                        <Progress value={progress} className="h-2.5" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>৳{current.toLocaleString("bn-BD")} উঠেছে</span>
                          <span>৳{target.toLocaleString("bn-BD")} লক্ষ্য</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <Link to={`/projects/${p.slug || p.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1">
                          বিস্তারিত <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Link to={`/donations?project=${p.slug || p.id}`}>
                        <Button size="sm" className="gap-1">
                          <Heart className="h-3 w-3" /> দান করুন
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
        {projects.length === 0 && <div className="text-center text-muted-foreground py-8">কোনো প্রকল্প নেই</div>}

        {projects.length > 0 && (
          <div className="text-center mt-10">
            <Link to="/projects">
              <Button variant="outline" className="gap-2">
                সব প্রকল্প দেখুন <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
