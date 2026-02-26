import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

interface Review {
  id: string;
  name: string;
  role?: string;
  image_url?: string;
  text: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
}

const ReviewSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("setting_key", "homepage_reviews").single();
      if (data) {
        try {
          const raw = typeof data.setting_value === "string" ? JSON.parse(data.setting_value) : data.setting_value;
          const items = (Array.isArray(raw) ? raw : []).filter((r: any) => r.is_active !== false);
          items.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
          setReviews(items);
        } catch {}
      }
    };
    load();
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <Star className="h-6 w-6 text-primary fill-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">রিভিউ ও মতামত</span>
          </div>
          <h2 className="text-3xl font-bold font-heading">তারা আমাদের সম্পর্কে বলেন</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6 space-y-4 relative">
              <Quote className="h-8 w-8 text-primary/10 absolute top-4 right-4" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <p className="text-muted-foreground italic">"{review.text}"</p>
              <div className="flex items-center gap-3">
                {review.image_url ? (
                  <img src={review.image_url} alt={review.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{review.name[0]}</div>
                )}
                <div>
                  <p className="font-medium text-sm">{review.name}</p>
                  {review.role && <p className="text-xs text-muted-foreground">{review.role}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
