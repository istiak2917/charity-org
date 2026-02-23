import { Heart, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/shishuful-logo.jpg";
import heroChild1 from "@/assets/hero-child-1.jpg";
import heroEducation from "@/assets/hero-education.jpg";
import heroVolunteer from "@/assets/hero-volunteer.jpg";
import heroBooks from "@/assets/hero-books.jpg";
import heroChildrenPlaying from "@/assets/hero-children-playing.jpg";
import heroDonation from "@/assets/hero-donation.jpg";

const collageImages = [
  { src: heroChild1, alt: "হাসিখুশি শিশু", rotate: "-5deg", top: "5%", left: "2%", w: "140px", h: "180px", delay: "0.3s", float: "hero-float-1" },
  { src: heroEducation, alt: "শিক্ষা কার্যক্রম", rotate: "4deg", top: "0%", right: "3%", w: "170px", h: "130px", delay: "0.4s", float: "hero-float-2" },
  { src: heroVolunteer, alt: "স্বেচ্ছাসেবক", rotate: "-3deg", bottom: "8%", left: "0%", w: "150px", h: "170px", delay: "0.5s", float: "hero-float-3" },
  { src: heroBooks, alt: "বই ও শিক্ষা", rotate: "5deg", bottom: "5%", right: "2%", w: "160px", h: "130px", delay: "0.6s", float: "hero-float-1" },
  { src: heroChildrenPlaying, alt: "শিশুদের খেলা", rotate: "-4deg", top: "40%", left: "-5%", w: "130px", h: "160px", delay: "0.7s", float: "hero-float-2" },
  { src: heroDonation, alt: "সাহায্য বিতরণ", rotate: "3deg", top: "35%", right: "-3%", w: "145px", h: "140px", delay: "0.8s", float: "hero-float-3" },
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

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text block */}
          <div className="space-y-6 hero-text-entrance">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-tight text-foreground font-heading hero-headline">
              <span className="hero-shimmer-text inline-block">
                প্রতিটি শিশুর মুখে হাসি
              </span>
              <br />
              <span className="text-primary">আমাদের অঙ্গীকার</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg hero-subtext">
              আমরা একসাথে গড়ি মানবতার সুন্দর ভবিষ্যৎ।
            </p>
            <div className="flex flex-wrap gap-3 hero-cta-entrance">
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

          {/* Collage */}
          <div className="relative flex items-center justify-center min-h-[420px] md:min-h-[500px]">
            {/* Center circle with logo */}
            <div className="hero-center-circle">
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
                  transform: `rotate(${img.rotate})`,
                  top: img.top,
                  left: img.left,
                  right: img.right,
                  bottom: img.bottom,
                  width: img.w,
                  height: img.h,
                  animationDelay: img.delay,
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
