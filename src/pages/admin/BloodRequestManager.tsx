import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface BloodRequest {
  id: string; patient_name: string; blood_group: string; required_date: string;
  location: string; contact: string; status: string; [key: string]: any;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BloodRequestManager = () => {
  const requests = useAdminCrud<BloodRequest>({ table: "blood_requests" });
  const [reqOpen, setReqOpen] = useState(false);
  const [reqForm, setReqForm] = useState({ patient_name: "", blood_group: "", required_date: "", location: "", contact: "", status: "pending" });

  const handleReqSubmit = async () => {
    if (!reqForm.patient_name || !reqForm.blood_group) return;
    await requests.create(reqForm);
    setReqOpen(false);
    setReqForm({ patient_name: "", blood_group: "", required_date: "", location: "", contact: "", status: "pending" });
  };

  if (requests.loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">রক্তদান ম্যানেজার</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 text-center"><div className="text-2xl font-bold">{requests.items.length}</div><div className="text-sm text-muted-foreground">মোট অনুরোধ</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-red-500">{requests.items.filter(r => r.status === "pending").length}</div><div className="text-sm text-muted-foreground">মুলতুবি অনুরোধ</div></Card>
      </div>

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
                      <SelectItem value="approved">অনুমোদিত</SelectItem>
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
    </div>
  );
};

export default BloodRequestManager;
