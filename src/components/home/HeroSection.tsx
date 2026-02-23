import { Heart, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/shishuful-logo.jpg";
import heroChild1 from "@/assets/hero-child-1.jpg";
import heroEducation from "@/assets/hero-education.jpg";
import heroVolunteer from "@/assets/hero-volunteer.jpg";
import heroBooks from "@/assets/hero-books.jpg";
import heroChildrenPlaying from "@/assets/hero-children-playing.jpg";
import heroDonation from "@/assets/hero-donation.jpg";

// Positions as percentages from center of container
// Using transform translate to position from center point
interface CollageImage {
  src: string; alt: string; rotate: number; top: string;
  left?: string; right?: string; w: number; h: number;
  delay: number; float: string;
}

const collageImages: CollageImage[] = [
  { src: heroChild1, alt: "হাসিখুশি শিশু", rotate: -5, top: "2%", left: "6%", w: 130, h: 160, delay: 0.3, float: "hero-float-1" },
  { src: heroEducation, alt: "শিক্ষা কার্যক্রম", rotate: 4, top: "0%", right: "6%", w: 150, h: 120, delay: 0.4, float: "hero-float-2" },
  { src: heroVolunteer, alt: "স্বেচ্ছাসেবক", rotate: -3, top: "34%", left: "0%", w: 125, h: 150, delay: 0.5, float: "hero-float-3" },
  { src: heroBooks, alt: "বই ও শিক্ষা", rotate: 5, top: "32%", right: "0%", w: 140, h: 115, delay: 0.6, float: "hero-float-1" },
  { src: heroChildrenPlaying, alt: "শিশুদের খেলা", rotate: -4, top: "70%", left: "6%", w: 120, h: 140, delay: 0.7, float: "hero-float-2" },
  { src: heroDonation, alt: "সাহায্য বিতরণ", rotate: 3, top: "72%", right: "3%", w: 135, h: 125, delay: 0.8, float: "hero-float-3" },
];

const HeroSection = () => {
  return (
    <section id="home" className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 hero-gradient-bg" />

      {/* Bengali text texture */}
      <div className="absolute inset-0 hero-bengali-texture select-none pointer-events-none" aria-hidden="true">
        <span>শিশুফুল মানবতা ভালোবাসা শিশুর হাসি শিশুফুল মানবতা ভালোবাসা শিশুর হাসি শিশুফুল মানবতা ভালোবাসা শিশুর হাসি শিশুফুল মানবতা ভালোবাসা শিশুর হাসি শিশুফুল মানবতা ভালোবাসা শিশুর হাসি শিশুফুল মানবতা ভালোবাসা শিশুর হাসি</span>
      </div>

      {/* Soft vignette */}
      <div className="absolute inset-0 hero-vignette pointer-events-none" />

      {/* Cinematic light rays */}
      <div className="absolute inset-0 hero-light-rays pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="hero-particle"
            style={{
              left: `${8 + Math.random() * 84}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.7}s`,
              width: `${3 + Math.random() * 5}px`,
              height: `${3 + Math.random() * 5}px`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
        <div className="flex flex-col items-center text-center gap-6 md:gap-8">
          {/* Text block — always on top */}
          <div className="space-y-5 hero-text-entrance max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-tight text-foreground font-heading hero-headline">
              <span className="hero-shimmer-text inline-block">
                প্রতিটি শিশুর মুখে হাসি
              </span>
              <br />
              <span className="text-primary">আমাদের অঙ্গীকার</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed hero-subtext">
              আমরা একসাথে গড়ি মানবতার সুন্দর ভবিষ্যৎ।
            </p>
            <div className="flex flex-wrap justify-center gap-3 hero-cta-entrance">
              <Button className="btn-press gap-2 text-base px-7 py-5 bg-gradient-to-r from-primary to-accent shadow-lg hero-btn-glow" size="lg">
                <Heart className="h-5 w-5" /> অনুদান করুন
              </Button>
              <Button variant="outline" className="btn-press gap-2 text-base px-7 py-5 border-primary text-primary hover:bg-primary hover:text-primary-foreground" size="lg">
                <Users className="h-5 w-5" /> স্বেচ্ছাসেবক হোন
              </Button>
              <Button variant="ghost" className="btn-press gap-2 text-base px-7 py-5 text-muted-foreground" size="lg">
                <BookOpen className="h-5 w-5" /> আরও জানুন
              </Button>
            </div>
          </div>

          {/* Collage — below text */}
          <div className="relative hero-collage-container mx-auto">
            {/* Center circle with logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hero-center-circle z-10">
              <div className="hero-center-glow" />
              <img
                src={logo}
                alt="শিশুফুল লোগো"
                className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover relative z-10 shadow-xl"
                loading="lazy"
              />
            </div>

            {/* Floating image cards */}
            {collageImages.map((img, i) => (
              <div
                key={i}
                className={`absolute hero-collage-card ${img.float}`}
                style={{
                  transform: `rotate(${img.rotate}deg)`,
                  top: img.top,
                  left: img.left,
                  right: img.right,
                  width: `${img.w}px`,
                  height: `${img.h}px`,
                  animationDelay: `${img.delay}s`,
                } as React.CSSProperties}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
