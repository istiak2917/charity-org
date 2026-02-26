import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface GalleryItem {
  id: string; title: string; image_url: string; category: string; tags?: string; caption?: string; [key: string]: any;
}

const GalleryManager = () => {
  const { items, loading, create, update, remove } = useAdminCrud<GalleryItem>({ table: "gallery_items" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState({ title: "", image_url: "", category: "", tags: "", caption: "" });
  const [filterCat, setFilterCat] = useState("সব");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
  const filtered = filterCat === "সব" ? items : items.filter(i => i.category === filterCat);

  const resetForm = () => { setForm({ title: "", image_url: "", category: "", tags: "", caption: "" }); setEditing(null); };

  const handleSubmit = async () => {
    if (!form.image_url) return;
    if (editing) await update(editing.id, form);
    else await create(form);
    setOpen(false); resetForm();
  };

  const handleEdit = (g: GalleryItem) => {
    setEditing(g);
    setForm({ title: g.title || "", image_url: g.image_url, category: g.category || "", tags: g.tags || "", caption: g.caption || "" });
    setOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold font-heading">গ্যালারি ম্যানেজার</h1>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন ছবি</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "সম্পাদনা" : "নতুন ছবি"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="শিরোনাম" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Input placeholder="ছবির URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
                <Input placeholder="ক্যাটাগরি" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                <Input placeholder="ট্যাগ (কমা দিয়ে আলাদা)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                <Input placeholder="ক্যাপশন" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
                <Button onClick={handleSubmit} className="w-full">{editing ? "আপডেট" : "যোগ করুন"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterCat("সব")} className={`px-3 py-1 rounded-full text-xs font-medium ${filterCat === "সব" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>সব ({items.length})</button>
          {categories.map(c => (
            <button key={c} onClick={() => setFilterCat(c)} className={`px-3 py-1 rounded-full text-xs font-medium ${filterCat === c ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{c} ({items.filter(i => i.category === c).length})</button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((g) => (
          <Card key={g.id} className="overflow-hidden group relative">
            <img src={g.image_url} alt={g.title || "Gallery"} className="w-full h-48 object-cover" />
            <div className="p-3 space-y-1">
              <div className="font-medium text-sm truncate">{g.title || "শিরোনামহীন"}</div>
              {g.category && <div className="text-xs text-muted-foreground">{g.category}</div>}
              {g.tags && (
                <div className="flex flex-wrap gap-1">
                  {g.tags.split(",").map((tag: string, i: number) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">{tag.trim()}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleEdit(g)}><Pencil className="h-3 w-3" /></Button>
              <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => remove(g.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center text-muted-foreground py-12">গ্যালারিতে কোনো ছবি নেই</div>}
    </div>
  );
};

export default GalleryManager;
