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
import { Download, Plus, Trash2, Filter, CalendarDays, Printer, Mail, MessageCircle } from "lucide-react";
import DonationReceipt from "@/components/DonationReceipt";
import EmailCompose from "@/components/EmailCompose";
import WhatsAppSend from "@/components/WhatsAppSend";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

interface Donation {
  id: string; donor_name: string; donor_email: string; amount: number;
  method: string; status: string; created_at: string;
  campaign_id?: string; source?: string; [key: string]: any;
}
interface Campaign {
  id: string; title: string; target_amount: number; current_amount: number; is_active: boolean;
}

const HEATMAP_COLORS = ["hsl(var(--muted))", "hsl(330 80% 85%)", "hsl(330 80% 70%)", "hsl(330 80% 55%)", "hsl(330 80% 40%)"];
const PIE_COLORS = ["hsl(330, 80%, 55%)", "hsl(340, 70%, 60%)", "hsl(38, 80%, 60%)", "hsl(145, 40%, 55%)", "hsl(200, 60%, 70%)", "hsl(270, 50%, 60%)"];

const DonationManager = () => {
  const { t, lang } = useLanguage();
  const { items, loading, create, remove } = useAdminCrud<Donation>({ table: "donations" });
  const campaigns = useAdminCrud<Campaign>({ table: "donation_campaigns" });
  const [donOpen, setDonOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [receiptDonation, setReceiptDonation] = useState<Donation | null>(null);
  const [emailDonation, setEmailDonation] = useState<Donation | null>(null);
  const [waDonation, setWaDonation] = useState<Donation | null>(null);
  const [filterMethod, setFilterMethod] = useState("all");
  const [donForm, setDonForm] = useState({
    donor_name: "", donor_email: "", amount: 0, method: "", status: "confirmed",
    campaign_id: "", source: "",
  });

  const STATUS_OPTIONS = [
    { value: "pending", label: t("status_pending"), color: "secondary" },
    { value: "confirmed", label: t("status_confirmed"), color: "default" },
    { value: "completed", label: t("status_completed"), color: "default" },
    { value: "refunded", label: t("status_refunded"), color: "destructive" },
  ];

  const METHOD_OPTIONS = ["বিকাশ", "নগদ", "রকেট", "ব্যাংক ট্রান্সফার", "হাতে হাতে", "অন্যান্য"];
  const SOURCE_OPTIONS = ["ওয়েবসাইট", "ইভেন্ট", "সরাসরি", "রেফারেল", "সোশ্যাল মিডিয়া", "অন্যান্য"];

  const locale = lang === "bn" ? "bn-BD" : "en-US";

  const handleDonSubmit = async () => {
    if (!donForm.donor_name || !donForm.amount) return;
    const payload: any = { ...donForm };
    if (!payload.campaign_id) delete payload.campaign_id;
    if (!payload.source) delete payload.source;
    await create(payload);
    setDonForm({ donor_name: "", donor_email: "", amount: 0, method: "", status: "confirmed", campaign_id: "", source: "" });
    setDonOpen(false);
  };

  const exportCSV = () => {
    const headers = ["donor_name", "donor_email", "amount", "method", "status", "created_at"];
    const rows = items.map(d => headers.map(h => String(d[h] || "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "donations.csv"; a.click();
  };

  const filteredItems = useMemo(() => {
    let list = [...items];
    if (filterStatus !== "all") list = list.filter(d => d.status === filterStatus);
    if (filterMethod !== "all") list = list.filter(d => d.method === filterMethod);
    return list;
  }, [items, filterStatus, filterMethod]);

  const monthlyData = useMemo(() => {
    const monthKeys = ["month_jan","month_feb","month_mar","month_apr","month_may","month_jun","month_jul","month_aug","month_sep","month_oct","month_nov","month_dec"];
    return monthKeys.map((key, i) => {
      const sum = items.filter(d => new Date(d.created_at).getMonth() === i).reduce((s, d) => s + (d.amount || 0), 0);
      return { month: t(key), amount: sum };
    });
  }, [items, t]);

  const methodData = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach(d => { if (d.method) map[d.method] = (map[d.method] || 0) + (d.amount || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [items]);

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
    const monthKeys = ["month_jan","month_feb","month_mar","month_apr","month_may","month_jun","month_jul","month_aug","month_sep","month_oct","month_nov","month_dec"];
    const maxVal = Math.max(...Object.values(dayMap), 1);
    return monthKeys.map((key, mi) => {
      const daysInMonth = new Date(year, mi + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, di) => {
        const val = dayMap[`${mi}-${di + 1}`] || 0;
        const level = val === 0 ? 0 : Math.min(4, Math.ceil((val / maxVal) * 4));
        return { day: di + 1, amount: val, level };
      });
      return { month: t(key), days };
    });
  }, [items, t]);

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
        <h1 className="text-2xl font-bold font-heading">{t("don_mgr_title")}</h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2" onClick={exportCSV}><Download className="h-4 w-4" /> CSV</Button>
          <Dialog open={donOpen} onOpenChange={setDonOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> {t("don_mgr_manual_entry")}</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{t("don_mgr_entry_title")}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder={t("don_mgr_donor_name")} value={donForm.donor_name} onChange={(e) => setDonForm({ ...donForm, donor_name: e.target.value })} />
                <Input placeholder={t("contact_email")} value={donForm.donor_email} onChange={(e) => setDonForm({ ...donForm, donor_email: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder={t("don_mgr_amount")} value={donForm.amount || ""} onChange={(e) => setDonForm({ ...donForm, amount: Number(e.target.value) })} />
                  <Select value={donForm.method} onValueChange={(v) => setDonForm({ ...donForm, method: v })}>
                    <SelectTrigger><SelectValue placeholder={t("don_mgr_method")} /></SelectTrigger>
                    <SelectContent>{METHOD_OPTIONS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={donForm.status} onValueChange={(v) => setDonForm({ ...donForm, status: v })}>
                    <SelectTrigger><SelectValue placeholder={t("don_mgr_status")} /></SelectTrigger>
                    <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={donForm.source} onValueChange={(v) => setDonForm({ ...donForm, source: v })}>
                    <SelectTrigger><SelectValue placeholder={t("don_mgr_source")} /></SelectTrigger>
                    <SelectContent>{SOURCE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Select value={donForm.campaign_id} onValueChange={(v) => setDonForm({ ...donForm, campaign_id: v })}>
                  <SelectTrigger><SelectValue placeholder={t("don_mgr_campaign_optional")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("don_mgr_no_campaign")}</SelectItem>
                    {campaigns.items.filter(c => c.is_active).map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={handleDonSubmit} className="w-full">{t("common_add")}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">{t("don_mgr_total_donations")}</div><div className="text-2xl font-bold text-primary">৳{totalDonations.toLocaleString(locale)}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">{t("don_mgr_confirmed")}</div><div className="text-2xl font-bold text-green-600">৳{confirmedTotal.toLocaleString(locale)}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">{t("don_mgr_total_donors")}</div><div className="text-2xl font-bold">{items.length}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">{t("don_mgr_active_campaigns")}</div><div className="text-2xl font-bold">{campaigns.items.filter(c => c.is_active).length}</div></Card>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="flex-wrap">
          <TabsTrigger value="list">{t("don_mgr_list")}</TabsTrigger>
          <TabsTrigger value="charts">{t("don_mgr_charts")}</TabsTrigger>
          <TabsTrigger value="heatmap">{t("don_mgr_heatmap")}</TabsTrigger>
          <TabsTrigger value="campaigns">{t("don_mgr_campaigns")}</TabsTrigger>
        </TabsList>

        {/* LIST TAB */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("don_mgr_all_status")}</SelectItem>
                {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("don_mgr_all_methods")}</SelectItem>
                {METHOD_OPTIONS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground ml-auto">{filteredItems.length} {t("don_mgr_results")}</span>
          </div>
          <Card className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("don_mgr_donor")}</TableHead><TableHead>{t("don_mgr_amount")}</TableHead><TableHead>{t("don_mgr_method")}</TableHead>
                  <TableHead>{t("don_mgr_source")}</TableHead><TableHead>{t("don_mgr_campaigns")}</TableHead><TableHead>{t("don_mgr_status")}</TableHead>
                  <TableHead>{t("don_mgr_date")}</TableHead><TableHead className="text-right">{t("don_mgr_action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((d) => {
                  const camp = campaigns.items.find(c => c.id === d.campaign_id);
                  const statusOpt = STATUS_OPTIONS.find(s => s.value === d.status);
                  return (
                    <TableRow key={d.id}>
                      <TableCell><div className="font-medium">{d.donor_name || t("don_mgr_anonymous")}</div><div className="text-xs text-muted-foreground">{d.donor_email}</div></TableCell>
                      <TableCell className="font-bold">৳{d.amount?.toLocaleString(locale)}</TableCell>
                      <TableCell>{d.method || "-"}</TableCell>
                      <TableCell><Badge variant="outline">{d.source || "-"}</Badge></TableCell>
                      <TableCell>{camp ? <Badge variant="secondary">{camp.title}</Badge> : "-"}</TableCell>
                      <TableCell><Badge variant={statusOpt?.color as any || "secondary"}>{statusOpt?.label || d.status}</Badge></TableCell>
                      <TableCell className="text-sm">{new Date(d.created_at).toLocaleDateString(locale)}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="icon" variant="ghost" title={t("don_mgr_receipt")} onClick={() => setReceiptDonation(d)}><Printer className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" title={t("contact_email")} onClick={() => setEmailDonation(d)}><Mail className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" title="WhatsApp" onClick={() => setWaDonation(d)}><MessageCircle className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredItems.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">{t("don_mgr_no_donations")}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* CHARTS TAB */}
        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {t("don_mgr_monthly")}</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip formatter={(v: number) => [`৳${v.toLocaleString(locale)}`, t("dash_donation_label")]} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-4">{t("don_mgr_by_method")}</h3>
              {methodData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={methodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false} fontSize={11}>
                      {methodData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`৳${v.toLocaleString(locale)}`, t("don_mgr_amount")]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">{t("common_no_data")}</div>}
            </Card>
          </div>
        </TabsContent>

        {/* HEATMAP TAB */}
        <TabsContent value="heatmap" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">{t("don_mgr_heatmap_title")} ({new Date().getFullYear()})</h3>
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
                          title={`${m.month} ${d.day}: ৳${d.amount.toLocaleString(locale)}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <span>{t("don_mgr_less")}</span>
                {HEATMAP_COLORS.map((c, i) => <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />)}
                <span>{t("don_mgr_more")}</span>
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
                    <Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? t("don_mgr_active") : t("don_mgr_inactive")}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{c.count} {t("don_mgr_donors_count")}</span>
                      <span className="font-medium">৳{c.raised.toLocaleString(locale)} / ৳{c.target_amount.toLocaleString(locale)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-right text-sm font-bold text-primary">{pct}%</div>
                  </div>
                </Card>
              );
            })}
            {campaignPerf.length === 0 && <div className="col-span-2 text-center text-muted-foreground py-8">{t("don_mgr_no_campaigns")}</div>}
          </div>
        </TabsContent>
      </Tabs>

      {/* Receipt Dialog */}
      <Dialog open={!!receiptDonation} onOpenChange={() => setReceiptDonation(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t("don_mgr_receipt")}</DialogTitle></DialogHeader>
          {receiptDonation && <DonationReceipt donation={receiptDonation} onClose={() => setReceiptDonation(null)} />}
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={!!emailDonation} onOpenChange={() => setEmailDonation(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t("don_mgr_email_donor")}</DialogTitle></DialogHeader>
          {emailDonation && <EmailCompose
            to={emailDonation.donor_email}
            subject={`আপনার ৳${emailDonation.amount} অনুদানের জন্য ধন্যবাদ`}
            body={`প্রিয় ${emailDonation.donor_name},\n\nআপনার ৳${emailDonation.amount} অনুদানের জন্য আন্তরিক ধন্যবাদ জানাচ্ছি।\n\nশুভেচ্ছান্তে,\nশিশুফুল ফাউন্ডেশন`}
            onSent={() => setEmailDonation(null)}
          />}
        </DialogContent>
      </Dialog>

      {/* WhatsApp Dialog */}
      <Dialog open={!!waDonation} onOpenChange={() => setWaDonation(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t("don_mgr_wa_msg")}</DialogTitle></DialogHeader>
          {waDonation && <WhatsAppSend
            defaultMessage={`আসসালামু আলাইকুম ${waDonation.donor_name},\n\nআপনার ৳${waDonation.amount} অনুদানের জন্য আন্তরিক ধন্যবাদ। আল্লাহ আপনাকে উত্তম প্রতিদান দিন।\n\n- শিশুফুল ফাউন্ডেশন`}
          />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DonationManager;