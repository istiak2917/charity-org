import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import ImpactSection from "@/components/home/ImpactSection";
import DonationSection from "@/components/home/DonationSection";
import EventsSection from "@/components/home/EventsSection";
import TeamSection from "@/components/home/TeamSection";
import BlogSection from "@/components/home/BlogSection";
import GallerySection from "@/components/home/GallerySection";
import TransparencySection from "@/components/home/TransparencySection";
import ContactSection from "@/components/home/ContactSection";
import type { HomepageSection } from "@/hooks/useSiteSettings";

const sectionComponents: Record<string, React.ComponentType> = {
  hero: HeroSection,
  about: AboutSection,
  projects: ProjectsSection,
  impact: ImpactSection,
  donation: DonationSection,
  events: EventsSection,
  team: TeamSection,
  blog: BlogSection,
  gallery: GallerySection,
  transparency: TransparencySection,
  contact: ContactSection,
};

const Index = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("homepage_sections")
      .select("*")
      .then(({ data }) => {
        if (data && data.length > 0) {
          // Sort by whatever order column exists
          const sorted = [...data].sort((a: any, b: any) => {
            const aOrder = a.sort_order ?? a.display_order ?? a.order_index ?? 0;
            const bOrder = b.sort_order ?? b.display_order ?? b.order_index ?? 0;
            return aOrder - bOrder;
          });
          setSections(sorted);
        }
        setLoaded(true);
      });
  }, []);

  // Fallback: if no homepage_sections data, show default order
  const visibleSections = loaded && sections.length > 0
    ? sections.filter((s: any) => s.is_visible !== false)
    : Object.keys(sectionComponents).map((key) => ({
        id: key, section_key: key, title: key, is_visible: true, config: {},
      }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {visibleSections.map((s) => {
          const Component = sectionComponents[s.section_key];
          if (!Component) return null;
          return <Component key={s.section_key} />;
        })}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
