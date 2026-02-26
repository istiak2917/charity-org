import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowUp, ArrowDown, HelpCircle, Star, Save } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
}

interface ReviewItem {
  id: string;
  name: string;
  role: string;
  image_url: string;
  text: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
}

const FAQReviewManager = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_settings").select("*").in("setting_key", ["homepage_faqs", "homepage_reviews"]);
      if (data) {
        data.forEach((s: any) => {
          try {
            const val = typeof s.setting_value === "string" ? JSON.parse(s.setting_value) : s.setting_value;
            if (s.setting_key === "homepage_faqs") setFaqs(Array.isArray(val) ? val : []);
            if (s.setting_key === "homepage_reviews") setReviews(Array.isArray(val) ? val : []);
          } catch {}
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const save = async (key: string, data: any[]) => {
    setSaving(true);
    await supabase.from("site_settings").upsert(
      { setting_key: key, setting_value: JSON.stringify(data) },
      { onConflict: "setting_key" }
    );
    setSaving(false);
    toast({ title: "সেভ হয়েছে!" });
  };

  // FAQ helpers
  const addFaq = () => setFaqs([...faqs, { id: crypto.randomUUID(), question: "", answer: "", is_active: true, sort_order: faqs.length }]);
  const updateFaq = (id: string, u: Partial<FAQItem>) => setFaqs(faqs.map(f => f.id === id ? { ...f, ...u } : f));
  const removeFaq = (id: string) => setFaqs(faqs.filter(f => f.id !== id));
  const moveFaq = (i: number, d: -1 | 1) => { const a = [...faqs]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setFaqs(a); };

  // Review helpers
  const addReview = () => setReviews([...reviews, { id: crypto.randomUUID(), name: "", role: "", image_url: "", text: "", rating: 5, is_active: true, sort_order: reviews.length }]);
  const updateReview = (id: string, u: Partial<ReviewItem>) => setReviews(reviews.map(r => r.id === id ? { ...r, ...u } : r));
  const removeReview = (id: string) => setReviews(reviews.filter(r => r.id !== id));
  const moveReview = (i: number, d: -1 | 1) => { const a = [...reviews]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setReviews(a); };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">FAQ ও রিভিউ ম্যানেজার</h1>

      <Tabs defaultValue="faq">
        <TabsList>
          <TabsTrigger value="faq" className="gap-1"><HelpCircle className="h-4 w-4" /> FAQ</TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1"><Star className="h-4 w-4" /> রিভিউ</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{faqs.length}টি FAQ</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={addFaq} className="gap-1"><Plus className="h-4 w-4" /> FAQ যোগ</Button>
              <Button size="sm" onClick={() => save("homepage_faqs", faqs)} disabled={saving} className="gap-1"><Save className="h-4 w-4" /> সেভ</Button>
            </div>
          </div>
          {faqs.map((faq, i) => (
            <Card key={faq.id} className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">#{i + 1}</span>
                <div className="flex-1" />
                <label className="flex items-center gap-1 text-xs"><Switch checked={faq.is_active} onCheckedChange={v => updateFaq(faq.id, { is_active: v })} /> সক্রিয়</label>
                <Button size="icon" variant="ghost" onClick={() => moveFaq(i, -1)}><ArrowUp className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" onClick={() => moveFaq(i, 1)}><ArrowDown className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeFaq(faq.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <div><Label className="text-xs">প্রশ্ন</Label><Input value={faq.question} onChange={e => updateFaq(faq.id, { question: e.target.value })} placeholder="প্রশ্ন লিখুন" /></div>
              <div><Label className="text-xs">উত্তর</Label><Textarea value={faq.answer} onChange={e => updateFaq(faq.id, { answer: e.target.value })} placeholder="উত্তর লিখুন" rows={3} /></div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{reviews.length}টি রিভিউ</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={addReview} className="gap-1"><Plus className="h-4 w-4" /> রিভিউ যোগ</Button>
              <Button size="sm" onClick={() => save("homepage_reviews", reviews)} disabled={saving} className="gap-1"><Save className="h-4 w-4" /> সেভ</Button>
            </div>
          </div>
          {reviews.map((rev, i) => (
            <Card key={rev.id} className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">#{i + 1}</span>
                <div className="flex-1" />
                <label className="flex items-center gap-1 text-xs"><Switch checked={rev.is_active} onCheckedChange={v => updateReview(rev.id, { is_active: v })} /> সক্রিয়</label>
                <Button size="icon" variant="ghost" onClick={() => moveReview(i, -1)}><ArrowUp className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" onClick={() => moveReview(i, 1)}><ArrowDown className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeReview(rev.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">নাম</Label><Input value={rev.name} onChange={e => updateReview(rev.id, { name: e.target.value })} /></div>
                <div><Label className="text-xs">পদবি/রোল</Label><Input value={rev.role} onChange={e => updateReview(rev.id, { role: e.target.value })} /></div>
                <div><Label className="text-xs">ছবি URL</Label><Input value={rev.image_url} onChange={e => updateReview(rev.id, { image_url: e.target.value })} /></div>
                <div>
                  <Label className="text-xs">রেটিং (১-৫)</Label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => updateReview(rev.id, { rating: n })} className="focus:outline-none">
                        <Star className={`h-5 w-5 ${n <= rev.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div><Label className="text-xs">মন্তব্য</Label><Textarea value={rev.text} onChange={e => updateReview(rev.id, { text: e.target.value })} rows={3} /></div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FAQReviewManager;
