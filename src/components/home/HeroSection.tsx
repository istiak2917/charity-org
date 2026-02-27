import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Heart, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/shishuful-logo.jpg";
import heroChild1 from "@/assets/hero-child-1.jpg";
import heroEducation from "@/assets/hero-education.jpg";
import heroVolunteer from "@/assets/hero-volunteer.jpg";
import heroBooks from "@/assets/hero-books.jpg";
import heroChildrenPlaying from "@/assets/hero-children-playing.jpg";
import heroDonation from "@/assets/hero-donation.jpg";

const collageImages = [
  { src: heroChild1, alt: "Child", delay: 0.2 },
  { src: heroEducation, alt: "Education", delay: 0.3 },
  { src: heroVolunteer, alt: "Volunteer", delay: 0.4 },
  { src: heroBooks, alt: "Books", delay: 0.5 },
  { src: heroChildrenPlaying, alt: "Children Playing", delay: 0.6 },
  { src: heroDonation, alt: "Donation", delay: 0.7 },
];

const HeroSection = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [headline, setHeadline] = useState("");
  const [subtext, setSubtext] = useState("");
  const [ctaText, setCtaText] = useState("");

  useEffect(() => {
    supabase.from("site_settings").select("*").then(({ data }) => {
      if (data) {
        data.forEach((s: any) => {
          const k = s.key || s.setting_key || s.name || "";
          const raw = s.value || s.setting_value || "";
          const val = typeof raw === "string" ? raw.replace(/^"|"$/g, "") : JSON.stringify(raw).replace(/^"|"$/g, "");
          if (k === "hero_headline") setHeadline(val);
          if (k === "hero_subtext") setSubtext(val);
          if (k === "cta_button_text") setCtaText(val);
        });
      }
    });
  }, []);

  // When language is not Bengali, use translations instead of DB values
  const displayHeadline = lang === "bn" ? (headline || t("hero_default_headline")) : t("hero_default_headline");
  const displaySubtext = lang === "bn" ? (subtext || t("hero_default_subtext")) : t("hero_default_subtext");
  const displayCta = lang === "bn" ? (ctaText || t("hero_cta_donate")) : t("hero_cta_donate");

  const headlineParts = displayHeadline.split(" ");
  const mid = Math.ceil(headlineParts.length / 2);
  const line1 = headlineParts.slice(0, mid).join(" ");
  const line2 = headlineParts.slice(mid).join(" ");

  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-0 hero-gradient-bg" />
      <div className="absolute inset-0 hero-bengali-texture select-none pointer-events-none" aria-hidden="true">
        <span>শিশুফুল মানবতা ভালোবাসা শিশুর হাসি শিশুফুল মানবতা ভালোবাসা শিশুর হাসি শিশুফুল মানবতা ভালোবাসা শিশুর হাসি শিশুফুল মানবতা ভালোবাসা শিশুর হাসি</span>
      </div>
      <div className="absolute inset-0 hero-vignette pointer-events-none" />
      <div className="absolute inset-0 hero-light-rays pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="hero-particle" style={{ left: `${8 + Math.random() * 84}%`, top: `${10 + Math.random() * 80}%`, animationDelay: `${i * 0.7}s`, width: `${3 + Math.random() * 5}px`, height: `${3 + Math.random() * 5}px` }} />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="pt-8 pb-6 md:pt-12 md:pb-8 flex flex-col items-center">
          <div className="hero-text-entrance mb-6 md:mb-8">
            <div className="relative">
              <div className="hero-center-glow" />
              <img src={logo} alt="শিশুফুল লোগো" className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full object-cover shadow-xl relative z-10 border-4 border-white/60" loading="lazy" />
            </div>
          </div>
          <div className="hero-image-grid">
            {collageImages.map((img, i) => (
              <div key={i} className="hero-grid-card" style={{ animationDelay: `${img.delay}s` }}>
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover rounded-2xl" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        <div className="pb-12 md:pb-16 flex flex-col items-center text-center space-y-5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-tight text-foreground font-heading hero-text-entrance">
            <span className="hero-shimmer-text inline-block">{line1}</span>
            {line2 && <><br /><span className="text-primary">{line2}</span></>}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed hero-subtext max-w-xl">{displaySubtext}</p>
          <div className="flex flex-wrap justify-center gap-3 hero-cta-entrance">
            <Button onClick={() => navigate("/donations")} className="btn-press gap-2 text-base px-7 py-5 bg-gradient-to-r from-primary to-accent shadow-lg hero-btn-glow" size="lg">
              <Heart className="h-5 w-5" /> {displayCta}
            </Button>
            <Button onClick={() => navigate("/volunteers")} variant="outline" className="btn-press gap-2 text-base px-7 py-5 border-primary text-primary hover:bg-primary hover:text-primary-foreground" size="lg">
              <Users className="h-5 w-5" /> {t("hero_cta_volunteer")}
            </Button>
            <Button onClick={() => navigate("/about")} variant="ghost" className="btn-press gap-2 text-base px-7 py-5 text-muted-foreground" size="lg">
              <BookOpen className="h-5 w-5" /> {t("hero_cta_learn_more")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
