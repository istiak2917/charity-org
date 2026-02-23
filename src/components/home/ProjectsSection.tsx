import { Progress } from "@/components/ui/progress";
import ScrollReveal from "@/components/ScrollReveal";

const projects = [
  { title: "শিশু শিক্ষা কার্যক্রম", desc: "সুবিধাবঞ্চিত শিশুদের জন্য বিনামূল্যে প্রাথমিক শিক্ষা।", raised: 45000, target: 100000, status: "চলমান", emoji: "📚" },
  { title: "পুষ্টি কর্মসূচি", desc: "অপুষ্টিতে ভোগা শিশুদের পুষ্টিকর খাবার বিতরণ।", raised: 72000, target: 80000, status: "চলমান", emoji: "🍲" },
  { title: "শীতবস্ত্র বিতরণ", desc: "শীতকালে শিশুদের মধ্যে গরম কাপড় বিতরণ।", raised: 30000, target: 30000, status: "সম্পন্ন", emoji: "🧥" },
];

const ProjectsSection = () => {
  return (
    <section id="projects" className="py-20 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-warm-gold/10 floating-shape" />
      <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-primary/10 floating-shape-reverse" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">আমাদের কাজ</span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2 mb-4">আমাদের প্রকল্পসমূহ</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4">বর্তমানে চলমান এবং সম্পন্ন প্রকল্পসমূহ</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <ScrollReveal key={p.title} delay={i * 120}>
              <div className="group bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{p.emoji}</span>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${p.status === "সম্পন্ন" ? "bg-soft-green/15 text-soft-green" : "bg-primary/10 text-primary"}`}>
                      {p.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-heading mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mb-5">{p.desc}</p>
                  <div className="space-y-2">
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-out animated-progress"
                        style={{ "--target-width": `${(p.raised / p.target) * 100}%` } as React.CSSProperties}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>৳{p.raised.toLocaleString("bn-BD")}</span>
                      <span>৳{p.target.toLocaleString("bn-BD")} লক্ষ্য</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
