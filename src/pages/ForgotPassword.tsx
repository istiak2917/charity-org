import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "রিসেট লিংক পাঠানো হয়েছে!", description: "আপনার ইমেইল চেক করুন।" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border border-border shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-heading text-foreground">পাসওয়ার্ড রিসেট</h1>
          <p className="text-muted-foreground text-sm mt-1">আপনার ইমেইল দিন, রিসেট লিংক পাঠানো হবে</p>
        </div>
        {sent ? (
          <div className="text-center space-y-4">
            <Mail className="h-12 w-12 text-primary mx-auto" />
            <p className="text-foreground">রিসেট লিংক পাঠানো হয়েছে! আপনার ইমেইল চেক করুন।</p>
            <Link to="/login" className="text-primary hover:underline text-sm">লগইনে ফিরে যান</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="email" placeholder="ইমেইল" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" className="btn-press w-full" disabled={loading}>
              {loading ? "পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান"}
            </Button>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">লগইনে ফিরে যান</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
