import { Heart, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/shishuful-logo.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative overflow-hidden bg-texture-bengali">
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-fade-in">
            <img src={logo} alt="শিশুফুল" className="h-16 w-auto rounded-xl" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground font-heading">
              প্রতিটি শিশুর মুখে হাসি{" "}
              <span className="text-primary">আমাদের অঙ্গীকার</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              শিশুফুল একটি মানবিক সংগঠন যা প্রতিটি শিশুর অধিকার, শিক্ষা এবং সুন্দর ভবিষ্যৎ নিশ্চিত করতে কাজ করে।
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="btn-press gap-2 text-base px-6 py-5" size="lg">
                <Heart className="h-5 w-5" /> অনুদান দিন
              </Button>
              <Button variant="outline" className="btn-press gap-2 text-base px-6 py-5 border-primary text-primary hover:bg-primary hover:text-primary-foreground" size="lg">
                <Users className="h-5 w-5" /> স্বেচ্ছাসেবক হন
              </Button>
              <Button variant="ghost" className="btn-press gap-2 text-base px-6 py-5 text-muted-foreground" size="lg">
                <BookOpen className="h-5 w-5" /> আরও জানুন
              </Button>
            </div>
          </div>

          {/* Right Decorative */}
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="absolute w-72 h-72 rounded-full bg-primary/10 -top-10 -right-10" />
            <div className="absolute w-48 h-48 rounded-full bg-accent/10 bottom-0 left-10" />
            <div className="relative z-10 rounded-xl overflow-hidden shadow-xl" style={{ borderRadius: "20px" }}>
              <img
                src={logo}
                alt="শিশুফুল - শিশুদের জন্য"
                className="w-80 h-80 object-contain bg-card p-8"
                loading="lazy"
              />
            </div>
            <div className="absolute w-32 h-32 rounded-full bg-warm-gold/15 top-10 left-0" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
