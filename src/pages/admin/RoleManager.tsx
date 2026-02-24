import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus, Plus } from "lucide-react";
import {
  ALL_ROLES, MODULE_LABELS, ROLE_LABELS, hasPermission,
  type AppRole, type Module, type Permission,
} from "@/lib/permissions";



const ALL_MODULES: Module[] = Object.keys(MODULE_LABELS) as Module[];
const ALL_PERMISSIONS: Permission[] = ["view", "create", "edit", "delete"];

interface UserWithRole { user_id: string; email: string; full_name: string; roles: string[]; }

const ROLES = ["super_admin", "admin", "editor", "volunteer", "member", "finance_manager", "content_manager", "volunteer_manager", "blood_manager", "viewer"] as const;

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
    if (error) toast({ title: "রোল যোগ ব্যর্থ", description: error.message, variant: "destructive" });
    else { toast({ title: "রোল যোগ হয়েছে!" }); fetchUsers(); }
  };

  const removeRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) toast({ title: "রোল মুছতে ব্যর্থ", description: error.message, variant: "destructive" });
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
          <h1 className="text-2xl font-bold font-heading">রোল ও পারমিশন ম্যানেজার</h1>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="h-4 w-4" /> নতুন সদস্য তৈরি</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>নতুন সদস্য/ইউজার তৈরি</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">পুরো নাম <span className="text-destructive">*</span></label>
                <Input placeholder="পুরো নাম" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">ইমেইল <span className="text-destructive">*</span></label>
                <Input placeholder="ইমেইল" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">পাসওয়ার্ড <span className="text-destructive">*</span></label>
                <Input placeholder="পাসওয়ার্ড" type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">রোল</label>
                <Select value={newUser.role} onValueChange={v => setNewUser({...newUser, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r] || r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateUser} disabled={creating} className="w-full gap-2">
                <Plus className="h-4 w-4" /> {creating ? "তৈরি হচ্ছে..." : "তৈরি করুন"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">ইউজার রোল</TabsTrigger>
          <TabsTrigger value="matrix">পারমিশন ম্যাট্রিক্স</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
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
                            {ROLE_LABELS[r] || r} ✕
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select onValueChange={(v) => addRole(u.user_id, v)}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="রোল বাছুন" /></SelectTrigger>
                        <SelectContent>
                          {ROLES.filter((r) => !u.roles.includes(r)).map((r) => (
                            <SelectItem key={r} value={r}>{ROLE_LABELS[r] || r}</SelectItem>
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
        </TabsContent>

        <TabsContent value="matrix">
          <Card className="p-4 overflow-x-auto">
            <h3 className="font-bold text-lg mb-4">রোল-মডিউল পারমিশন ম্যাট্রিক্স</h3>
            <p className="text-sm text-muted-foreground mb-4">এই ম্যাট্রিক্স দেখায় কোন রোলের কোন মডিউলে কী ধরনের অ্যাক্সেস আছে। পারমিশন পরিবর্তন করতে permissions.ts ফাইল আপডেট করুন।</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card z-10 min-w-[120px]">মডিউল</TableHead>
                  {ALL_ROLES.map(role => (
                    <TableHead key={role} className="text-center text-xs min-w-[100px]">
                      {ROLE_LABELS[role]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ALL_MODULES.map(mod => (
                  <TableRow key={mod}>
                    <TableCell className="sticky left-0 bg-card z-10 font-medium text-sm">{MODULE_LABELS[mod]}</TableCell>
                    {ALL_ROLES.map(role => {
                      const perms = ALL_PERMISSIONS.filter(p => hasPermission([role], mod, p));
                      return (
                        <TableCell key={role} className="text-center">
                          {perms.length > 0 ? (
                            <div className="flex flex-wrap gap-0.5 justify-center">
                              {perms.map(p => (
                                <Badge key={p} variant="outline" className="text-[10px] px-1 py-0">
                                  {p === "view" ? "দেখা" : p === "create" ? "তৈরি" : p === "edit" ? "সম্পাদনা" : "মুছা"}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleManager;
