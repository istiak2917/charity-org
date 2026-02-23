import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Download, FileText, ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import CountUp from "@/components/CountUp";
import ScrollReveal from "@/components/ScrollReveal";

const PIE_COLORS = ["hsl(330, 80%, 55%)", "hsl(340, 70%, 60%)", "hsl(38, 80%, 60%)", "hsl(145, 40%, 55%)", "hsl(200, 60%, 70%)", "hsl(270, 50%, 60%)"];

interface Report { id: string; title: string; report_type: string; file_url: string; year: number; description?: string; }

const TransparencyPage = () => {
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; আয়: number; ব্যয়: number }[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [donRes, expRes, incRes, campRes, repRes] = await Promise.all([
        supabase.from("donations").select("amount, created_at, campaign_id"),
        supabase.from("expenses").select("amount, category, expense_date"),
        supabase.from("income_records").select("amount, income_date"),
        supabase.from("donation_campaigns").select("*").eq("is_active", true),
        supabase.from("reports").select("*").order("year", { ascending: false }).limit(10),
      ]);

      const donData = donRes.data || [];
      const expData = expRes.data || [];
      const incData = incRes.data || [];

      const donTotal = donData.reduce((s, d) => s + (d.amount || 0), 0);
      const expTotal = expData.reduce((s, e) => s + (e.amount || 0), 0);
      const incTotal = incData.reduce((s, i) => s + (i.amount || 0), 0);
      setTotalDonations(donTotal);
      setTotalExpenses(expTotal);
      setTotalIncome(incTotal);

      // Category breakdown
      const catMap: Record<string, number> = {};
      expData.forEach(e => { const c = e.category || "অন্যান্য"; catMap[c] = (catMap[c] || 0) + (e.amount || 0); });
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));

      // Monthly comparison
      const months = ["জানু", "ফেব্রু", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
      const incMap: Record<number, number> = {};
      const expMap: Record<number, number> = {};
      [...incData, ...donData].forEach((d: any) => {
        const m = new Date(d.income_date || d.created_at || "").getMonth();
        incMap[m] = (incMap[m] || 0) + (d.amount || 0);
      });
      expData.forEach(e => {
        const m = new Date(e.expense_date || "").getMonth();
        expMap[m] = (expMap[m] || 0) + (e.amount || 0);
      });
      setMonthlyData(months.map((month, i) => ({ month, আয়: incMap[i] || 0, ব্যয়: expMap[i] || 0 })));

      // Campaigns with real raised amounts
      const campData = (campRes.data || []).map(c => {
        const raised = donData.filter(d => d.campaign_id === c.id).reduce((s, d) => s + (d.amount || 0), 0);
        return { ...c, raised };
      });
      setCampaigns(campData);
      setReports(repRes.data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const netBalance = totalIncome + totalDonations - totalExpenses;

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">আর্থিক স্বচ্ছতা</span>
            <h1 className="text-3xl md:text-4xl font-bold font-heading mt-2 mb-4">স্বচ্ছতা প্রতিবেদন</h1>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">আমাদের সকল আর্থিক কার্যক্রম সম্পূর্ণ স্বচ্ছ। এখানে আমাদের আয়, ব্যয় এবং তহবিল ব্যবহারের বিস্তারিত দেখুন।</p>
          </div>
        </ScrollReveal>

        {/* Financial Summary */}
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <Card className="p-5 text-center">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">৳<CountUp target={totalDonations} /></div>
              <div className="text-sm text-muted-foreground">মোট অনুদান</div>
            </Card>
            <Card className="p-5 text-center">
              <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">৳<CountUp target={totalIncome} /></div>
              <div className="text-sm text-muted-foreground">মোট আয়</div>
            </Card>
            <Card className="p-5 text-center">
              <TrendingDown className="h-6 w-6 text-destructive mx-auto mb-2" />
              <div className="text-2xl font-bold text-destructive">৳<CountUp target={totalExpenses} /></div>
              <div className="text-sm text-muted-foreground">মোট ব্যয়</div>
            </Card>
            <Card className="p-5 text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-destructive"}`}>৳<CountUp target={Math.abs(netBalance)} /></div>
              <div className="text-sm text-muted-foreground">নেট ব্যালেন্স</div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <ScrollReveal>
            <Card className="p-5">
              <h3 className="font-semibold font-heading mb-4">মাসভিত্তিক আয় ও ব্যয়</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip formatter={(v: number) => `৳${v.toLocaleString("bn-BD")}`} />
                  <Bar dataKey="আয়" fill="hsl(145, 40%, 55%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ব্যয়" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <Card className="p-5">
              <h3 className="font-semibold font-heading mb-4">ব্যয়ের খাত</h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false} fontSize={11}>
                      {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `৳${v.toLocaleString("bn-BD")}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-[280px] flex items-center justify-center text-muted-foreground">ডেটা নেই</div>}
            </Card>
          </ScrollReveal>
        </div>

        {/* Campaign Progress */}
        {campaigns.length > 0 && (
          <ScrollReveal>
            <div className="mb-10">
              <h2 className="text-2xl font-bold font-heading mb-6 text-center">সক্রিয় ক্যাম্পেইন</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map(c => {
                  const pct = c.target_amount > 0 ? Math.min(100, Math.round((c.raised / c.target_amount) * 100)) : 0;
                  return (
                    <Card key={c.id} className="p-5">
                      <h4 className="font-semibold mb-3">{c.title}</h4>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">সংগৃহীত</span>
                        <span className="font-bold text-primary">৳{c.raised.toLocaleString("bn-BD")} / ৳{c.target_amount.toLocaleString("bn-BD")}</span>
                      </div>
                      <Progress value={pct} className="h-3" />
                      <div className="text-right text-sm font-bold mt-1">{pct}%</div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Reports */}
        <ScrollReveal>
          <div>
            <h2 className="text-2xl font-bold font-heading mb-6 text-center">প্রকাশিত প্রতিবেদন</h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {reports.map(r => (
                <Card key={r.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{r.title}</span>
                      <Badge variant="secondary">{r.report_type}</Badge>
                      <Badge variant="outline">{r.year}</Badge>
                    </div>
                    {r.description && <p className="text-sm text-muted-foreground mt-1">{r.description}</p>}
                  </div>
                  {r.file_url && (
                    <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-1"><Download className="h-3 w-3" /> ডাউনলোড</Button>
                    </a>
                  )}
                </Card>
              ))}
              {reports.length === 0 && <div className="text-center text-muted-foreground py-8">কোনো প্রতিবেদন প্রকাশিত হয়নি</div>}
            </div>
          </div>
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
};

export default TransparencyPage;
