import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";

const galleryItems = [
  { title: "শিক্ষা কার্যক্রম", category: "শিক্ষা" },
  { title: "খাদ্য বিতরণ", category: "পুষ্টি" },
  { title: "শীতবস্ত্র বিতরণ", category: "সেবা" },
  { title: "শিশু দিবস", category: "ইভেন্ট" },
  { title: "বই বিতরণ", category: "শিক্ষা" },
  { title: "স্বেচ্ছাসেবক প্রশিক্ষণ", category: "সেবা" },
  { title: "স্বাস্থ্য ক্যাম্প", category: "স্বাস্থ্য" },
  { title: "পরিবেশ সচেতনতা", category: "ইভেন্ট" },
];

const heights = ["h-48", "h-64", "h-52", "h-56", "h-60", "h-48", "h-56", "h-52"];

const GallerySection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="gallery" className="py-20 bg-card relative overflow-hidden">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">আমাদের মুহূর্ত</span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2 mb-4">গ্যালারি</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4">আমাদের কার্যক্রমের কিছু মুহূর্ত</p>
          </div>
        </ScrollReveal>

        {/* Masonry grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {galleryItems.map((item, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div
                className={`group relative ${heights[i]} rounded-2xl overflow-hidden cursor-pointer break-inside-avoid bg-gradient-to-br from-primary/8 to-accent/8`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Placeholder content */}
                <div className="absolute inset-0 flex items-center justify-center text-primary/15 text-5xl font-bold">
                  📷
                </div>

                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent transition-opacity duration-300 ${hoveredIndex === i ? "opacity-100" : "opacity-0"}`}>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="text-xs text-primary-foreground/70 bg-primary/50 px-2 py-0.5 rounded-full">{item.category}</span>
                    <h4 className="text-primary-foreground font-bold mt-1">{item.title}</h4>
                  </div>
                </div>

                {/* Zoom effect */}
                <div className={`absolute inset-0 transition-transform duration-500 ${hoveredIndex === i ? "scale-110" : "scale-100"}`} />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
