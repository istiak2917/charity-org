import ScrollReveal from "@/components/ScrollReveal";

const teamMembers = [
  { name: "সভাপতি", role: "সভাপতি", bio: "সংগঠনের নেতৃত্ব প্রদান", initials: "স" },
  { name: "সাধারণ সম্পাদক", role: "সাধারণ সম্পাদক", bio: "দৈনন্দিন কার্যক্রম পরিচালনা", initials: "সা" },
  { name: "কোষাধ্যক্ষ", role: "কোষাধ্যক্ষ", bio: "আর্থিক ব্যবস্থাপনা", initials: "কো" },
  { name: "সহ-সভাপতি", role: "সহ-সভাপতি", bio: "সংগঠনের সহায়তা প্রদান", initials: "সহ" },
];

const TeamSection = () => {
  return (
    <section className="py-20 bg-card relative overflow-hidden">
      <div className="absolute top-0 left-1/2 w-[500px] h-[500px] rounded-full bg-primary/3 -translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">আমাদের মানুষ</span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2 mb-4">আমাদের দল</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4">নিবেদিতপ্রাণ যারা শিশুদের জন্য কাজ করেন</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {teamMembers.map((m, i) => (
            <ScrollReveal key={m.role} delay={i * 100}>
              <div className="text-center group">
                <div className="relative mx-auto w-28 h-28 md:w-32 md:h-32 mb-4">
                  {/* Glow ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/40 group-hover:to-accent/40 transition-all duration-300 scale-100 group-hover:scale-110" />
                  <div className="absolute inset-1 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl md:text-4xl text-primary font-bold font-heading group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground transition-all duration-500">
                    {m.initials}
                  </div>
                </div>
                <h4 className="font-bold font-heading text-foreground">{m.name}</h4>
                <p className="text-sm text-primary">{m.role}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.bio}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
