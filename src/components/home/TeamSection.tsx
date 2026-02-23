const teamMembers = [
  { name: "সভাপতি", role: "সভাপতি", bio: "সংগঠনের নেতৃত্ব প্রদান" },
  { name: "সাধারণ সম্পাদক", role: "সাধারণ সম্পাদক", bio: "দৈনন্দিন কার্যক্রম পরিচালনা" },
  { name: "কোষাধ্যক্ষ", role: "কোষাধ্যক্ষ", bio: "আর্থিক ব্যবস্থাপনা" },
  { name: "সহ-সভাপতি", role: "সহ-সভাপতি", bio: "সংগঠনের সহায়তা প্রদান" },
];

const TeamSection = () => {
  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading mb-3">আমাদের দল</h2>
          <p className="text-muted-foreground">নিবেদিতপ্রাণ যারা শিশুদের জন্য কাজ করেন</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {teamMembers.map((m) => (
            <div key={m.role} className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3 text-3xl text-primary font-bold">
                {m.name.charAt(0)}
              </div>
              <h4 className="font-bold font-heading">{m.name}</h4>
              <p className="text-sm text-primary">{m.role}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
