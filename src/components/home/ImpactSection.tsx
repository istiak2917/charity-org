import { useEffect, useRef, useState } from "react";
import { Users, Heart, BookOpen, Award } from "lucide-react";

const counters = [
  { icon: Users, target: 1250, label: "সুবিধাভোগী শিশু", suffix: "+" },
  { icon: Heart, target: 85, label: "সম্পন্ন প্রকল্প", suffix: "+" },
  { icon: BookOpen, target: 320, label: "স্বেচ্ছাসেবক", suffix: "+" },
  { icon: Award, target: 15, label: "বছরের অভিজ্ঞতা", suffix: "+" },
];

const ImpactSection = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 bg-primary text-primary-foreground" ref={ref}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-heading text-center mb-12">আমাদের প্রভাব</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {counters.map((c) => (
            <div key={c.label} className="text-center animate-count-up" style={{ animationDelay: visible ? "0ms" : "9999s" }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-foreground/15 mb-3">
                <c.icon className="h-7 w-7" />
              </div>
              <div className="text-4xl font-bold mb-1">
                {visible ? c.target : 0}{c.suffix}
              </div>
              <div className="text-sm opacity-80">{c.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
