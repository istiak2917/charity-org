import { useState, useMemo } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, Download } from "lucide-react";

interface Beneficiary {
  id: string; name: string; category: string; project_id?: string;
  description?: string; is_public?: boolean; image_url?: string;
  contact?: string; address?: string; assistance_history?: any[];
  documents?: string[]; created_at: string; [key: string]: any;
}

interface Project { id: string; title: string; [key: string]: any; }

const CATEGORIES = ["শিশু", "শিক্ষার্থী", "পরিবার", "প্রতিবন্ধী", "বয়স্ক", "নারী", "অন্যান্য"];

const BeneficiaryManager = () => {
  const { items, loading, create, update, remove } = useAdminCrud<Beneficiary>({ table: "beneficiaries" });
  const projects = useAdminCrud<Project>({ table: "projects" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Beneficiary | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [detailDialog, setDetailDialog] = useState<Beneficiary | null>(null);
  const [assistanceNote, setAssistanceNote] = useState("");

  const [form, setForm] = useState({
    name: "", category: "শিশু", project_id: "", description: "",
    is_public: false, image_url: "", contact: "", address: "",
    assistance_history: [] as any[], documents: [] as string[],
  });

  const resetForm = () => {
    setForm({ name: "", category: "শিশু", project_id: "", description: "", is_public: false, image_url: "", contact: "", address: "", assistance_history: [], documents: [] });
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.name) return;
    const payload: any = { ...form };
    if (!payload.project_id) delete payload.project_id;
    if (editing) await update(editing.id, payload);
    else await create(payload);
    setOpen(false); resetForm();
  };

  const handleEdit = (b: Beneficiary) => {
    setEditing(b);
    setForm({
      name: b.name || "", category: b.category || "শিশু", project_id: b.project_id || "",
      description: b.description || "", is_public: b.is_public ?? false,
      image_url: b.image_url || "", contact: b.contact || "", address: b.address || "",
      assistance_history: b.assistance_history || [], documents: b.documents || [],
    });
    setOpen(true);
  };

  const addAssistance = async (beneficiary: Beneficiary) => {
    if (!assistanceNote.trim()) return;
    const history = [...(beneficiary.assistance_history || []), {
      date: new Date().toISOString(), note: assistanceNote.trim(),
    }];
    await update(beneficiary.id, { assistance_history: history });
    setAssistanceNote("");
    setDetailDialog({ ...beneficiary, assistance_history: history });
  };

  const filtered = useMemo(() => {
    let list = items;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b => b.name?.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q));
    }
    if (filterCat !== "all") list = list.filter(b => b.category === filterCat);
    return list;
  }, [items, search, filterCat]);

  const exportCSV = () => {
    const headers = "নাম,ক্যাটেগরি,প্রকল্প,ঠিকানা,যোগাযোগ,সাহায্যের সংখ্যা,পাবলিক\n";
    const rows = filtered.map(b => {
      const proj = projects.items.find(p => p.id === b.project_id);
      return `${b.name},${b.category},${proj?.title || ""},${b.address || ""},${b.contact || ""},${(b.assistance_history || []).length},${b.is_public ? "হ্যাঁ" : "না"}`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "beneficiaries.csv"; a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold font-heading">উপকারভোগী ম্যানেজার</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportCSV}><Download className="h-4 w-4" /> CSV</Button>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন উপকারভোগী</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
              <DialogHeader><DialogTitle>{editing ? "সম্পাদনা" : "নতুন উপকারভোগী"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="নাম *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="ক্যাটেগরি" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.project_id} onValueChange={v => setForm({ ...form, project_id: v })}>
                  <SelectTrigger><SelectValue placeholder="প্রকল্প (ঐচ্ছিক)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">কোনো প্রকল্প নেই</SelectItem>
                    {projects.items.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Textarea placeholder="বিবরণ" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="যোগাযোগ" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
                  <Input placeholder="ঠিকানা" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
                <Input placeholder="ছবির URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
                <Input placeholder="ডকুমেন্ট URL (কমা দিয়ে আলাদা)" value={form.documents.join(", ")} onChange={e => setForm({ ...form, documents: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_public} onCheckedChange={v => setForm({ ...form, is_public: v })} />
                  <Label>পাবলিক প্রোফাইল</Label>
                </div>
                <Button onClick={handleSubmit} className="w-full">{editing ? "আপডেট করুন" : "তৈরি করুন"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট উপকারভোগী</div><div className="text-2xl font-bold">{items.length}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">পাবলিক</div><div className="text-2xl font-bold text-green-600">{items.filter(b => b.is_public).length}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">ক্যাটেগরি</div><div className="text-2xl font-bold">{new Set(items.map(b => b.category)).size}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">প্রকল্পে সংযুক্ত</div><div className="text-2xl font-bold">{items.filter(b => b.project_id).length}</div></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="নাম দিয়ে খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>নাম</TableHead><TableHead>ক্যাটেগরি</TableHead><TableHead>প্রকল্প</TableHead>
              <TableHead>সাহায্য</TableHead><TableHead>পাবলিক</TableHead><TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(b => {
              const proj = projects.items.find(p => p.id === b.project_id);
              return (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {b.image_url && <img src={b.image_url} alt={b.name} className="w-8 h-8 rounded-full object-cover" />}
                      <div>
                        <div className="font-medium">{b.name}</div>
                        <div className="text-xs text-muted-foreground">{b.address || ""}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{b.category}</Badge></TableCell>
                  <TableCell>{proj ? <Badge variant="outline">{proj.title}</Badge> : "—"}</TableCell>
                  <TableCell><Badge>{(b.assistance_history || []).length} বার</Badge></TableCell>
                  <TableCell>{b.is_public ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => setDetailDialog(b)}><Eye className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(b)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">কোনো উপকারভোগী নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      {/* Detail + Assistance History Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={v => { if (!v) setDetailDialog(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>{detailDialog?.name} — বিস্তারিত</DialogTitle></DialogHeader>
          {detailDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3"><div className="text-xs text-muted-foreground">ক্যাটেগরি</div><div>{detailDialog.category}</div></Card>
                <Card className="p-3"><div className="text-xs text-muted-foreground">যোগাযোগ</div><div>{detailDialog.contact || "—"}</div></Card>
                <Card className="p-3 col-span-2"><div className="text-xs text-muted-foreground">বিবরণ</div><div className="text-sm">{detailDialog.description || "—"}</div></Card>
              </div>

              {detailDialog.documents && detailDialog.documents.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">ডকুমেন্টস</h4>
                  <div className="flex gap-2 flex-wrap">
                    {detailDialog.documents.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">ডকুমেন্ট {i + 1}</a>
                    ))}
                  </div>
                </div>
              )}

              <h4 className="font-semibold text-sm">সাহায্যের ইতিহাস</h4>
              <div className="space-y-2 max-h-48 overflow-auto">
                {(detailDialog.assistance_history || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((h: any, i: number) => (
                  <div key={i} className="flex gap-2 items-start border-l-2 border-primary pl-3 py-1">
                    <div className="text-xs text-muted-foreground shrink-0">{new Date(h.date).toLocaleDateString("bn-BD")}</div>
                    <div className="text-sm">{h.note}</div>
                  </div>
                ))}
                {(!detailDialog.assistance_history || detailDialog.assistance_history.length === 0) && (
                  <p className="text-sm text-muted-foreground">কোনো ইতিহাস নেই</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input placeholder="নতুন সাহায্যের নোট..." value={assistanceNote} onChange={e => setAssistanceNote(e.target.value)} />
                <Button onClick={() => addAssistance(detailDialog)}>যোগ করুন</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BeneficiaryManager;
