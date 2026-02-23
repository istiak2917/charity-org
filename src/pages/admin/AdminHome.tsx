import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { FolderOpen, Heart, Users, Calendar, Newspaper, Image, MessageSquare, UserCircle } from "lucide-react";

interface StatCard { icon: any; label: string; count: number; color: string; }

const AdminHome = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const tables = [
        { table: "projects", icon: FolderOpen, label: "প্রকল্প", color: "text-blue-500" },
        { table: "donations", icon: Heart, label: "অনুদান", color: "text-pink-500" },
        { table: "volunteers", icon: Users, label: "স্বেচ্ছাসেবক", color: "text-green-500" },
        { table: "events", icon: Calendar, label: "ইভেন্ট", color: "text-purple-500" },
        { table: "blog_posts", icon: Newspaper, label: "ব্লগ পোস্ট", color: "text-orange-500" },
        { table: "gallery_items", icon: Image, label: "গ্যালারি", color: "text-cyan-500" },
        { table: "contact_messages", icon: MessageSquare, label: "মেসেজ", color: "text-yellow-500" },
        { table: "team_members", icon: UserCircle, label: "টিম মেম্বার", color: "text-red-500" },
      ];

      const results = await Promise.all(
        tables.map(async (t) => {
          const { count } = await supabase.from(t.table).select("*", { count: "exact", head: true });
          return { icon: t.icon, label: t.label, count: count || 0, color: t.color };
        })
      );
      setStats(results);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">ড্যাশবোর্ড</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-muted ${s.color}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{s.count}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminHome;
