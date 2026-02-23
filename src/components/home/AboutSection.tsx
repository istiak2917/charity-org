import { Target, Eye, Heart } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading text-foreground mb-3">আমাদের সম্পর্কে</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            শিশুফুল একটি অলাভজনক মানবিক সংগঠন যা শিশুদের সামগ্রিক কল্যাণে নিবেদিত।
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Heart, title: "আমাদের লক্ষ্য", desc: "প্রতিটি সুবিধাবঞ্চিত শিশুর জীবনে আলো জ্বালানো এবং তাদের মৌলিক অধিকার নিশ্চিত করা।" },
            { icon: Target, title: "আমাদের মিশন", desc: "শিক্ষা, স্বাস্থ্যসেবা এবং সামাজিক সহায়তার মাধ্যমে শিশুদের ক্ষমতায়ন করা।" },
            { icon: Eye, title: "আমাদের ভিশন", desc: "এমন একটি সমাজ গড়া যেখানে প্রতিটি শিশু নিরাপদ, শিক্ষিত এবং সুখী।" },
          ].map((item) => (
            <div key={item.title} className="bg-background rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
