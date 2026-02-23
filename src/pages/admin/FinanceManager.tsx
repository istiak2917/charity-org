import { useState, useMemo } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Download, TrendingUp, TrendingDown, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

interface Expense {
  id: string; title: string; amount: number; category: string;
  description: string; expense_date: string; status?: string; receipt_url?: string; [key: string]: any;
}
interface Income {
  id: string; title: string; amount: number; source: string;
  description: string; income_date: string; [key: string]: any;
}
interface Donation {
  id: string; amount: number; created_at: string; status: string; campaign_id?: string; [key: string]: any;
}
interface Campaign {
  id: string; title: string; target_amount: number; current_amount: number; is_active: boolean;
}

const EXPENSE_CATEGORIES = ["শিক্ষা", "স্বাস্থ্য", "প্রশাসনিক", "পরিবহন", "ইভেন্ট", "অবকাঠামো", "বেতন", "সরবরাহ", "অন্যান্য"];
const EXPENSE_STATUS = [
  { value: "pending", label: "অনুমোদন বাকি", icon: Clock },
  { value: "approved", label: "অনুমোদিত", icon: CheckCircle },
  { value: "rejected", label: "প্রত্যাখ্যাত", icon: XCircle },
];
const PIE_COLORS = ["hsl(330, 80%, 55%)", "hsl(340, 70%, 60%)", "hsl(38, 80%, 60%)", "hsl(145, 40%, 55%)", "hsl(200, 60%, 70%)", "hsl(270, 50%, 60%)", "hsl(20, 70%, 55%)", "hsl(180, 50%, 50%)", "hsl(60, 60%, 50%)"];

