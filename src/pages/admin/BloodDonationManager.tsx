import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface BloodDonor { id: string; name: string; blood_group: string; phone: string; location: string; last_donation_date: string; is_available: boolean; }
interface BloodRequest { id: string; patient_name: string; blood_group: string; required_date: string; location: string; contact: string; provider_name: string; status: string; }

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const getNextEligibleDate = (lastDate: string) => {
  if (!lastDate) return "যেকোনো সময়";
  const d = new Date(lastDate);
  d.setMonth(d.getMonth() + 3);
  return d.toLocaleDateString("bn-BD");
};

const BloodDonationManager = () => {
  const donors = useAdminCrud<BloodDonor>({ table: "blood_donors" });
  const requests = useAdminCrud<BloodRequest>({ table: "blood_requests" });

  const [donorOpen, setDonorOpen] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<BloodDonor | null>(null);
  const [editingReq, setEditingReq] = useState<BloodRequest | null>(null);

  const [donorForm, setDonorForm] = useState({ name: "", blood_group: "A+", phone: "", location: "", last_donation_date: "", is_available: true });
  const [reqForm, setReqForm] = useState({ patient_name: "", blood_group: "A+", required_date: "", location: "", contact: "", provider_name: "", status: "pending" });

  const handleDonorSubmit = async () => {
    if (!donorForm.name) return;
    if (editingDonor) await donors.update(editingDonor.id, donorForm);
    else await donors.create(donorForm);
    setDonorOpen(false); setEditingDonor(null);
    setDonorForm({ name: "", blood_group: "A+", phone: "", location: "", last_donation_date: "", is_available: true });
  };

  const handleReqSubmit = async () => {
    if (!reqForm.patient_name) return;
    if (editingReq) await requests.update(editingReq.id, reqForm);
    else await requests.create(reqForm);
    setReqOpen(false); setEditingReq(null);
    setReqForm({ patient_name: "", blood_group: "A+", required_date: "", location: "", contact: "", provider_name: "", status: "pending" });
  };

  const editDonor = (d: BloodDonor) => {
    setEditingDonor(d);
    setDonorForm({ name: d.name, blood_group: d.blood_group, phone: d.phone || "", location: d.location || "", last_donation_date: d.last_donation_date || "", is_available: d.is_available });
    setDonorOpen(true);
  };

  const editReq = (r: BloodRequest) => {
    setEditingReq(r);
    setReqForm({ patient_name: r.patient_name, blood_group: r.blood_group, required_date: r.required_date || "", location: r.location || "", contact: r.contact || "", provider_name: r.provider_name || "", status: r.status });
    setReqOpen(true);
  };

  if (donors.loading || requests.loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">রক্তদান ম্যানেজমেন্ট</h1>

      <Tabs defaultValue="donors">
        <TabsList><TabsTrigger value="donors">রক্তদাতা</TabsTrigger><TabsTrigger value="requests">জরুরি রিকোয়েস্ট</TabsTrigger></TabsList>

        <TabsContent value="donors" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={donorOpen} onOpenChange={(v) => { setDonorOpen(v); if (!v) setEditingDonor(null); }}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> দাতা যোগ</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingDonor ? "দাতা সম্পাদনা" : "নতুন দাতা"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="নাম" value={donorForm.name} onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })} />
                  <Select value={donorForm.blood_group} onValueChange={(v) => setDonorForm({ ...donorForm, blood_group: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{BLOOD_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="ফোন" value={donorForm.phone} onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })} />
                  <Input placeholder="অবস্থান" value={donorForm.location} onChange={(e) => setDonorForm({ ...donorForm, location: e.target.value })} />
                  <Input type="date" value={donorForm.last_donation_date} onChange={(e) => setDonorForm({ ...donorForm, last_donation_date: e.target.value })} />
                  <Button onClick={handleDonorSubmit} className="w-full">{editingDonor ? "আপডেট" : "যোগ করুন"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>নাম</TableHead><TableHead>গ্রুপ</TableHead><TableHead>ফোন</TableHead><TableHead>অবস্থান</TableHead><TableHead>পরবর্তী দানের তারিখ</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
              <TableBody>
                {donors.items.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell><Badge variant="outline">{d.blood_group}</Badge></TableCell>
                    <TableCell>{d.phone || "-"}</TableCell>
                    <TableCell>{d.location || "-"}</TableCell>
                    <TableCell>{getNextEligibleDate(d.last_donation_date)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => editDonor(d)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => donors.remove(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {donors.items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">কোনো দাতা নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={reqOpen} onOpenChange={(v) => { setReqOpen(v); if (!v) setEditingReq(null); }}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> রিকোয়েস্ট যোগ</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingReq ? "রিকোয়েস্ট সম্পাদনা" : "নতুন রিকোয়েস্ট"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="রোগীর নাম" value={reqForm.patient_name} onChange={(e) => setReqForm({ ...reqForm, patient_name: e.target.value })} />
                  <Select value={reqForm.blood_group} onValueChange={(v) => setReqForm({ ...reqForm, blood_group: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{BLOOD_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="date" value={reqForm.required_date} onChange={(e) => setReqForm({ ...reqForm, required_date: e.target.value })} />
                  <Input placeholder="অবস্থান" value={reqForm.location} onChange={(e) => setReqForm({ ...reqForm, location: e.target.value })} />
                  <Input placeholder="যোগাযোগ" value={reqForm.contact} onChange={(e) => setReqForm({ ...reqForm, contact: e.target.value })} />
                  <Input placeholder="প্রদানকারীর নাম" value={reqForm.provider_name} onChange={(e) => setReqForm({ ...reqForm, provider_name: e.target.value })} />
                  <Select value={reqForm.status} onValueChange={(v) => setReqForm({ ...reqForm, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleReqSubmit} className="w-full">{editingReq ? "আপডেট" : "যোগ করুন"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>রোগী</TableHead><TableHead>গ্রুপ</TableHead><TableHead>তারিখ</TableHead><TableHead>অবস্থান</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
              <TableBody>
                {requests.items.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.patient_name}</TableCell>
                    <TableCell><Badge variant="outline">{r.blood_group}</Badge></TableCell>
                    <TableCell>{r.required_date ? new Date(r.required_date).toLocaleDateString("bn-BD") : "-"}</TableCell>
                    <TableCell>{r.location || "-"}</TableCell>
                    <TableCell><Badge variant={r.status === "fulfilled" ? "default" : "secondary"}>{r.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => editReq(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => requests.remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {requests.items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">কোনো রিকোয়েস্ট নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BloodDonationManager;
