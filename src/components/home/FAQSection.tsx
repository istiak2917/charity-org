import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
}

const FAQSection = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  useEffect(() => {
    const load = async () => {
      // Load from site_settings
      const { data } = await supabase.from("site_settings").select("*").eq("setting_key", "homepage_faqs").single();
      if (data) {
        try {
          const raw = typeof data.setting_value === "string" ? JSON.parse(data.setting_value) : data.setting_value;
          const items = (Array.isArray(raw) ? raw : []).filter((f: any) => f.is_active !== false);
          items.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
          setFaqs(items);
        } catch {}
      }
    };
    load();
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <HelpCircle className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">সচরাচর জিজ্ঞাসা</span>
          </div>
          <h2 className="text-3xl font-bold font-heading">আপনার প্রশ্নের উত্তর</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="bg-card rounded-lg border px-4">
              <AccordionTrigger className="text-left font-medium hover:no-underline">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
