import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Heart, Quote, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ScrollReveal from "@/components/ScrollReveal";

const TestimonialsPage = () => {
  const [stories, setStories] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const { lang } = useLanguage();
  const lb = (bn: string, en: string) => lang === "bn" ? bn : en;

  useEffect(() => {
    // Load success stories from beneficiaries
    supabase.from("beneficiaries").select("*").eq("status", "active").limit(6).then(({ data }) => {
      setStories(data || []);
    });
    // Load reviews from settings
    supabase.from("site_settings").select("*").eq("setting_key", "homepage_reviews").single().then(({ data }) => {
      if (data) {
        try {
          const val = data.setting_value || data.value || "[]";
          const parsed = JSON.parse(typeof val === "string" ? val.replace(/^"|"$/g, "") : JSON.stringify(val));
          setReviews(parsed.filter((r: any) => r.is_active));
        } catch { /* ignore */ }
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SEOHead title={lb("সফলতার গল্প", "Success Stories")} description={lb("আমাদের উপকারভোগীদের গল্প", "Stories from our beneficiaries")} />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Heart className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">{lb("সফলতার গল্প ও মতামত", "Success Stories & Testimonials")}</h1>
          <p className="text-muted-foreground">{lb("যাদের জীবনে পরিবর্তন এসেছে", "Lives we've changed")}</p>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold font-heading mb-6 text-center">{lb("মতামত", "Testimonials")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {reviews.map((r: any, i: number) => (
                <ScrollReveal key={r.id || i} delay={i * 100}>
                  <Card className="p-6 h-full flex flex-col">
                    <Quote className="h-6 w-6 text-primary/30 mb-3" />
                    <p className="text-sm text-muted-foreground flex-1 mb-4">{r.text}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {(r.name || "?")[0]}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.role}</div>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        {Array.from({ length: r.rating || 5 }).map((_, si) => (
                          <Star key={si} className="h-3 w-3 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* Beneficiary Stories */}
        {stories.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold font-heading mb-6 text-center">{lb("উপকারভোগীদের গল্প", "Beneficiary Stories")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {stories.map((s: any, i: number) => (
                <ScrollReveal key={s.id} delay={i * 100}>
                  <Card className="p-6">
                    <h3 className="font-bold font-heading mb-2">{s.name}</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {s.age && <p>{lb("বয়স", "Age")}: {s.age}</p>}
                      {s.education_level && <p>{lb("শিক্ষা", "Education")}: {s.education_level}</p>}
                      {s.address && <p>{lb("ঠিকানা", "Address")}: {s.address}</p>}
                      {s.notes && <p className="mt-2 italic">{s.notes}</p>}
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {stories.length === 0 && reviews.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {lb("এখনো কোনো গল্প যোগ হয়নি", "No stories added yet")}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TestimonialsPage;
