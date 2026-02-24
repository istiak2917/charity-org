import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, MessageSquare } from "lucide-react";

const STATUS_MAP: Record<string, string> = { open: "উন্মুক্ত", in_progress: "চলমান", resolved: "সমাধান", closed: "বন্ধ" };
const PRIORITY_MAP: Record<string, string> = { low: "কম", medium: "মাঝারি", high: "উচ্চ", critical: "জটিল" };

const CaseTracker = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [logOpen, setLogOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", beneficiary_id: "", assigned_worker_id: "", priority: "medium", private_notes: "" });
  const [logText, setLogText] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    const { data: c } = await supabase.from("cases").select("*").order("created_at", { ascending: false });
    setCases(c || []);
    const { data: l } = await supabase.from("case_logs").select("*").order("created_at", { ascending: false });
    setLogs(l || []);
    const { data: p } = await supabase.from("profiles").select("id, full_name");
    setProfiles(p || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const genCaseId = () => `CASE-${Date.now().toString(36).toUpperCase()}`;

  const save = async () => {
    const payload: any = { ...form, case_id: genCaseId(), status: "open" };
    if (!payload.beneficiary_id) delete payload.beneficiary_id;
    if (!payload.assigned_worker_id) delete payload.assigned_worker_id;
    const { error } = await supabase.from("cases").insert(payload);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else { toast({ title: "কেস তৈরি হয়েছে!" }); setOpen(false); setForm({ title: "", beneficiary_id: "", assigned_worker_id: "", priority: "medium", private_notes: "" }); load(); }
  };

  const addLog = async (caseId: string) => {
    if (!logText.trim()) return;
    const { error } = await supabase.from("case_logs").insert({ case_id: caseId, log_text: logText, logged_by: user?.id });
    if (!error) { toast({ title: "লগ যোগ হয়েছে!" }); setLogText(""); load(); }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("cases").update({ status }).eq("id", id);
    load();
  };

  const getName = (id: string) => profiles.find(p => p.id === id)?.full_name || id?.slice(0, 8) || "—";

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading">কেস ট্র্যাকিং</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন কেস</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>নতুন কেস তৈরি</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="কেস শিরোনাম *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Select value={form.assigned_worker_id} onValueChange={v => setForm({ ...form, assigned_worker_id: v })}>
                <SelectTrigger><SelectValue placeholder="সোশ্যাল ওয়ার্কার নির্ধারণ" /></SelectTrigger>
                <SelectContent>{profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name || p.id.slice(0, 8)}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">কম</SelectItem>
                  <SelectItem value="medium">মাঝারি</SelectItem>
                  <SelectItem value="high">উচ্চ</SelectItem>
                  <SelectItem value="critical">জটিল</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="প্রাইভেট নোট" value={form.private_notes} onChange={e => setForm({ ...form, private_notes: e.target.value })} />
              <Button onClick={save} className="w-full">তৈরি করুন</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["open", "in_progress", "resolved", "closed"].map(s => (
          <Card key={s} className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{cases.filter(c => c.status === s).length}</div>
            <div className="text-sm text-muted-foreground">{STATUS_MAP[s]}</div>
          </Card>
        ))}
      </div>

      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>কেস ID</TableHead><TableHead>শিরোনাম</TableHead><TableHead>দায়িত্বপ্রাপ্ত</TableHead><TableHead>প্রায়োরিটি</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead>অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {cases.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">{c.case_id}</TableCell>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell>{getName(c.assigned_worker_id)}</TableCell>
                <TableCell><Badge variant={c.priority === "critical" ? "destructive" : c.priority === "high" ? "default" : "secondary"}>{PRIORITY_MAP[c.priority]}</Badge></TableCell>
                <TableCell>
                  <Select value={c.status} onValueChange={v => updateStatus(c.id, v)}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Dialog open={logOpen === c.id} onOpenChange={o => setLogOpen(o ? c.id : null)}>
                    <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-1"><MessageSquare className="h-3 w-3" />লগ</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>প্রগ্রেস লগ — {c.case_id}</DialogTitle></DialogHeader>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {logs.filter(l => l.case_id === c.id).map(l => (
                          <div key={l.id} className="p-2 bg-muted rounded text-sm">
                            <div>{l.log_text}</div>
                            <div className="text-xs text-muted-foreground mt-1">{new Date(l.created_at).toLocaleString("bn-BD")}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="নতুন লগ এন্ট্রি" value={logText} onChange={e => setLogText(e.target.value)} />
                        <Button onClick={() => addLog(c.id)}>যোগ</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
            {cases.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">কোনো কেস নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default CaseTracker;
