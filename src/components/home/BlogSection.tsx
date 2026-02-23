const posts = [
  { title: "শিশুদের শিক্ষায় আমাদের পদক্ষেপ", excerpt: "গত মাসে আমরা ১০০টি শিশুর শিক্ষার ব্যবস্থা করেছি...", date: "১০ ফেব্রুয়ারি, ২০২৬" },
  { title: "পুষ্টি কর্মসূচির সাফল্য", excerpt: "আমাদের পুষ্টি কর্মসূচি সফলভাবে ৫০০ শিশুকে সহায়তা করেছে...", date: "৫ ফেব্রুয়ারি, ২০২৬" },
  { title: "স্বেচ্ছাসেবকদের অভিজ্ঞতা", excerpt: "আমাদের স্বেচ্ছাসেবকরা তাদের অভিজ্ঞতা শেয়ার করেছেন...", date: "১ ফেব্রুয়ারি, ২০২৬" },
];

const BlogSection = () => {
  return (
    <section id="blog" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading mb-3">সর্বশেষ ব্লগ</h2>
          <p className="text-muted-foreground">আমাদের সাম্প্রতিক কার্যক্রম এবং গল্প</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <article key={p.title} className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow duration-200">
              <div className="h-32 bg-primary/5 rounded-lg mb-4 flex items-center justify-center text-primary/20 text-4xl font-bold">
                ব্লগ
              </div>
              <time className="text-xs text-muted-foreground">{p.date}</time>
              <h3 className="text-lg font-bold font-heading mt-1 mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
