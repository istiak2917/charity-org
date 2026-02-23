import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus, Plus } from "lucide-react";

interface UserWithRole { user_id: string; email: string; full_name: string; roles: string[]; }

const ROLES = ["super_admin", "admin", "editor", "volunteer", "member"] as const;

const RoleManager = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: "", email: "", password: "", role: "member" });
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const { data: profiles } = await supabase.from("profiles").select("id, full_name");

    if (roles && profiles) {
      const userMap = new Map<string, UserWithRole>();
      profiles.forEach((p) => {
        userMap.set(p.id, { user_id: p.id, email: "", full_name: p.full_name || "", roles: [] });
      });
      roles.forEach((r) => {
        const u = userMap.get(r.user_id);
        if (u) u.roles.push(r.role);
      });
      setUsers(Array.from(userMap.values()));
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const addRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) {
      toast({ title: "রোল যোগ ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "রোল যোগ হয়েছে!" });
      fetchUsers();
    }
  };

  const removeRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) { toast({ title: "রোল মুছতে ব্যর্থ", description: error.message, variant: "destructive" }); }
    else { toast({ title: "রোল মুছে ফেলা হয়েছে!" }); fetchUsers(); }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast({ title: "সব তথ্য দিন", variant: "destructive" }); return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email, password: newUser.password,
        options: { data: { full_name: newUser.full_name } }
      });
      if (error) throw error;
      const uid = data.user?.id;
      if (uid) {
        await supabase.from("user_roles").insert({ user_id: uid, role: newUser.role });
        let profilePayload: Record<string, any> = { full_name: newUser.full_name };
        for (let i = 0; i < 5; i++) {
          const { error: pe } = await supabase.from("profiles").update(profilePayload).eq("id", uid);
          if (!pe) break;
          const m = pe.message?.match(/Could not find the '(\w+)' column/);
          if (m) { delete profilePayload[m[1]]; continue; }
          break;
        }
      }
      toast({ title: "ইউজার তৈরি হয়েছে!", description: `${newUser.email} — রোল: ${newUser.role}` });
      setNewUser({ full_name: "", email: "", password: "", role: "member" });
      setOpenCreate(false);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "তৈরি ব্যর্থ", description: err.message, variant: "destructive" });
    }
    setCreating(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading">রোল ম্যানেজার</h1>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="h-4 w-4" /> নতুন সদস্য তৈরি</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>নতুন সদস্য/ইউজার তৈরি</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="পুরো নাম" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} />
              <Input placeholder="ইমেইল" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              <Input placeholder="পাসওয়ার্ড" type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              <Select value={newUser.role} onValueChange={v => setNewUser({...newUser, role: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleCreateUser} disabled={creating} className="w-full gap-2">
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
              <TableHead>ইউজার</TableHead>
              <TableHead>বর্তমান রোল</TableHead>
              <TableHead>রোল যোগ করুন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.user_id}>
                <TableCell>
                  <div className="font-medium">{u.full_name || "নাম নেই"}</div>
                  <div className="text-xs text-muted-foreground">{u.user_id.slice(0, 8)}...</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r) => (
                      <Badge key={r} variant={r === "super_admin" ? "destructive" : r === "admin" ? "default" : "secondary"} className="cursor-pointer" onClick={() => removeRole(u.user_id, r)}>
                        {r} ✕
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Select onValueChange={(v) => addRole(u.user_id, v)}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="রোল বাছুন" /></SelectTrigger>
                    <SelectContent>
                      {ROLES.filter((r) => !u.roles.includes(r)).map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">কোনো ইউজার নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default RoleManager;
