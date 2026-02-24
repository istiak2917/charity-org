import { useState, useMemo } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Filter, AlertTriangle, MapPin, Phone, Droplets, Users, Heart, CheckCircle, XCircle, Bell } from "lucide-react";

interface BloodRequest {
  id: string; patient_name: string; blood_group: string; required_date: string;
  location: string; contact: string; status: string; urgency?: string;
  hospital?: string; bags_needed?: number; notes?: string; verified?: boolean;
  verified_at?: string; requested_by?: string; [key: string]: any;
}
interface BloodDonor {
  id: string; full_name: string; blood_group: string; phone: string;
  location?: string; is_available?: boolean; last_donated?: string; show_phone?: boolean; [key: string]: any;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_OPTIONS = [
  { value: "normal", label: "সাধারণ", color: "secondary" },
  { value: "urgent", label: "জরুরি", color: "default" },
  { value: "critical", label: "অতি জরুরি", color: "destructive" },
];
const STATUS_OPTIONS = [
  { value: "pending", label: "মুলতুবি" },
  { value: "approved", label: "অনুমোদিত" },
  { value: "rejected", label: "প্রত্যাখ্যাত" },
  { value: "matched", label: "ম্যাচড" },
  { value: "fulfilled", label: "পূরণ" },
  { value: "cancelled", label: "বাতিল" },
];

const COMPATIBLE_GROUPS: Record<string, string[]> = {
  "A+": ["A+", "A-", "O+", "O-"], "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"], "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"], "O-": ["O-"],
};

