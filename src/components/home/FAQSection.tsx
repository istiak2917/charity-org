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

const DEMO_FAQS: FAQItem[] = [
  { id: "1", question: "আপনারা কীভাবে কাজ করেন?", answer: "আমরা সুবিধাবঞ্চিত শিশুদের শিক্ষা, স্বাস্থ্য ও খাদ্য সহায়তা দিই। আমাদের স্বেচ্ছাসেবকরা মাঠ পর্যায়ে কাজ করেন।", is_active: true, sort_order: 0 },
  { id: "2", question: "কীভাবে অনুদান দিতে পারি?", answer: "বিকাশ, নগদ, ব্যাংক ট্রান্সফার বা আমাদের ওয়েবসাইটের মাধ্যমে অনুদান দিতে পারেন।", is_active: true, sort_order: 1 },
  { id: "3", question: "স্বেচ্ছাসেবক হতে চাইলে কী করতে হবে?", answer: "আমাদের ওয়েবসাইটে রেজিস্ট্রেশন করুন এবং স্বেচ্ছাসেবক ফর্ম পূরণ করুন। আমরা আপনার সাথে যোগাযোগ করব।", is_active: true, sort_order: 2 },
  { id: "4", question: "অনুদানের অর্থ কোথায় ব্যয় হয়?", answer: "সকল অনুদানের বিস্তারিত হিসাব আমাদের স্বচ্ছতা পেজে প্রকাশ করা হয়। প্রতিটি টাকার হিসাব রাখা হয়।", is_active: true, sort_order: 3 },
];

const FAQSection = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>(DEMO_FAQS);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("setting_key", "homepage_faqs").single();
      if (data) {
        try {
          const raw = typeof data.setting_value === "string" ? JSON.parse(data.setting_value) : data.setting_value;
          const items = (Array.isArray(raw) ? raw : []).filter((f: any) => f.is_active !== false);
          items.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
          if (items.length > 0) setFaqs(items);
        } catch {}
      }
    };
    load();
  }, []);

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
