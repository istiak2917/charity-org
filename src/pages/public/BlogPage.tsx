import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BlogPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("blog_posts").select("*").eq("status", "published").order("created_at", { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">ব্লগ</h1>
          <p className="text-muted-foreground">আমাদের সর্বশেষ খবর ও আপডেট</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {posts.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug || p.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  {p.image_url && <img src={p.image_url} alt={p.title} className="w-full h-48 object-cover" loading="lazy" />}
                  <div className="p-5">
                    {p.category && <Badge variant="secondary" className="mb-2">{p.category}</Badge>}
                    <h3 className="font-bold font-heading text-lg mb-2">{p.title}</h3>
                    {p.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>}
                    <div className="text-xs text-muted-foreground mt-3">{new Date(p.created_at).toLocaleDateString("bn-BD")}</div>
                  </div>
                </Card>
              </Link>
            ))}
            {posts.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12">কোনো ব্লগ পোস্ট নেই</div>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
