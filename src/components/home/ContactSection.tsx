import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

const ContactSection = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customSubtitle, setCustomSubtitle] = useState("");

  useEffect(() => {
    supabase.from("site_settings").select("*").then(({ data }) => {
      if (data) {
        data.forEach((s: any) => {
          const k = s.setting_key || s.key || "";
          const raw = s.setting_value || s.value || "";
          const val = typeof raw === "string" ? raw.replace(/^"|"$/g, "") : String(raw);
          if (k === "contact_section_title" && val) setCustomTitle(val);
          if (k === "contact_section_subtitle" && val) setCustomSubtitle(val);
        });
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload: any = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };
    const subjectVal = formData.get("subject") as string;
    if (subjectVal) payload.subject = subjectVal;
    
    let { error } = await supabase.from("contact_messages").insert(payload);
    if (error?.message?.includes("subject")) {
      delete payload.subject;
      const retry = await supabase.from("contact_messages").insert(payload);
      error = retry.error;
    }

    setLoading(false);
    if (error) {
      toast({ title: t("contact_fail"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("contact_success"), description: t("contact_success_desc") });
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-heading mb-3">{customTitle || t("contact_title")}</h2>
            <p className="text-muted-foreground">{customSubtitle || t("contact_subtitle")}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 bg-card p-8 rounded-xl border border-border">
            <Input name="name" placeholder={t("contact_name")} required />
            <Input name="email" type="email" placeholder={t("contact_email")} required />
            <Input name="subject" placeholder={t("contact_subject")} required />
            <Textarea name="message" placeholder={t("contact_message")} rows={4} required />
            <Button type="submit" className="btn-press w-full gap-2" disabled={loading}>
              <Send className="h-4 w-4" /> {loading ? t("contact_sending") : t("contact_send")}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
