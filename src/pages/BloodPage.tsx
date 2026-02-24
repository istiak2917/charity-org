import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Droplets, Phone, MapPin, Plus, AlertTriangle, Filter, Lock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface BloodRequest {
  id: string; patient_name: string; blood_group: string; required_date: string;
  location: string; contact: string; status: string; urgency?: string;
  hospital?: string; bags_needed?: number; verified?: boolean; verified_at?: string;
  requested_by?: string; [key: string]: any;
}

interface BloodDonor {
  id: string; full_name: string; blood_group: string; phone?: string;
  location?: string; is_available?: boolean; show_phone?: boolean; [key: string]: any;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BloodPage = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [reqOpen, setReqOpen] = useState(false);
  const [reqForm, setReqForm] = useState({ patient_name: "", blood_group: "", required_date: "", location: "", contact: "", urgency: "normal", hospital: "", bags_needed: 1 });
  const [filterGroup, setFilterGroup] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadData = async () => {
    // Public: only show approved + verified requests
    const { data: reqs } = await supabase.from("blood_requests").select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    setRequests(reqs || []);

    // Public: show donors with limited info
    const { data: d } = await supabase.from("blood_donors").select("id, full_name, blood_group, location, is_available, show_phone, phone")
      .order("full_name");
    setDonors(d || []);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "লগইন প্রয়োজন", description: "রক্তের অনুরোধ করতে আপনাকে লগইন করতে হবে।", variant: "destructive" });
      return;
    }
    if (!reqForm.patient_name || !reqForm.blood_group) {
      toast({ title: "রোগীর নাম ও রক্তের গ্রুপ দিন", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const payload: any = {
      ...reqForm,
      status: "pending",
      verified: false,
      requested_by: user.id,
    };
    if (!payload.urgency) delete payload.urgency;
    if (!payload.hospital) delete payload.hospital;
    if (!payload.bags_needed) delete payload.bags_needed;

    // Safe insert with column error handling
    for (let i = 0; i < 5; i++) {
      const { error } = await supabase.from("blood_requests").insert(payload);
      if (!error) break;
      const m = error.message?.match(/Could not find the '(\w+)' column/);
      if (m) { delete payload[m[1]]; continue; }
      toast({ title: "অনুরোধ ব্যর্থ", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // Notify admin via notification_queue
    try {
      await supabase.from("notification_queue").insert({
        channel: "email",
        subject: `নতুন রক্তের অনুরোধ: ${reqForm.blood_group} — ${reqForm.patient_name}`,
        message: `রোগী: ${reqForm.patient_name}\nগ্রুপ: ${reqForm.blood_group}\nহাসপাতাল: ${reqForm.hospital || "—"}\nস্থান: ${reqForm.location || "—"}\nজরুরিতা: ${reqForm.urgency}\n\nঅনুগ্রহ করে /admin/blood থেকে অনুমোদন করুন।`,
        status: "pending",
      });
    } catch { /* notification is best-effort */ }

    toast({
      title: "অনুরোধ পাঠানো হয়েছে!",
      description: "অ্যাডমিন অনুমোদনের পর এটি প্রকাশিত হবে।",
    });
    setReqOpen(false);
    setReqForm({ patient_name: "", blood_group: "", required_date: "", location: "", contact: "", urgency: "normal", hospital: "", bags_needed: 1 });
    setSubmitting(false);
  };

  // Only show approved requests publicly
  const activeRequests = useMemo(() => {
    return requests.filter(r => filterGroup === "all" || r.blood_group === filterGroup);
  }, [requests, filterGroup]);

  const urgentRequests = activeRequests.filter(r => r.urgency === "critical" || r.urgency === "urgent");

  // Donors: hide phone unless show_phone is true
  const publicDonors = useMemo(() => {
    return donors.filter(d => d.is_available !== false);
  }, [donors]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Droplets className="h-12 w-12 text-destructive mx-auto mb-3" />
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">রক্তদান</h1>
          <p className="text-muted-foreground">জরুরি রক্তের প্রয়োজনে আমরা আছি আপনার পাশে</p>
        </div>

        {/* Emergency Banner */}
        {urgentRequests.length > 0 && (
          <Card className="p-4 bg-destructive/10 border-destructive/30 mb-6 max-w-2xl mx-auto flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive animate-pulse shrink-0" />
            <div>
              <div className="font-bold text-destructive">{urgentRequests.length}টি জরুরি রক্তের অনুরোধ!</div>
              <div className="text-sm text-muted-foreground">অনুগ্রহ করে সাহায্য করুন</div>
            </div>
          </Card>
        )}

        <Tabs defaultValue="requests" className="max-w-3xl mx-auto">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="requests" className="flex-1">জরুরি অনুরোধ</TabsTrigger>
            <TabsTrigger value="donors" className="flex-1">ডোনার তালিকা</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-xl font-bold font-heading">অনুমোদিত রক্তের অনুরোধ</h2>
              <div className="flex gap-2">
                <Select value={filterGroup} onValueChange={setFilterGroup}>
                  <SelectTrigger className="w-[100px] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব</SelectItem>
                    {BLOOD_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>

                {user ? (
                  <Dialog open={reqOpen} onOpenChange={setReqOpen}>
                    <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> অনুরোধ</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>রক্তের অনুরোধ করুন</DialogTitle></DialogHeader>
                      <p className="text-sm text-muted-foreground mb-2">অনুরোধটি অ্যাডমিন অনুমোদনের পর প্রকাশিত হবে।</p>
                      <div className="space-y-3">
                        <Input placeholder="রোগীর নাম *" value={reqForm.patient_name} onChange={(e) => setReqForm({ ...reqForm, patient_name: e.target.value })} />
                        <div className="grid grid-cols-2 gap-3">
                          <Select value={reqForm.blood_group} onValueChange={(v) => setReqForm({ ...reqForm, blood_group: v })}>
                            <SelectTrigger><SelectValue placeholder="রক্তের গ্রুপ *" /></SelectTrigger>
                            <SelectContent>{BLOOD_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                          </Select>
                          <Select value={reqForm.urgency} onValueChange={(v) => setReqForm({ ...reqForm, urgency: v })}>
                            <SelectTrigger><SelectValue placeholder="জরুরিতা" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">সাধারণ</SelectItem>
                              <SelectItem value="urgent">জরুরি</SelectItem>
                              <SelectItem value="critical">অতি জরুরি</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input type="date" value={reqForm.required_date} onChange={(e) => setReqForm({ ...reqForm, required_date: e.target.value })} />
                        <Input placeholder="হাসপাতাল" value={reqForm.hospital} onChange={(e) => setReqForm({ ...reqForm, hospital: e.target.value })} />
                        <Input placeholder="স্থান / এলাকা" value={reqForm.location} onChange={(e) => setReqForm({ ...reqForm, location: e.target.value })} />
                        <Input placeholder="যোগাযোগ নম্বর" value={reqForm.contact} onChange={(e) => setReqForm({ ...reqForm, contact: e.target.value })} />
                        <Button onClick={handleSubmit} className="w-full" disabled={submitting}>
                          {submitting ? "পাঠানো হচ্ছে..." : "অনুরোধ পাঠান"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Link to="/login">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Lock className="h-4 w-4" /> লগইন করে অনুরোধ করুন
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {activeRequests.map((r) => (
                <Card key={r.id} className={`p-4 ${r.urgency === "critical" ? "border-destructive/50 bg-destructive/5" : r.urgency === "urgent" ? "border-amber-300/50 bg-amber-50/30" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{r.patient_name}</span>
                      {(r.urgency === "critical" || r.urgency === "urgent") && (
                        <Badge variant="destructive" className="text-[10px]">
                          {r.urgency === "critical" ? "অতি জরুরি" : "জরুরি"}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] text-green-600">✓ অনুমোদিত</Badge>
                    </div>
                    <Badge variant="destructive" className="text-lg">{r.blood_group}</Badge>
                  </div>
                  {r.hospital && <div className="text-sm text-muted-foreground mb-1">🏥 {r.hospital}</div>}
                  {r.location && <div className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.location}</div>}
                  {r.contact && <div className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> <a href={`tel:${r.contact}`} className="hover:text-primary">{r.contact}</a></div>}
                  <div className="flex items-center justify-between mt-2">
                    {r.required_date && <div className="text-xs text-muted-foreground">প্রয়োজন: {new Date(r.required_date).toLocaleDateString("bn-BD")}</div>}
                    {r.bags_needed && <div className="text-xs text-muted-foreground">{r.bags_needed} ব্যাগ</div>}
                  </div>
                </Card>
              ))}
              {activeRequests.length === 0 && <div className="text-center text-muted-foreground py-8">বর্তমানে কোনো অনুমোদিত অনুরোধ নেই</div>}
            </div>
          </TabsContent>

          <TabsContent value="donors">
            <div className="mb-4">
              <h2 className="text-xl font-bold font-heading mb-1">রক্তদাতা তালিকা</h2>
              <p className="text-sm text-muted-foreground">শুধুমাত্র সক্রিয় ডোনারদের সীমিত তথ্য দেখানো হচ্ছে</p>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>নাম</TableHead>
                    <TableHead>রক্তের গ্রুপ</TableHead>
                    <TableHead>এলাকা</TableHead>
                    <TableHead>যোগাযোগ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publicDonors.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.full_name}</TableCell>
                      <TableCell><Badge variant="destructive">{d.blood_group}</Badge></TableCell>
                      <TableCell>{d.location || "—"}</TableCell>
                      <TableCell>
                        {d.show_phone && d.phone ? (
                          <a href={`tel:${d.phone}`} className="text-primary hover:underline flex items-center gap-1"><Phone className="h-3 w-3" />{d.phone}</a>
                        ) : (
                          <span className="text-muted-foreground text-sm">সংস্থায় যোগাযোগ করুন</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {publicDonors.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">কোনো সক্রিয় ডোনার নেই</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default BloodPage;
