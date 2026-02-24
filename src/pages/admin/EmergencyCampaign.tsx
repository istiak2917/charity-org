import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Plus, Clock } from "lucide-react";

const EmergencyCampaign = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", target_amount: "", deadline: "", redirect_url: "", badge_text: "জরুরি" });
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("emergency_campaigns").select("*").order("created_at", { ascending: false });
    setCampaigns(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload: any = { ...form, target_amount: parseFloat(form.target_amount) || 0, is_active: true };
    if (payload.deadline) payload.deadline = new Date(payload.deadline).toISOString();
    else delete payload.deadline;
    const { error } = await supabase.from("emergency_campaigns").insert(payload);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else { toast({ title: "জরুরি ক্যাম্পেইন তৈরি হয়েছে!" }); setOpen(false); load(); }
  };

  const toggle = async (id: string, current: boolean) => {
    await supabase.from("emergency_campaigns").update({ is_active: !current }).eq("id", id);
    load();
  };

  const Countdown = ({ deadline }: { deadline: string }) => {
    const [remaining, setRemaining] = useState("");
    useEffect(() => {
      const calc = () => {
        const diff = new Date(deadline).getTime() - Date.now();
        if (diff <= 0) { setRemaining("সময় শেষ"); return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setRemaining(`${d}দিন ${h}ঘণ্টা ${m}মিনিট`);
      };
      calc();
      const i = setInterval(calc, 60000);
      return () => clearInterval(i);
    }, [deadline]);
    return <span className="text-sm font-mono flex items-center gap-1"><Clock className="h-3 w-3" />{remaining}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <h1 className="text-2xl font-bold font-heading">জরুরি ক্যাম্পেইন</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="destructive" className="gap-2"><Plus className="h-4 w-4" /> নতুন জরুরি ক্যাম্পেইন</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>জরুরি ক্যাম্পেইন তৈরি</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="শিরোনাম *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="বিবরণ" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <Input placeholder="লক্ষ্য পরিমাণ (৳)" type="number" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} />
              <Input type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              <Input placeholder="ডোনেশন রিডাইরেক্ট URL" value={form.redirect_url} onChange={e => setForm({ ...form, redirect_url: e.target.value })} />
              <Input placeholder="ব্যাজ টেক্সট" value={form.badge_text} onChange={e => setForm({ ...form, badge_text: e.target.value })} />
              <Button onClick={save} variant="destructive" className="w-full">তৈরি করুন</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {campaigns.map(c => {
          const pct = c.target_amount > 0 ? Math.round(((c.raised_amount || 0) / c.target_amount) * 100) : 0;
          return (
            <Card key={c.id} className={`p-6 ${c.is_active ? "border-destructive border-2" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{c.title}</h3>
                    {c.is_active && <Badge variant="destructive">{c.badge_text || "জরুরি"}</Badge>}
                  </div>
                  {c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}
                  <div className="flex items-center gap-4">
                    <span className="text-sm">লক্ষ্য: ৳{c.target_amount?.toLocaleString()}</span>
                    <span className="text-sm">সংগৃহীত: ৳{(c.raised_amount || 0).toLocaleString()}</span>
                    {c.deadline && <Countdown deadline={c.deadline} />}
                  </div>
                  <Progress value={pct} className="w-64" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{c.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
                  <Switch checked={c.is_active} onCheckedChange={() => toggle(c.id, c.is_active)} />
                </div>
              </div>
            </Card>
          );
        })}
        {campaigns.length === 0 && <Card className="p-8 text-center text-muted-foreground">কোনো জরুরি ক্যাম্পেইন নেই</Card>}
      </div>
    </div>
  );
};

export default EmergencyCampaign;
