const GallerySection = () => {
  return (
    <section id="gallery" className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading mb-3">গ্যালারি</h2>
          <p className="text-muted-foreground">আমাদের কার্যক্রমের কিছু মুহূর্ত</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-primary/5 rounded-xl flex items-center justify-center text-primary/20 text-2xl font-bold hover:bg-primary/10 transition-colors duration-200"
            >
              ছবি {i + 1}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
