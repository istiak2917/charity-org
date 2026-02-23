import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface BloodDonor {
  id: string; name: string; blood_group: string; phone: string;
  location: string; last_donation_date: string; is_available: boolean;
}
interface BloodRequest {
  id: string; patient_name: string; blood_group: string; required_date: string;
  location: string; contact: string; provider_name: string; status: string;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BloodRequestManager = () => {
  const donors = useAdminCrud<BloodDonor>({ table: "blood_donors" });
  const requests = useAdminCrud<BloodRequest>({ table: "blood_requests" });

  const [donorOpen, setDonorOpen] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [donorForm, setDonorForm] = useState({ name: "", blood_group: "", phone: "", location: "", last_donation_date: "", is_available: true });
  const [reqForm, setReqForm] = useState({ patient_name: "", blood_group: "", required_date: "", location: "", contact: "", provider_name: "", status: "pending" });

  const handleDonorSubmit = async () => {
    if (!donorForm.name || !donorForm.blood_group) return;
    await donors.create(donorForm);
    setDonorOpen(false);
    setDonorForm({ name: "", blood_group: "", phone: "", location: "", last_donation_date: "", is_available: true });
  };

  const handleReqSubmit = async () => {
    if (!reqForm.patient_name || !reqForm.blood_group) return;
    await requests.create(reqForm);
    setReqOpen(false);
    setReqForm({ patient_name: "", blood_group: "", required_date: "", location: "", contact: "", provider_name: "", status: "pending" });
  };

  if (donors.loading || requests.loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">রক্তদান ম্যানেজার</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center"><div className="text-2xl font-bold">{donors.items.length}</div><div className="text-sm text-muted-foreground">মোট দাতা</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-green-600">{donors.items.filter(d => d.is_available).length}</div><div className="text-sm text-muted-foreground">উপলব্ধ দাতা</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-red-500">{requests.items.filter(r => r.status === "pending").length}</div><div className="text-sm text-muted-foreground">মুলতুবি অনুরোধ</div></Card>
      </div>

      <Tabs defaultValue="requests">
        <TabsList><TabsTrigger value="requests">রক্তের অনুরোধ</TabsTrigger><TabsTrigger value="donors">দাতা তালিকা</TabsTrigger></TabsList>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={reqOpen} onOpenChange={setReqOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন অনুরোধ</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>নতুন রক্তের অনুরোধ</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="রোগীর নাম" value={reqForm.patient_name} onChange={(e) => setReqForm({ ...reqForm, patient_name: e.target.value })} />
                  <Select value={reqForm.blood_group} onValueChange={(v) => setReqForm({ ...reqForm, blood_group: v })}>
                    <SelectTrigger><SelectValue placeholder="রক্তের গ্রুপ" /></SelectTrigger>
                    <SelectContent>{BLOOD_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="date" value={reqForm.required_date} onChange={(e) => setReqForm({ ...reqForm, required_date: e.target.value })} />
                  <Input placeholder="স্থান" value={reqForm.location} onChange={(e) => setReqForm({ ...reqForm, location: e.target.value })} />
                  <Input placeholder="যোগাযোগ" value={reqForm.contact} onChange={(e) => setReqForm({ ...reqForm, contact: e.target.value })} />
                  <Button onClick={handleReqSubmit} className="w-full">যোগ করুন</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>রোগী</TableHead><TableHead>গ্রুপ</TableHead><TableHead>স্থান</TableHead><TableHead>তারিখ</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
              <TableBody>
                {requests.items.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.patient_name}</TableCell>
                    <TableCell><Badge variant="outline">{r.blood_group}</Badge></TableCell>
                    <TableCell>{r.location || "-"}</TableCell>
                    <TableCell>{r.required_date ? new Date(r.required_date).toLocaleDateString("bn-BD") : "-"}</TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(v) => requests.update(r.id, { status: v } as any)}>
                        <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">মুলতুবি</SelectItem>
                          <SelectItem value="fulfilled">পূরণ</SelectItem>
                          <SelectItem value="cancelled">বাতিল</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => requests.remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {requests.items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">কোনো অনুরোধ নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="donors" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={donorOpen} onOpenChange={setDonorOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> দাতা যোগ</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>নতুন রক্তদাতা</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="নাম" value={donorForm.name} onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })} />
                  <Select value={donorForm.blood_group} onValueChange={(v) => setDonorForm({ ...donorForm, blood_group: v })}>
                    <SelectTrigger><SelectValue placeholder="রক্তের গ্রুপ" /></SelectTrigger>
                    <SelectContent>{BLOOD_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="ফোন" value={donorForm.phone} onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })} />
                  <Input placeholder="এলাকা" value={donorForm.location} onChange={(e) => setDonorForm({ ...donorForm, location: e.target.value })} />
                  <Input type="date" placeholder="শেষ দানের তারিখ" value={donorForm.last_donation_date} onChange={(e) => setDonorForm({ ...donorForm, last_donation_date: e.target.value })} />
                  <Button onClick={handleDonorSubmit} className="w-full">যোগ করুন</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>নাম</TableHead><TableHead>গ্রুপ</TableHead><TableHead>ফোন</TableHead><TableHead>এলাকা</TableHead><TableHead>উপলব্ধ</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
              <TableBody>
                {donors.items.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell><Badge variant="outline">{d.blood_group}</Badge></TableCell>
                    <TableCell>{d.phone || "-"}</TableCell>
                    <TableCell>{d.location || "-"}</TableCell>
                    <TableCell><Badge variant={d.is_available ? "default" : "secondary"}>{d.is_available ? "হ্যাঁ" : "না"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => donors.remove(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {donors.items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">কোনো দাতা নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BloodRequestManager;
