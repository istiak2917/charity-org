import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from "recharts";
import { TrendingUp, DollarSign, Users, Heart, Calendar, Download } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const AdvancedReporting = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [income, setIncome] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    const load = async () => {
      const [d, v, e, ex, inc, p] = await Promise.all([
        supabase.from("donations").select("*").order("created_at", { ascending: true }),
        supabase.from("volunteers").select("*"),
        supabase.from("events").select("*"),
        supabase.from("expenses").select("*"),
        supabase.from("income_records").select("*"),
        supabase.from("projects").select("*"),
      ]);
      setDonations(d.data || []);
      setVolunteers(v.data || []);
      setEvents(e.data || []);
      setExpenses(ex.data || []);
      setIncome(inc.data || []);
      setProjects(p.data || []);
    };
    load();
  }, []);

  const totalDonations = donations.reduce((s, d) => s + (d.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalIncome = income.reduce((s, i) => s + (i.amount || 0), 0);

  // Donation by method
  const methodData = Object.entries(
    donations.reduce((acc: any, d) => { acc[d.method || "অন্যান্য"] = (acc[d.method || "অন্যান্য"] || 0) + (d.amount || 0); return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Monthly donation trend
  const monthlyDonations = donations.reduce((acc: any, d) => {
    const month = (d.created_at || "").substring(0, 7);
    if (month) { acc[month] = (acc[month] || 0) + (d.amount || 0); }
    return acc;
  }, {});
  const monthlyData = Object.entries(monthlyDonations).map(([month, amount]) => ({ month, amount }));

  // Expense by category
  const expenseByCat = Object.entries(
    expenses.reduce((acc: any, e) => { acc[e.category || "অন্যান্য"] = (acc[e.category || "অন্যান্য"] || 0) + (e.amount || 0); return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Project budget utilization
  const projectBudget = projects.map(p => ({ name: (p.title || "").substring(0, 15), budget: p.budget || 0, spent: p.spent || 0, remaining: (p.budget || 0) - (p.spent || 0) }));

  const exportCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(","), ...data.map(row => headers.map(h => `"${row[h] ?? ""}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${filename}.csv`; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary" /> অ্যাডভান্সড রিপোর্টিং</h1>
        <Button variant="outline" className="gap-2" onClick={() => exportCSV(donations, "donations-report")}>
          <Download className="h-4 w-4" /> CSV এক্সপোর্ট
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><Heart className="h-4 w-4" /> মোট অনুদান</div>
          <p className="text-2xl font-bold mt-1">৳{totalDonations.toLocaleString("bn-BD")}</p>
          <p className="text-xs text-muted-foreground">{donations.length} টি</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><DollarSign className="h-4 w-4" /> মোট আয়</div>
          <p className="text-2xl font-bold mt-1">৳{totalIncome.toLocaleString("bn-BD")}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><DollarSign className="h-4 w-4" /> মোট ব্যয়</div>
          <p className="text-2xl font-bold mt-1">৳{totalExpenses.toLocaleString("bn-BD")}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><Users className="h-4 w-4" /> স্বেচ্ছাসেবক</div>
          <p className="text-2xl font-bold mt-1">{volunteers.length}</p>
        </Card>
      </div>

      <Tabs defaultValue="donations">
        <TabsList className="flex-wrap">
          <TabsTrigger value="donations">অনুদান বিশ্লেষণ</TabsTrigger>
          <TabsTrigger value="finance">আয়-ব্যয়</TabsTrigger>
          <TabsTrigger value="projects">প্রকল্প বাজেট</TabsTrigger>
        </TabsList>

        <TabsContent value="donations" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">মাসিক অনুদান প্রবণতা</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="পরিমাণ" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-4">পদ্ধতি অনুযায়ী অনুদান</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={methodData} cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} dataKey="value">
                    {methodData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">ক্যাটাগরি অনুযায়ী ব্যয়</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseByCat}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" name="ব্যয়" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-4">আয় vs ব্যয় সারসংক্ষেপ</h3>
            <div className="flex gap-8 items-center justify-center py-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">৳{totalIncome.toLocaleString("bn-BD")}</p>
                <p className="text-sm text-muted-foreground">মোট আয়</p>
              </div>
              <div className="text-4xl font-light text-muted-foreground">—</div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">৳{totalExpenses.toLocaleString("bn-BD")}</p>
                <p className="text-sm text-muted-foreground">মোট ব্যয়</p>
              </div>
              <div className="text-4xl font-light text-muted-foreground">=</div>
              <div className="text-center">
                <p className={`text-3xl font-bold ${totalIncome - totalExpenses >= 0 ? "text-green-600" : "text-red-500"}`}>৳{(totalIncome - totalExpenses).toLocaleString("bn-BD")}</p>
                <p className="text-sm text-muted-foreground">ব্যালান্স</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">প্রকল্প বাজেট ব্যবহার</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectBudget}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#3b82f6" name="বাজেট" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" fill="#ef4444" name="ব্যয়" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedReporting;
