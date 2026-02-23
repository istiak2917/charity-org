import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

interface UserWithRole { user_id: string; email: string; full_name: string; roles: string[]; }

const ROLES = ["super_admin", "admin", "editor", "volunteer", "member"] as const;

const RoleManager = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
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
    if (error) {
      toast({ title: "রোল মুছতে ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "রোল মুছে ফেলা হয়েছে!" });
      fetchUsers();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">রোল ম্যানেজার</h1>
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
