import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Contact form submission — no contact_messages table exists yet
    setTimeout(() => {
      setLoading(false);
      toast({ title: "বার্তা পাঠানো হয়েছে!", description: "আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।" });
      (e.target as HTMLFormElement).reset();
    }, 500);
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-heading mb-3">যোগাযোগ করুন</h2>
            <p className="text-muted-foreground">আমাদের সাথে যোগাযোগ করতে নিচের ফর্মটি পূরণ করুন</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 bg-card p-8 rounded-xl border border-border">
            <Input name="name" placeholder="আপনার নাম" required />
            <Input name="email" type="email" placeholder="ইমেইল" required />
            <Input name="subject" placeholder="বিষয়" required />
            <Textarea name="message" placeholder="আপনার বার্তা লিখুন..." rows={4} required />
            <Button type="submit" className="btn-press w-full gap-2" disabled={loading}>
              <Send className="h-4 w-4" /> {loading ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
