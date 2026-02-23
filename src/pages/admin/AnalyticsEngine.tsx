import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp, TrendingDown, Users, DollarSign, Activity, BarChart3, PieChart as PieIcon,
  ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend
} from "recharts";

const COLORS = ["hsl(330, 80%, 55%)", "hsl(145, 40%, 55%)", "hsl(38, 80%, 60%)", "hsl(200, 60%, 70%)", "hsl(270, 50%, 60%)", "hsl(0, 84%, 60%)"];
const BN_MONTHS = ["জানু", "ফেব্রু", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];

interface MetricCard {
  label: string;
  value: string;
  change?: number;
  icon: any;
  color: string;
}

const AnalyticsEngine = () => {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [donRes, expRes, incRes, volRes, projRes] = await Promise.all([
        supabase.from("donations").select("*").order("created_at"),
        supabase.from("expenses").select("*").order("expense_date"),
        supabase.from("income_records").select("*").order("income_date"),
        supabase.from("volunteers").select("*"),
        supabase.from("projects").select("*"),
      ]);
      setDonations(donRes.data || []);
      setExpenses(expRes.data || []);
      setIncomes(incRes.data || []);
      setVolunteers(volRes.data || []);
      setProjects(projRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  // === Donation Trend (monthly) ===
  const donationTrend = useMemo(() => {
    const map: Record<string, number> = {};
    donations.forEach(d => {
      const date = new Date(d.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + (d.amount || 0);
    });
    return Object.entries(map).sort().slice(-12).map(([k, v]) => {
      const [y, m] = k.split("-");
      return { month: `${BN_MONTHS[parseInt(m) - 1]} ${y.slice(2)}`, amount: v };
    });
  }, [donations]);

  // === Monthly Growth ===
  const monthlyGrowth = useMemo(() => {
    if (donationTrend.length < 2) return 0;
    const last = donationTrend[donationTrend.length - 1].amount;
    const prev = donationTrend[donationTrend.length - 2].amount;
    return prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;
  }, [donationTrend]);

  // === Volunteer Retention Rate ===
  const volunteerRetention = useMemo(() => {
    if (volunteers.length === 0) return 0;
    const active = volunteers.filter(v => v.status === "active" || v.is_active === true).length;
    return Math.round((active / volunteers.length) * 100);
  }, [volunteers]);

  // === Project Efficiency Ratio (budget vs spent) ===
  const projectEfficiency = useMemo(() => {
    const withBudget = projects.filter(p => p.budget > 0);
    if (withBudget.length === 0) return { ratio: 0, data: [] };
    const data = withBudget.map(p => {
      const spent = expenses.filter(e => e.project_id === p.id).reduce((s, e) => s + (e.amount || 0), 0);
      const efficiency = p.budget > 0 ? Math.round((spent / p.budget) * 100) : 0;
      return {
        name: p.title.length > 12 ? p.title.slice(0, 12) + "…" : p.title,
        budget: p.budget,
        spent,
        efficiency,
        status: p.status,
      };
    });
    const avgEfficiency = Math.round(data.reduce((s, d) => s + d.efficiency, 0) / data.length);
    return { ratio: avgEfficiency, data };
  }, [projects, expenses]);

  // === Financial Sustainability (income+donations vs expenses over last 6 months) ===
  const sustainability = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyIn: Record<string, number> = {};
    const monthlyOut: Record<string, number> = {};

    [...donations, ...incomes].forEach((d: any) => {
      const date = new Date(d.created_at || d.income_date);
      if (date >= sixMonthsAgo) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyIn[key] = (monthlyIn[key] || 0) + (d.amount || 0);
      }
    });
    expenses.forEach(e => {
      const date = new Date(e.expense_date);
      if (date >= sixMonthsAgo) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyOut[key] = (monthlyOut[key] || 0) + (e.amount || 0);
      }
    });

    const allKeys = [...new Set([...Object.keys(monthlyIn), ...Object.keys(monthlyOut)])].sort();
    const data = allKeys.map(k => {
      const [y, m] = k.split("-");
      return {
        month: `${BN_MONTHS[parseInt(m) - 1]}`,
        আয়: monthlyIn[k] || 0,
        ব্যয়: monthlyOut[k] || 0,
      };
    });

    const totalIn = Object.values(monthlyIn).reduce((s, v) => s + v, 0);
    const totalOut = Object.values(monthlyOut).reduce((s, v) => s + v, 0);
    const ratio = totalOut > 0 ? Math.round((totalIn / totalOut) * 100) : totalIn > 0 ? 999 : 0;

    return { ratio, data };
  }, [donations, incomes, expenses]);

  // === Expense Category Breakdown ===
  const expenseCategories = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      const c = e.category || "অন্যান্য";
      map[c] = (map[c] || 0) + (e.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  // === Donation by Campaign ===
  const donationByCampaign = useMemo(() => {
    const map: Record<string, number> = {};
    donations.forEach(d => {
      const key = d.campaign_id || "direct";
      map[key] = (map[key] || 0) + (d.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({
      name: name === "direct" ? "সরাসরি" : name.slice(0, 8),
      value
    })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [donations]);

  const totalDonations = donations.reduce((s, d) => s + (d.amount || 0), 0);
  const totalExpense = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalIncome = incomes.reduce((s, i) => s + (i.amount || 0), 0);

  const metrics: MetricCard[] = [
    { label: "মোট অনুদান", value: `৳${totalDonations.toLocaleString("bn-BD")}`, change: monthlyGrowth, icon: TrendingUp, color: "text-primary" },
    { label: "স্বেচ্ছাসেবক ধারণ হার", value: `${volunteerRetention}%`, icon: Users, color: "text-green-600" },
    { label: "প্রকল্প দক্ষতা", value: `${projectEfficiency.ratio}%`, icon: Activity, color: "text-blue-600" },
    { label: "আর্থিক টেকসইতা", value: `${sustainability.ratio}%`, icon: DollarSign, color: sustainability.ratio >= 100 ? "text-green-600" : "text-destructive" },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">অ্যানালিটিক্স ইঞ্জিন</h1>
        <Badge variant="outline" className="text-xs">সর্বশেষ আপডেট: এইমাত্র</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <m.icon className={`h-5 w-5 ${m.color}`} />
              {m.change !== undefined && (
                <div className={`flex items-center text-xs font-medium ${m.change > 0 ? "text-green-600" : m.change < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {m.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : m.change < 0 ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {Math.abs(m.change)}%
                </div>
              )}
            </div>
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{m.label}</div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="trends">ট্রেন্ড</TabsTrigger>
          <TabsTrigger value="efficiency">দক্ষতা</TabsTrigger>
          <TabsTrigger value="sustainability">টেকসইতা</TabsTrigger>
          <TabsTrigger value="breakdown">বিশ্লেষণ</TabsTrigger>
        </TabsList>

        {/* Donation Trend */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="font-semibold font-heading mb-4">অনুদান ট্রেন্ড (মাসিক)</h3>
              {donationTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={donationTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip formatter={(v: number) => `৳${v.toLocaleString("bn-BD")}`} />
                    <Area type="monotone" dataKey="amount" stroke="hsl(330, 80%, 55%)" fill="hsl(330, 80%, 55%)" fillOpacity={0.15} strokeWidth={2} name="অনুদান" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <div className="h-[300px] flex items-center justify-center text-muted-foreground">ডেটা নেই</div>}
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold font-heading mb-4">মাসিক প্রবৃদ্ধি</h3>
              <div className="flex flex-col items-center justify-center h-[300px]">
                <div className={`text-6xl font-bold ${monthlyGrowth > 0 ? "text-green-600" : monthlyGrowth < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {monthlyGrowth > 0 ? "+" : ""}{monthlyGrowth}%
                </div>
                <p className="text-muted-foreground mt-2">গত মাসের তুলনায়</p>
                <div className="mt-6 grid grid-cols-3 gap-6 text-center w-full">
                  <div>
                    <div className="text-lg font-bold text-primary">৳{totalDonations.toLocaleString("bn-BD")}</div>
                    <div className="text-xs text-muted-foreground">মোট অনুদান</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{donations.length}</div>
                    <div className="text-xs text-muted-foreground">মোট লেনদেন</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">৳{donations.length > 0 ? Math.round(totalDonations / donations.length).toLocaleString("bn-BD") : 0}</div>
                    <div className="text-xs text-muted-foreground">গড় অনুদান</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Project Efficiency */}
        <TabsContent value="efficiency">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="font-semibold font-heading mb-4">প্রকল্প বাজেট বনাম ব্যয়</h3>
              {projectEfficiency.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectEfficiency.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip formatter={(v: number) => `৳${v.toLocaleString("bn-BD")}`} />
                    <Legend />
                    <Bar dataKey="budget" fill="hsl(var(--muted-foreground))" name="বাজেট" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spent" fill="hsl(330, 80%, 55%)" name="ব্যয়" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-[300px] flex items-center justify-center text-muted-foreground">বাজেটসহ প্রকল্প নেই</div>}
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold font-heading mb-4">স্বেচ্ছাসেবক অবস্থা</h3>
              <div className="flex flex-col items-center justify-center h-[300px]">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(145, 40%, 55%)" strokeWidth="3" strokeDasharray={`${volunteerRetention}, 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{volunteerRetention}%</span>
                  </div>
                </div>
                <p className="text-muted-foreground mt-4">ধারণ হার</p>
                <div className="mt-4 grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">{volunteers.filter(v => v.status === "active" || v.is_active).length}</div>
                    <div className="text-xs text-muted-foreground">সক্রিয়</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-muted-foreground">{volunteers.length}</div>
                    <div className="text-xs text-muted-foreground">মোট</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Sustainability */}
        <TabsContent value="sustainability">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold font-heading">আর্থিক টেকসইতা (গত ৬ মাস)</h3>
              <Badge variant={sustainability.ratio >= 100 ? "default" : "destructive"}>
                {sustainability.ratio >= 100 ? "টেকসই" : "ঝুঁকিপূর্ণ"} — {sustainability.ratio}%
              </Badge>
            </div>
            {sustainability.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={sustainability.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip formatter={(v: number) => `৳${v.toLocaleString("bn-BD")}`} />
                  <Legend />
                  <Area type="monotone" dataKey="আয়" stroke="hsl(145, 40%, 55%)" fill="hsl(145, 40%, 55%)" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="ব্যয়" stroke="hsl(0, 84%, 60%)" fill="hsl(0, 84%, 60%)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-[350px] flex items-center justify-center text-muted-foreground">ডেটা নেই</div>}
            <div className="mt-4 p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>আর্থিক টেকসইতা সূচক:</strong> গত ৬ মাসে মোট আয় (অনুদান + আয়) বনাম মোট ব্যয়ের অনুপাত। ১০০%-এর উপরে মানে সংগঠন আর্থিকভাবে টেকসই।
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Breakdown */}
        <TabsContent value="breakdown">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="font-semibold font-heading mb-4">ব্যয়ের খাতভিত্তিক বিশ্লেষণ</h3>
              {expenseCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={expenseCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false} fontSize={11}>
                      {expenseCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `৳${v.toLocaleString("bn-BD")}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-[300px] flex items-center justify-center text-muted-foreground">ডেটা নেই</div>}
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold font-heading mb-4">আর্থিক সারসংক্ষেপ</h3>
              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">মোট আয় (অনুদান + আয়)</span>
                  <span className="font-bold text-green-600">৳{(totalDonations + totalIncome).toLocaleString("bn-BD")}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">মোট ব্যয়</span>
                  <span className="font-bold text-destructive">৳{totalExpense.toLocaleString("bn-BD")}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border-2 border-primary/20">
                  <span className="text-sm font-medium">নেট ব্যালেন্স</span>
                  <span className={`font-bold text-lg ${(totalDonations + totalIncome - totalExpense) >= 0 ? "text-green-600" : "text-destructive"}`}>
                    ৳{Math.abs(totalDonations + totalIncome - totalExpense).toLocaleString("bn-BD")}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">মোট প্রকল্প</span>
                  <span className="font-bold">{projects.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">মোট স্বেচ্ছাসেবক</span>
                  <span className="font-bold">{volunteers.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsEngine;
