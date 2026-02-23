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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ImpactSection />
        <DonationSection />
        <EventsSection />
        <TeamSection />
        <BlogSection />
        <GallerySection />
        <TransparencySection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
