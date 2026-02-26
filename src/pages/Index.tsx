import { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BlockRenderer } from "@/components/builder/BlockRenderer";
import type { HomepageSection, SectionBlock, SectionConfig } from "@/types/homepage-builder";

// Fallback components for sections without blocks
const FALLBACK_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  hero: lazy(() => import("@/components/home/HeroSection")),
  about: lazy(() => import("@/components/home/AboutSection")),
  projects: lazy(() => import("@/components/home/ProjectsSection")),
  impact: lazy(() => import("@/components/home/ImpactSection")),
  donation: lazy(() => import("@/components/home/DonationSection")),
  events: lazy(() => import("@/components/home/EventsSection")),
  team: lazy(() => import("@/components/home/TeamSection")),
  blog: lazy(() => import("@/components/home/BlogSection")),
  gallery: lazy(() => import("@/components/home/GallerySection")),
  contact: lazy(() => import("@/components/home/ContactSection")),
  transparency: lazy(() => import("@/components/home/TransparencySection")),
  faq: lazy(() => import("@/components/home/FAQSection")),
  reviews: lazy(() => import("@/components/home/ReviewSection")),
};

const Index = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [blocks, setBlocks] = useState<Record<string, SectionBlock[]>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Fetch sections
      const { data: sData } = await supabase
        .from("homepage_sections")
        .select("*")
        .order("position", { ascending: true });

      if (sData) {
        setSections(sData.filter((s: any) => s.is_visible === true));
      }

      // Fetch blocks
      const { data: bData } = await supabase
        .from("section_blocks")
        .select("*")
        .order("position", { ascending: true });

      if (bData) {
        const grouped: Record<string, SectionBlock[]> = {};
        bData.forEach((b: any) => {
          const sid = b.section_id;
          if (!grouped[sid]) grouped[sid] = [];
          grouped[sid].push(b as SectionBlock);
        });
        setBlocks(grouped);
      }

      setLoaded(true);
    };
    load();
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {sections.map((section) => {
          const sectionBlocks = blocks[section.id] || [];
          const config: SectionConfig = section.content || {};

          // Build section styles
          const style: React.CSSProperties = {};
          if (config.background?.color) style.backgroundColor = config.background.color;
          if (config.background?.gradient) style.background = config.background.gradient;
          if (config.background?.imageUrl) {
            style.backgroundImage = `url(${config.background.imageUrl})`;
            style.backgroundSize = "cover";
            style.backgroundPosition = "center";
          }
          if (config.spacing?.paddingTop) style.paddingTop = config.spacing.paddingTop;
          if (config.spacing?.paddingBottom) style.paddingBottom = config.spacing.paddingBottom;
          if (config.spacing?.paddingLeft) style.paddingLeft = config.spacing.paddingLeft;
          if (config.spacing?.paddingRight) style.paddingRight = config.spacing.paddingRight;
          if (config.spacing?.marginTop) style.marginTop = config.spacing.marginTop;
          if (config.spacing?.marginBottom) style.marginBottom = config.spacing.marginBottom;

          const className = [
            config.advanced?.customClass || "",
          ].filter(Boolean).join(" ");

          return (
            <section
              key={section.id}
              id={config.advanced?.customId || section.section_key}
              className={className}
              style={style}
            >
              {sectionBlocks.length > 0 ? (
                sectionBlocks
                  .filter((b: any) => b.is_visible !== false)
                  .map((block) => (
                    <BlockRenderer key={block.id} block={block} />
                  ))
              ) : (
                // Fallback: render original component if available
                (() => {
                  const FallbackComp = FALLBACK_COMPONENTS[section.section_key];
                  if (FallbackComp) {
                    return (
                      <Suspense fallback={<div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>}>
                        <FallbackComp />
                      </Suspense>
                    );
                  }
                  return null;
                })()
              )}
            </section>
          );
        })}

        {sections.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <p>হোমপেজ সেকশন কনফিগার করা হয়নি।</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
