import { useState, useMemo } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Plus, UserPlus, Trophy, Clock, Award, Star, Download, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Volunteer {
  id: string; full_name: string; email: string; phone: string; skills: string;
  status: string; hours_logged?: number; badge?: string; is_public?: boolean;
  attendance_count?: number; [key: string]: any;
}

const SKILL_TAGS = ["শিক্ষা", "স্বাস্থ্য", "আইটি", "ইভেন্ট", "ডিজাইন", "কন্টেন্ট", "ফটোগ্রাফি", "মিডিয়া", "প্রশাসন", "অনুবাদ"];

const toSkillString = (skills: any): string => {
  if (!skills) return "";
  if (Array.isArray(skills)) return skills.join(", ");
  if (typeof skills === "string") return skills;
  return String(skills);
};

const getBadge = (hours: number): { label: string; color: string; icon: string } => {
  if (hours >= 500) return { label: "প্লাটিনাম", color: "bg-purple-100 text-purple-700 border-purple-300", icon: "💎" };
  if (hours >= 200) return { label: "গোল্ড", color: "bg-amber-100 text-amber-700 border-amber-300", icon: "🥇" };
  if (hours >= 100) return { label: "সিলভার", color: "bg-gray-100 text-gray-700 border-gray-300", icon: "🥈" };
  if (hours >= 50) return { label: "ব্রোঞ্জ", color: "bg-orange-100 text-orange-700 border-orange-300", icon: "🥉" };
  return { label: "নতুন", color: "bg-muted text-muted-foreground", icon: "🌱" };
};

