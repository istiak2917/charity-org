import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  FolderOpen, Heart, Users, Calendar, Newspaper, Image, MessageSquare,
  UserCircle, Droplets, DollarSign, ClipboardList, TrendingUp, TrendingDown
} from "lucide-react";

interface StatCard { icon: any; label: string; count: number; color: string; link: string; }

const AdminHome = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [financials, setFinancials] = useState({ totalDonations: 0, totalExpenses: 0, totalIncome: 0 });
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
        supabase.from("donations").select("amount"),
        supabase.from("expenses").select("amount"),
        supabase.from("income_records").select("amount"),
      ]);
      const totalDonations = (donRes.data || []).reduce((s, d) => s + (d.amount || 0), 0);
      const totalExpenses = (expRes.data || []).reduce((s, e) => s + (e.amount || 0), 0);
      const totalIncome = (incRes.data || []).reduce((s, i) => s + (i.amount || 0), 0);

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
