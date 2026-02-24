import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Heart, TrendingUp } from "lucide-react";

const DonationsPage = () => {
  const [stats, setStats] = useState({ total: 0, count: 0, campaigns: 0 });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("donations").select("*"),
      supabase.from("donation_campaigns").select("*").eq("status", "active"),
    ]).then(([donRes, campRes]) => {
      const donations = donRes.data || [];
      const total = donations.reduce((s: number, d: any) => s + (d.amount || 0), 0);
      setStats({ total, count: donations.length, campaigns: (campRes.data || []).length });
      setCampaigns(campRes.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Heart className="h-12 w-12 text-primary mx-auto mb-3" />
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">অনুদান</h1>
          <p className="text-muted-foreground">আপনার সাহায্য পরিবর্তন আনে</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary">৳{stats.total.toLocaleString("bn-BD")}</div>
                <div className="text-sm text-muted-foreground">মোট অনুদান</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary">{stats.count.toLocaleString("bn-BD")}</div>
                <div className="text-sm text-muted-foreground">মোট দাতা</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary">{stats.campaigns.toLocaleString("bn-BD")}</div>
                <div className="text-sm text-muted-foreground">চলমান ক্যাম্পেইন</div>
              </Card>
            </div>

            {campaigns.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-xl font-bold font-heading mb-4 text-center">চলমান ক্যাম্পেইন</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaigns.map((c) => (
                    <Card key={c.id} className="p-5">
                      <h3 className="font-bold font-heading mb-1">{c.title}</h3>
                      {c.description && <p className="text-sm text-muted-foreground mb-2">{c.description}</p>}
                      {c.goal_amount && (
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span>লক্ষ্য: ৳{c.goal_amount.toLocaleString("bn-BD")}</span>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DonationsPage;
