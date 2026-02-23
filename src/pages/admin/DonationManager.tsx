import { useState, useMemo } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Plus, Trash2, Filter, CalendarDays } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Donation {
  id: string; donor_name: string; donor_email: string; amount: number;
  method: string; status: string; created_at: string;
  campaign_id?: string; source?: string; [key: string]: any;
}
interface Campaign {
  id: string; title: string; target_amount: number; current_amount: number; is_active: boolean;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "পেন্ডিং", color: "secondary" },
  { value: "confirmed", label: "নিশ্চিত", color: "default" },
  { value: "completed", label: "সম্পন্ন", color: "default" },
  { value: "refunded", label: "ফেরত", color: "destructive" },
];

const METHOD_OPTIONS = ["বিকাশ", "নগদ", "রকেট", "ব্যাংক ট্রান্সফার", "হাতে হাতে", "অন্যান্য"];
const SOURCE_OPTIONS = ["ওয়েবসাইট", "ইভেন্ট", "সরাসরি", "রেফারেল", "সোশ্যাল মিডিয়া", "অন্যান্য"];
const HEATMAP_COLORS = ["hsl(var(--muted))", "hsl(330 80% 85%)", "hsl(330 80% 70%)", "hsl(330 80% 55%)", "hsl(330 80% 40%)"];
const PIE_COLORS = ["hsl(330, 80%, 55%)", "hsl(340, 70%, 60%)", "hsl(38, 80%, 60%)", "hsl(145, 40%, 55%)", "hsl(200, 60%, 70%)", "hsl(270, 50%, 60%)"];

