import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const NewsletterWidget = () => {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const { lang } = useLanguage();
  const { toast } = useToast();
  const lb = (bn: string, en: string) => lang === "bn" ? bn : en;

  const handleSubscribe = async () => {
    if (!email.includes("@")) {
      toast({ title: lb("সঠিক ইমেইল দিন", "Enter valid email"), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email, status: "active" });
    if (error && error.message?.includes("duplicate")) {
      toast({ title: lb("ইমেইল আগে থেকেই আছে", "Already subscribed") });
    } else if (error) {
      toast({ title: lb("ত্রুটি হয়েছে", "Error occurred"), variant: "destructive" });
    } else {
      setDone(true);
      toast({ title: lb("সফলভাবে সাবস্ক্রাইব হয়েছে!", "Subscribed successfully!") });
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm text-primary">
        <CheckCircle className="h-4 w-4" /> {lb("ধন্যবাদ! সাবস্ক্রাইব হয়েছে।", "Thanks! You're subscribed.")}
      </div>
    );
  }

  return (
    <div className="flex gap-2 max-w-md">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={lb("ইমেইল দিন", "Enter email")}
          className="pl-9"
          onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
        />
      </div>
      <Button onClick={handleSubscribe} disabled={loading} size="sm">
        {lb("সাবস্ক্রাইব", "Subscribe")}
      </Button>
    </div>
  );
};

export default NewsletterWidget;
