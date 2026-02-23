import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Donation { id: string; donor_name: string; donor_email: string; amount: number; method: string; status: string; created_at: string; }

const DonationManager = () => {
  const { items, loading } = useAdminCrud<Donation>({ table: "donations" });

  const exportCSV = () => {
    const headers = "নাম,ইমেইল,পরিমাণ,পদ্ধতি,স্ট্যাটাস,তারিখ\n";
    const rows = items.map((d) => `${d.donor_name},${d.donor_email},${d.amount},${d.method},${d.status},${new Date(d.created_at).toLocaleDateString("bn-BD")}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "donations.csv"; a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">অনুদান ম্যানেজার</h1>
        <Button variant="outline" className="gap-2" onClick={exportCSV}><Download className="h-4 w-4" /> CSV এক্সপোর্ট</Button>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>দাতা</TableHead>
              <TableHead>পরিমাণ</TableHead>
              <TableHead>পদ্ধতি</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead>তারিখ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <div className="font-medium">{d.donor_name || "বেনামী"}</div>
                  <div className="text-xs text-muted-foreground">{d.donor_email}</div>
                </TableCell>
                <TableCell className="font-bold">৳{d.amount}</TableCell>
                <TableCell>{d.method || "-"}</TableCell>
                <TableCell><Badge variant={d.status === "completed" ? "default" : "secondary"}>{d.status}</Badge></TableCell>
                <TableCell>{new Date(d.created_at).toLocaleDateString("bn-BD")}</TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">কোনো অনুদান নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default DonationManager;
