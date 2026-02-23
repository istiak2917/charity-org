import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      toast({ title: "রেজিস্ট্রেশন ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফলভাবে রেজিস্ট্রেশন হয়েছে!" });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border border-border shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-heading text-foreground">রেজিস্ট্রেশন</h1>
          <p className="text-muted-foreground text-sm mt-1">শিশুফুলে নতুন অ্যাকাউন্ট তৈরি করুন</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="পুরো নাম" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input type="email" placeholder="ইমেইল" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="btn-press w-full gap-2" disabled={loading}>
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
