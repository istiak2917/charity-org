import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

interface BlogPost { id: string; title: string; content: string; excerpt: string; image_url: string; is_published: boolean; is_featured: boolean; created_at: string; [key: string]: any; }

const BlogManager = () => {
  const { items, loading, create, update, remove } = useAdminCrud<BlogPost>({ table: "blog_posts" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({ title: "", content: "", excerpt: "", image_url: "", is_published: false, is_featured: false });

  const resetForm = () => { setForm({ title: "", content: "", excerpt: "", image_url: "", is_published: false, is_featured: false }); setEditing(null); };

  const handleSubmit = async () => {
    if (!form.title) return;
    if (editing) { await update(editing.id, form); } else { await create(form); }
    setOpen(false); resetForm();
  };

  const handleEdit = (p: BlogPost) => {
    setEditing(p);
    setForm({ title: p.title, content: p.content || "", excerpt: p.excerpt || "", image_url: p.image_url || "", is_published: p.is_published, is_featured: p.is_featured });
    setOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">ব্লগ ম্যানেজার</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন পোস্ট</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "পোস্ট সম্পাদনা" : "নতুন পোস্ট"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="শিরোনাম" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input placeholder="সংক্ষিপ্ত বিবরণ" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
              <Textarea placeholder="বিস্তারিত কন্টেন্ট" rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              <Input placeholder="ছবির URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> প্রকাশিত</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> ফিচার্ড</label>
              </div>
              <Button onClick={handleSubmit} className="w-full">{editing ? "আপডেট করুন" : "তৈরি করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>শিরোনাম</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead>তারিখ</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title} {p.is_featured && <Badge className="ml-2">ফিচার্ড</Badge>}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => update(p.id, { is_published: !p.is_published } as any)}>
                    {p.is_published ? <><Eye className="h-4 w-4 mr-1" /> প্রকাশিত</> : <><EyeOff className="h-4 w-4 mr-1" /> ড্রাফট</>}
                  </Button>
                </TableCell>
                <TableCell>{new Date(p.created_at).toLocaleDateString("bn-BD")}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">কোনো ব্লগ পোস্ট নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default BlogManager;
