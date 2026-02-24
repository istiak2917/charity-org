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
import { useToast } from "@/hooks/use-toast";
import { Heart, Plus, Eye } from "lucide-react";

interface Sponsorship {
  id: string; sponsor_id: string; beneficiary_id: string; amount: number;
  frequency: string; status: string; start_date: string; end_date: string | null; notes: string;
}

const SponsorshipManager = () => {
  const [items, setItems] = useState<Sponsorship[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ sponsor_id: "", beneficiary_id: "", amount: "", frequency: "monthly", notes: "" });
  const { toast } = useToast();

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("sponsorships").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    const { data: b } = await supabase.from("beneficiaries").select("id, name");
    setBeneficiaries(b || []);
    const { data: p } = await supabase.from("profiles").select("id, full_name");
    setProfiles(p || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const save = async () => {
    const payload: any = { ...form, amount: parseFloat(form.amount) || 0, status: "active", start_date: new Date().toISOString().split("T")[0] };
    const { error } = await supabase.from("sponsorships").insert(payload);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else { toast({ title: "স্পনসরশিপ যোগ হয়েছে!" }); setOpen(false); fetch(); }
  };

  const getName = (id: string, list: any[], key = "full_name") => list.find(i => i.id === id)?.[key] || id?.slice(0, 8);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading">স্পনসরশিপ ম্যানেজার</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন স্পনসরশিপ</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>স্পনসরশিপ যোগ করুন</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.sponsor_id} onValueChange={v => setForm({ ...form, sponsor_id: v })}>
                <SelectTrigger><SelectValue placeholder="স্পনসর নির্বাচন" /></SelectTrigger>
                <SelectContent>{profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name || p.id.slice(0, 8)}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.beneficiary_id} onValueChange={v => setForm({ ...form, beneficiary_id: v })}>
                <SelectTrigger><SelectValue placeholder="উপকারভোগী নির্বাচন" /></SelectTrigger>
                <SelectContent>{beneficiaries.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="পরিমাণ (৳)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              <Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">মাসিক</SelectItem>
                  <SelectItem value="quarterly">ত্রৈমাসিক</SelectItem>
                  <SelectItem value="yearly">বার্ষিক</SelectItem>
                  <SelectItem value="one_time">একবার</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="নোট" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              <Button onClick={save} className="w-full">সংরক্ষণ করুন</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{items.filter(i => i.status === "active").length}</div>
          <div className="text-sm text-muted-foreground">সক্রিয় স্পনসরশিপ</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">৳{items.reduce((s, i) => s + (i.amount || 0), 0).toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">মোট স্পনসরশিপ</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{new Set(items.map(i => i.beneficiary_id)).size}</div>
          <div className="text-sm text-muted-foreground">উপকারভোগী</div>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>স্পনসর</TableHead>
              <TableHead>উপকারভোগী</TableHead>
              <TableHead>পরিমাণ</TableHead>
              <TableHead>ফ্রিকোয়েন্সি</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell>{getName(item.sponsor_id, profiles)}</TableCell>
                <TableCell>{getName(item.beneficiary_id, beneficiaries, "name")}</TableCell>
                <TableCell>৳{item.amount?.toLocaleString()}</TableCell>
                <TableCell>{item.frequency === "monthly" ? "মাসিক" : item.frequency === "quarterly" ? "ত্রৈমাসিক" : item.frequency === "yearly" ? "বার্ষিক" : "একবার"}</TableCell>
                <TableCell><Badge variant={item.status === "active" ? "default" : "secondary"}>{item.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}</Badge></TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">কোনো স্পনসরশিপ নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default SponsorshipManager;
