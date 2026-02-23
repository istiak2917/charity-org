import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Droplets, Phone, MapPin, Plus, AlertTriangle, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BloodRequest {
  id: string; patient_name: string; blood_group: string; required_date: string;
  location: string; contact: string; status: string; urgency?: string;
  hospital?: string; bags_needed?: number; [key: string]: any;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BloodPage = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [reqOpen, setReqOpen] = useState(false);
  const [reqForm, setReqForm] = useState({ patient_name: "", blood_group: "", required_date: "", location: "", contact: "", urgency: "normal", hospital: "", bags_needed: 1 });
  const [filterGroup, setFilterGroup] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("blood_requests").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setRequests(data); });
  }, []);

  const handleSubmit = async () => {
    if (!reqForm.patient_name || !reqForm.blood_group) return;
    const payload: any = { ...reqForm, status: "pending" };
    if (!payload.urgency) delete payload.urgency;
    if (!payload.hospital) delete payload.hospital;
    if (!payload.bags_needed) delete payload.bags_needed;
    
    for (let i = 0; i < 5; i++) {
      const { error } = await supabase.from("blood_requests").insert(payload);
      if (!error) break;
      const m = error.message?.match(/Could not find the '(\w+)' column/);
      if (m) { delete payload[m[1]]; continue; }
      toast({ title: "অনুরোধ ব্যর্থ", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "রক্তের অনুরোধ পাঠানো হয়েছে!" });
    setReqOpen(false);
    setReqForm({ patient_name: "", blood_group: "", required_date: "", location: "", contact: "", urgency: "normal", hospital: "", bags_needed: 1 });
    const { data } = await supabase.from("blood_requests").select("*").order("created_at", { ascending: false });
    if (data) setRequests(data);
  };

  const activeRequests = useMemo(() => {
    return requests
      .filter(r => r.status === "pending" || r.status === "approved")
      .filter(r => filterGroup === "all" || r.blood_group === filterGroup);
  }, [requests, filterGroup]);

  const urgentRequests = activeRequests.filter(r => r.urgency === "critical" || r.urgency === "urgent");

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

        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-bold font-heading">জরুরি রক্তের অনুরোধ</h2>
            <div className="flex gap-2">
              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger className="w-[100px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব</SelectItem>
                  {BLOOD_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
              <Dialog open={reqOpen} onOpenChange={setReqOpen}>
                <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> অনুরোধ</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>রক্তের অনুরোধ করুন</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <Input placeholder="রোগীর নাম" value={reqForm.patient_name} onChange={(e) => setReqForm({ ...reqForm, patient_name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <Select value={reqForm.blood_group} onValueChange={(v) => setReqForm({ ...reqForm, blood_group: v })}>
                        <SelectTrigger><SelectValue placeholder="রক্তের গ্রুপ" /></SelectTrigger>
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
                    <Input placeholder="হাসপাতাল / স্থান" value={reqForm.location} onChange={(e) => setReqForm({ ...reqForm, location: e.target.value })} />
                    <Input placeholder="যোগাযোগ নম্বর" value={reqForm.contact} onChange={(e) => setReqForm({ ...reqForm, contact: e.target.value })} />
                    <Button onClick={handleSubmit} className="w-full">অনুরোধ পাঠান</Button>
                  </div>
                </DialogContent>
              </Dialog>
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
            {activeRequests.length === 0 && <div className="text-center text-muted-foreground py-8">বর্তমানে কোনো জরুরি অনুরোধ নেই</div>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BloodPage;
