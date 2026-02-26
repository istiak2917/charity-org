import { useState, useMemo } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Plus, Pencil, Trash2, Target, TrendingUp, CheckCircle2, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Project {
  id: string; title: string; description: string; image_url: string; status: string;
  budget?: number; actual_spent?: number; milestones?: any[]; impact_metrics?: any;
  start_date?: string; end_date?: string; [key: string]: any;
}

interface Expense { id: string; amount: number; category: string; project_id?: string; [key: string]: any; }
interface Donation { id: string; amount: number; campaign_id?: string; [key: string]: any; }

const ProjectManager = () => {
  const { items, loading, create, update, remove } = useAdminCrud<Project>({ table: "projects" });
  const expenses = useAdminCrud<Expense>({ table: "expenses" });
  const donations = useAdminCrud<Donation>({ table: "donations" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [milestoneText, setMilestoneText] = useState("");

  const [form, setForm] = useState({
    title: "", description: "", image_url: "", status: "active",
    budget: 0, start_date: "", end_date: "",
    milestones: [] as any[], impact_metrics: {} as any,
  });

  const resetForm = () => {
    setForm({ title: "", description: "", image_url: "", status: "active", budget: 0, start_date: "", end_date: "", milestones: [], impact_metrics: {} });
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.title) return;
    const payload: any = { ...form };
    if (!payload.budget) delete payload.budget;
    if (!payload.start_date) delete payload.start_date;
    if (!payload.end_date) delete payload.end_date;
    if (editing) await update(editing.id, payload);
    else await create(payload);
    setOpen(false); resetForm();
  };

  const handleEdit = (p: Project) => {
    setEditing(p);
    setForm({
      title: p.title, description: p.description || "", image_url: p.image_url || "",
      status: p.status || "active", budget: p.budget || 0,
      start_date: p.start_date || "", end_date: p.end_date || "",
      milestones: p.milestones || [], impact_metrics: p.impact_metrics || {},
    });
    setOpen(true);
  };

  const addMilestone = async (project: Project) => {
    if (!milestoneText.trim()) return;
    const ms = [...(project.milestones || []), { text: milestoneText.trim(), done: false, date: new Date().toISOString() }];
    await update(project.id, { milestones: ms });
    setMilestoneText("");
    setDetailProject({ ...project, milestones: ms });
  };

  const toggleMilestone = async (project: Project, idx: number) => {
    const ms = [...(project.milestones || [])];
    ms[idx] = { ...ms[idx], done: !ms[idx].done, completed_at: !ms[idx].done ? new Date().toISOString() : null };
    await update(project.id, { milestones: ms });
    setDetailProject({ ...project, milestones: ms });
  };

  // Budget vs Actual per project
  const projectMetrics = useMemo(() => {
    return items.map(p => {
      const projectExpenses = expenses.items.filter(e => e.project_id === p.id);
      const actualSpent = projectExpenses.reduce((s, e) => s + (e.amount || 0), 0);
      const budget = p.budget || 0;
      const completedMs = (p.milestones || []).filter((m: any) => m.done).length;
      const totalMs = (p.milestones || []).length;
      return { ...p, actualSpent, budget, completedMs, totalMs };
    });
  }, [items, expenses.items]);

  const budgetChartData = useMemo(() => {
    return projectMetrics.filter(p => p.budget > 0).map(p => ({
      name: p.title.length > 15 ? p.title.slice(0, 15) + "…" : p.title,
      বাজেট: p.budget,
      ব্যয়: p.actualSpent,
    }));
  }, [projectMetrics]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const totalBudget = projectMetrics.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projectMetrics.reduce((s, p) => s + p.actualSpent, 0);
  const activeProjects = items.filter(p => p.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold font-heading">প্রকল্প ম্যানেজার</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন প্রকল্প</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
            <DialogHeader><DialogTitle>{editing ? "প্রকল্প সম্পাদনা" : "নতুন প্রকল্প"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="প্রকল্পের নাম" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="বিবরণ" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <Input placeholder="ছবির URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="স্ট্যাটাস" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} />
                <Input type="number" placeholder="বাজেট (৳)" value={form.budget || ""} onChange={e => setForm({ ...form, budget: Number(e.target.value) })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">শুরুর তারিখ</label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">শেষের তারিখ</label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
              </div>
              <Button onClick={handleSubmit} className="w-full">{editing ? "আপডেট করুন" : "তৈরি করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট প্রকল্প</div><div className="text-2xl font-bold">{items.length}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">সক্রিয়</div><div className="text-2xl font-bold text-green-600">{activeProjects}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট বাজেট</div><div className="text-xl font-bold">৳{totalBudget.toLocaleString("bn-BD")}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট ব্যয়</div><div className="text-xl font-bold text-primary">৳{totalSpent.toLocaleString("bn-BD")}</div></Card>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">তালিকা</TabsTrigger>
          <TabsTrigger value="budget">বাজেট বিশ্লেষণ</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>নাম</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead>বাজেট</TableHead>
                  <TableHead>ব্যয়</TableHead><TableHead>মাইলস্টোন</TableHead><TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectMetrics.map(p => {
                  const budgetPct = p.budget > 0 ? Math.min(100, (p.actualSpent / p.budget) * 100) : 0;
                  const msPct = p.totalMs > 0 ? (p.completedMs / p.totalMs) * 100 : 0;
                  return (
                    <TableRow key={p.id} className="cursor-pointer" onClick={() => setDetailProject(p)}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell><Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                      <TableCell>{p.budget > 0 ? `৳${p.budget.toLocaleString("bn-BD")}` : "—"}</TableCell>
                      <TableCell>
                        {p.budget > 0 ? (
                          <div className="space-y-1">
                            <div className="text-sm">৳{p.actualSpent.toLocaleString("bn-BD")}</div>
                            <Progress value={budgetPct} className="h-1.5" />
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        {p.totalMs > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{p.completedMs}/{p.totalMs}</span>
                            <Progress value={msPct} className="h-1.5 w-16" />
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-right space-x-1" onClick={e => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">কোনো প্রকল্প নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4" /> বাজেট বনাম ব্যয়</h3>
            {budgetChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={budgetChartData}>
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip formatter={(v: number) => `৳${v.toLocaleString("bn-BD")}`} />
                  <Bar dataKey="বাজেট" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ব্যয়" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-[350px] flex items-center justify-center text-muted-foreground">বাজেটসহ কোনো প্রকল্প নেই</div>}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Project Detail Dialog */}
      <Dialog open={!!detailProject} onOpenChange={v => { if (!v) setDetailProject(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>{detailProject?.title} — বিস্তারিত</DialogTitle></DialogHeader>
          {detailProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="p-3"><div className="text-xs text-muted-foreground">স্ট্যাটাস</div><Badge>{detailProject.status}</Badge></Card>
                <Card className="p-3"><div className="text-xs text-muted-foreground">বাজেট</div><div className="font-bold">৳{(detailProject.budget || 0).toLocaleString("bn-BD")}</div></Card>
                <Card className="p-3"><div className="text-xs text-muted-foreground">ব্যয়</div><div className="font-bold text-primary">৳{(projectMetrics.find(p => p.id === detailProject.id)?.actualSpent || 0).toLocaleString("bn-BD")}</div></Card>
              </div>

              {detailProject.budget && detailProject.budget > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>বাজেট ব্যবহার</span>
                    <span>{Math.round(((projectMetrics.find(p => p.id === detailProject.id)?.actualSpent || 0) / detailProject.budget) * 100)}%</span>
                  </div>
                  <Progress value={Math.min(100, ((projectMetrics.find(p => p.id === detailProject.id)?.actualSpent || 0) / detailProject.budget) * 100)} />
                </div>
              )}

              <h4 className="font-semibold text-sm flex items-center gap-2"><Target className="h-4 w-4" /> মাইলস্টোন</h4>
              <div className="space-y-2">
                {(detailProject.milestones || []).map((m: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted" onClick={() => toggleMilestone(detailProject, i)}>
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${m.done ? "text-green-600" : "text-muted-foreground"}`} />
                    <span className={`text-sm flex-1 ${m.done ? "line-through text-muted-foreground" : ""}`}>{m.text}</span>
                    {m.done && m.completed_at && <span className="text-[10px] text-muted-foreground">{new Date(m.completed_at).toLocaleDateString("bn-BD")}</span>}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="নতুন মাইলস্টোন..." value={milestoneText} onChange={e => setMilestoneText(e.target.value)} />
                <Button onClick={() => addMilestone(detailProject)}>যোগ করুন</Button>
              </div>

              {detailProject.description && (
                <div>
                  <h4 className="font-semibold text-sm">বিবরণ</h4>
                  <p className="text-sm text-muted-foreground">{detailProject.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectManager;
