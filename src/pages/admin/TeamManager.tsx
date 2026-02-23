import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface TeamMember {
  id: string; name: string; role: string; image_url: string;
  bio: string; facebook: string; twitter: string; linkedin: string; display_order: number;
}

const TeamManager = () => {
  const { items, loading, create, update, remove } = useAdminCrud<TeamMember>({ table: "team_members", orderBy: "created_at", ascending: true });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState({ name: "", role: "", image_url: "", bio: "", facebook: "", twitter: "", linkedin: "", display_order: 0 });

  const resetForm = () => { setForm({ name: "", role: "", image_url: "", bio: "", facebook: "", twitter: "", linkedin: "", display_order: 0 }); setEditing(null); };

  const handleSubmit = async () => {
    if (!form.name) return;
    if (editing) await update(editing.id, form);
    else await create(form);
    setOpen(false); resetForm();
  };

  const handleEdit = (m: TeamMember) => {
    setEditing(m);
    setForm({ name: m.name, role: m.role || "", image_url: m.image_url || "", bio: m.bio || "", facebook: m.facebook || "", twitter: m.twitter || "", linkedin: m.linkedin || "", display_order: m.display_order });
    setOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">টিম ম্যানেজার</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন মেম্বার</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "মেম্বার সম্পাদনা" : "নতুন মেম্বার"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="নাম" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="পদবী" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              <Input placeholder="ছবির URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              <Textarea placeholder="পরিচিতি" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              <Input placeholder="Facebook URL" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
              <Input placeholder="Twitter URL" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} />
              <Input placeholder="LinkedIn URL" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
              <Input type="number" placeholder="ক্রম" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
              <Button onClick={handleSubmit} className="w-full">{editing ? "আপডেট করুন" : "তৈরি করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>নাম</TableHead><TableHead>পদবী</TableHead><TableHead>ক্রম</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.role || "-"}</TableCell>
                <TableCell>{m.display_order}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(m)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">কোনো টিম মেম্বার নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default TeamManager;
