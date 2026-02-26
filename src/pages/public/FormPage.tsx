import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

const FormPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("custom_forms").select("*").eq("slug", slug).eq("is_active", true).single();
      setForm(data);
      setLoading(false);
    };
    load();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const fields = form.config?.fields || [];
    for (const f of fields) {
      if (f.required && !formData[f.label]) {
        toast({ title: `"${f.label}" আবশ্যক`, variant: "destructive" });
        return;
      }
    }
    setSubmitting(true);
    const { error } = await supabase.from("form_submissions").insert({ form_id: form.id, data: formData });
    setSubmitting(false);
    if (error) {
      toast({ title: "জমা দিতে সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!form) return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-4 py-20 text-center"><h1 className="text-2xl font-bold">ফর্ম পাওয়া যায়নি</h1></div><Footer /></div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">{form.config?.success_message || "ফর্ম সফলভাবে জমা হয়েছে!"}</h1>
        </div>
        <Footer />
      </div>
    );
  }

  const fields = form.config?.fields || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{form.title}</h1>
            {form.description && <p className="text-muted-foreground mt-1">{form.description}</p>}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f: any) => (
              <div key={f.id} className={f.width === "half" ? "inline-block w-[48%] mr-[2%] align-top" : ""}>
                <Label>{f.label} {f.required && <span className="text-destructive">*</span>}</Label>
                {f.type === "textarea" ? (
                  <Textarea value={formData[f.label] || ""} onChange={e => setFormData({ ...formData, [f.label]: e.target.value })} placeholder={f.placeholder} />
                ) : f.type === "select" ? (
                  <Select value={formData[f.label] || ""} onValueChange={v => setFormData({ ...formData, [f.label]: v })}>
                    <SelectTrigger><SelectValue placeholder={f.placeholder || "নির্বাচন করুন"} /></SelectTrigger>
                    <SelectContent>{(f.options || []).map((opt: string) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                  </Select>
                ) : f.type === "checkbox" ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input type="checkbox" checked={!!formData[f.label]} onChange={e => setFormData({ ...formData, [f.label]: e.target.checked })} />
                    <span className="text-sm">{f.placeholder || f.label}</span>
                  </div>
                ) : f.type === "radio" ? (
                  <div className="space-y-1 mt-1">
                    {(f.options || []).map((opt: string) => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <input type="radio" name={f.id} checked={formData[f.label] === opt} onChange={() => setFormData({ ...formData, [f.label]: opt })} />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <Input type={f.type} value={formData[f.label] || ""} onChange={e => setFormData({ ...formData, [f.label]: e.target.value })} placeholder={f.placeholder} />
                )}
              </div>
            ))}
            <Button type="submit" disabled={submitting} className="w-full">{submitting ? "জমা হচ্ছে..." : form.config?.submit_text || "জমা দিন"}</Button>
          </form>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default FormPage;
