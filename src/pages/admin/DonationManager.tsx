import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Plus, Trash2 } from "lucide-react";

interface Donation { id: string; donor_name: string; donor_email: string; amount: number; method: string; status: string; created_at: string; }

const DonationManager = () => {
  const { items, loading, create, remove } = useAdminCrud<Donation>({ table: "donations" });
  const [donOpen, setDonOpen] = useState(false);
  const [donForm, setDonForm] = useState({ donor_name: "", donor_email: "", amount: 0, method: "", status: "completed" });

  const handleDonSubmit = async () => {
    if (!donForm.donor_name || !donForm.amount) return;
    await create(donForm);
    setDonOpen(false);
    setDonForm({ donor_name: "", donor_email: "", amount: 0, method: "", status: "completed" });
  };

  const exportCSV = () => {
    const headers = "নাম,ইমেইল,পরিমাণ,পদ্ধতি,স্ট্যাটাস,তারিখ\n";
    const rows = items.map((d) => `${d.donor_name},${d.donor_email},${d.amount},${d.method},${d.status},${new Date(d.created_at).toLocaleDateString("bn-BD")}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "donations.csv"; a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const totalDonations = items.reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">অনুদান ম্যানেজার</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportCSV}><Download className="h-4 w-4" /> CSV</Button>
          <Dialog open={donOpen} onOpenChange={setDonOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> ম্যানুয়াল এন্ট্রি</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>অনুদান এন্ট্রি</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="দাতার নাম" value={donForm.donor_name} onChange={(e) => setDonForm({ ...donForm, donor_name: e.target.value })} />
                <Input placeholder="ইমেইল" value={donForm.donor_email} onChange={(e) => setDonForm({ ...donForm, donor_email: e.target.value })} />
                <Input type="number" placeholder="পরিমাণ" value={donForm.amount || ""} onChange={(e) => setDonForm({ ...donForm, amount: Number(e.target.value) })} />
                <Input placeholder="পদ্ধতি (বিকাশ, নগদ ইত্যাদি)" value={donForm.method} onChange={(e) => setDonForm({ ...donForm, method: e.target.value })} />
                <Button onClick={handleDonSubmit} className="w-full">যোগ করুন</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট অনুদান</div><div className="text-2xl font-bold text-primary">৳{totalDonations.toLocaleString("bn-BD")}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট দাতা</div><div className="text-2xl font-bold">{items.length}</div></Card>
      </div>

      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>দাতা</TableHead><TableHead>পরিমাণ</TableHead><TableHead>পদ্ধতি</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead>তারিখ</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((d) => (
              <TableRow key={d.id}>
                <TableCell><div className="font-medium">{d.donor_name || "বেনামী"}</div><div className="text-xs text-muted-foreground">{d.donor_email}</div></TableCell>
                <TableCell className="font-bold">৳{d.amount}</TableCell>
                <TableCell>{d.method || "-"}</TableCell>
                <TableCell><Badge variant={d.status === "completed" ? "default" : "secondary"}>{d.status}</Badge></TableCell>
                <TableCell>{new Date(d.created_at).toLocaleDateString("bn-BD")}</TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">কোনো অনুদান নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default DonationManager;
