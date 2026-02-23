import { useState, useMemo } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, StickyNote, Download, Eye } from "lucide-react";

interface Donation {
  id: string; donor_name: string; donor_email: string; amount: number;
  method: string; status: string; created_at: string; source?: string;
  campaign_id?: string; [key: string]: any;
}

interface DonorProfile {
  name: string;
  email: string;
  totalAmount: number;
  donationCount: number;
  firstDonation: string;
  lastDonation: string;
  methods: string[];
  sources: string[];
  isMajor: boolean;
  donations: Donation[];
}

const DonorCRM = () => {
  const { items: donations, loading } = useAdminCrud<Donation>({ table: "donations" });
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [selectedDonor, setSelectedDonor] = useState<DonorProfile | null>(null);
  const [noteDialog, setNoteDialog] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Build donor profiles from donations
  const donorProfiles = useMemo(() => {
    const map: Record<string, DonorProfile> = {};
    donations.forEach(d => {
      const key = (d.donor_email || d.donor_name || "unknown").toLowerCase();
      if (!map[key]) {
        map[key] = {
          name: d.donor_name || "বেনামী",
          email: d.donor_email || "",
          totalAmount: 0,
          donationCount: 0,
          firstDonation: d.created_at,
          lastDonation: d.created_at,
          methods: [],
          sources: [],
          isMajor: false,
          donations: [],
        };
      }
      const p = map[key];
      p.totalAmount += d.amount || 0;
      p.donationCount++;
      if (d.created_at < p.firstDonation) p.firstDonation = d.created_at;
      if (d.created_at > p.lastDonation) p.lastDonation = d.created_at;
      if (d.method && !p.methods.includes(d.method)) p.methods.push(d.method);
      if (d.source && !p.sources.includes(d.source)) p.sources.push(d.source);
      p.donations.push(d);
    });
    // Mark major donors (top 10% or ≥10000)
    const profiles = Object.values(map);
    const sortedByAmount = [...profiles].sort((a, b) => b.totalAmount - a.totalAmount);
    const top10pct = Math.max(1, Math.ceil(profiles.length * 0.1));
    const majorThreshold = sortedByAmount[top10pct - 1]?.totalAmount || 10000;
    profiles.forEach(p => { p.isMajor = p.totalAmount >= Math.min(majorThreshold, 10000); });
    return profiles.sort((a, b) => b.totalAmount - a.totalAmount);
  }, [donations]);

  // Segmentation
  const filteredDonors = useMemo(() => {
    let list = donorProfiles;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q));
    }
    if (segmentFilter === "major") list = list.filter(d => d.isMajor);
    else if (segmentFilter === "recurring") list = list.filter(d => d.donationCount >= 3);
    else if (segmentFilter === "new") list = list.filter(d => d.donationCount === 1);
    else if (segmentFilter === "lapsed") {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      list = list.filter(d => new Date(d.lastDonation) < sixMonthsAgo && d.donationCount > 1);
    }
    return list;
  }, [donorProfiles, search, segmentFilter]);

  const exportCSV = () => {
    const headers = "নাম,ইমেইল,মোট অনুদান,অনুদান সংখ্যা,প্রথম অনুদান,শেষ অনুদান,প্রধান দাতা\n";
    const rows = filteredDonors.map(d =>
      `${d.name},${d.email},${d.totalAmount},${d.donationCount},${new Date(d.firstDonation).toLocaleDateString("bn-BD")},${new Date(d.lastDonation).toLocaleDateString("bn-BD")},${d.isMajor ? "হ্যাঁ" : "না"}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "donors.csv"; a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const totalLifetimeValue = donorProfiles.reduce((s, d) => s + d.totalAmount, 0);
  const majorDonors = donorProfiles.filter(d => d.isMajor).length;
  const avgDonation = donations.length > 0 ? totalLifetimeValue / donations.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold font-heading">ডোনার CRM</h1>
        <Button variant="outline" className="gap-2" onClick={exportCSV}><Download className="h-4 w-4" /> CSV</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট দাতা</div><div className="text-2xl font-bold">{donorProfiles.length}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">প্রধান দাতা</div><div className="text-2xl font-bold text-primary flex items-center justify-center gap-1"><Star className="h-5 w-5" />{majorDonors}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট লাইফটাইম ভ্যালু</div><div className="text-2xl font-bold text-green-600">৳{totalLifetimeValue.toLocaleString("bn-BD")}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">গড় অনুদান</div><div className="text-2xl font-bold">৳{Math.round(avgDonation).toLocaleString("bn-BD")}</div></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব দাতা</SelectItem>
            <SelectItem value="major">প্রধান দাতা ⭐</SelectItem>
            <SelectItem value="recurring">নিয়মিত (৩+)</SelectItem>
            <SelectItem value="new">নতুন দাতা</SelectItem>
            <SelectItem value="lapsed">নিষ্ক্রিয় (৬ মাস+)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filteredDonors.length} জন</span>
      </div>

      {/* Donor Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>দাতা</TableHead>
              <TableHead>মোট অনুদান</TableHead>
              <TableHead>অনুদান সংখ্যা</TableHead>
              <TableHead>প্রথম অনুদান</TableHead>
              <TableHead>শেষ অনুদান</TableHead>
              <TableHead>পদ্ধতি</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDonors.map((donor, i) => (
              <TableRow key={i} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedDonor(donor)}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {donor.isMajor && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />}
                    <div>
                      <div className="font-medium">{donor.name}</div>
                      <div className="text-xs text-muted-foreground">{donor.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-bold text-primary">৳{donor.totalAmount.toLocaleString("bn-BD")}</TableCell>
                <TableCell><Badge variant="secondary">{donor.donationCount} বার</Badge></TableCell>
                <TableCell className="text-sm">{new Date(donor.firstDonation).toLocaleDateString("bn-BD")}</TableCell>
                <TableCell className="text-sm">{new Date(donor.lastDonation).toLocaleDateString("bn-BD")}</TableCell>
                <TableCell><div className="flex gap-1 flex-wrap">{donor.methods.map(m => <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>)}</div></TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedDonor(donor); }}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedDonor(donor); setNoteDialog(true); }}><StickyNote className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredDonors.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">কোনো দাতা পাওয়া যায়নি</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      {/* Donor Detail Dialog */}
      <Dialog open={!!selectedDonor && !noteDialog} onOpenChange={(v) => { if (!v) setSelectedDonor(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDonor?.isMajor && <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
              {selectedDonor?.name} — প্রোফাইল
            </DialogTitle>
          </DialogHeader>
          {selectedDonor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Card className="p-3"><div className="text-xs text-muted-foreground">ইমেইল</div><div className="font-medium text-sm">{selectedDonor.email || "—"}</div></Card>
                <Card className="p-3"><div className="text-xs text-muted-foreground">লাইফটাইম ভ্যালু</div><div className="font-bold text-primary">৳{selectedDonor.totalAmount.toLocaleString("bn-BD")}</div></Card>
                <Card className="p-3"><div className="text-xs text-muted-foreground">মোট অনুদান</div><div className="font-bold">{selectedDonor.donationCount} বার</div></Card>
                <Card className="p-3"><div className="text-xs text-muted-foreground">প্রথম অনুদান</div><div className="text-sm">{new Date(selectedDonor.firstDonation).toLocaleDateString("bn-BD")}</div></Card>
                <Card className="p-3"><div className="text-xs text-muted-foreground">শেষ অনুদান</div><div className="text-sm">{new Date(selectedDonor.lastDonation).toLocaleDateString("bn-BD")}</div></Card>
                <Card className="p-3"><div className="text-xs text-muted-foreground">উৎস</div><div className="text-sm">{selectedDonor.sources.join(", ") || "—"}</div></Card>
              </div>

              {notes[selectedDonor.email] && (
                <Card className="p-3 bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="text-xs text-muted-foreground mb-1">নোট</div>
                  <p className="text-sm">{notes[selectedDonor.email]}</p>
                </Card>
              )}

              <h4 className="font-semibold text-sm">অনুদানের ইতিহাস</h4>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>তারিখ</TableHead><TableHead>পরিমাণ</TableHead><TableHead>পদ্ধতি</TableHead><TableHead>স্ট্যাটাস</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDonor.donations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="text-sm">{new Date(d.created_at).toLocaleDateString("bn-BD")}</TableCell>
                      <TableCell className="font-bold">৳{d.amount?.toLocaleString("bn-BD")}</TableCell>
                      <TableCell>{d.method || "—"}</TableCell>
                      <TableCell><Badge variant="secondary">{d.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>দাতার নোট — {selectedDonor?.name}</DialogTitle></DialogHeader>
          <Textarea
            rows={5}
            placeholder="দাতা সম্পর্কে নোট লিখুন..."
            value={notes[selectedDonor?.email || ""] || ""}
            onChange={(e) => setNotes({ ...notes, [selectedDonor?.email || ""]: e.target.value })}
          />
          <Button onClick={() => setNoteDialog(false)}>সংরক্ষণ করুন</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DonorCRM;
