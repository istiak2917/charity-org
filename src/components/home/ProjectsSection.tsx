import { Progress } from "@/components/ui/progress";

const projects = [
  { title: "শিশু শিক্ষা কার্যক্রম", desc: "সুবিধাবঞ্চিত শিশুদের জন্য বিনামূল্যে প্রাথমিক শিক্ষা।", raised: 45000, target: 100000, status: "চলমান" },
  { title: "পুষ্টি কর্মসূচি", desc: "অপুষ্টিতে ভোগা শিশুদের পুষ্টিকর খাবার বিতরণ।", raised: 72000, target: 80000, status: "চলমান" },
  { title: "শীতবস্ত্র বিতরণ", desc: "শীতকালে শিশুদের মধ্যে গরম কাপড় বিতরণ।", raised: 30000, target: 30000, status: "সম্পন্ন" },
];

const ProjectsSection = () => {
  return (
    <section id="projects" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading mb-3">আমাদের প্রকল্পসমূহ</h2>
          <p className="text-muted-foreground">বর্তমানে চলমান এবং সম্পন্ন প্রকল্পসমূহ</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.title} className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.status === "সম্পন্ন" ? "bg-soft-green/15 text-soft-green" : "bg-primary/10 text-primary"}`}>
                  {p.status}
                </span>
              </div>
              <h3 className="text-lg font-bold font-heading mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{p.desc}</p>
              <div className="space-y-2">
                <Progress value={(p.raised / p.target) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>৳{p.raised.toLocaleString("bn-BD")}</span>
                  <span>৳{p.target.toLocaleString("bn-BD")} লক্ষ্য</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
