import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, Plus, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Volunteer { id: string; full_name: string; email: string; phone: string; skills: string; status: string; [key: string]: any; }

const VolunteerManager = () => {
  const { items, loading, update, fetch: refetch } = useAdminCrud<Volunteer>({ table: "volunteers" });
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "", skills: "" });
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!form.email || !form.password || !form.full_name) {
      toast({ title: "সব তথ্য দিন", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name } }
      });
      if (authError) throw authError;

      const userId = authData.user?.id;

      // 2. Add volunteer role
      if (userId) {
        // Try inserting role
        await supabase.from("user_roles").insert({ user_id: userId, role: "volunteer" });
        // Update profile
        let profilePayload: Record<string, any> = { full_name: form.full_name, phone: form.phone };
        for (let i = 0; i < 5; i++) {
          const { error } = await supabase.from("profiles").update(profilePayload).eq("id", userId);
          if (!error) break;
          const m = error.message?.match(/Could not find the '(\w+)' column/);
          if (m) { delete profilePayload[m[1]]; continue; }
          break;
        }
      }

      // 3. Add to volunteers table
      let volPayload: Record<string, any> = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        skills: form.skills,
        status: "approved",
        user_id: userId
      };
      for (let i = 0; i < 5; i++) {
        const { error } = await supabase.from("volunteers").insert(volPayload);
        if (!error) break;
        const m = error.message?.match(/Could not find the '(\w+)' column/);
        if (m) { delete volPayload[m[1]]; continue; }
        toast({ title: "ভলান্টিয়ার টেবিলে যোগ ব্যর্থ", description: error.message, variant: "destructive" });
        break;
      }

      toast({ title: "ভলান্টিয়ার তৈরি হয়েছে!", description: `${form.email} — পাসওয়ার্ড: ${form.password}` });
      setForm({ full_name: "", email: "", password: "", phone: "", skills: "" });
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast({ title: "তৈরি ব্যর্থ", description: err.message, variant: "destructive" });
    }
    setCreating(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">স্বেচ্ছাসেবক ম্যানেজার</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="h-4 w-4" /> নতুন ভলান্টিয়ার</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>নতুন ভলান্টিয়ার তৈরি করুন</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="পুরো নাম" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
              <Input placeholder="ইমেইল" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <Input placeholder="পাসওয়ার্ড" type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              <Input placeholder="ফোন" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              <Input placeholder="দক্ষতা (কমা দিয়ে)" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} />
              <Button onClick={handleCreate} disabled={creating} className="w-full gap-2">
                <Plus className="h-4 w-4" /> {creating ? "তৈরি হচ্ছে..." : "তৈরি করুন"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>নাম</TableHead>
              <TableHead>ইমেইল</TableHead>
              <TableHead>দক্ষতা</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">{v.full_name}</TableCell>
                <TableCell>{v.email}</TableCell>
                <TableCell>{v.skills || "-"}</TableCell>
                <TableCell><Badge variant={v.status === "approved" ? "default" : v.status === "rejected" ? "destructive" : "secondary"}>{v.status}</Badge></TableCell>
                <TableCell className="text-right space-x-2">
                  {v.status === "pending" && (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => update(v.id, { status: "approved" } as any)}><Check className="h-4 w-4 text-green-600" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => update(v.id, { status: "rejected" } as any)}><X className="h-4 w-4 text-destructive" /></Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">কোনো স্বেচ্ছাসেবক নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default VolunteerManager;
