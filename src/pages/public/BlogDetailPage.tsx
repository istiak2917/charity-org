import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      let { data } = await supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle();
      if (!data) {
        const r = await supabase.from("blog_posts").select("*").eq("id", slug).maybeSingle();
        data = r.data;
      }
      if (data) setPost(data); else setNotFound(true);
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
        <p className="text-muted-foreground mb-4">ব্লগ পোস্ট পাওয়া যায়নি</p>
        <Link to="/blog"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> সব ব্লগ</Button></Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> সব ব্লগ
        </Link>
        {post.image_url && <img src={post.image_url} alt={post.title} className="w-full rounded-xl mb-6 max-h-96 object-cover" />}
        {post.category && <Badge variant="secondary" className="mb-3">{post.category}</Badge>}
        <h1 className="text-3xl font-bold font-heading mb-3">{post.title}</h1>
        <div className="text-sm text-muted-foreground mb-6">{new Date(post.created_at).toLocaleDateString("bn-BD")}</div>
        <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: post.content || post.body || "" }} />
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetailPage;
