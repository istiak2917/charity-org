import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Search, Trash2 } from "lucide-react";

const TIME_SLOTS: Record<string, string> = { full_day: "সারাদিন", morning: "সকাল", afternoon: "দুপুর", evening: "সন্ধ্যা" };

const VolunteerCalendar = () => {
  const [availability, setAvailability] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [form, setForm] = useState({ volunteer_id: "", available_date: "", time_slot: "full_day", notes: "" });
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data: a } = await supabase.from("volunteer_availability").select("*").order("available_date", { ascending: true });
    setAvailability(a || []);
    const { data: p } = await supabase.from("profiles").select("id, full_name");
    setProfiles(p || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.volunteer_id || !form.available_date) { toast({ title: "স্বেচ্ছাসেবক ও তারিখ দিন", variant: "destructive" }); return; }
    const { error } = await supabase.from("volunteer_availability").insert(form);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else { toast({ title: "উপলভ্যতা যোগ হয়েছে!" }); setForm({ volunteer_id: "", available_date: "", time_slot: "full_day", notes: "" }); load(); }
  };

  const remove = async (id: string) => {
    await supabase.from("volunteer_availability").delete().eq("id", id);
    load();
  };

  const getName = (id: string) => profiles.find(p => p.id === id)?.full_name || id?.slice(0, 8);

  const filtered = filterDate ? availability.filter(a => a.available_date === filterDate) : availability;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">ভলান্টিয়ার ক্যালেন্ডার</h1>
      </div>

      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">উপলভ্যতা যোগ করুন</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Select value={form.volunteer_id} onValueChange={v => setForm({ ...form, volunteer_id: v })}>
            <SelectTrigger><SelectValue placeholder="স্বেচ্ছাসেবক" /></SelectTrigger>
            <SelectContent>{profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name || p.id.slice(0, 8)}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="date" value={form.available_date} onChange={e => setForm({ ...form, available_date: e.target.value })} />
          <Select value={form.time_slot} onValueChange={v => setForm({ ...form, time_slot: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(TIME_SLOTS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="নোট" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <Button onClick={add}>যোগ করুন</Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input type="date" className="w-48" value={filterDate} onChange={e => setFilterDate(e.target.value)} placeholder="তারিখ ফিল্টার" />
          {filterDate && <Button variant="ghost" size="sm" onClick={() => setFilterDate("")}>রিসেট</Button>}
          <Badge variant="outline">{filtered.length} জন পাওয়া গেছে</Badge>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>স্বেচ্ছাসেবক</TableHead><TableHead>তারিখ</TableHead><TableHead>সময়</TableHead><TableHead>নোট</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.map(a => (
              <TableRow key={a.id}>
                <TableCell>{getName(a.volunteer_id)}</TableCell>
                <TableCell>{a.available_date}</TableCell>
                <TableCell><Badge variant="secondary">{TIME_SLOTS[a.time_slot] || a.time_slot}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{a.notes || "—"}</TableCell>
                <TableCell><Button variant="ghost" size="sm" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">কোনো উপলভ্যতা নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default VolunteerCalendar;
