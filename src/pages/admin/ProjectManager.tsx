import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Project { id: string; title: string; description: string; image_url: string; category: string; status: string; funding_target: number; funding_current: number; is_urgent: boolean; }

const ProjectManager = () => {
  const { items, loading, create, update, remove } = useAdminCrud<Project>({ table: "projects" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ title: "", description: "", image_url: "", category: "", status: "active", funding_target: 0, is_urgent: false });

  const resetForm = () => { setForm({ title: "", description: "", image_url: "", category: "", status: "active", funding_target: 0, is_urgent: false }); setEditing(null); };

  const handleSubmit = async () => {
    if (!form.title) return;
    if (editing) {
      await update(editing.id, form);
    } else {
      await create(form);
    }
    setOpen(false);
    resetForm();
  };

  const handleEdit = (p: Project) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description || "", image_url: p.image_url || "", category: p.category || "", status: p.status, funding_target: p.funding_target, is_urgent: p.is_urgent });
    setOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">প্রকল্প ম্যানেজার</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> নতুন প্রকল্প</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "প্রকল্প সম্পাদনা" : "নতুন প্রকল্প"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="প্রকল্পের নাম" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="বিবরণ" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input placeholder="ছবির URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              <Input placeholder="ক্যাটাগরি" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <Input type="number" placeholder="ফান্ডিং টার্গেট" value={form.funding_target} onChange={(e) => setForm({ ...form, funding_target: Number(e.target.value) })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_urgent} onChange={(e) => setForm({ ...form, is_urgent: e.target.checked })} /> জরুরি প্রকল্প
              </label>
              <Button onClick={handleSubmit} className="w-full">{editing ? "আপডেট করুন" : "তৈরি করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>নাম</TableHead>
              <TableHead>ক্যাটাগরি</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead>ফান্ডিং</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title} {p.is_urgent && <Badge variant="destructive" className="ml-2">জরুরি</Badge>}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell><Badge variant="secondary">{p.status}</Badge></TableCell>
                <TableCell>৳{p.funding_current}/{p.funding_target}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">কোনো প্রকল্প নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ProjectManager;
