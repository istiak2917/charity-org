import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";

interface GalleryItem { id: string; title: string; image_url: string; category: string; caption: string; }

const GalleryPage = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState("সব");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("gallery_items").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) {
        setItems(data);
        const cats = [...new Set(data.map(d => d.category).filter(Boolean))];
        setCategories(cats);
      }
    });
  }, []);

  const filtered = filter === "সব" ? items : items.filter(i => i.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">গ্যালারি</h1>
          <p className="text-muted-foreground">আমাদের কার্যক্রমের মুহূর্তসমূহ</p>
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button onClick={() => setFilter("সব")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "সব" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"}`}>সব</button>
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === c ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"}`}>{c}</button>
            ))}
          </div>
        )}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filtered.map((item) => (
            <Card key={item.id} className="overflow-hidden break-inside-avoid group">
              <img src={item.image_url} alt={item.title || "Gallery"} className="w-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              <div className="p-3">
                <div className="font-medium text-sm">{item.title}</div>
                {item.caption && <div className="text-xs text-muted-foreground">{item.caption}</div>}
              </div>
            </Card>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center text-muted-foreground py-12">কোনো ছবি নেই</div>}
      </main>
      <Footer />
    </div>
  );
};

export default GalleryPage;
