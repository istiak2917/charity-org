import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";

interface Report {
  id: string; title: string; report_type: string; file_url: string;
  year: number; [key: string]: any;
}

const ReportsManager = () => {
  const { items, loading, create, update, remove } = useAdminCrud<Report>({ table: "reports" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Report | null>(null);
  const [form, setForm] = useState({ title: "", report_type: "annual", file_url: "", year: new Date().getFullYear() });

  const resetForm = () => { setForm({ title: "", report_type: "annual", file_url: "", year: new Date().getFullYear() }); setEditing(null); };

  const handleSubmit = async () => {
    if (!form.title) return;
    if (editing) await update(editing.id, form);
    else await create(form);
    setOpen(false); resetForm();
  };

  const handleEdit = (r: Report) => {
    setEditing(r);
    setForm({ title: r.title, report_type: r.report_type || "annual", file_url: r.file_url || "", year: r.year || new Date().getFullYear() });
    setOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">রিপোর্ট ম্যানেজার</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন রিপোর্ট</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "সম্পাদনা" : "নতুন রিপোর্ট"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="শিরোনাম" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Select value={form.report_type} onValueChange={(v) => setForm({ ...form, report_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">বার্ষিক</SelectItem>
                  <SelectItem value="financial">আর্থিক</SelectItem>
                  <SelectItem value="project">প্রকল্প</SelectItem>
                  <SelectItem value="audit">অডিট</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="সাল" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
              <Input placeholder="ফাইল URL" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} />
              <Button onClick={handleSubmit} className="w-full">{editing ? "আপডেট" : "যোগ করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>শিরোনাম</TableHead><TableHead>ধরন</TableHead><TableHead>সাল</TableHead><TableHead>ফাইল</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell><Badge variant="secondary">{r.report_type}</Badge></TableCell>
                <TableCell>{r.year}</TableCell>
                <TableCell>
                  {r.file_url ? (
                    <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      দেখুন <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : "-"}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">কোনো রিপোর্ট নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ReportsManager;
