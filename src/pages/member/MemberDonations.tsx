import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Donation { id: string; amount: number; method: string; status: string; created_at: string; }

const MemberDonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from("donations").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setDonations(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const total = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">অনুদানের ইতিহাস</h1>
      <Card className="p-4"><div className="text-lg">মোট অনুদান: <span className="font-bold text-primary">৳{total}</span></div></Card>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>পরিমাণ</TableHead><TableHead>পদ্ধতি</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead>তারিখ</TableHead></TableRow></TableHeader>
          <TableBody>
            {donations.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-bold">৳{d.amount}</TableCell>
                <TableCell>{d.method || "-"}</TableCell>
                <TableCell><Badge variant={d.status === "completed" ? "default" : "secondary"}>{d.status}</Badge></TableCell>
                <TableCell>{new Date(d.created_at).toLocaleDateString("bn-BD")}</TableCell>
              </TableRow>
            ))}
            {donations.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">কোনো অনুদান নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default MemberDonations;
