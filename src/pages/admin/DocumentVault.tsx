import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FolderLock, Plus, Download, Trash2, Upload } from "lucide-react";

const CATEGORIES: Record<string, string> = { general: "সাধারণ", finance: "আর্থিক", legal: "আইনি", hr: "এইচআর", project: "প্রকল্প" };
const VISIBILITY: Record<string, string> = { admin: "শুধু অ্যাডমিন", editor: "এডিটর+", all: "সকল সদস্য" };

const DocumentVault = () => {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", category: "general", visibility: "admin" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
    setDocs(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!file || !form.title) { toast({ title: "ফাইল ও শিরোনাম দিন", variant: "destructive" }); return; }
    setUploading(true);
    const path = `${Date.now()}-${file.name}`;
    const { error: ue } = await supabase.storage.from("documents").upload(path, file);
    if (ue) { toast({ title: "আপলোড ব্যর্থ", description: ue.message, variant: "destructive" }); setUploading(false); return; }
    const { data: url } = supabase.storage.from("documents").getPublicUrl(path);
    const { error } = await supabase.from("documents").insert({ ...form, file_url: url.publicUrl, file_name: file.name, uploaded_by: user?.id });
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else { toast({ title: "ডকুমেন্ট আপলোড হয়েছে!" }); setOpen(false); setFile(null); setForm({ title: "", category: "general", visibility: "admin" }); load(); }
    setUploading(false);
  };

  const remove = async (id: string) => {
    await supabase.from("documents").delete().eq("id", id);
    toast({ title: "মুছে ফেলা হয়েছে!" });
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderLock className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading">ডকুমেন্ট ভল্ট</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> আপলোড</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>ডকুমেন্ট আপলোড</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="শিরোনাম *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" id="doc-file" />
                <label htmlFor="doc-file" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{file ? file.name : "ফাইল নির্বাচন করুন"}</span>
                </label>
              </div>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.visibility} onValueChange={v => setForm({ ...form, visibility: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(VISIBILITY).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={upload} disabled={uploading} className="w-full">{uploading ? "আপলোড হচ্ছে..." : "আপলোড করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>শিরোনাম</TableHead><TableHead>ক্যাটাগরি</TableHead><TableHead>দৃশ্যমানতা</TableHead><TableHead>ভার্সন</TableHead><TableHead>তারিখ</TableHead><TableHead>অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {docs.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.title}</TableCell>
                <TableCell><Badge variant="outline">{CATEGORIES[d.category] || d.category}</Badge></TableCell>
                <TableCell><Badge variant="secondary">{VISIBILITY[d.visibility] || d.visibility}</Badge></TableCell>
                <TableCell>v{d.version}</TableCell>
                <TableCell className="text-sm">{new Date(d.created_at).toLocaleDateString("bn-BD")}</TableCell>
                <TableCell className="flex gap-1">
                  {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer"><Button size="sm" variant="outline"><Download className="h-3 w-3" /></Button></a>}
                  <Button size="sm" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {docs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">কোনো ডকুমেন্ট নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default DocumentVault;
