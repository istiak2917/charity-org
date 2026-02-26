import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Eye, EyeOff, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BlogPost {
  id: string; title: string; title_en?: string; content: string; content_en?: string;
  excerpt: string; excerpt_en?: string; image_url: string;
  is_published: boolean; is_featured: boolean; created_at: string; [key: string]: any;
}

const BlogManager = () => {
  const { items, loading, create, update, remove } = useAdminCrud<BlogPost>({ table: "blog_posts" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({
    title: "", title_en: "", content: "", content_en: "",
    excerpt: "", excerpt_en: "", image_url: "",
    is_published: false, is_featured: false,
  });
  const { lang } = useLanguage();
  const lb = (bn: string, en: string) => lang === "bn" ? bn : en;

  const resetForm = () => {
    setForm({ title: "", title_en: "", content: "", content_en: "", excerpt: "", excerpt_en: "", image_url: "", is_published: false, is_featured: false });
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.title) return;
    if (editing) { await update(editing.id, form); } else { await create(form); }
    setOpen(false); resetForm();
  };

  const handleEdit = (p: BlogPost) => {
    setEditing(p);
    setForm({
      title: p.title || "", title_en: p.title_en || "",
      content: p.content || "", content_en: p.content_en || "",
      excerpt: p.excerpt || "", excerpt_en: p.excerpt_en || "",
      image_url: p.image_url || "",
      is_published: p.is_published, is_featured: p.is_featured,
    });
    setOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">{lb("ব্লগ ম্যানেজার", "Blog Manager")}</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> {lb("নতুন পোস্ট", "New Post")}</Button></DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? lb("পোস্ট সম্পাদনা", "Edit Post") : lb("নতুন পোস্ট", "New Post")}</DialogTitle></DialogHeader>
            <Tabs defaultValue="bn">
              <TabsList className="mb-3">
                <TabsTrigger value="bn">বাংলা</TabsTrigger>
                <TabsTrigger value="en" className="gap-1"><Globe className="h-3.5 w-3.5" /> English</TabsTrigger>
              </TabsList>
              <TabsContent value="bn" className="space-y-3">
                <Input placeholder={lb("শিরোনাম (বাংলা)", "Title (Bengali)")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Input placeholder={lb("সংক্ষিপ্ত বিবরণ (বাংলা)", "Excerpt (Bengali)")} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
                <Textarea placeholder={lb("বিস্তারিত কন্টেন্ট (বাংলা)", "Content (Bengali)")} rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </TabsContent>
              <TabsContent value="en" className="space-y-3">
                <Input placeholder="Title (English)" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
                <Input placeholder="Excerpt (English)" value={form.excerpt_en} onChange={(e) => setForm({ ...form, excerpt_en: e.target.value })} />
                <Textarea placeholder="Content (English)" rows={8} value={form.content_en} onChange={(e) => setForm({ ...form, content_en: e.target.value })} />
              </TabsContent>
            </Tabs>
            <div className="space-y-3 mt-3">
              <Input placeholder={lb("ছবির URL", "Image URL")} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> {lb("প্রকাশিত", "Published")}</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> {lb("ফিচার্ড", "Featured")}</label>
              </div>
              <Button onClick={handleSubmit} className="w-full">{editing ? lb("আপডেট করুন", "Update") : lb("তৈরি করুন", "Create")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead>{lb("শিরোনাম", "Title")}</TableHead>
            <TableHead>{lb("ইংরেজি", "English")}</TableHead>
            <TableHead>{lb("স্ট্যাটাস", "Status")}</TableHead>
            <TableHead>{lb("তারিখ", "Date")}</TableHead>
            <TableHead className="text-right">{lb("অ্যাকশন", "Actions")}</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title} {p.is_featured && <Badge className="ml-2">{lb("ফিচার্ড", "Featured")}</Badge>}</TableCell>
                <TableCell>{p.title_en ? <Badge variant="outline" className="gap-1"><Globe className="h-3 w-3" /> {lb("আছে", "Yes")}</Badge> : <span className="text-muted-foreground text-xs">{lb("নেই", "No")}</span>}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => update(p.id, { is_published: !p.is_published } as any)}>
                    {p.is_published ? <><Eye className="h-4 w-4 mr-1" /> {lb("প্রকাশিত", "Published")}</> : <><EyeOff className="h-4 w-4 mr-1" /> {lb("ড্রাফট", "Draft")}</>}
                  </Button>
                </TableCell>
                <TableCell>{new Date(p.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{lb("কোনো ব্লগ পোস্ট নেই", "No blog posts")}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default BlogManager;
