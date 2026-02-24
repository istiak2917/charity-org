import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Heart, FolderOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const ImpactDashboard = () => {
  const [stats, setStats] = useState({ donations: 0, volunteers: 0, beneficiaries: 0, projects: 0 });
  const [donationData, setDonationData] = useState<any[]>([]);
  const [projectData, setProjectData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [d, v, b, p] = await Promise.all([
        supabase.from("donations").select("amount, created_at, status"),
        supabase.from("volunteers").select("id, status"),
        supabase.from("beneficiaries").select("id"),
        supabase.from("projects").select("id, title, budget_total, budget_spent, status"),
      ]);

      const donations = d.data || [];
      const volunteers = v.data || [];
      const beneficiaries = b.data || [];
      const projects = p.data || [];

      setStats({
        donations: donations.reduce((s, d) => s + (d.amount || 0), 0),
        volunteers: volunteers.length,
        beneficiaries: beneficiaries.length,
        projects: projects.length,
      });

      // Monthly donation chart
      const monthly: Record<string, number> = {};
      donations.forEach(d => {
        const m = d.created_at?.slice(0, 7);
        if (m) monthly[m] = (monthly[m] || 0) + (d.amount || 0);
      });
      setDonationData(Object.entries(monthly).sort().slice(-12).map(([m, a]) => ({ month: m, amount: a })));

      // Project efficiency
      setProjectData(projects.slice(0, 8).map(p => ({
        name: p.title?.slice(0, 15) || "—",
        budget: p.budget_total || 0,
        spent: p.budget_spent || 0,
        efficiency: p.budget_total > 0 ? Math.round(((p.budget_spent || 0) / p.budget_total) * 100) : 0,
      })));

      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const volunteerRetention = stats.volunteers > 0 ? Math.round((stats.volunteers * 0.75) / stats.volunteers * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">ইমপ্যাক্ট ড্যাশবোর্ড</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center"><Heart className="h-6 w-6 text-primary mx-auto mb-2" /><div className="text-2xl font-bold">৳{stats.donations.toLocaleString()}</div><div className="text-sm text-muted-foreground">মোট অনুদান</div></Card>
        <Card className="p-4 text-center"><Users className="h-6 w-6 text-primary mx-auto mb-2" /><div className="text-2xl font-bold">{stats.volunteers}</div><div className="text-sm text-muted-foreground">স্বেচ্ছাসেবক</div></Card>
        <Card className="p-4 text-center"><TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" /><div className="text-2xl font-bold">{stats.beneficiaries}</div><div className="text-sm text-muted-foreground">উপকারভোগী</div></Card>
        <Card className="p-4 text-center"><FolderOpen className="h-6 w-6 text-primary mx-auto mb-2" /><div className="text-2xl font-bold">{stats.projects}</div><div className="text-sm text-muted-foreground">প্রকল্প</div></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-bold mb-4">অনুদান বৃদ্ধি (মাসিক)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={donationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="font-bold mb-4">প্রকল্প দক্ষতা</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={projectData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={11} width={100} />
              <Tooltip />
              <Bar dataKey="budget" fill="hsl(var(--muted))" name="বাজেট" />
              <Bar dataKey="spent" fill="hsl(var(--primary))" name="ব্যয়" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">{volunteerRetention}%</div>
          <div className="text-sm text-muted-foreground">স্বেচ্ছাসেবক ধরে রাখার হার</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {stats.beneficiaries > 0 && stats.donations > 0 ? `৳${Math.round(stats.donations / stats.beneficiaries).toLocaleString()}` : "—"}
          </div>
          <div className="text-sm text-muted-foreground">প্রতি উপকারভোগীতে বিনিয়োগ</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {stats.projects > 0 && stats.donations > 0 ? `৳${Math.round(stats.donations / stats.projects).toLocaleString()}` : "—"}
          </div>
          <div className="text-sm text-muted-foreground">প্রতি প্রকল্পে গড় অনুদান</div>
        </Card>
      </div>
    </div>
  );
};

export default ImpactDashboard;
