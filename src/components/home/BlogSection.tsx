import ScrollReveal from "@/components/ScrollReveal";

const posts = [
  { title: "শিশুদের শিক্ষায় আমাদের পদক্ষেপ", excerpt: "গত মাসে আমরা ১০০টি শিশুর শিক্ষার ব্যবস্থা করেছি...", date: "১০ ফেব্রুয়ারি, ২০২৬", category: "শিক্ষা" },
  { title: "পুষ্টি কর্মসূচির সাফল্য", excerpt: "আমাদের পুষ্টি কর্মসূচি সফলভাবে ৫০০ শিশুকে সহায়তা করেছে...", date: "৫ ফেব্রুয়ারি, ২০২৬", category: "পুষ্টি" },
  { title: "স্বেচ্ছাসেবকদের অভিজ্ঞতা", excerpt: "আমাদের স্বেচ্ছাসেবকরা তাদের অভিজ্ঞতা শেয়ার করেছেন...", date: "১ ফেব্রুয়ারি, ২০২৬", category: "গল্প" },
];

const BlogSection = () => {
  return (
    <section id="blog" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">সর্বশেষ সংবাদ</span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2 mb-4">সর্বশেষ ব্লগ</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4">আমাদের সাম্প্রতিক কার্যক্রম এবং গল্প</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured large card */}
          <ScrollReveal className="lg:col-span-2">
            <article className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="h-56 bg-gradient-to-br from-primary/10 via-accent/10 to-warm-gold/10 flex items-center justify-center text-6xl relative overflow-hidden">
                📰
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">{posts[0].category}</span>
                  <time className="text-xs text-muted-foreground">{posts[0].date}</time>
                </div>
                <h3 className="text-xl font-bold font-heading mb-2 group-hover:text-primary transition-colors duration-200">{posts[0].title}</h3>
                <p className="text-muted-foreground">{posts[0].excerpt}</p>
              </div>
            </article>
          </ScrollReveal>

          {/* Side smaller cards */}
          <div className="flex flex-col gap-6">
            {posts.slice(1).map((p, i) => (
              <ScrollReveal key={p.title} delay={(i + 1) * 150}>
                <article className="group bg-card rounded-2xl p-5 border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">{p.category}</span>
                    <time className="text-xs text-muted-foreground">{p.date}</time>
                  </div>
                  <h3 className="text-lg font-bold font-heading mb-2 group-hover:text-primary transition-colors duration-200">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.excerpt}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
