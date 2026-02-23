import { Calendar, MapPin } from "lucide-react";

const events = [
  { title: "শীতবস্ত্র বিতরণ ২০২৬", date: "১৫ মার্চ, ২০২৬", location: "ঢাকা", desc: "শীতকালীন উষ্ণ বস্ত্র বিতরণ কর্মসূচি।" },
  { title: "শিশু দিবস উদযাপন", date: "১৭ মার্চ, ২০২৬", location: "চট্টগ্রাম", desc: "জাতীয় শিশু দিবস উপলক্ষে বিশেষ আয়োজন।" },
  { title: "বই বিতরণ মেলা", date: "১ এপ্রিল, ২০২৬", location: "সিলেট", desc: "শিশুদের মধ্যে বই বিতরণ এবং পাঠ্য উৎসব।" },
];

const EventsSection = () => {
  return (
    <section id="events" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading mb-3">আসন্ন ইভেন্ট</h2>
          <p className="text-muted-foreground">আমাদের আসন্ন কার্যক্রম সম্পর্কে জানুন</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((e) => (
            <div key={e.title} className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 text-sm text-primary mb-3">
                <Calendar className="h-4 w-4" /> {e.date}
              </div>
              <h3 className="text-lg font-bold font-heading mb-2">{e.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{e.desc}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {e.location}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
