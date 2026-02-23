import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast({ title: "অবৈধ লিংক", variant: "destructive" });
      navigate("/login");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "পাসওয়ার্ড মিলছে না", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "পাসওয়ার্ড পরিবর্তন হয়েছে!" });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border border-border shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-heading text-foreground">নতুন পাসওয়ার্ড সেট করুন</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="password" placeholder="নতুন পাসওয়ার্ড" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input type="password" placeholder="পাসওয়ার্ড নিশ্চিত করুন" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <Button type="submit" className="btn-press w-full" disabled={loading}>
            {loading ? "সেভ হচ্ছে..." : "পাসওয়ার্ড সেভ করুন"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
