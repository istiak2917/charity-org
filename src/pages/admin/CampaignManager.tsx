import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Campaign {
  id: string; title: string; description: string; target_amount: number;
  current_amount: number; is_active: boolean; [key: string]: any;
}

const CampaignManager = () => {
  const { items, loading, create, update, remove } = useAdminCrud<Campaign>({ table: "donation_campaigns" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState({ title: "", description: "", target_amount: 0, current_amount: 0, is_active: true });

  const resetForm = () => { setForm({ title: "", description: "", target_amount: 0, current_amount: 0, is_active: true }); setEditing(null); };

  const handleSubmit = async () => {
    if (!form.title) return;
    if (editing) await update(editing.id, form);
    else await create(form);
    setOpen(false); resetForm();
  };

  const handleEdit = (c: Campaign) => {
    setEditing(c);
    setForm({ title: c.title, description: c.description || "", target_amount: c.target_amount, current_amount: c.current_amount, is_active: c.is_active });
    setOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">ক্যাম্পেইন ম্যানেজার</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন ক্যাম্পেইন</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "সম্পাদনা" : "নতুন ক্যাম্পেইন"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="ক্যাম্পেইনের নাম" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="বিবরণ" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="টার্গেট পরিমাণ" value={form.target_amount || ""} onChange={(e) => setForm({ ...form, target_amount: Number(e.target.value) })} />
                <Input type="number" placeholder="সংগৃহীত" value={form.current_amount || ""} onChange={(e) => setForm({ ...form, current_amount: Number(e.target.value) })} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> সক্রিয়
              </label>
              <Button onClick={handleSubmit} className="w-full">{editing ? "আপডেট" : "তৈরি করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead className="min-w-[120px]">ক্যাম্পেইন</TableHead><TableHead className="min-w-[180px]">অগ্রগতি</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell>
                  <div className="space-y-1 min-w-[150px]">
                    <div className="text-xs whitespace-nowrap">৳{(c.current_amount || 0).toLocaleString("bn-BD")} / ৳{(c.target_amount || 0).toLocaleString("bn-BD")}</div>
                    <Progress value={c.target_amount > 0 ? ((c.current_amount || 0) / c.target_amount) * 100 : 0} className="h-2" />
                  </div>
                </TableCell>
                <TableCell><Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</Badge></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">কোনো ক্যাম্পেইন নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default CampaignManager;
