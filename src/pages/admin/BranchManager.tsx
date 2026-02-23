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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Building2, BarChart3, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Branch {
  id: string; name: string; code: string; address?: string;
  contact?: string; manager_name?: string; is_active?: boolean;
  created_at: string; [key: string]: any;
}

interface Donation { id: string; amount: number; branch_id?: string; created_at: string; [key: string]: any; }
interface Expense { id: string; amount: number; branch_id?: string; category?: string; created_at: string; [key: string]: any; }
interface Volunteer { id: string; branch_id?: string; [key: string]: any; }

const BranchManager = () => {
  const { items: branches, loading, create, update, remove } = useAdminCrud<Branch>({ table: "branches" });
  const donations = useAdminCrud<Donation>({ table: "donations" });
  const expenses = useAdminCrud<Expense>({ table: "expenses" });
  const volunteers = useAdminCrud<Volunteer>({ table: "volunteers" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [detailBranch, setDetailBranch] = useState<Branch | null>(null);

  const [form, setForm] = useState({
    name: "", code: "", address: "", contact: "", manager_name: "", is_active: true,
  });

  const resetForm = () => {
    setForm({ name: "", code: "", address: "", contact: "", manager_name: "", is_active: true });
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.code) return;
    if (editing) await update(editing.id, form);
    else await create(form);
    setOpen(false); resetForm();
  };

  const handleEdit = (b: Branch) => {
    setEditing(b);
    setForm({
      name: b.name, code: b.code || "", address: b.address || "",
      contact: b.contact || "", manager_name: b.manager_name || "",
      is_active: b.is_active ?? true,
    });
    setOpen(true);
  };

  // Per-branch metrics
  const branchMetrics = useMemo(() => {
    return branches.map(b => {
      const branchDon = donations.items.filter(d => d.branch_id === b.id);
      const branchExp = expenses.items.filter(e => e.branch_id === b.id);
      const branchVol = volunteers.items.filter(v => v.branch_id === b.id);
      const totalDonation = branchDon.reduce((s, d) => s + (d.amount || 0), 0);
      const totalExpense = branchExp.reduce((s, e) => s + (e.amount || 0), 0);
      return {
        ...b,
        totalDonation,
        totalExpense,
        netBalance: totalDonation - totalExpense,
        volunteerCount: branchVol.length,
        donationCount: branchDon.length,
      };
    });
  }, [branches, donations.items, expenses.items, volunteers.items]);

  // Master overview chart
  const chartData = useMemo(() =>
    branchMetrics.filter(b => b.totalDonation > 0 || b.totalExpense > 0).map(b => ({
      name: b.name.length > 12 ? b.name.slice(0, 12) + "…" : b.name,
      অনুদান: b.totalDonation,
      ব্যয়: b.totalExpense,
    })),
  [branchMetrics]);

  // Totals
  const totalDonAll = branchMetrics.reduce((s, b) => s + b.totalDonation, 0);
  const totalExpAll = branchMetrics.reduce((s, b) => s + b.totalExpense, 0);
  const totalVolAll = branchMetrics.reduce((s, b) => s + b.volunteerCount, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold font-heading">শাখা ম্যানেজার</h1>
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন শাখা</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "শাখা সম্পাদনা" : "নতুন শাখা"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="শাখার নাম *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="শাখা কোড *" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
              <Input placeholder="ঠিকানা" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="যোগাযোগ" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
                <Input placeholder="ম্যানেজারের নাম" value={form.manager_name} onChange={e => setForm({ ...form, manager_name: e.target.value })} />
              </div>
              <Button onClick={handleSubmit} className="w-full">{editing ? "আপডেট করুন" : "তৈরি করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Master Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট শাখা</div><div className="text-2xl font-bold">{branches.length}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">সর্বমোট অনুদান</div><div className="text-2xl font-bold text-primary">৳{totalDonAll.toLocaleString("bn-BD")}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">সর্বমোট ব্যয়</div><div className="text-2xl font-bold text-destructive">৳{totalExpAll.toLocaleString("bn-BD")}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট স্বেচ্ছাসেবক</div><div className="text-2xl font-bold">{totalVolAll}</div></Card>
      </div>

      <Tabs defaultValue="branches">
        <TabsList>
          <TabsTrigger value="branches">শাখা তালিকা</TabsTrigger>
          <TabsTrigger value="overview">মাস্টার ওভারভিউ</TabsTrigger>
        </TabsList>

        <TabsContent value="branches">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>শাখা</TableHead><TableHead>কোড</TableHead><TableHead>অনুদান</TableHead>
                  <TableHead>ব্যয়</TableHead><TableHead>ব্যালেন্স</TableHead><TableHead>স্বেচ্ছাসেবক</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead><TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchMetrics.map(b => (
                  <TableRow key={b.id} className="cursor-pointer" onClick={() => setDetailBranch(b)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <div className="font-medium">{b.name}</div>
                          {b.address && <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{b.address}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{b.code}</Badge></TableCell>
                    <TableCell className="font-bold text-primary">৳{b.totalDonation.toLocaleString("bn-BD")}</TableCell>
                    <TableCell>৳{b.totalExpense.toLocaleString("bn-BD")}</TableCell>
                    <TableCell className={b.netBalance >= 0 ? "text-green-600 font-bold" : "text-destructive font-bold"}>
                      ৳{b.netBalance.toLocaleString("bn-BD")}
                    </TableCell>
                    <TableCell>{b.volunteerCount}</TableCell>
                    <TableCell><Badge variant={b.is_active ? "default" : "secondary"}>{b.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</Badge></TableCell>
                    <TableCell className="text-right space-x-1" onClick={e => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(b)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {branches.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">কোনো শাখা নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4" /> শাখা অনুযায়ী অনুদান ও ব্যয়</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip formatter={(v: number) => `৳${v.toLocaleString("bn-BD")}`} />
                  <Bar dataKey="অনুদান" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ব্যয়" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-[350px] flex items-center justify-center text-muted-foreground">শাখায় কোনো আর্থিক ডেটা নেই</div>}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Branch Detail Dialog */}
      <Dialog open={!!detailBranch} onOpenChange={v => { if (!v) setDetailBranch(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> {detailBranch?.name}</DialogTitle></DialogHeader>
          {detailBranch && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3"><div className="text-xs text-muted-foreground">কোড</div><div className="font-bold">{detailBranch.code}</div></Card>
                <Card className="p-3"><div className="text-xs text-muted-foreground">ম্যানেজার</div><div>{detailBranch.manager_name || "—"}</div></Card>
                <Card className="p-3"><div className="text-xs text-muted-foreground">ঠিকানা</div><div className="text-sm">{detailBranch.address || "—"}</div></Card>
                <Card className="p-3"><div className="text-xs text-muted-foreground">যোগাযোগ</div><div className="text-sm">{detailBranch.contact || "—"}</div></Card>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 text-center"><div className="text-xs text-muted-foreground">অনুদান</div><div className="font-bold text-primary">৳{(branchMetrics.find(b => b.id === detailBranch.id)?.totalDonation || 0).toLocaleString("bn-BD")}</div></Card>
                <Card className="p-3 text-center"><div className="text-xs text-muted-foreground">ব্যয়</div><div className="font-bold">৳{(branchMetrics.find(b => b.id === detailBranch.id)?.totalExpense || 0).toLocaleString("bn-BD")}</div></Card>
                <Card className="p-3 text-center"><div className="text-xs text-muted-foreground">স্বেচ্ছাসেবক</div><div className="font-bold">{branchMetrics.find(b => b.id === detailBranch.id)?.volunteerCount || 0}</div></Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchManager;
