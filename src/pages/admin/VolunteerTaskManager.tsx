import { useState, useEffect } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Task { id: string; volunteer_id: string; title: string; description: string; status: string; due_date: string; }
interface Volunteer { id: string; full_name: string; }

const VolunteerTaskManager = () => {
  const { items, loading, create, update, remove } = useAdminCrud<Task>({ table: "volunteer_tasks" });
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState({ volunteer_id: "", title: "", description: "", status: "pending", due_date: "" });

  useEffect(() => {
    supabase.from("volunteers").select("id, full_name").eq("status", "approved").then(({ data }) => {
      if (data) setVolunteers(data);
    });
  }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.volunteer_id) return;
    if (editing) await update(editing.id, form);
    else await create(form);
    setOpen(false); setEditing(null);
    setForm({ volunteer_id: "", title: "", description: "", status: "pending", due_date: "" });
  };

  const getVolunteerName = (id: string) => volunteers.find(v => v.id === id)?.full_name || "-";

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">টাস্ক ম্যানেজার</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> টাস্ক যোগ</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "সম্পাদনা" : "নতুন টাস্ক"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.volunteer_id} onValueChange={(v) => setForm({ ...form, volunteer_id: v })}>
                <SelectTrigger><SelectValue placeholder="স্বেচ্ছাসেবক নির্বাচন" /></SelectTrigger>
                <SelectContent>{volunteers.map(v => <SelectItem key={v.id} value={v.id}>{v.full_name}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="টাস্কের শিরোনাম" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="বিবরণ" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSubmit} className="w-full">{editing ? "আপডেট" : "যোগ করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>টাস্ক</TableHead><TableHead>স্বেচ্ছাসেবক</TableHead><TableHead>ডেডলাইন</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.title}</TableCell>
                <TableCell>{getVolunteerName(t.volunteer_id)}</TableCell>
                <TableCell>{t.due_date ? new Date(t.due_date).toLocaleDateString("bn-BD") : "-"}</TableCell>
                <TableCell><Badge variant={t.status === "completed" ? "default" : t.status === "in_progress" ? "secondary" : "outline"}>{t.status}</Badge></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(t); setForm({ volunteer_id: t.volunteer_id, title: t.title, description: t.description || "", status: t.status, due_date: t.due_date || "" }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">কোনো টাস্ক নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default VolunteerTaskManager;
