import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Trash2 } from "lucide-react";

const STATUS_MAP: Record<string, string> = { pending: "অপেক্ষমাণ", sent: "পাঠানো", failed: "ব্যর্থ" };
const CHANNEL_MAP: Record<string, string> = { sms: "SMS", email: "ইমেইল", push: "পুশ" };

const NotificationQueue = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ recipient_phone: "", recipient_email: "", channel: "sms", subject: "", message: "" });
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("notification_queue").select("*").order("created_at", { ascending: false }).limit(100);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.message) { toast({ title: "মেসেজ দিন", variant: "destructive" }); return; }
    const payload: any = { ...form };
    if (!payload.recipient_phone) delete payload.recipient_phone;
    if (!payload.recipient_email) delete payload.recipient_email;
    if (!payload.subject) delete payload.subject;
    const { error } = await supabase.from("notification_queue").insert(payload);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else { toast({ title: "নোটিফিকেশন কিউতে যোগ হয়েছে!" }); setOpen(false); setForm({ recipient_phone: "", recipient_email: "", channel: "sms", subject: "", message: "" }); load(); }
  };

  const remove = async (id: string) => {
    await supabase.from("notification_queue").delete().eq("id", id);
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading">নোটিফিকেশন কিউ</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন নোটিফিকেশন</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>নোটিফিকেশন তৈরি</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.channel} onValueChange={v => setForm({ ...form, channel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">ইমেইল</SelectItem>
                  <SelectItem value="push">পুশ</SelectItem>
                </SelectContent>
              </Select>
              {form.channel === "sms" && <Input placeholder="ফোন নম্বর (+880...)" value={form.recipient_phone} onChange={e => setForm({ ...form, recipient_phone: e.target.value })} />}
              {form.channel === "email" && <Input placeholder="ইমেইল" type="email" value={form.recipient_email} onChange={e => setForm({ ...form, recipient_email: e.target.value })} />}
              <Input placeholder="বিষয়" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
              <Textarea placeholder="মেসেজ *" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              <Button onClick={add} className="w-full">কিউতে যোগ করুন</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-primary">{items.filter(i => i.status === "pending").length}</div><div className="text-sm text-muted-foreground">অপেক্ষমাণ</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-primary">{items.filter(i => i.status === "sent").length}</div><div className="text-sm text-muted-foreground">পাঠানো</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-destructive">{items.filter(i => i.status === "failed").length}</div><div className="text-sm text-muted-foreground">ব্যর্থ</div></Card>
      </div>

      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>চ্যানেল</TableHead><TableHead>প্রাপক</TableHead><TableHead>মেসেজ</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead>তারিখ</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map(i => (
              <TableRow key={i.id}>
                <TableCell><Badge variant="outline">{CHANNEL_MAP[i.channel] || i.channel}</Badge></TableCell>
                <TableCell className="text-sm">{i.recipient_phone || i.recipient_email || "—"}</TableCell>
                <TableCell className="text-sm max-w-[200px] truncate">{i.message}</TableCell>
                <TableCell><Badge variant={i.status === "sent" ? "default" : i.status === "failed" ? "destructive" : "secondary"}>{STATUS_MAP[i.status]}</Badge></TableCell>
                <TableCell className="text-xs">{new Date(i.created_at).toLocaleString("bn-BD")}</TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => remove(i.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">কিউ খালি</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default NotificationQueue;