const DonationManager = () => {
  const { items, loading, create, remove } = useAdminCrud<Donation>({ table: "donations" });
  const campaigns = useAdminCrud<Campaign>({ table: "donation_campaigns" });
  const [donOpen, setDonOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [donForm, setDonForm] = useState({
    donor_name: "", donor_email: "", amount: 0, method: "", status: "confirmed",
    campaign_id: "", source: "",
  });

  const handleDonSubmit = async () => {
    if (!donForm.donor_name || !donForm.amount) return;
    const payload: any = { ...donForm };
    if (!payload.campaign_id) delete payload.campaign_id;
    if (!payload.source) delete payload.source;
    await create(payload);
    setDonOpen(false);
    setDonForm({ donor_name: "", donor_email: "", amount: 0, method: "", status: "confirmed", campaign_id: "", source: "" });
  };

  const exportCSV = () => {
    const headers = "নাম,ইমেইল,পরিমাণ,পদ্ধতি,উৎস,স্ট্যাটাস,ক্যাম্পেইন,তারিখ\n";
    const rows = filteredItems.map((d) => {
      const camp = campaigns.items.find(c => c.id === d.campaign_id);
      return `${d.donor_name},${d.donor_email},${d.amount},${d.method},${d.source || ""},${d.status},${camp?.title || ""},${new Date(d.created_at).toLocaleDateString("bn-BD")}`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "donations.csv"; a.click();
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(d => {
      if (filterStatus !== "all" && d.status !== filterStatus) return false;
      if (filterMethod !== "all" && d.method !== filterMethod) return false;
      return true;
    });
  }, [items, filterStatus, filterMethod]);

  // Monthly breakdown
  const monthlyData = useMemo(() => {
    const months = ["জানু", "ফেব্রু", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
    const map: Record<number, number> = {};
    items.forEach(d => { const m = new Date(d.created_at).getMonth(); map[m] = (map[m] || 0) + (d.amount || 0); });
    return months.map((month, i) => ({ month, amount: map[i] || 0 }));
  }, [items]);

  // Method breakdown for pie chart
  const methodData = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach(d => { const m = d.method || "অন্যান্য"; map[m] = (map[m] || 0) + (d.amount || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [items]);

  // Heatmap data (day of week x week of year for current year)
  const heatmapData = useMemo(() => {
    const year = new Date().getFullYear();
    const dayMap: Record<string, number> = {};
    items.forEach(d => {
      const dt = new Date(d.created_at);
      if (dt.getFullYear() === year) {
        const key = `${dt.getMonth()}-${dt.getDate()}`;
        dayMap[key] = (dayMap[key] || 0) + (d.amount || 0);
      }
    });
    // Build 12 months grid
    const months = ["জানু", "ফেব্রু", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
    const maxVal = Math.max(...Object.values(dayMap), 1);
    return months.map((month, mi) => {
      const daysInMonth = new Date(year, mi + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, di) => {
        const val = dayMap[`${mi}-${di + 1}`] || 0;
        const level = val === 0 ? 0 : Math.min(4, Math.ceil((val / maxVal) * 4));
        return { day: di + 1, amount: val, level };
      });
      return { month, days };
    });
  }, [items]);

  // Campaign performance
  const campaignPerf = useMemo(() => {
    return campaigns.items.map(c => {
      const donations = items.filter(d => d.campaign_id === c.id);
      const raised = donations.reduce((s, d) => s + (d.amount || 0), 0);
      return { ...c, raised, count: donations.length };
    });
  }, [campaigns.items, items]);

  if (loading || campaigns.loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const totalDonations = items.reduce((s, d) => s + (d.amount || 0), 0);
  const confirmedTotal = items.filter(d => d.status === "confirmed" || d.status === "completed").reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold font-heading">অনুদান ম্যানেজার</h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2" onClick={exportCSV}><Download className="h-4 w-4" /> CSV</Button>
          <Dialog open={donOpen} onOpenChange={setDonOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> ম্যানুয়াল এন্ট্রি</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>অনুদান এন্ট্রি</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="দাতার নাম" value={donForm.donor_name} onChange={(e) => setDonForm({ ...donForm, donor_name: e.target.value })} />
                <Input placeholder="ইমেইল" value={donForm.donor_email} onChange={(e) => setDonForm({ ...donForm, donor_email: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="পরিমাণ (৳)" value={donForm.amount || ""} onChange={(e) => setDonForm({ ...donForm, amount: Number(e.target.value) })} />
                  <Select value={donForm.method} onValueChange={(v) => setDonForm({ ...donForm, method: v })}>
                    <SelectTrigger><SelectValue placeholder="পদ্ধতি" /></SelectTrigger>
                    <SelectContent>{METHOD_OPTIONS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={donForm.status} onValueChange={(v) => setDonForm({ ...donForm, status: v })}>
                    <SelectTrigger><SelectValue placeholder="স্ট্যাটাস" /></SelectTrigger>
                    <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={donForm.source} onValueChange={(v) => setDonForm({ ...donForm, source: v })}>
                    <SelectTrigger><SelectValue placeholder="উৎস" /></SelectTrigger>
                    <SelectContent>{SOURCE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Select value={donForm.campaign_id} onValueChange={(v) => setDonForm({ ...donForm, campaign_id: v })}>
                  <SelectTrigger><SelectValue placeholder="ক্যাম্পেইন (ঐচ্ছিক)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">কোনো ক্যাম্পেইন নেই</SelectItem>
                    {campaigns.items.filter(c => c.is_active).map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={handleDonSubmit} className="w-full">যোগ করুন</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট অনুদান</div><div className="text-2xl font-bold text-primary">৳{totalDonations.toLocaleString("bn-BD")}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">নিশ্চিত অনুদান</div><div className="text-2xl font-bold text-green-600">৳{confirmedTotal.toLocaleString("bn-BD")}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট দাতা</div><div className="text-2xl font-bold">{items.length}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">সক্রিয় ক্যাম্পেইন</div><div className="text-2xl font-bold">{campaigns.items.filter(c => c.is_active).length}</div></Card>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="flex-wrap">
          <TabsTrigger value="list">তালিকা</TabsTrigger>
          <TabsTrigger value="charts">চার্ট</TabsTrigger>
          <TabsTrigger value="heatmap">হিটম্যাপ</TabsTrigger>
          <TabsTrigger value="campaigns">ক্যাম্পেইন</TabsTrigger>
        </TabsList>

        {/* LIST TAB */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব পদ্ধতি</SelectItem>
                {METHOD_OPTIONS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground ml-auto">{filteredItems.length} টি ফলাফল</span>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>দাতা</TableHead><TableHead>পরিমাণ</TableHead><TableHead>পদ্ধতি</TableHead>
                  <TableHead>উৎস</TableHead><TableHead>ক্যাম্পেইন</TableHead><TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>তারিখ</TableHead><TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((d) => {
                  const camp = campaigns.items.find(c => c.id === d.campaign_id);
                  const statusOpt = STATUS_OPTIONS.find(s => s.value === d.status);
                  return (
                    <TableRow key={d.id}>
                      <TableCell><div className="font-medium">{d.donor_name || "বেনামী"}</div><div className="text-xs text-muted-foreground">{d.donor_email}</div></TableCell>
                      <TableCell className="font-bold">৳{d.amount?.toLocaleString("bn-BD")}</TableCell>
                      <TableCell>{d.method || "-"}</TableCell>
                      <TableCell><Badge variant="outline">{d.source || "-"}</Badge></TableCell>
                      <TableCell>{camp ? <Badge variant="secondary">{camp.title}</Badge> : "-"}</TableCell>
                      <TableCell><Badge variant={statusOpt?.color as any || "secondary"}>{statusOpt?.label || d.status}</Badge></TableCell>
                      <TableCell className="text-sm">{new Date(d.created_at).toLocaleDateString("bn-BD")}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredItems.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">কোনো অনুদান নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* CHARTS TAB */}
        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><CalendarDays className="h-4 w-4" /> মাসভিত্তিক অনুদান</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip formatter={(v: number) => [`৳${v.toLocaleString("bn-BD")}`, "অনুদান"]} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-4">পদ্ধতি অনুযায়ী অনুদান</h3>
              {methodData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={methodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false} fontSize={11}>
                      {methodData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`৳${v.toLocaleString("bn-BD")}`, "পরিমাণ"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">ডেটা নেই</div>}
            </Card>
          </div>
        </TabsContent>

        {/* HEATMAP TAB */}
        <TabsContent value="heatmap" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">অনুদান হিটম্যাপ ({new Date().getFullYear()})</h3>
            <div className="overflow-x-auto">
              <div className="space-y-3 min-w-[600px]">
                {heatmapData.map((m) => (
                  <div key={m.month} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-12 shrink-0">{m.month}</span>
                    <div className="flex gap-[2px] flex-wrap">
                      {m.days.map((d) => (
                        <div
                          key={d.day}
                          className="w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-150"
                          style={{ background: HEATMAP_COLORS[d.level] }}
                          title={`${m.month} ${d.day}: ৳${d.amount.toLocaleString("bn-BD")}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <span>কম</span>
                {HEATMAP_COLORS.map((c, i) => <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />)}
                <span>বেশি</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* CAMPAIGNS TAB */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaignPerf.map(c => {
              const pct = c.target_amount > 0 ? Math.min(100, Math.round((c.raised / c.target_amount) * 100)) : 0;
              return (
                <Card key={c.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{c.title}</h4>
                    <Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{c.count} জন দাতা</span>
                      <span className="font-medium">৳{c.raised.toLocaleString("bn-BD")} / ৳{c.target_amount.toLocaleString("bn-BD")}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-right text-sm font-bold text-primary">{pct}%</div>
                  </div>
                </Card>
              );
            })}
            {campaignPerf.length === 0 && <div className="col-span-2 text-center text-muted-foreground py-8">কোনো ক্যাম্পেইন নেই</div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DonationManager;
