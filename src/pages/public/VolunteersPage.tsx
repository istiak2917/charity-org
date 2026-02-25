import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

const VolunteersPage = () => {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        // Try "approved" status first (used by admin), fallback to "active"
        let { data, error } = await supabase.from("volunteers").select("*").eq("status", "approved").order("created_at", { ascending: false });
        if (error) {
          console.error("Volunteers fetch error:", error);
          setVolunteers([]);
        } else if (!data || data.length === 0) {
          // Fallback: try "active" status
          const res = await supabase.from("volunteers").select("*").eq("status", "active").order("created_at", { ascending: false });
          setVolunteers(res.data || []);
        } else {
          setVolunteers(data);
        }
      } catch (err) {
        console.error("Volunteers fetch failed:", err);
        setVolunteers([]);
      }
      setLoading(false);
    };
    fetchVolunteers();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Users className="h-12 w-12 text-primary mx-auto mb-3" />
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">স্বেচ্ছাসেবক</h1>
          <p className="text-muted-foreground">আমাদের নিবেদিত স্বেচ্ছাসেবক দল</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {volunteers.map((v) => (
              <Card key={v.id} className="p-4 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center text-primary font-bold text-xl">
                  {((v.full_name || v.name || "?") as string)[0]}
                </div>
                <h3 className="font-bold text-sm">{v.full_name || v.name || "—"}</h3>
                {(v.role || v.skills) && <Badge variant="outline" className="mt-1 text-xs">{v.role || v.skills}</Badge>}
              </Card>
            ))}
            {volunteers.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12">কোনো স্বেচ্ছাসেবক তথ্য নেই</div>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default VolunteersPage;
