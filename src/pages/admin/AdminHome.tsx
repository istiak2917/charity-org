import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  FolderOpen, Heart, Users, Calendar, Newspaper,
  TrendingUp
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface StatCard { icon: any; label: string; count: number; color: string; link: string; }

const AdminHome = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [totalDonations, setTotalDonations] = useState(0);
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
      ];

      const results = await Promise.all(
        tables.map(async (t) => {
          const { count } = await supabase.from(t.table).select("*", { count: "exact", head: true });
          return { icon: t.icon, label: t.label, count: count || 0, color: t.color, link: t.link };
        })
      );

      // Donations data
      const { data: donData } = await supabase.from("donations").select("amount, created_at");
      const total = (donData || []).reduce((s, d) => s + (d.amount || 0), 0);
      setTotalDonations(total);

      // Monthly donations
      const months = ["জানু", "ফেব্রু", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
      const monthMap: Record<number, number> = {};
      (donData || []).forEach((d: any) => {
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

      setStats(results);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">ড্যাশবোর্ড</h1>

      {/* Total Donations */}
      <Card className="p-4 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-muted text-primary"><TrendingUp className="h-6 w-6" /></div>
        <div><div className="text-2xl font-bold">৳{totalDonations.toLocaleString("bn-BD")}</div><div className="text-sm text-muted-foreground">মোট অনুদান</div></div>
      </Card>

      {/* Monthly Donations Chart */}
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
