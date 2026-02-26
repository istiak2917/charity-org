import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";

interface BlogPost { id: string; title: string; excerpt: string; image_url?: string; created_at: string; }

const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const { t, lang } = useLanguage();
  const dateLocale = lang === "bn" ? "bn-BD" : "en-US";

  useEffect(() => {
    supabase.from("blog_posts").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(3).then(({ data }) => {
      if (data) setPosts(data);
    });
  }, []);

  return (
    <section id="blog" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">{t("blog_latest_news")}</span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2 mb-4">{t("blog_title")}</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4">{t("blog_subtitle")}</p>
          </div>
        </ScrollReveal>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ScrollReveal className="lg:col-span-2">
              <article className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <div className="h-56 bg-gradient-to-br from-primary/10 via-accent/10 to-warm-gold/10 flex items-center justify-center text-6xl relative overflow-hidden">
                  {posts[0].image_url ? <img src={posts[0].image_url} alt={posts[0].title} className="w-full h-full object-cover" /> : "📰"}
                </div>
                <div className="p-6">
                  <time className="text-xs text-muted-foreground">{new Date(posts[0].created_at).toLocaleDateString(dateLocale)}</time>
                  <h3 className="text-xl font-bold font-heading mb-2 mt-1 group-hover:text-primary transition-colors">{posts[0].title}</h3>
                  <p className="text-muted-foreground line-clamp-3">{posts[0].excerpt}</p>
                </div>
              </article>
            </ScrollReveal>
            <div className="flex flex-col gap-6">
              {posts.slice(1).map((p, i) => (
                <ScrollReveal key={p.id} delay={(i + 1) * 150}>
                  <article className="group bg-card rounded-2xl p-5 border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5">
                    <time className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString(dateLocale)}</time>
                    <h3 className="text-lg font-bold font-heading mb-2 mt-1 group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">{t("blog_no_data")}</div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
