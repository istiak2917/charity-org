import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck, Download, QrCode, UserCheck } from "lucide-react";

const AttendanceTracker = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data: e } = await supabase.from("events").select("id, title").order("date", { ascending: false });
    setEvents(e || []);
    const { data: a } = await supabase.from("event_attendance").select("*").order("created_at", { ascending: false });
    setAttendance(a || []);
    const { data: p } = await supabase.from("profiles").select("id, full_name");
    setProfiles(p || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const registerAttendee = async (userId: string) => {
    if (!selectedEvent) return;
    const { error } = await supabase.from("event_attendance").insert({ event_id: selectedEvent, user_id: userId });
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else { toast({ title: "রেজিস্ট্রেশন সম্পন্ন!" }); load(); }
  };

  const checkIn = async (id: string) => {
    await supabase.from("event_attendance").update({ checked_in: true, checked_in_at: new Date().toISOString() }).eq("id", id);
    toast({ title: "চেক-ইন সম্পন্ন!" });
    load();
  };

  const getName = (id: string) => profiles.find(p => p.id === id)?.full_name || id?.slice(0, 8);
  const getEventName = (id: string) => events.find(e => e.id === id)?.title || "—";

  const filtered = selectedEvent ? attendance.filter(a => a.event_id === selectedEvent) : attendance;

  const exportCSV = () => {
    const rows = [["নাম", "ইভেন্ট", "টোকেন", "চেক-ইন", "সময়"]];
    filtered.forEach(a => {
      rows.push([getName(a.user_id), getEventName(a.event_id), a.token, a.checked_in ? "হ্যাঁ" : "না", a.checked_in_at || "—"]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "attendance.csv"; a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading">উপস্থিতি ট্র্যাকার</h1>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCSV}><Download className="h-4 w-4" /> CSV এক্সপোর্ট</Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-3 items-center">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-72"><SelectValue placeholder="ইভেন্ট নির্বাচন করুন" /></SelectTrigger>
            <SelectContent>{events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}</SelectContent>
          </Select>
          {selectedEvent && (
            <Select onValueChange={v => registerAttendee(v)}>
              <SelectTrigger className="w-56"><SelectValue placeholder="অংশগ্রহণকারী যোগ" /></SelectTrigger>
              <SelectContent>{profiles.filter(p => !filtered.some(a => a.user_id === p.id)).map(p => <SelectItem key={p.id} value={p.id}>{p.full_name || p.id.slice(0, 8)}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <Badge variant="outline">{filtered.filter(a => a.checked_in).length}/{filtered.length} চেক-ইন</Badge>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>নাম</TableHead><TableHead>ইভেন্ট</TableHead><TableHead>টোকেন</TableHead><TableHead>চেক-ইন</TableHead><TableHead>অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.map(a => (
              <TableRow key={a.id}>
                <TableCell>{getName(a.user_id)}</TableCell>
                <TableCell>{getEventName(a.event_id)}</TableCell>
                <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">{a.token?.slice(0, 12)}...</code></TableCell>
                <TableCell>
                  {a.checked_in ? <Badge className="gap-1"><UserCheck className="h-3 w-3" />হ্যাঁ</Badge> : <Badge variant="secondary">না</Badge>}
                </TableCell>
                <TableCell>
                  {!a.checked_in && <Button size="sm" onClick={() => checkIn(a.id)} className="gap-1"><QrCode className="h-3 w-3" />চেক-ইন</Button>}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">কোনো উপস্থিতি নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AttendanceTracker;
