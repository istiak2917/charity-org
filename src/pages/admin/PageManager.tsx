import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";

const DEFAULT_PAGES = [
  { title: "গোপনীয়তা নীতি", slug: "privacy-policy", type: "policy" },
  { title: "শর্তাবলী", slug: "terms-and-conditions", type: "policy" },
  { title: "কুকি নীতি", slug: "cookies-policy", type: "policy" },
  { title: "রিফান্ড নীতি", slug: "refund-policy", type: "policy" },
  { title: "শিশু সুরক্ষা নীতি", slug: "child-protection-policy", type: "policy" },
  { title: "স্বচ্ছতা নীতি", slug: "transparency-policy", type: "policy" },
];

interface Page { id: string; title: string; slug: string; content: string; status: string; type: string; meta_title?: string; meta_description?: string; [key: string]: any; }

const PageManager = () => {
  const { items, loading, create, update, remove } = useAdminCrud<Page>({ table: "pages" });
  const [editPage, setEditPage] = useState<Page | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", content: "", status: "draft", type: "policy", meta_title: "", meta_description: "" });

  const resetForm = () => setForm({ title: "", slug: "", content: "", status: "draft", type: "policy", meta_title: "", meta_description: "" });

  const handleCreate = async () => {
    const ok = await create(form as any);
    if (ok) { resetForm(); setFormOpen(false); }
  };

  const handleUpdate = async () => {
    if (!editPage) return;
    const ok = await update(editPage.id, form as any);
    if (ok) { setEditPage(null); resetForm(); }
  };

  const handleSeedDefaults = async () => {
    const existingSlugs = items.map(p => p.slug);
    for (const def of DEFAULT_PAGES) {
      if (!existingSlugs.includes(def.slug)) {
        await create({ ...def, content: `<p>${def.title} এখানে লিখুন...</p>`, status: "draft" } as any);
      }
    }
  };

  const openEdit = (page: Page) => {
    setEditPage(page);
    setForm({
      title: page.title || "",
      slug: page.slug || "",
      content: page.content || "",
      status: page.status || "draft",
      type: page.type || "policy",
      meta_title: page.meta_title || "",
      meta_description: page.meta_description || "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">পেজ ম্যানেজার</h1>
          <p className="text-muted-foreground">পলিসি ও স্ট্যাটিক পেজ পরিচালনা</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSeedDefaults}>ডিফল্ট পেজ তৈরি</Button>
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" /> নতুন পেজ</Button></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>নতুন পেজ</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="শিরোনাম" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") })} />
                <Input placeholder="স্লাগ (URL)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">ড্রাফট</SelectItem>
                      <SelectItem value="published">প্রকাশিত</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="policy">পলিসি</SelectItem>
                      <SelectItem value="page">সাধারণ পেজ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="Meta Title (SEO)" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} />
                <Input placeholder="Meta Description (SEO)" value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
                <Textarea placeholder="কন্টেন্ট (HTML সাপোর্ট)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} />
                <Button onClick={handleCreate} className="w-full">তৈরি করুন</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      {editPage && (
        <Dialog open={!!editPage} onOpenChange={() => { setEditPage(null); resetForm(); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>পেজ সম্পাদনা</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="শিরোনাম" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input placeholder="স্লাগ (URL)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">ড্রাফট</SelectItem>
                    <SelectItem value="published">প্রকাশিত</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="policy">পলিসি</SelectItem>
                    <SelectItem value="page">সাধারণ পেজ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Meta Title (SEO)" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} />
              <Input placeholder="Meta Description (SEO)" value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
              <Textarea placeholder="কন্টেন্ট (HTML সাপোর্ট)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} />
              <Button onClick={handleUpdate} className="w-full">আপডেট করুন</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <div className="space-y-3">
          {items.map((page) => (
            <Card key={page.id} className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{page.title}</h3>
                  <Badge variant={page.status === "published" ? "default" : "secondary"}>
                    {page.status === "published" ? <><Eye className="h-3 w-3 mr-1" /> প্রকাশিত</> : <><EyeOff className="h-3 w-3 mr-1" /> ড্রাফট</>}
                  </Badge>
                  {page.type && <Badge variant="outline">{page.type}</Badge>}
                </div>
                <div className="text-xs text-muted-foreground mt-1">/page/{page.slug}</div>
              </div>
              <div className="flex gap-1">
                {page.status === "published" && (
                  <a href={`/page/${page.slug}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost"><ExternalLink className="h-4 w-4" /></Button>
                  </a>
                )}
                <Button size="sm" variant="ghost" onClick={() => openEdit(page)}><Edit className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(page.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
          {items.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <p className="mb-3">কোনো পেজ নেই</p>
              <Button variant="outline" onClick={handleSeedDefaults}>ডিফল্ট পলিসি পেজ তৈরি করুন</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PageManager;
