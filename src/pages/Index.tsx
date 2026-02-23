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
      .order("position", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSections(data);
        }
        setLoaded(true);
      });
  }, []);

  const visibleSections = loaded && sections.length > 0
    ? sections.filter((s: any) => s.is_visible === true)
    : Object.keys(sectionComponents).map((key) => ({
        id: key, section_key: key, title: key, is_visible: true,
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