const BloodRequestManager = () => {
  const requests = useAdminCrud<BloodRequest>({ table: "blood_requests" });
  const donors = useAdminCrud<BloodDonor>({ table: "blood_donors" });
  const [reqOpen, setReqOpen] = useState(false);
  const [reqForm, setReqForm] = useState({
    patient_name: "", blood_group: "", required_date: "", location: "",
    contact: "", status: "pending", urgency: "normal", hospital: "",
    bags_needed: 1, notes: ""
  });
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [matchDialog, setMatchDialog] = useState<BloodRequest | null>(null);
  const { toast } = useToast();

  const handleReqSubmit = async () => {
    if (!reqForm.patient_name || !reqForm.blood_group) return;
    const payload: any = { ...reqForm, verified: false };
    if (!payload.urgency) delete payload.urgency;
    if (!payload.hospital) delete payload.hospital;
    if (!payload.bags_needed) delete payload.bags_needed;
    if (!payload.notes) delete payload.notes;
    await requests.create(payload);
    setReqOpen(false);
    setReqForm({ patient_name: "", blood_group: "", required_date: "", location: "", contact: "", status: "pending", urgency: "normal", hospital: "", bags_needed: 1, notes: "" });
  };

  // APPROVE: set status=approved, verified=true, verified_at, then notify matching donors
  const approveRequest = async (req: BloodRequest) => {
    const updatePayload: any = { status: "approved", verified: true, verified_at: new Date().toISOString() };
    await requests.update(req.id, updatePayload);

    // Find matching donors and send notifications
    const validGroups = COMPATIBLE_GROUPS[req.blood_group] || [req.blood_group];
    const matchingDonors = donors.items.filter(d => validGroups.includes(d.blood_group) && d.is_available !== false);

    if (matchingDonors.length > 0) {
      const notifications = matchingDonors.map(d => ({
        channel: d.phone ? "sms" : "email",
        recipient_phone: d.phone || null,
        subject: `জরুরি রক্তের অনুরোধ: ${req.blood_group}`,
        message: `প্রিয় ${d.full_name}, ${req.patient_name}-এর জন্য ${req.blood_group} রক্ত প্রয়োজন। হাসপাতাল: ${req.hospital || "—"}, স্থান: ${req.location || "—"}। যোগাযোগ: ${req.contact || "—"}`,
        status: "pending",
      }));

      // Batch insert notifications (best-effort)
      try {
        await supabase.from("notification_queue").insert(notifications);
      } catch { /* best-effort */ }

      toast({
        title: "অনুমোদিত ✓",
        description: `${matchingDonors.length} জন সামঞ্জস্যপূর্ণ ডোনারকে নোটিফিকেশন পাঠানো হয়েছে।`,
      });
    } else {
      toast({ title: "অনুমোদিত ✓", description: "কোনো সামঞ্জস্যপূর্ণ ডোনার পাওয়া যায়নি।" });
    }
  };

  const rejectRequest = async (req: BloodRequest) => {
    await requests.update(req.id, { status: "rejected", verified: false } as any);
    toast({ title: "প্রত্যাখ্যাত", description: "অনুরোধটি প্রত্যাখ্যান করা হয়েছে।" });
  };

  const toggleDonorAvailability = async (d: BloodDonor) => {
    await donors.update(d.id, { is_available: !d.is_available } as any);
  };

  const filteredRequests = useMemo(() => {
    return requests.items.filter(r => {
      if (filterGroup !== "all" && r.blood_group !== filterGroup) return false;
      if (filterUrgency !== "all" && r.urgency !== filterUrgency) return false;
      return true;
    });
  }, [requests.items, filterGroup, filterUrgency]);

  const matchedDonors = useMemo(() => {
    if (!matchDialog) return [];
    const validGroups = COMPATIBLE_GROUPS[matchDialog.blood_group] || [matchDialog.blood_group];
    return donors.items.filter(d => validGroups.includes(d.blood_group) && d.is_available !== false);
  }, [matchDialog, donors.items]);

  const urgentCount = requests.items.filter(r => (r.urgency === "critical" || r.urgency === "urgent") && r.status === "pending").length;
  const pendingCount = requests.items.filter(r => r.status === "pending").length;

  const groupStats = useMemo(() => {
    const map: Record<string, number> = {};
    donors.items.filter(d => d.is_available !== false).forEach(d => { map[d.blood_group] = (map[d.blood_group] || 0) + 1; });
    return BLOOD_GROUPS.map(g => ({ group: g, count: map[g] || 0 }));
  }, [donors.items]);

  if (requests.loading || donors.loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* Pending Approval Banner */}
      {pendingCount > 0 && (
        <Card className="p-4 bg-amber-50/50 border-amber-300/50 dark:bg-amber-900/10 flex items-center gap-3">
          <Bell className="h-6 w-6 text-amber-600 animate-pulse" />
          <div>
            <div className="font-bold text-amber-700 dark:text-amber-400">{pendingCount}টি অনুরোধ অনুমোদনের অপেক্ষায়!</div>
            <div className="text-sm text-muted-foreground">অনুগ্রহ করে পর্যালোচনা করুন এবং অনুমোদন/প্রত্যাখ্যান করুন</div>
          </div>
        </Card>
      )}

      {urgentCount > 0 && (
        <Card className="p-4 bg-destructive/10 border-destructive/30 flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive animate-pulse" />
          <div>
            <div className="font-bold text-destructive">{urgentCount}টি জরুরি রক্তের অনুরোধ অপেক্ষমান!</div>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold font-heading">রক্তদান ম্যানেজার</h1>
        <Dialog open={reqOpen} onOpenChange={setReqOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন অনুরোধ (অ্যাডমিন)</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>নতুন রক্তের অনুরোধ</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="রোগীর নাম *" value={reqForm.patient_name} onChange={(e) => setReqForm({ ...reqForm, patient_name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={reqForm.blood_group} onValueChange={(v) => setReqForm({ ...reqForm, blood_group: v })}>
                  <SelectTrigger><SelectValue placeholder="রক্তের গ্রুপ *" /></SelectTrigger>
                  <SelectContent>{BLOOD_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={reqForm.urgency} onValueChange={(v) => setReqForm({ ...reqForm, urgency: v })}>
                  <SelectTrigger><SelectValue placeholder="জরুরিতা" /></SelectTrigger>
                  <SelectContent>{URGENCY_OPTIONS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="date" value={reqForm.required_date} onChange={(e) => setReqForm({ ...reqForm, required_date: e.target.value })} />
                <Input type="number" placeholder="ব্যাগ সংখ্যা" value={reqForm.bags_needed || ""} onChange={(e) => setReqForm({ ...reqForm, bags_needed: Number(e.target.value) })} />
              </div>
              <Input placeholder="হাসপাতাল" value={reqForm.hospital} onChange={(e) => setReqForm({ ...reqForm, hospital: e.target.value })} />
              <Input placeholder="স্থান / এলাকা" value={reqForm.location} onChange={(e) => setReqForm({ ...reqForm, location: e.target.value })} />
              <Input placeholder="যোগাযোগ নম্বর" value={reqForm.contact} onChange={(e) => setReqForm({ ...reqForm, contact: e.target.value })} />
              <Button onClick={handleReqSubmit} className="w-full">যোগ করুন</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center"><Droplets className="h-5 w-5 text-destructive mx-auto mb-1" /><div className="text-2xl font-bold">{requests.items.length}</div><div className="text-sm text-muted-foreground">মোট অনুরোধ</div></Card>
        <Card className="p-4 text-center"><Bell className="h-5 w-5 text-amber-500 mx-auto mb-1" /><div className="text-2xl font-bold text-amber-600">{pendingCount}</div><div className="text-sm text-muted-foreground">অপেক্ষমান</div></Card>
        <Card className="p-4 text-center"><AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" /><div className="text-2xl font-bold text-destructive">{urgentCount}</div><div className="text-sm text-muted-foreground">জরুরি</div></Card>
        <Card className="p-4 text-center"><Users className="h-5 w-5 text-primary mx-auto mb-1" /><div className="text-2xl font-bold">{donors.items.length}</div><div className="text-sm text-muted-foreground">মোট ডোনার</div></Card>
        <Card className="p-4 text-center"><Heart className="h-5 w-5 text-green-600 mx-auto mb-1" /><div className="text-2xl font-bold text-green-600">{requests.items.filter(r => r.status === "fulfilled").length}</div><div className="text-sm text-muted-foreground">পূরণ</div></Card>
      </div>

      {/* Blood Group Availability */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">গ্রুপ ভিত্তিক ডোনার প্রাপ্যতা</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {groupStats.map(g => (
            <div key={g.group} className="text-center p-3 rounded-lg bg-muted/50 border">
              <div className="text-lg font-bold text-destructive">{g.group}</div>
              <div className="text-sm font-medium">{g.count} জন</div>
            </div>
          ))}
        </div>
      </Card>

      <Tabs defaultValue="requests">
        <TabsList><TabsTrigger value="requests">অনুরোধ</TabsTrigger><TabsTrigger value="donors">ডোনার তালিকা</TabsTrigger></TabsList>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterGroup} onValueChange={setFilterGroup}>
              <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব গ্রুপ</SelectItem>
                {BLOOD_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterUrgency} onValueChange={setFilterUrgency}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব জরুরিতা</SelectItem>
                {URGENCY_OPTIONS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>রোগী</TableHead><TableHead>গ্রুপ</TableHead><TableHead>জরুরিতা</TableHead>
                  <TableHead>হাসপাতাল</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead>যাচাই</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((r) => {
                  const urgencyOpt = URGENCY_OPTIONS.find(u => u.value === r.urgency);
                  return (
                    <TableRow key={r.id} className={r.urgency === "critical" ? "bg-destructive/5" : r.status === "pending" ? "bg-amber-50/30 dark:bg-amber-900/5" : ""}>
                      <TableCell>
                        <div className="font-medium">{r.patient_name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {r.location && <><MapPin className="h-3 w-3" /> {r.location}</>}
                        </div>
                        {r.contact && <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {r.contact}</div>}
                      </TableCell>
                      <TableCell><Badge variant="destructive" className="text-sm">{r.blood_group}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={urgencyOpt?.color as any || "secondary"}>
                          {urgencyOpt?.label || r.urgency || "সাধারণ"}
                        </Badge>
                        {r.bags_needed && <div className="text-xs text-muted-foreground mt-1">{r.bags_needed} ব্যাগ</div>}
                      </TableCell>
                      <TableCell className="text-sm">{r.hospital || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : r.status === "fulfilled" ? "default" : "secondary"}>
                          {STATUS_OPTIONS.find(s => s.value === r.status)?.label || r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {r.verified ? (
                          <Badge variant="outline" className="text-green-600 border-green-300 gap-1"><CheckCircle className="h-3 w-3" />যাচাইকৃত</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">অযাচাই</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {r.status === "pending" && (
                            <>
                              <Button size="sm" variant="default" className="h-7 text-xs gap-1" onClick={() => approveRequest(r)}>
                                <CheckCircle className="h-3 w-3" /> অনুমোদন
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive" onClick={() => rejectRequest(r)}>
                                <XCircle className="h-3 w-3" /> প্রত্যাখ্যান
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setMatchDialog(r)}>
                            <Users className="h-3 w-3" /> ম্যাচ
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => requests.remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredRequests.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">কোনো অনুরোধ নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="donors" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow><TableHead>নাম</TableHead><TableHead>গ্রুপ</TableHead><TableHead>ফোন</TableHead><TableHead>এলাকা</TableHead><TableHead>সর্বশেষ দান</TableHead><TableHead>ফোন প্রকাশ</TableHead><TableHead>প্রাপ্যতা</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {donors.items.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.full_name}</TableCell>
                    <TableCell><Badge variant="destructive">{d.blood_group}</Badge></TableCell>
                    <TableCell>{d.phone || "—"}</TableCell>
                    <TableCell>{d.location || "—"}</TableCell>
                    <TableCell className="text-sm">{d.last_donated ? new Date(d.last_donated).toLocaleDateString("bn-BD") : "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => donors.update(d.id, { show_phone: !d.show_phone } as any)}>
                        {d.show_phone ? <Badge>প্রকাশিত</Badge> : <Badge variant="secondary">গোপন</Badge>}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleDonorAvailability(d)}>
                        {d.is_available !== false ? <Badge variant="default">সক্রিয়</Badge> : <Badge variant="secondary">নিষ্ক্রিয়</Badge>}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {donors.items.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">কোনো ডোনার নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Donor Matching Dialog */}
      <Dialog open={!!matchDialog} onOpenChange={(v) => { if (!v) setMatchDialog(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>ডোনার ম্যাচিং — {matchDialog?.blood_group}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mb-3">
            রোগী: <span className="font-medium text-foreground">{matchDialog?.patient_name}</span> | 
            স্থান: {matchDialog?.location || "—"} | 
            {matchDialog?.bags_needed && ` ${matchDialog.bags_needed} ব্যাগ প্রয়োজন`}
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {matchedDonors.length > 0 ? matchedDonors.map(d => (
              <Card key={d.id} className="p-3 flex items-center gap-3">
                <Badge variant="destructive">{d.blood_group}</Badge>
                <div className="flex-1">
                  <div className="font-medium text-sm">{d.full_name}</div>
                  <div className="text-xs text-muted-foreground">{d.location || "—"}</div>
                </div>
                {d.phone && (
                  <a href={`tel:${d.phone}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {d.phone}
                  </a>
                )}
              </Card>
            )) : (
              <div className="text-center text-muted-foreground py-6">কোনো সামঞ্জস্যপূর্ণ ডোনার পাওয়া যায়নি</div>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-2">{matchedDonors.length} জন সামঞ্জস্যপূর্ণ ডোনার পাওয়া গেছে</div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BloodRequestManager;
