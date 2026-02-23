import { Users, Heart, BookOpen, Award } from "lucide-react";
import CountUp from "@/components/CountUp";
import ScrollReveal from "@/components/ScrollReveal";

const counters = [
  { icon: Users, target: 1250, label: "সুবিধাভোগী শিশু", suffix: "+" },
  { icon: Heart, target: 85, label: "সম্পন্ন প্রকল্প", suffix: "+" },
  { icon: BookOpen, target: 320, label: "স্বেচ্ছাসেবক", suffix: "+" },
  { icon: Award, target: 15, label: "বছরের অভিজ্ঞতা", suffix: "+" },
];

const ImpactSection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary-foreground/5 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-primary-foreground/5 translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">আমাদের প্রভাব</h2>
            <div className="w-16 h-1 bg-primary-foreground/30 mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {counters.map((c, i) => (
            <ScrollReveal key={c.label} delay={i * 100}>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/10 mb-4 group-hover:scale-110 group-hover:bg-primary-foreground/20 transition-all duration-300">
                  <c.icon className="h-8 w-8" />
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  <CountUp target={c.target} suffix={c.suffix} />
                </div>
                <div className="text-sm opacity-80">{c.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
