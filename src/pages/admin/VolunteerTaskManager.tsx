import { useState, useEffect, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, CheckCircle, Clock, AlertCircle, Filter } from "lucide-react";

interface Task {
  id: string; volunteer_id: string; title: string; description: string;
  status: string; due_date: string; priority?: string; approved_by?: string;
  completion_notes?: string; hours_spent?: number; [key: string]: any;
}
interface Volunteer { id: string; full_name: string; }

const STATUS_OPTIONS = [
  { value: "pending", label: "অপেক্ষমান", color: "secondary" },
  { value: "assigned", label: "অ্যাসাইনড", color: "outline" },
  { value: "in_progress", label: "চলমান", color: "default" },
  { value: "completed", label: "সম্পন্ন", color: "default" },
  { value: "approved", label: "অনুমোদিত", color: "default" },
  { value: "rejected", label: "প্রত্যাখ্যাত", color: "destructive" },
];
const PRIORITY_OPTIONS = [
  { value: "low", label: "নিম্ন" },
  { value: "medium", label: "মাঝারি" },
  { value: "high", label: "উচ্চ" },
  { value: "urgent", label: "জরুরি" },
];

const VolunteerTaskManager = () => {
  const { items, loading, create, update, remove } = useAdminCrud<Task>({ table: "volunteer_tasks" });
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState({
    volunteer_id: "", title: "", description: "", status: "assigned",
    due_date: "", priority: "medium", hours_spent: 0, completion_notes: ""
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVolunteer, setFilterVolunteer] = useState("all");

  useEffect(() => {
    supabase.from("volunteers").select("id, full_name").eq("status", "approved").then(({ data }) => {
      if (data) setVolunteers(data);
    });
  }, []);

  const resetForm = () => {
    setForm({ volunteer_id: "", title: "", description: "", status: "assigned", due_date: "", priority: "medium", hours_spent: 0, completion_notes: "" });
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.volunteer_id) return;
    const payload: any = { ...form };
    if (!payload.priority) delete payload.priority;
    if (!payload.completion_notes) delete payload.completion_notes;
    if (!payload.hours_spent) delete payload.hours_spent;
    if (editing) await update(editing.id, payload);
    else await create(payload);
    setOpen(false);
    resetForm();
  };

  const handleApprove = async (t: Task) => {
    await update(t.id, { status: "approved" } as any);
  };
  const handleReject = async (t: Task) => {
    await update(t.id, { status: "rejected" } as any);
  };

  const getVolunteerName = (id: string) => volunteers.find(v => v.id === id)?.full_name || "-";

  const filteredItems = useMemo(() => {
    return items.filter(t => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterVolunteer !== "all" && t.volunteer_id !== filterVolunteer) return false;
      return true;
    });
  }, [items, filterStatus, filterVolunteer]);

  // Stats
  const stats = useMemo(() => ({
    total: items.length,
    completed: items.filter(t => t.status === "completed" || t.status === "approved").length,
    pending: items.filter(t => t.status === "pending" || t.status === "assigned").length,
    overdue: items.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed" && t.status !== "approved").length,
  }), [items]);

  // Group by volunteer
  const byVolunteer = useMemo(() => {
    const map: Record<string, { name: string; total: number; completed: number; hours: number }> = {};
    items.forEach(t => {
      if (!map[t.volunteer_id]) map[t.volunteer_id] = { name: getVolunteerName(t.volunteer_id), total: 0, completed: 0, hours: 0 };
      map[t.volunteer_id].total++;
      if (t.status === "completed" || t.status === "approved") map[t.volunteer_id].completed++;
      map[t.volunteer_id].hours += (t.hours_spent || 0);
    });
    return Object.values(map).sort((a, b) => b.completed - a.completed);
  }, [items, volunteers]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold font-heading">টাস্ক ম্যানেজার</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> টাস্ক যোগ</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "সম্পাদনা" : "নতুন টাস্ক"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.volunteer_id} onValueChange={(v) => setForm({ ...form, volunteer_id: v })}>
                <SelectTrigger><SelectValue placeholder="স্বেচ্ছাসেবক নির্বাচন" /></SelectTrigger>
                <SelectContent>{volunteers.map(v => <SelectItem key={v.id} value={v.id}>{v.full_name}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="টাস্কের শিরোনাম" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="বিবরণ" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue placeholder="অগ্রাধিকার" /></SelectTrigger>
                  <SelectContent>{PRIORITY_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="ঘণ্টা ব্যয়" value={form.hours_spent || ""} onChange={(e) => setForm({ ...form, hours_spent: Number(e.target.value) })} />
              </div>
              <Textarea placeholder="সম্পন্নতার নোট (ঐচ্ছিক)" value={form.completion_notes} onChange={(e) => setForm({ ...form, completion_notes: e.target.value })} />
              <Button onClick={handleSubmit} className="w-full">{editing ? "আপডেট" : "যোগ করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center"><div className="text-2xl font-bold">{stats.total}</div><div className="text-sm text-muted-foreground">মোট টাস্ক</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-green-600">{stats.completed}</div><div className="text-sm text-muted-foreground">সম্পন্ন</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-amber-500">{stats.pending}</div><div className="text-sm text-muted-foreground">অপেক্ষমান</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-destructive">{stats.overdue}</div><div className="text-sm text-muted-foreground">মেয়াদোত্তীর্ণ</div></Card>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList><TabsTrigger value="tasks">টাস্ক তালিকা</TabsTrigger><TabsTrigger value="summary">ভলান্টিয়ার সামারি</TabsTrigger></TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterVolunteer} onValueChange={setFilterVolunteer}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ভলান্টিয়ার</SelectItem>
                {volunteers.map(v => <SelectItem key={v.id} value={v.id}>{v.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>টাস্ক</TableHead><TableHead>স্বেচ্ছাসেবক</TableHead><TableHead>অগ্রাধিকার</TableHead>
                  <TableHead>ডেডলাইন</TableHead><TableHead>ঘণ্টা</TableHead><TableHead>স্ট্যাটাস</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((t) => {
                  const isOverdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed" && t.status !== "approved";
                  const priorityColor = t.priority === "urgent" ? "destructive" : t.priority === "high" ? "default" : "secondary";
                  const statusOpt = STATUS_OPTIONS.find(s => s.value === t.status);
                  return (
                    <TableRow key={t.id} className={isOverdue ? "bg-destructive/5" : ""}>
                      <TableCell>
                        <div className="font-medium">{t.title}</div>
                        {t.completion_notes && <div className="text-xs text-muted-foreground mt-1">{t.completion_notes}</div>}
                      </TableCell>
                      <TableCell>{getVolunteerName(t.volunteer_id)}</TableCell>
                      <TableCell>
                        <Badge variant={priorityColor as any}>
                          {PRIORITY_OPTIONS.find(p => p.value === t.priority)?.label || t.priority || "মাঝারি"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {isOverdue && <AlertCircle className="h-3 w-3 text-destructive" />}
                          <span className={isOverdue ? "text-destructive" : ""}>{t.due_date ? new Date(t.due_date).toLocaleDateString("bn-BD") : "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{t.hours_spent || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={statusOpt?.color as any || "secondary"}>{statusOpt?.label || t.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {t.status === "completed" && (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => handleApprove(t)}>
                              <CheckCircle className="h-3 w-3 text-green-600" /> অনুমোদন
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive" onClick={() => handleReject(t)}>
                              প্রত্যাখ্যান
                            </Button>
                          </>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => {
                          setEditing(t);
                          setForm({
                            volunteer_id: t.volunteer_id, title: t.title, description: t.description || "",
                            status: t.status, due_date: t.due_date || "", priority: t.priority || "medium",
                            hours_spent: t.hours_spent || 0, completion_notes: t.completion_notes || ""
                          });
                          setOpen(true);
                        }}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredItems.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">কোনো টাস্ক নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">ভলান্টিয়ার ভিত্তিক টাস্ক সামারি</h3>
            <Table>
              <TableHeader>
                <TableRow><TableHead>ভলান্টিয়ার</TableHead><TableHead>মোট</TableHead><TableHead>সম্পন্ন</TableHead><TableHead>ঘণ্টা</TableHead><TableHead>সম্পন্নতা</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {byVolunteer.map((v, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.total}</TableCell>
                    <TableCell>{v.completed}</TableCell>
                    <TableCell>{v.hours}h</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${v.total > 0 ? (v.completed / v.total) * 100 : 0}%` }} />
                        </div>
                        <span className="text-xs">{v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {byVolunteer.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">ডেটা নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VolunteerTaskManager;
