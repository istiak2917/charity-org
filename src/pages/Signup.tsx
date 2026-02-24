import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { UserPlus } from "lucide-react";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast({ title: "শর্তাবলীতে সম্মত হতে হবে", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    if (error) {
      toast({ title: "রেজিস্ট্রেশন ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফলভাবে রেজিস্ট্রেশন হয়েছে!" });

      // Auto-subscribe to newsletter
      if (subscribeNewsletter) {
        try {
          try {
            await supabase.functions.invoke("newsletter-subscribe", {
              body: { email, name: fullName, action: "subscribe" },
            });
          } catch {
            await supabase.from("newsletter_subscribers").upsert(
              { email, name: fullName, status: "active" },
              { onConflict: "email" }
            );
          }
        } catch {}
      }

      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border border-border shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-heading text-foreground">রেজিস্ট্রেশন</h1>
          <p className="text-muted-foreground text-sm mt-1">শিশুফুলে নতুন অ্যাকাউন্ট তৈরি করুন</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="fullName">পুরো নাম <span className="text-destructive">*</span></Label>
            <Input id="fullName" placeholder="আপনার পুরো নাম লিখুন" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">ইমেইল <span className="text-destructive">*</span></Label>
            <Input id="email" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">পাসওয়ার্ড <span className="text-destructive">*</span></Label>
            <Input id="password" type="password" placeholder="কমপক্ষে ৬ অক্ষর" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(!!v)} />
              <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                আমি <Link to="/page/terms-and-conditions" className="text-primary hover:underline" target="_blank">শর্তাবলী</Link> ও <Link to="/page/privacy-policy" className="text-primary hover:underline" target="_blank">গোপনীয়তা নীতি</Link>তে সম্মত
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="newsletter" checked={subscribeNewsletter} onCheckedChange={(v) => setSubscribeNewsletter(!!v)} />
              <Label htmlFor="newsletter" className="text-sm leading-tight cursor-pointer">
                নিউজলেটার সাবস্ক্রাইব করতে চাই
              </Label>
            </div>
          </div>

          <Button type="submit" className="btn-press w-full gap-2" disabled={loading || !agreeTerms}>
            <UserPlus className="h-4 w-4" /> {loading ? "তৈরি হচ্ছে..." : "রেজিস্ট্রেশন করুন"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ইতিমধ্যে অ্যাকাউন্ট আছে? <Link to="/login" className="text-primary hover:underline">লগইন করুন</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
