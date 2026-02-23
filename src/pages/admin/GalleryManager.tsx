import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil } from "lucide-react";

interface GalleryItem { id: string; title: string; image_url: string; category: string; caption: string; }

const GalleryManager = () => {
  const { items, loading, create, update, remove } = useAdminCrud<GalleryItem>({ table: "gallery_items" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState({ title: "", image_url: "", category: "", caption: "" });

  const resetForm = () => { setForm({ title: "", image_url: "", category: "", caption: "" }); setEditing(null); };

  const handleSubmit = async () => {
    if (!form.image_url) return;
    if (editing) { await update(editing.id, form); } else { await create(form); }
    setOpen(false); resetForm();
  };

  const handleEdit = (g: GalleryItem) => {
    setEditing(g);
    setForm({ title: g.title || "", image_url: g.image_url, category: g.category || "", caption: g.caption || "" });
    setOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">গ্যালারি ম্যানেজার</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন ছবি</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "ছবি সম্পাদনা" : "নতুন ছবি"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="শিরোনাম" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input placeholder="ছবির URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              <Input placeholder="ক্যাটাগরি" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <Input placeholder="ক্যাপশন" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
              <Button onClick={handleSubmit} className="w-full">{editing ? "আপডেট করুন" : "যোগ করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((g) => (
          <Card key={g.id} className="overflow-hidden group relative">
            <img src={g.image_url} alt={g.title} className="w-full h-40 object-cover" />
            <div className="p-3">
              <div className="text-sm font-medium truncate">{g.title || "Untitled"}</div>
              <div className="text-xs text-muted-foreground">{g.category}</div>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleEdit(g)}><Pencil className="h-3 w-3" /></Button>
              <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => remove(g.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </Card>
        ))}
        {items.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12">কোনো ছবি নেই</div>}
      </div>
    </div>
  );
};

export default GalleryManager;
