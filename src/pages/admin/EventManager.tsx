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

interface Event { id: string; title: string; description: string; location: string; event_date: string; image_url: string; is_featured: boolean; [key: string]: any; }

const EventManager = () => {
  const { items, loading, create, update, remove } = useAdminCrud<Event>({ table: "events" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState({ title: "", description: "", location: "", event_date: "", image_url: "", is_featured: false });

  const resetForm = () => { setForm({ title: "", description: "", location: "", event_date: "", image_url: "", is_featured: false }); setEditing(null); };

  const handleSubmit = async () => {
    if (!form.title) return;
    if (editing) await update(editing.id, form);
    else await create(form);
    setOpen(false); resetForm();
  };

  const handleEdit = (e: Event) => {
    setEditing(e);
    setForm({ title: e.title, description: e.description || "", location: e.location || "", event_date: e.event_date || "", image_url: e.image_url || "", is_featured: e.is_featured || false });
    setOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">ইভেন্ট ম্যানেজার</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন ইভেন্ট</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "ইভেন্ট সম্পাদনা" : "নতুন ইভেন্ট"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="ইভেন্টের নাম" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="বিবরণ" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input placeholder="স্থান" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              <Input placeholder="ছবির URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> ফিচার্ড
              </label>
              <Button onClick={handleSubmit} className="w-full">{editing ? "আপডেট করুন" : "তৈরি করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>ইভেন্ট</TableHead><TableHead>স্থান</TableHead><TableHead>তারিখ</TableHead><TableHead>ফিচার্ড</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.title}</TableCell>
                <TableCell>{e.location || "-"}</TableCell>
                <TableCell>{e.event_date ? new Date(e.event_date).toLocaleDateString("bn-BD") : "-"}</TableCell>
                <TableCell>{e.is_featured ? <Badge>হ্যাঁ</Badge> : "-"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(e)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">কোনো ইভেন্ট নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default EventManager;