const VolunteerManager = () => {
  const { items, loading, update, fetch: refetch } = useAdminCrud<Volunteer>({ table: "volunteers" });
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "", skills: "" });
  const [hoursDialog, setHoursDialog] = useState<Volunteer | null>(null);
  const [addHours, setAddHours] = useState(0);
  const [filterSkill, setFilterSkill] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!form.email || !form.password || !form.full_name) {
      toast({ title: "সব তথ্য দিন", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { full_name: form.full_name } }
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (userId) {
        await supabase.from("user_roles").insert({ user_id: userId, role: "volunteer" });
        let profilePayload: Record<string, any> = { full_name: form.full_name, phone: form.phone };
        for (let i = 0; i < 5; i++) {
          const { error } = await supabase.from("profiles").update(profilePayload).eq("id", userId);
          if (!error) break;
          const m = error.message?.match(/Could not find the '(\w+)' column/);
          if (m) { delete profilePayload[m[1]]; continue; }
          break;
        }
      }
      let volPayload: Record<string, any> = {
        full_name: form.full_name, email: form.email, phone: form.phone,
        skills: form.skills, status: "approved", user_id: userId, hours_logged: 0,
        attendance_count: 0, is_public: true
      };
      for (let i = 0; i < 5; i++) {
        const { error } = await supabase.from("volunteers").insert(volPayload);
        if (!error) break;
        const m = error.message?.match(/Could not find the '(\w+)' column/);
        if (m) { delete volPayload[m[1]]; continue; }
        toast({ title: "ভলান্টিয়ার টেবিলে যোগ ব্যর্থ", description: error.message, variant: "destructive" });
        break;
      }
      toast({ title: "ভলান্টিয়ার তৈরি হয়েছে!", description: `${form.email}` });
      setForm({ full_name: "", email: "", password: "", phone: "", skills: "" });
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast({ title: "তৈরি ব্যর্থ", description: err.message, variant: "destructive" });
    }
    setCreating(false);
  };

  const handleAddHours = async () => {
    if (!hoursDialog || addHours <= 0) return;
    const newHours = (hoursDialog.hours_logged || 0) + addHours;
    const newAttendance = (hoursDialog.attendance_count || 0) + 1;
    await update(hoursDialog.id, { hours_logged: newHours, attendance_count: newAttendance } as any);
    setHoursDialog(null);
    setAddHours(0);
  };

  const togglePublic = async (v: Volunteer) => {
    await update(v.id, { is_public: !v.is_public } as any);
  };

  const filteredItems = useMemo(() => {
    return items.filter(v => {
      if (filterStatus !== "all" && v.status !== filterStatus) return false;
      if (filterSkill !== "all" && !toSkillString(v.skills).includes(filterSkill)) return false;
      return true;
    });
  }, [items, filterStatus, filterSkill]);

  // Leaderboard
  const leaderboard = useMemo(() => {
    return [...items].filter(v => v.status === "approved").sort((a, b) => (b.hours_logged || 0) - (a.hours_logged || 0)).slice(0, 10);
  }, [items]);

  // Skills distribution
  const skillsData = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach(v => {
      toSkillString(v.skills).split(",").map(s => s.trim()).filter(Boolean).forEach(s => {
        map[s] = (map[s] || 0) + 1;
      });
    });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [items]);

  const exportCSV = () => {
    const headers = "নাম,ইমেইল,ফোন,দক্ষতা,ঘণ্টা,উপস্থিতি,ব্যাজ,স্ট্যাটাস\n";
    const rows = items.map(v => {
      const badge = getBadge(v.hours_logged || 0);
      return `${v.full_name},${v.email},${v.phone || ""},${toSkillString(v.skills)},${v.hours_logged || 0},${v.attendance_count || 0},${badge.label},${v.status}`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "volunteers.csv"; a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const approved = items.filter(v => v.status === "approved").length;
  const totalHours = items.reduce((s, v) => s + (v.hours_logged || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold font-heading">স্বেচ্ছাসেবক ম্যানেজার</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportCSV}><Download className="h-4 w-4" /> CSV</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><UserPlus className="h-4 w-4" /> নতুন ভলান্টিয়ার</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>নতুন ভলান্টিয়ার তৈরি করুন</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="পুরো নাম" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
                <Input placeholder="ইমেইল" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <Input placeholder="পাসওয়ার্ড" type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <Input placeholder="ফোন" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                <Input placeholder="দক্ষতা (কমা দিয়ে)" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
                <div className="flex flex-wrap gap-1">
                  {SKILL_TAGS.map(s => (
                    <Badge key={s} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        const existing = form.skills.split(",").map(x => x.trim()).filter(Boolean);
                        if (!existing.includes(s)) setForm({ ...form, skills: [...existing, s].join(", ") });
                      }}>{s}</Badge>
                  ))}
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full gap-2">
                  <Plus className="h-4 w-4" /> {creating ? "তৈরি হচ্ছে..." : "তৈরি করুন"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center"><div className="text-2xl font-bold">{items.length}</div><div className="text-sm text-muted-foreground">মোট স্বেচ্ছাসেবক</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-green-600">{approved}</div><div className="text-sm text-muted-foreground">অনুমোদিত</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-primary">{totalHours}h</div><div className="text-sm text-muted-foreground">মোট কাজের ঘণ্টা</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold">{items.filter(v => v.status === "pending").length}</div><div className="text-sm text-muted-foreground">অপেক্ষমান</div></Card>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="flex-wrap">
          <TabsTrigger value="list">তালিকা</TabsTrigger>
          <TabsTrigger value="leaderboard">লিডারবোর্ড</TabsTrigger>
          <TabsTrigger value="skills">দক্ষতা বিশ্লেষণ</TabsTrigger>
        </TabsList>

        {/* LIST TAB */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                <SelectItem value="approved">অনুমোদিত</SelectItem>
                <SelectItem value="pending">অপেক্ষমান</SelectItem>
                <SelectItem value="rejected">প্রত্যাখ্যাত</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSkill} onValueChange={setFilterSkill}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব দক্ষতা</SelectItem>
                {SKILL_TAGS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground ml-auto">{filteredItems.length} জন</span>
          </div>
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>নাম</TableHead><TableHead>দক্ষতা</TableHead><TableHead>ঘণ্টা</TableHead>
                  <TableHead>ব্যাজ</TableHead><TableHead>উপস্থিতি</TableHead><TableHead>প্রকাশ্য</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead><TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((v) => {
                  const badge = getBadge(v.hours_logged || 0);
                  return (
                    <TableRow key={v.id}>
                      <TableCell>
                        <div className="font-medium">{v.full_name}</div>
                        <div className="text-xs text-muted-foreground">{v.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {toSkillString(v.skills).split(",").map(s => s.trim()).filter(Boolean).map(s => (
                            <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                          ))}
                          {!toSkillString(v.skills).trim() && "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="gap-1 h-7" onClick={() => { setHoursDialog(v); setAddHours(0); }}>
                          <Clock className="h-3 w-3" /> {v.hours_logged || 0}h
                        </Button>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${badge.color}`}>
                          {badge.icon} {badge.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{v.attendance_count || 0}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => togglePublic(v)}>
                          {v.is_public !== false ? "✅" : "❌"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant={v.status === "approved" ? "default" : v.status === "rejected" ? "destructive" : "secondary"}>
                          {v.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {v.status === "pending" && (
                          <>
                            <Button size="icon" variant="ghost" onClick={() => update(v.id, { status: "approved" } as any)}><Check className="h-4 w-4 text-green-600" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => update(v.id, { status: "rejected" } as any)}><X className="h-4 w-4 text-destructive" /></Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredItems.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">কোনো স্বেচ্ছাসেবক নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* LEADERBOARD TAB */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" /> শীর্ষ স্বেচ্ছাসেবক</h3>
            <div className="space-y-3">
              {leaderboard.map((v, i) => {
                const badge = getBadge(v.hours_logged || 0);
                return (
                  <div key={v.id} className={`flex items-center gap-4 p-3 rounded-lg ${i < 3 ? "bg-muted/50" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-700" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{v.full_name}</div>
                      <div className="text-xs text-muted-foreground">{v.skills || "—"}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${badge.color}`}>{badge.icon} {badge.label}</span>
                    <div className="text-right">
                      <div className="font-bold text-primary">{v.hours_logged || 0}h</div>
                      <div className="text-[10px] text-muted-foreground">{v.attendance_count || 0} দিন</div>
                    </div>
                  </div>
                );
              })}
              {leaderboard.length === 0 && <div className="text-center text-muted-foreground py-8">ডেটা নেই</div>}
            </div>
          </Card>
        </TabsContent>

        {/* SKILLS TAB */}
        <TabsContent value="skills" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">দক্ষতা বিতরণ</h3>
            {skillsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillsData} layout="vertical">
                  <XAxis type="number" fontSize={11} />
                  <YAxis dataKey="name" type="category" fontSize={11} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="text-center text-muted-foreground py-8">ডেটা নেই</div>}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hours Dialog */}
      <Dialog open={!!hoursDialog} onOpenChange={(v) => { if (!v) setHoursDialog(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>ঘণ্টা যোগ করুন — {hoursDialog?.full_name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">বর্তমান ঘণ্টা: <span className="font-bold text-foreground">{hoursDialog?.hours_logged || 0}h</span></div>
            <Input type="number" placeholder="নতুন ঘণ্টা যোগ করুন" value={addHours || ""} onChange={(e) => setAddHours(Number(e.target.value))} />
            <Button onClick={handleAddHours} className="w-full gap-2"><Clock className="h-4 w-4" /> যোগ করুন</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VolunteerManager;
