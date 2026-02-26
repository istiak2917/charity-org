import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send } from "lucide-react";

interface EmailComposeProps {
  to?: string;
  subject?: string;
  body?: string;
  onSent?: () => void;
}

const EmailCompose = ({ to: defaultTo, subject: defaultSubject, body: defaultBody, onSent }: EmailComposeProps) => {
  const [to, setTo] = useState(defaultTo || "");
  const [subject, setSubject] = useState(defaultSubject || "");
  const [body, setBody] = useState(defaultBody || "");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!to || !subject) {
      toast({ title: "ইমেইল ও বিষয় প্রয়োজন", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: { to, subject, body: `<div style="font-family:sans-serif;padding:20px;">${body.replace(/\n/g, "<br/>")}</div>`, type: "manual" },
      });
      if (error) throw error;
      toast({ title: "ইমেইল পাঠানো হয়েছে / কিউতে যোগ হয়েছে ✅" });
      onSent?.();
    } catch (err: any) {
      // Fallback: queue in email_queue table
      await supabase.from("email_queue").insert({ to_email: to, subject, body, type: "manual", status: "queued" });
      toast({ title: "ইমেইল কিউতে যোগ হয়েছে", description: "ইমেইল সার্ভিস কনফিগার করার পর পাঠানো হবে।" });
      onSent?.();
    }
    setSending(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Mail className="h-4 w-4 text-primary" /> ইমেইল পাঠান
      </div>
      <Input placeholder="প্রাপকের ইমেইল" value={to} onChange={(e) => setTo(e.target.value)} type="email" />
      <Input placeholder="বিষয়" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <Textarea placeholder="মেসেজ..." rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
      <Button onClick={handleSend} disabled={sending} className="gap-2">
        <Send className="h-4 w-4" /> {sending ? "পাঠানো হচ্ছে..." : "পাঠান"}
      </Button>
    </div>
  );
};

export default EmailCompose;
