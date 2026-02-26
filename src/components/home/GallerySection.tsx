import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";

interface GalleryItem { id: string; title: string; image_url: string; category: string; caption: string; }

const GallerySection = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    supabase.from("gallery_items").select("*").order("created_at", { ascending: false }).limit(8).then(({ data }) => {
      if (data) setItems(data);
    });
  }, []);

  const heights = ["h-48", "h-64", "h-52", "h-56", "h-60", "h-48", "h-56", "h-52"];

  return (
    <section id="gallery" className="py-20 bg-card relative overflow-hidden">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">{t("gallery_moments")}</span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2 mb-4">{t("gallery_title")}</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4">{t("gallery_subtitle")}</p>
          </div>
        </ScrollReveal>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {items.map((item, i) => (
            <ScrollReveal key={item.id} delay={i * 80}>
              <div
                className={`group relative ${heights[i % heights.length]} rounded-2xl overflow-hidden cursor-pointer break-inside-avoid`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <img src={item.image_url} alt={item.title || "Gallery"} className={`w-full h-full object-cover transition-transform duration-500 ${hoveredIndex === i ? "scale-110" : "scale-100"}`} loading="lazy" />
                <div className={`absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent transition-opacity duration-300 ${hoveredIndex === i ? "opacity-100" : "opacity-0"}`}>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {item.category && <span className="text-xs text-primary-foreground/70 bg-primary/50 px-2 py-0.5 rounded-full">{item.category}</span>}
                    <h4 className="text-primary-foreground font-bold mt-1">{item.title || item.caption}</h4>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        {items.length === 0 && <div className="text-center text-muted-foreground py-8">{t("gallery_no_data")}</div>}
      </div>
    </section>
  );
};

export default GallerySection;
