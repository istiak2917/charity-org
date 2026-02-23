import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  FolderOpen, Heart, Users, Calendar, Newspaper, Image, MessageSquare,
  UserCircle, Droplets, DollarSign, ClipboardList, TrendingUp, TrendingDown
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface StatCard { icon: any; label: string; count: number; color: string; link: string; }

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--accent))", "#6366f1", "#06b6d4", "#f59e0b"];

const AdminHome = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [financials, setFinancials] = useState({ totalDonations: 0, totalExpenses: 0, totalIncome: 0 });
  const [expenseByCategory, setExpenseByCategory] = useState<{ name: string; value: number }[]>([]);
  const [monthlyDonations, setMonthlyDonations] = useState<{ month: string; amount: number }[]>([]);
  const [projectStats, setProjectStats] = useState({ total: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const tables = [
        { table: "projects", icon: FolderOpen, label: "প্রকল্প", color: "text-blue-500", link: "/admin/projects" },
        { table: "donations", icon: Heart, label: "অনুদান", color: "text-pink-500", link: "/admin/donations" },
        { table: "volunteers", icon: Users, label: "স্বেচ্ছাসেবক", color: "text-green-500", link: "/admin/volunteers" },
        { table: "events", icon: Calendar, label: "ইভেন্ট", color: "text-purple-500", link: "/admin/events" },
        { table: "blog_posts", icon: Newspaper, label: "ব্লগ পোস্ট", color: "text-orange-500", link: "/admin/blog" },
        { table: "gallery_items", icon: Image, label: "গ্যালারি", color: "text-cyan-500", link: "/admin/gallery" },
        { table: "contact_messages", icon: MessageSquare, label: "মেসেজ", color: "text-yellow-500", link: "/admin/messages" },
        { table: "team_members", icon: UserCircle, label: "টিম মেম্বার", color: "text-red-500", link: "/admin/team" },
        { table: "blood_donors", icon: Droplets, label: "রক্তদাতা", color: "text-red-600", link: "/admin/blood" },
      ];

      const results = await Promise.all(
        tables.map(async (t) => {
          const { count } = await supabase.from(t.table).select("*", { count: "exact", head: true });
          return { icon: t.icon, label: t.label, count: count || 0, color: t.color, link: t.link };
        })
      );

      // Financial summary
      const [donRes, expRes, incRes] = await Promise.all([
        supabase.from("donations").select("amount, created_at"),
        supabase.from("expenses").select("amount, category"),
        supabase.from("income_records").select("amount"),
      ]);
      const totalDonations = (donRes.data || []).reduce((s, d) => s + (d.amount || 0), 0);
      const totalExpenses = (expRes.data || []).reduce((s, e) => s + (e.amount || 0), 0);
      const totalIncome = (incRes.data || []).reduce((s, i) => s + (i.amount || 0), 0);

      // Expense by category
      const catMap: Record<string, number> = {};
      (expRes.data || []).forEach((e: any) => {
        const cat = e.category || "অন্যান্য";
        catMap[cat] = (catMap[cat] || 0) + (e.amount || 0);
      });
      setExpenseByCategory(Object.entries(catMap).map(([name, value]) => ({ name, value })));

      // Monthly donations (last 6 months approximation)
      const months = ["জানু", "ফেব্রু", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
      const monthMap: Record<number, number> = {};
      (donRes.data || []).forEach((d: any) => {
        const m = new Date(d.created_at).getMonth();
        monthMap[m] = (monthMap[m] || 0) + (d.amount || 0);
      });
      setMonthlyDonations(
        Object.entries(monthMap).map(([m, amount]) => ({ month: months[Number(m)], amount }))
      );

      // Project stats
      const { data: projData } = await supabase.from("projects").select("status");
      const active = (projData || []).filter(p => p.status === "active").length;
      const completed = (projData || []).filter(p => p.status === "completed").length;
      setProjectStats({ total: (projData || []).length, active, completed });

      setFinancials({ totalDonations, totalExpenses, totalIncome });
      setStats(results);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">ড্যাশবোর্ড</h1>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-muted text-primary"><TrendingUp className="h-6 w-6" /></div>
          <div><div className="text-2xl font-bold">৳{financials.totalDonations.toLocaleString("bn-BD")}</div><div className="text-sm text-muted-foreground">মোট অনুদান</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-muted text-destructive"><TrendingDown className="h-6 w-6" /></div>
          <div><div className="text-2xl font-bold">৳{financials.totalExpenses.toLocaleString("bn-BD")}</div><div className="text-sm text-muted-foreground">মোট ব্যয়</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-muted text-primary"><DollarSign className="h-6 w-6" /></div>
          <div><div className="text-2xl font-bold">৳{financials.totalIncome.toLocaleString("bn-BD")}</div><div className="text-sm text-muted-foreground">মোট আয়</div></div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Donations Bar Chart */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">মাসভিত্তিক অনুদান</h3>
          {monthlyDonations.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyDonations}>
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v: number) => [`৳${v.toLocaleString("bn-BD")}`, "অনুদান"]} />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">ডেটা নেই</div>
          )}
        </Card>

        {/* Expense Pie Chart */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">ব্যয় বিভাগভিত্তিক</h3>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {expenseByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `৳${v.toLocaleString("bn-BD")}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">ডেটা নেই</div>
          )}
        </Card>
      </div>

      {/* Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{projectStats.total}</div>
          <div className="text-sm text-muted-foreground">মোট প্রকল্প</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{projectStats.active}</div>
          <div className="text-sm text-muted-foreground">সক্রিয় প্রকল্প</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{projectStats.completed}</div>
          <div className="text-sm text-muted-foreground">সম্পন্ন প্রকল্প</div>
        </Card>
      </div>

      {/* Module Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link to={s.link} key={s.label}>
            <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className={`p-3 rounded-xl bg-muted ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{s.count}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminHome;
