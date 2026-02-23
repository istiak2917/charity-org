import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Droplets, Phone, MapPin, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BloodRequest { id: string; patient_name: string; blood_group: string; required_date: string; location: string; contact: string; status: string; }
interface BloodDonor { id: string; name: string; blood_group: string; phone: string; location: string; is_available: boolean; }

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BloodPage = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [reqOpen, setReqOpen] = useState(false);
  const [reqForm, setReqForm] = useState({ patient_name: "", blood_group: "", required_date: "", location: "", contact: "" });
  const [filterGroup, setFilterGroup] = useState("সব");
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      supabase.from("blood_requests").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("blood_donors").select("*").eq("is_available", true).order("created_at", { ascending: false }),
    ]).then(([reqRes, donRes]) => {
      if (reqRes.data) setRequests(reqRes.data);
      if (donRes.data) setDonors(donRes.data);
    });
  }, []);

  const handleSubmit = async () => {
    if (!reqForm.patient_name || !reqForm.blood_group) return;
    const { error } = await supabase.from("blood_requests").insert({ ...reqForm, status: "pending" });
    if (error) toast({ title: "অনুরোধ ব্যর্থ", description: error.message, variant: "destructive" });
    else {
      toast({ title: "রক্তের অনুরোধ পাঠানো হয়েছে!" });
      setReqOpen(false);
      setReqForm({ patient_name: "", blood_group: "", required_date: "", location: "", contact: "" });
      // Refresh
      const { data } = await supabase.from("blood_requests").select("*").eq("status", "pending").order("created_at", { ascending: false });
      if (data) setRequests(data);
    }
  };

  const filteredDonors = filterGroup === "সব" ? donors : donors.filter(d => d.blood_group === filterGroup);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Droplets className="h-12 w-12 text-primary mx-auto mb-3" />
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">রক্তদান</h1>
          <p className="text-muted-foreground">জরুরি রক্তের প্রয়োজনে আমরা আছি আপনার পাশে</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Pending Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-heading">জরুরি রক্তের অনুরোধ</h2>
              <Dialog open={reqOpen} onOpenChange={setReqOpen}>
                <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> অনুরোধ</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>রক্তের অনুরোধ করুন</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <Input placeholder="রোগীর নাম" value={reqForm.patient_name} onChange={(e) => setReqForm({ ...reqForm, patient_name: e.target.value })} />
                    <Select value={reqForm.blood_group} onValueChange={(v) => setReqForm({ ...reqForm, blood_group: v })}>
                      <SelectTrigger><SelectValue placeholder="রক্তের গ্রুপ" /></SelectTrigger>
                      <SelectContent>{BLOOD_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input type="date" value={reqForm.required_date} onChange={(e) => setReqForm({ ...reqForm, required_date: e.target.value })} />
                    <Input placeholder="হাসপাতাল / স্থান" value={reqForm.location} onChange={(e) => setReqForm({ ...reqForm, location: e.target.value })} />
                    <Input placeholder="যোগাযোগ নম্বর" value={reqForm.contact} onChange={(e) => setReqForm({ ...reqForm, contact: e.target.value })} />
                    <Button onClick={handleSubmit} className="w-full">অনুরোধ পাঠান</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-3">
              {requests.map((r) => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{r.patient_name}</span>
                    <Badge variant="destructive" className="text-lg">{r.blood_group}</Badge>
                  </div>
                  {r.location && <div className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.location}</div>}
                  {r.contact && <div className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {r.contact}</div>}
                  {r.required_date && <div className="text-xs text-muted-foreground mt-1">প্রয়োজন: {new Date(r.required_date).toLocaleDateString("bn-BD")}</div>}
                </Card>
              ))}
              {requests.length === 0 && <div className="text-center text-muted-foreground py-8">বর্তমানে কোনো জরুরি অনুরোধ নেই</div>}
            </div>
          </div>

          {/* Available Donors */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-heading">উপলব্ধ দাতা</h2>
              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="সব">সব</SelectItem>
                  {BLOOD_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              {filteredDonors.map((d) => (
                <Card key={d.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{d.name}</div>
                    {d.location && <div className="text-xs text-muted-foreground">{d.location}</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg font-bold">{d.blood_group}</Badge>
                    {d.phone && (
                      <a href={`tel:${d.phone}`} className="text-primary hover:underline text-sm flex items-center gap-1">
                        <Phone className="h-3 w-3" /> কল
                      </a>
                    )}
                  </div>
                </Card>
              ))}
              {filteredDonors.length === 0 && <div className="text-center text-muted-foreground py-8">কোনো দাতা পাওয়া যায়নি</div>}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BloodPage;