const FinanceManager = () => {
  const expenses = useAdminCrud<Expense>({ table: "expenses" });
  const incomes = useAdminCrud<Income>({ table: "income_records" });
  const donations = useAdminCrud<Donation>({ table: "donations" });
  const campaignsCrud = useAdminCrud<Campaign>({ table: "donation_campaigns" });

  const [expOpen, setExpOpen] = useState(false);
  const [incOpen, setIncOpen] = useState(false);
  const [editExp, setEditExp] = useState<Expense | null>(null);
  const [editInc, setEditInc] = useState<Income | null>(null);

  const [expForm, setExpForm] = useState({ title: "", amount: 0, category: "", description: "", expense_date: "", status: "pending", receipt_url: "" });
  const [incForm, setIncForm] = useState({ title: "", amount: 0, source: "", description: "", income_date: "" });

  const totalExpense = expenses.items.reduce((s, e) => s + (e.amount || 0), 0);
  const totalIncome = incomes.items.reduce((s, i) => s + (i.amount || 0), 0);
  const totalDonation = donations.items.reduce((s, d) => s + (d.amount || 0), 0);
  const netBalance = totalIncome + totalDonation - totalExpense;

  const handleExpSubmit = async () => {
    if (!expForm.title) return;
    const payload: any = { ...expForm };
    if (!payload.receipt_url) delete payload.receipt_url;
    if (!payload.status) delete payload.status;
    if (editExp) await expenses.update(editExp.id, payload);
    else await expenses.create(payload);
    setExpOpen(false); setEditExp(null);
    setExpForm({ title: "", amount: 0, category: "", description: "", expense_date: "", status: "pending", receipt_url: "" });
  };

  const handleIncSubmit = async () => {
    if (!incForm.title) return;
    if (editInc) await incomes.update(editInc.id, incForm);
    else await incomes.create(incForm);
    setIncOpen(false); setEditInc(null);
    setIncForm({ title: "", amount: 0, source: "", description: "", income_date: "" });
  };

  const handleExpStatusChange = async (id: string, status: string) => {
    await expenses.update(id, { status } as any);
  };

  const exportCSV = (type: "expense" | "income") => {
    const data = type === "expense" ? expenses.items : incomes.items;
    const headers = type === "expense" ? "শিরোনাম,পরিমাণ,ক্যাটাগরি,স্ট্যাটাস,তারিখ\n" : "শিরোনাম,পরিমাণ,উৎস,তারিখ\n";
    const rows = data.map((d: any) =>
      type === "expense"
        ? `${d.title},${d.amount},${d.category || ""},${d.status || ""},${d.expense_date || ""}`
        : `${d.title},${d.amount},${d.source || ""},${d.income_date || ""}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${type}s.csv`; a.click();
  };

  // Monthly comparison data
  const monthlyComparison = useMemo(() => {
    const months = ["জানু", "ফেব্রু", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
    const incMap: Record<number, number> = {};
    const expMap: Record<number, number> = {};
    const donMap: Record<number, number> = {};
    incomes.items.forEach(i => { const m = new Date(i.income_date || i.created_at || "").getMonth(); incMap[m] = (incMap[m] || 0) + (i.amount || 0); });
    expenses.items.forEach(e => { const m = new Date(e.expense_date || e.created_at || "").getMonth(); expMap[m] = (expMap[m] || 0) + (e.amount || 0); });
    donations.items.forEach(d => { const m = new Date(d.created_at).getMonth(); donMap[m] = (donMap[m] || 0) + (d.amount || 0); });
    return months.map((month, i) => ({ month, আয়: (incMap[i] || 0) + (donMap[i] || 0), ব্যয়: expMap[i] || 0 }));
  }, [incomes.items, expenses.items, donations.items]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.items.forEach(e => { const c = e.category || "অন্যান্য"; map[c] = (map[c] || 0) + (e.amount || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses.items]);

  // Campaign performance
  const campaignData = useMemo(() => {
    return campaignsCrud.items.map(c => {
      const raised = donations.items.filter(d => d.campaign_id === c.id).reduce((s, d) => s + (d.amount || 0), 0);
      return { name: c.title.slice(0, 15), টার্গেট: c.target_amount, সংগৃহীত: raised };
    });
  }, [campaignsCrud.items, donations.items]);

  if (expenses.loading || incomes.loading || donations.loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">আর্থিক ড্যাশবোর্ড</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-muted text-primary"><TrendingUp className="h-5 w-5" /></div>
          <div><div className="text-xl font-bold">৳{(totalIncome + totalDonation).toLocaleString("bn-BD")}</div><div className="text-xs text-muted-foreground">মোট আয় + অনুদান</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-muted text-destructive"><TrendingDown className="h-5 w-5" /></div>
          <div><div className="text-xl font-bold">৳{totalExpense.toLocaleString("bn-BD")}</div><div className="text-xs text-muted-foreground">মোট ব্যয়</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-muted text-green-600"><DollarSign className="h-5 w-5" /></div>
          <div><div className={`text-xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-destructive"}`}>৳{netBalance.toLocaleString("bn-BD")}</div><div className="text-xs text-muted-foreground">নেট ব্যালেন্স</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-muted text-amber-500"><Clock className="h-5 w-5" /></div>
          <div><div className="text-xl font-bold">{expenses.items.filter(e => e.status === "pending").length}</div><div className="text-xs text-muted-foreground">অনুমোদন বাকি</div></div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">মাসভিত্তিক আয় vs ব্যয়</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyComparison}>
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v: number) => `৳${v.toLocaleString("bn-BD")}`} />
              <Legend />
              <Bar dataKey="আয়" fill="hsl(145, 40%, 55%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ব্যয়" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-4">ব্যয়ের ক্যাটাগরি</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false} fontSize={10}>
                  {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `৳${v.toLocaleString("bn-BD")}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">ডেটা নেই</div>}
        </Card>
      </div>

      {/* Campaign Performance */}
      {campaignData.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">ক্যাম্পেইন পারফরম্যান্স</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={campaignData} layout="vertical">
              <XAxis type="number" fontSize={11} />
              <YAxis dataKey="name" type="category" fontSize={11} width={80} />
              <Tooltip formatter={(v: number) => `৳${v.toLocaleString("bn-BD")}`} />
              <Legend />
              <Bar dataKey="টার্গেট" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="সংগৃহীত" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Expense & Income Tabs */}
      <Tabs defaultValue="expenses">
        <TabsList><TabsTrigger value="expenses">ব্যয় ম্যানেজমেন্ট</TabsTrigger><TabsTrigger value="income">আয়</TabsTrigger></TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="gap-2" onClick={() => exportCSV("expense")}><Download className="h-4 w-4" /> CSV</Button>
            <Dialog open={expOpen} onOpenChange={(v) => { setExpOpen(v); if (!v) setEditExp(null); }}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> ব্যয় যোগ</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{editExp ? "সম্পাদনা" : "নতুন ব্যয়"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="শিরোনাম" value={expForm.title} onChange={(e) => setExpForm({ ...expForm, title: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="number" placeholder="পরিমাণ" value={expForm.amount || ""} onChange={(e) => setExpForm({ ...expForm, amount: Number(e.target.value) })} />
                    <Select value={expForm.category} onValueChange={(v) => setExpForm({ ...expForm, category: v })}>
                      <SelectTrigger><SelectValue placeholder="ক্যাটাগরি" /></SelectTrigger>
                      <SelectContent>{EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="date" value={expForm.expense_date} onChange={(e) => setExpForm({ ...expForm, expense_date: e.target.value })} />
                    <Select value={expForm.status} onValueChange={(v) => setExpForm({ ...expForm, status: v })}>
                      <SelectTrigger><SelectValue placeholder="স্ট্যাটাস" /></SelectTrigger>
                      <SelectContent>{EXPENSE_STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Input placeholder="রসিদ URL (ঐচ্ছিক)" value={expForm.receipt_url} onChange={(e) => setExpForm({ ...expForm, receipt_url: e.target.value })} />
                  <Textarea placeholder="বিবরণ" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} />
                  <Button onClick={handleExpSubmit} className="w-full">{editExp ? "আপডেট" : "যোগ করুন"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>শিরোনাম</TableHead><TableHead>পরিমাণ</TableHead><TableHead>ক্যাটাগরি</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead>তারিখ</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
              <TableBody>
                {expenses.items.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div className="font-medium">{e.title}</div>
                      {e.receipt_url && <a href={e.receipt_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">রসিদ দেখুন</a>}
                    </TableCell>
                    <TableCell className="font-bold">৳{e.amount?.toLocaleString("bn-BD")}</TableCell>
                    <TableCell><Badge variant="outline">{e.category || "-"}</Badge></TableCell>
                    <TableCell>
                      <Select value={e.status || "pending"} onValueChange={(v) => handleExpStatusChange(e.id, v)}>
                        <SelectTrigger className="h-7 w-[120px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>{EXPENSE_STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm">{e.expense_date || "-"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditExp(e); setExpForm({ title: e.title, amount: e.amount, category: e.category || "", description: e.description || "", expense_date: e.expense_date || "", status: e.status || "pending", receipt_url: e.receipt_url || "" }); setExpOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => expenses.remove(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {expenses.items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">কোনো ব্যয় নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="gap-2" onClick={() => exportCSV("income")}><Download className="h-4 w-4" /> CSV</Button>
            <Dialog open={incOpen} onOpenChange={(v) => { setIncOpen(v); if (!v) setEditInc(null); }}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> আয় যোগ</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editInc ? "সম্পাদনা" : "নতুন আয়"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="শিরোনাম" value={incForm.title} onChange={(e) => setIncForm({ ...incForm, title: e.target.value })} />
                  <Input type="number" placeholder="পরিমাণ" value={incForm.amount || ""} onChange={(e) => setIncForm({ ...incForm, amount: Number(e.target.value) })} />
                  <Input placeholder="উৎস" value={incForm.source} onChange={(e) => setIncForm({ ...incForm, source: e.target.value })} />
                  <Input type="date" value={incForm.income_date} onChange={(e) => setIncForm({ ...incForm, income_date: e.target.value })} />
                  <Textarea placeholder="বিবরণ" value={incForm.description} onChange={(e) => setIncForm({ ...incForm, description: e.target.value })} />
                  <Button onClick={handleIncSubmit} className="w-full">{editInc ? "আপডেট" : "যোগ করুন"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>শিরোনাম</TableHead><TableHead>পরিমাণ</TableHead><TableHead>উৎস</TableHead><TableHead>তারিখ</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
              <TableBody>
                {incomes.items.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.title}</TableCell>
                    <TableCell className="font-bold">৳{i.amount?.toLocaleString("bn-BD")}</TableCell>
                    <TableCell>{i.source || "-"}</TableCell>
                    <TableCell>{i.income_date || "-"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditInc(i); setIncForm({ title: i.title, amount: i.amount, source: i.source || "", description: i.description || "", income_date: i.income_date || "" }); setIncOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => incomes.remove(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {incomes.items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">কোনো আয় নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceManager;
