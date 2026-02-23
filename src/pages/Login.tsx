import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingForRoles, setWaitingForRoles] = useState(false);
  const { signIn, user, roles, isAdmin, hasRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect based on role once roles are loaded after login
  useEffect(() => {
    if (waitingForRoles && user && roles.length > 0) {
      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else if (hasRole("volunteer")) {
        navigate("/member/volunteer", { replace: true });
      } else {
        navigate("/member", { replace: true });
      }
      setWaitingForRoles(false);
    }
  }, [waitingForRoles, user, roles, isAdmin, hasRole, navigate]);

  // If already logged in, redirect
  useEffect(() => {
    if (user && roles.length > 0 && !waitingForRoles) {
      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else if (hasRole("volunteer")) {
        navigate("/member/volunteer", { replace: true });
      } else {
        navigate("/member", { replace: true });
      }
    }
  }, [user, roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "লগইন ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফলভাবে লগইন হয়েছে!" });
      setWaitingForRoles(true);
      // Fallback: if roles don't load within 3s, go to member panel
      setTimeout(() => {
        setWaitingForRoles((prev) => {
          if (prev) navigate("/member", { replace: true });
          return false;
        });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border border-border shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-heading text-foreground">লগইন করুন</h1>
          <p className="text-muted-foreground text-sm mt-1">শিশুফুল অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder="ইমেইল" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="পাসওয়ার্ড" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="btn-press w-full gap-2" disabled={loading || waitingForRoles}>
            <LogIn className="h-4 w-4" /> {loading ? "প্রবেশ করা হচ্ছে..." : waitingForRoles ? "রিডাইরেক্ট হচ্ছে..." : "লগইন"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm space-y-2">
          <Link to="/forgot-password" className="text-primary hover:underline block">পাসওয়ার্ড ভুলে গেছেন?</Link>
          <p className="text-muted-foreground">
            অ্যাকাউন্ট নেই? <Link to="/signup" className="text-primary hover:underline">রেজিস্ট্রেশন করুন</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
