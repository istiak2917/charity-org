import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Download, Plus, Pencil, Trash2 } from "lucide-react";

interface Donation { id: string; donor_name: string; donor_email: string; amount: number; method: string; status: string; campaign_id: string; created_at: string; }
interface Campaign { id: string; title: string; description: string; target_amount: number; current_amount: number; is_active: boolean; image_url: string; end_date: string; }

const DonationManager = () => {
  const donations = useAdminCrud<Donation>({ table: "donations" });
  const campaigns = useAdminCrud<Campaign>({ table: "donation_campaigns" });

  const [campOpen, setCampOpen] = useState(false);
  const [donOpen, setDonOpen] = useState(false);
  const [editCamp, setEditCamp] = useState<Campaign | null>(null);
  const [campForm, setCampForm] = useState({ title: "", description: "", target_amount: 0, current_amount: 0, is_active: true, image_url: "", end_date: "" });
  const [donForm, setDonForm] = useState({ donor_name: "", donor_email: "", amount: 0, method: "", status: "completed", campaign_id: "", note: "" });

  const handleCampSubmit = async () => {
    if (!campForm.title) return;
    if (editCamp) await campaigns.update(editCamp.id, campForm);
    else await campaigns.create(campForm);
    setCampOpen(false); setEditCamp(null);
    setCampForm({ title: "", description: "", target_amount: 0, current_amount: 0, is_active: true, image_url: "", end_date: "" });
  };

  const handleDonSubmit = async () => {
    if (!donForm.donor_name || !donForm.amount) return;
    await donations.create(donForm);
    setDonOpen(false);
    setDonForm({ donor_name: "", donor_email: "", amount: 0, method: "", status: "completed", campaign_id: "", note: "" });
  };

  const exportCSV = () => {
    const headers = "নাম,ইমেইল,পরিমাণ,পদ্ধতি,স্ট্যাটাস,তারিখ\n";
    const rows = donations.items.map((d) => `${d.donor_name},${d.donor_email},${d.amount},${d.method},${d.status},${new Date(d.created_at).toLocaleDateString("bn-BD")}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "donations.csv"; a.click();
  };

  if (donations.loading || campaigns.loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const totalDonations = donations.items.reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">অনুদান ম্যানেজার</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট অনুদান</div><div className="text-2xl font-bold text-primary">৳{totalDonations.toLocaleString("bn-BD")}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট দাতা</div><div className="text-2xl font-bold">{donations.items.length}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">সক্রিয় ক্যাম্পেইন</div><div className="text-2xl font-bold">{campaigns.items.filter(c => c.is_active).length}</div></Card>
      </div>

      <Tabs defaultValue="donations">
        <TabsList><TabsTrigger value="donations">অনুদান তালিকা</TabsTrigger><TabsTrigger value="campaigns">ক্যাম্পেইন</TabsTrigger></TabsList>

        <TabsContent value="donations" className="space-y-4">
          <div className="flex justify-end gap-2">
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
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>দাতা</TableHead><TableHead>পরিমাণ</TableHead><TableHead>পদ্ধতি</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead>তারিখ</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
              <TableBody>
                {donations.items.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell><div className="font-medium">{d.donor_name || "বেনামী"}</div><div className="text-xs text-muted-foreground">{d.donor_email}</div></TableCell>
                    <TableCell className="font-bold">৳{d.amount}</TableCell>
                    <TableCell>{d.method || "-"}</TableCell>
                    <TableCell><Badge variant={d.status === "completed" ? "default" : "secondary"}>{d.status}</Badge></TableCell>
                    <TableCell>{new Date(d.created_at).toLocaleDateString("bn-BD")}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => donations.remove(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {donations.items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">কোনো অনুদান নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={campOpen} onOpenChange={(v) => { setCampOpen(v); if (!v) setEditCamp(null); }}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন ক্যাম্পেইন</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editCamp ? "সম্পাদনা" : "নতুন ক্যাম্পেইন"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="শিরোনাম" value={campForm.title} onChange={(e) => setCampForm({ ...campForm, title: e.target.value })} />
                  <Textarea placeholder="বিবরণ" value={campForm.description} onChange={(e) => setCampForm({ ...campForm, description: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="number" placeholder="লক্ষ্যমাত্রা" value={campForm.target_amount || ""} onChange={(e) => setCampForm({ ...campForm, target_amount: Number(e.target.value) })} />
                    <Input type="number" placeholder="সংগৃহীত" value={campForm.current_amount || ""} onChange={(e) => setCampForm({ ...campForm, current_amount: Number(e.target.value) })} />
                  </div>
                  <Input type="date" value={campForm.end_date} onChange={(e) => setCampForm({ ...campForm, end_date: e.target.value })} />
                  <Input placeholder="ছবির URL" value={campForm.image_url} onChange={(e) => setCampForm({ ...campForm, image_url: e.target.value })} />
                  <Button onClick={handleCampSubmit} className="w-full">{editCamp ? "আপডেট" : "তৈরি করুন"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4">
            {campaigns.items.map((c) => (
              <Card key={c.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div><h3 className="font-semibold text-lg">{c.title}</h3><p className="text-sm text-muted-foreground">{c.description}</p></div>
                  <div className="flex gap-1">
                    <Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "সক্রিয়" : "বন্ধ"}</Badge>
                    <Button size="icon" variant="ghost" onClick={() => { setEditCamp(c); setCampForm({ title: c.title, description: c.description || "", target_amount: c.target_amount, current_amount: c.current_amount, is_active: c.is_active, image_url: c.image_url || "", end_date: c.end_date || "" }); setCampOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => campaigns.remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                {c.target_amount > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm"><span>৳{(c.current_amount || 0).toLocaleString("bn-BD")} সংগৃহীত</span><span>লক্ষ্য: ৳{c.target_amount.toLocaleString("bn-BD")}</span></div>
                    <Progress value={(c.current_amount / c.target_amount) * 100} className="h-3" />
                    <div className="text-xs text-muted-foreground">বাকি: ৳{(c.target_amount - (c.current_amount || 0)).toLocaleString("bn-BD")}{c.end_date ? ` • শেষ তারিখ: ${new Date(c.end_date).toLocaleDateString("bn-BD")}` : ""}</div>
                  </div>
                )}
              </Card>
            ))}
            {campaigns.items.length === 0 && <Card className="p-8 text-center text-muted-foreground">কোনো ক্যাম্পেইন নেই</Card>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DonationManager;
