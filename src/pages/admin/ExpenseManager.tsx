import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Download } from "lucide-react";

interface Expense { id: string; title: string; amount: number; category: string; description: string; expense_date: string; }
interface Income { id: string; title: string; amount: number; source: string; description: string; income_date: string; }

const ExpenseManager = () => {
  const expenses = useAdminCrud<Expense>({ table: "expenses" });
  const incomes = useAdminCrud<Income>({ table: "income_records" });

  const [expOpen, setExpOpen] = useState(false);
  const [incOpen, setIncOpen] = useState(false);
  const [editExp, setEditExp] = useState<Expense | null>(null);
  const [editInc, setEditInc] = useState<Income | null>(null);

  const [expForm, setExpForm] = useState({ title: "", amount: 0, category: "", description: "", expense_date: "" });
  const [incForm, setIncForm] = useState({ title: "", amount: 0, source: "", description: "", income_date: "" });

  const totalExpense = expenses.items.reduce((s, e) => s + (e.amount || 0), 0);
  const totalIncome = incomes.items.reduce((s, i) => s + (i.amount || 0), 0);

  const handleExpSubmit = async () => {
    if (!expForm.title) return;
    if (editExp) await expenses.update(editExp.id, expForm);
    else await expenses.create(expForm);
    setExpOpen(false); setEditExp(null);
    setExpForm({ title: "", amount: 0, category: "", description: "", expense_date: "" });
  };

  const handleIncSubmit = async () => {
    if (!incForm.title) return;
    if (editInc) await incomes.update(editInc.id, incForm);
    else await incomes.create(incForm);
    setIncOpen(false); setEditInc(null);
    setIncForm({ title: "", amount: 0, source: "", description: "", income_date: "" });
  };

  const exportCSV = (type: "expense" | "income") => {
    const data = type === "expense" ? expenses.items : incomes.items;
    const headers = type === "expense" ? "শিরোনাম,পরিমাণ,ক্যাটাগরি,তারিখ\n" : "শিরোনাম,পরিমাণ,উৎস,তারিখ\n";
    const rows = data.map((d: any) =>
      type === "expense"
        ? `${d.title},${d.amount},${d.category || ""},${d.expense_date || ""}`
        : `${d.title},${d.amount},${d.source || ""},${d.income_date || ""}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${type}s.csv`; a.click();
  };

  if (expenses.loading || incomes.loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">আয়-ব্যয় ম্যানেজমেন্ট</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট আয়</div><div className="text-2xl font-bold text-green-600">৳{totalIncome.toLocaleString("bn-BD")}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট ব্যয়</div><div className="text-2xl font-bold text-red-500">৳{totalExpense.toLocaleString("bn-BD")}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">ব্যালেন্স</div><div className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-500"}`}>৳{(totalIncome - totalExpense).toLocaleString("bn-BD")}</div></Card>
      </div>

      <Tabs defaultValue="expenses">
        <TabsList><TabsTrigger value="expenses">ব্যয়</TabsTrigger><TabsTrigger value="income">আয়</TabsTrigger></TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="gap-2" onClick={() => exportCSV("expense")}><Download className="h-4 w-4" /> CSV</Button>
            <Dialog open={expOpen} onOpenChange={(v) => { setExpOpen(v); if (!v) setEditExp(null); }}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> ব্যয় যোগ</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editExp ? "সম্পাদনা" : "নতুন ব্যয়"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="শিরোনাম" value={expForm.title} onChange={(e) => setExpForm({ ...expForm, title: e.target.value })} />
                  <Input type="number" placeholder="পরিমাণ" value={expForm.amount || ""} onChange={(e) => setExpForm({ ...expForm, amount: Number(e.target.value) })} />
                  <Input placeholder="ক্যাটাগরি" value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })} />
                  <Input type="date" value={expForm.expense_date} onChange={(e) => setExpForm({ ...expForm, expense_date: e.target.value })} />
                  <Textarea placeholder="বিবরণ" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} />
                  <Button onClick={handleExpSubmit} className="w-full">{editExp ? "আপডেট" : "যোগ করুন"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>শিরোনাম</TableHead><TableHead>পরিমাণ</TableHead><TableHead>ক্যাটাগরি</TableHead><TableHead>তারিখ</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
              <TableBody>
                {expenses.items.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell>৳{e.amount}</TableCell>
                    <TableCell>{e.category || "-"}</TableCell>
                    <TableCell>{e.expense_date || "-"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditExp(e); setExpForm({ title: e.title, amount: e.amount, category: e.category || "", description: e.description || "", expense_date: e.expense_date || "" }); setExpOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => expenses.remove(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {expenses.items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">কোনো ব্যয় নেই</TableCell></TableRow>}
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
                    <TableCell>৳{i.amount}</TableCell>
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

export default ExpenseManager;
