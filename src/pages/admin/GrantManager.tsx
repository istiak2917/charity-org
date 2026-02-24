import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Plus } from "lucide-react";

const GrantManager = () => {
  const [grants, setGrants] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [utilizations, setUtilizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [utilOpen, setUtilOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", source: "", amount: "", project_id: "", description: "", start_date: "", end_date: "" });
  const [utilForm, setUtilForm] = useState({ amount: "", purpose: "" });
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data: g } = await supabase.from("grants").select("*").order("created_at", { ascending: false });
    setGrants(g || []);
    const { data: p } = await supabase.from("projects").select("id, title");
    setProjects(p || []);
    const { data: u } = await supabase.from("grant_utilizations").select("*");
    setUtilizations(u || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload: any = { ...form, amount: parseFloat(form.amount) || 0 };
    if (!payload.project_id) delete payload.project_id;
    const { error } = await supabase.from("grants").insert(payload);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else { toast({ title: "গ্রান্ট যোগ হয়েছে!" }); setOpen(false); setForm({ title: "", source: "", amount: "", project_id: "", description: "", start_date: "", end_date: "" }); load(); }
  };

  const addUtilization = async (grantId: string) => {
    const amt = parseFloat(utilForm.amount) || 0;
    const { error } = await supabase.from("grant_utilizations").insert({ grant_id: grantId, amount: amt, purpose: utilForm.purpose });
    if (!error) {
      const grant = grants.find(g => g.id === grantId);
      if (grant) await supabase.from("grants").update({ utilized: (grant.utilized || 0) + amt }).eq("id", grantId);
      toast({ title: "ব্যবহার রেকর্ড হয়েছে!" }); setUtilOpen(null); setUtilForm({ amount: "", purpose: "" }); load();
    } else toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const totalAmount = grants.reduce((s, g) => s + (g.amount || 0), 0);
  const totalUtilized = grants.reduce((s, g) => s + (g.utilized || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading">গ্রান্ট ম্যানেজমেন্ট</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন গ্রান্ট</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>গ্রান্ট যোগ করুন</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="গ্রান্ট শিরোনাম *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Input placeholder="উৎস (দাতা সংস্থা)" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />
              <Input placeholder="পরিমাণ (৳)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              <Select value={form.project_id} onValueChange={v => setForm({ ...form, project_id: v })}>
                <SelectTrigger><SelectValue placeholder="প্রকল্পের সাথে সংযুক্ত করুন" /></SelectTrigger>
                <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                <Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
              </div>
              <Textarea placeholder="বিবরণ" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <Button onClick={save} className="w-full">সংরক্ষণ করুন</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center"><div className="text-3xl font-bold text-primary">{grants.length}</div><div className="text-sm text-muted-foreground">মোট গ্রান্ট</div></Card>
        <Card className="p-4 text-center"><div className="text-3xl font-bold text-primary">৳{totalAmount.toLocaleString()}</div><div className="text-sm text-muted-foreground">মোট পরিমাণ</div></Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{totalAmount > 0 ? Math.round((totalUtilized / totalAmount) * 100) : 0}%</div>
          <div className="text-sm text-muted-foreground">ব্যবহৃত</div>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>শিরোনাম</TableHead><TableHead>উৎস</TableHead><TableHead>পরিমাণ</TableHead><TableHead>ব্যবহৃত</TableHead><TableHead>অগ্রগতি</TableHead><TableHead>অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {grants.map(g => {
              const pct = g.amount > 0 ? Math.round(((g.utilized || 0) / g.amount) * 100) : 0;
              return (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.title}</TableCell>
                  <TableCell>{g.source || "—"}</TableCell>
                  <TableCell>৳{g.amount?.toLocaleString()}</TableCell>
                  <TableCell>৳{(g.utilized || 0).toLocaleString()}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><Progress value={pct} className="w-20" /><span className="text-xs">{pct}%</span></div></TableCell>
                  <TableCell>
                    <Dialog open={utilOpen === g.id} onOpenChange={o => setUtilOpen(o ? g.id : null)}>
                      <DialogTrigger asChild><Button size="sm" variant="outline">ব্যবহার যোগ</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>গ্রান্ট ব্যবহার রেকর্ড</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <Input placeholder="পরিমাণ (৳)" type="number" value={utilForm.amount} onChange={e => setUtilForm({ ...utilForm, amount: e.target.value })} />
                          <Input placeholder="উদ্দেশ্য" value={utilForm.purpose} onChange={e => setUtilForm({ ...utilForm, purpose: e.target.value })} />
                          <Button onClick={() => addUtilization(g.id)} className="w-full">রেকর্ড করুন</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
            {grants.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">কোনো গ্রান্ট নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default GrantManager;
