import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, UserPlus, Plus, RotateCcw, Save } from "lucide-react";
import {
  ALL_ROLES, MODULE_LABELS, ROLE_LABELS,
  getDefaultPermission, getPermissionOverrides, setPermissionOverrides,
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
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { t, lang } = useLanguage();
  const lb = (bn: string, en: string) => lang === "bn" ? bn : en;

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

  const loadOverrides = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("*");
    if (data) {
      const row = data.find((s: any) => (s.setting_key || s.key) === "permission_overrides");
      if (row) {
        try {
          const val = row.setting_value || row.value || "{}";
          const parsed = JSON.parse(typeof val === "string" ? val.replace(/^"|"$/g, "") : JSON.stringify(val));
          setOverrides(parsed);
          setPermissionOverrides(parsed);
        } catch { /* ignore */ }
      }
    }
  }, []);

  useEffect(() => { fetchUsers(); loadOverrides(); }, [loadOverrides]);

  const addRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) toast({ title: lb("রোল যোগ ব্যর্থ", "Failed to add role"), description: error.message, variant: "destructive" });
    else { toast({ title: lb("রোল যোগ হয়েছে!", "Role added!") }); fetchUsers(); }
  };

  const removeRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) toast({ title: lb("রোল মুছতে ব্যর্থ", "Failed to remove role"), description: error.message, variant: "destructive" });
    else { toast({ title: lb("রোল মুছে ফেলা হয়েছে!", "Role removed!") }); fetchUsers(); }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast({ title: lb("সব তথ্য দিন", "Fill all fields"), variant: "destructive" }); return;
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
      toast({ title: lb("ইউজার তৈরি হয়েছে!", "User created!"), description: `${newUser.email} — ${lb("রোল", "Role")}: ${newUser.role}` });
      setNewUser({ full_name: "", email: "", password: "", role: "member" });
      setOpenCreate(false);
      fetchUsers();
    } catch (err: any) {
      toast({ title: lb("তৈরি ব্যর্থ", "Creation failed"), description: err.message, variant: "destructive" });
    }
    setCreating(false);
  };

  // Permission toggle
  const isPermissionEnabled = (role: AppRole, mod: Module, perm: Permission): boolean => {
    const key = `${role}:${mod}:${perm}`;
    if (key in overrides) return overrides[key];
    return getDefaultPermission(role, mod, perm);
  };

  const togglePermission = (role: AppRole, mod: Module, perm: Permission) => {
    const key = `${role}:${mod}:${perm}`;
    const currentlyEnabled = isPermissionEnabled(role, mod, perm);
    const defaultVal = getDefaultPermission(role, mod, perm);

    const newOverrides = { ...overrides };
    if (currentlyEnabled === defaultVal) {
      // Need to override
      newOverrides[key] = !currentlyEnabled;
    } else {
      // Already overridden, toggling back to default — remove override
      delete newOverrides[key];
    }
    setOverrides(newOverrides);
    setPermissionOverrides(newOverrides);
  };

  const saveOverrides = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert(
      { setting_key: "permission_overrides", setting_value: JSON.stringify(overrides) },
      { onConflict: "setting_key" }
    );
    if (error) {
      toast({ title: t("perm_save_fail"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("perm_save_success") });
    }
    setSaving(false);
  };

  const resetOverrides = () => {
    if (!confirm(lang === "bn" ? "সব পারমিশন ডিফল্টে ফিরবে?" : "Reset all permissions to default?")) return;
    setOverrides({});
    setPermissionOverrides({});
  };

  const isOverridden = (role: AppRole, mod: Module, perm: Permission): boolean => {
    return `${role}:${mod}:${perm}` in overrides;
  };

  const PERM_LABELS: Record<Permission, { bn: string; en: string }> = {
    view: { bn: "দেখা", en: "View" },
    create: { bn: "তৈরি", en: "Create" },
    edit: { bn: "সম্পাদনা", en: "Edit" },
    delete: { bn: "মুছা", en: "Delete" },
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading">{t("admin_roles")}</h1>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="h-4 w-4" /> {lb("নতুন সদস্য তৈরি", "Create New User")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{lb("নতুন সদস্য/ইউজার তৈরি", "Create New User")}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("পুরো নাম", "Full Name")} <span className="text-destructive">*</span></label>
                <Input placeholder={lb("পুরো নাম", "Full name")} value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("ইমেইল", "Email")} <span className="text-destructive">*</span></label>
                <Input placeholder={lb("ইমেইল", "Email")} type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("পাসওয়ার্ড", "Password")} <span className="text-destructive">*</span></label>
                <Input placeholder={lb("পাসওয়ার্ড", "Password")} type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("রোল", "Role")}</label>
                <Select value={newUser.role} onValueChange={v => setNewUser({...newUser, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r] || r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateUser} disabled={creating} className="w-full gap-2">
                <Plus className="h-4 w-4" /> {creating ? lb("তৈরি হচ্ছে...", "Creating...") : lb("তৈরি করুন", "Create")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">{lb("ইউজার রোল", "User Roles")}</TabsTrigger>
          <TabsTrigger value="matrix">{lb("পারমিশন ম্যাট্রিক্স", "Permission Matrix")}</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{lb("ইউজার", "User")}</TableHead>
                  <TableHead>{lb("বর্তমান রোল", "Current Roles")}</TableHead>
                  <TableHead>{lb("রোল যোগ করুন", "Add Role")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell>
                      <div className="font-medium">{u.full_name || lb("নাম নেই", "No name")}</div>
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
                        <SelectTrigger className="w-48"><SelectValue placeholder={lb("রোল বাছুন", "Select role")} /></SelectTrigger>
                        <SelectContent>
                          {ROLES.filter((r) => !u.roles.includes(r)).map((r) => (
                            <SelectItem key={r} value={r}>{ROLE_LABELS[r] || r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">{lb("কোনো ইউজার নেই", "No users found")}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="matrix">
          <Card className="p-4 overflow-x-auto">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-lg">{t("perm_matrix_title")}</h3>
                <p className="text-sm text-muted-foreground">{t("perm_matrix_desc")}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={resetOverrides}>
                  <RotateCcw className="h-3.5 w-3.5" /> {t("perm_reset")}
                </Button>
                <Button size="sm" className="gap-1" onClick={saveOverrides} disabled={saving}>
                  <Save className="h-3.5 w-3.5" /> {saving ? "..." : t("common_save")}
                </Button>
              </div>
            </div>
            {Object.keys(overrides).length > 0 && (
              <div className="mb-3 p-2 bg-accent/10 border border-accent/20 rounded-lg text-xs text-accent-foreground">
                {lb(
                  `${Object.keys(overrides).length}টি কাস্টম পারমিশন ওভাররাইড সক্রিয়। সেভ করুন যাতে স্থায়ী হয়।`,
                  `${Object.keys(overrides).length} custom permission override(s) active. Save to persist.`
                )}
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card z-10 min-w-[120px]">{lb("মডিউল", "Module")}</TableHead>
                  {ALL_ROLES.map(role => (
                    <TableHead key={role} className="text-center text-xs min-w-[110px]">
                      {ROLE_LABELS[role]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ALL_MODULES.map(mod => (
                  <TableRow key={mod}>
                    <TableCell className="sticky left-0 bg-card z-10 font-medium text-sm">{MODULE_LABELS[mod]}</TableCell>
                    {ALL_ROLES.map(role => (
                      <TableCell key={role} className="text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {ALL_PERMISSIONS.map(perm => {
                            const enabled = isPermissionEnabled(role, mod, perm);
                            const customized = isOverridden(role, mod, perm);
                            return (
                              <label
                                key={perm}
                                className={`flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded border cursor-pointer transition-colors ${
                                  enabled
                                    ? customized ? "bg-primary/20 border-primary/40 text-primary font-semibold" : "bg-muted border-border text-foreground"
                                    : customized ? "bg-destructive/10 border-destructive/30 text-destructive line-through" : "border-transparent text-muted-foreground"
                                }`}
                                title={`${role} → ${mod} → ${perm}${customized ? ` (${lb("কাস্টম", "custom")})` : ""}`}
                              >
                                <Checkbox
                                  checked={enabled}
                                  onCheckedChange={() => togglePermission(role, mod, perm)}
                                  className="h-3 w-3"
                                />
                                {lb(PERM_LABELS[perm].bn, PERM_LABELS[perm].en)}
                              </label>
                            );
                          })}
                        </div>
                      </TableCell>
                    ))}
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
