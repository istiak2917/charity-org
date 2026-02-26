import { useState, useEffect } from "react";
import { fetchAllSessions, SESSION_TABLES_SQL, type UserSession } from "@/lib/sessions";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Monitor, Smartphone, Globe, Database, Shield, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { fetchAuditLogs, AUDIT_LOGS_SQL, type AuditEntry } from "@/lib/audit";
import { useToast } from "@/hooks/use-toast";

const SessionManager = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(true);
  const [page, setPage] = useState(0);
  const [showSql, setShowSql] = useState(false);
  const [maxSessions, setMaxSessions] = useState("1");
  const pageSize = 30;

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(0);
  const [auditLoading, setAuditLoading] = useState(true);

  const loadSessions = async () => {
    setLoading(true);
    const { data, count } = await fetchAllSessions({ activeOnly, limit: pageSize, offset: page * pageSize });
    setSessions(data);
    setTotal(count);
    setLoading(false);
  };

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    const { data, count } = await fetchAuditLogs({ limit: pageSize, offset: auditPage * pageSize });
    setAuditLogs(data);
    setAuditTotal(count);
    setAuditLoading(false);
  };

  const loadMaxSessions = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "max_sessions_per_user")
      .maybeSingle();
    if (data?.setting_value) {
      try { setMaxSessions(String(JSON.parse(data.setting_value))); } catch { }
    }
  };

  useEffect(() => { loadSessions(); }, [page, activeOnly]);
  useEffect(() => { loadAuditLogs(); }, [auditPage]);
  useEffect(() => { loadMaxSessions(); }, []);

  const handleSaveMaxSessions = async () => {
    const val = parseInt(maxSessions, 10);
    if (isNaN(val) || val < 1) return;
    await supabase.from("site_settings").upsert({
      setting_key: "max_sessions_per_user",
      setting_value: JSON.stringify(val),
    }, { onConflict: "setting_key" });
    toast({ title: "সেভ হয়েছে", description: `সর্বোচ্চ ${val}টি ডিভাইসে লগইন করতে পারবে` });
  };

  const handleKillSession = async (sessionId: string) => {
    await supabase.from("user_sessions").update({ is_active: false }).eq("id", sessionId);
    loadSessions();
    toast({ title: "সেশন বন্ধ করা হয়েছে" });
  };

  const deviceIcon = (device?: string) => {
    if (!device) return <Globe className="h-4 w-4" />;
    if (device === "Android" || device === "iOS") return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const totalPages = Math.ceil(total / pageSize);
  const auditTotalPages = Math.ceil(auditTotal / pageSize);

  const actionBadge = (action: string) => {
    switch (action) {
      case "create": return <Badge className="bg-green-500/10 text-green-600 border-green-200">তৈরি</Badge>;
      case "update": return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">আপডেট</Badge>;
      case "delete": return <Badge className="bg-red-500/10 text-red-600 border-red-200">ডিলিট</Badge>;
      default: return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
          <Shield className="h-6 w-6" /> সিকিউরিটি ও সেশন
        </h1>
        <Button variant="outline" size="sm" onClick={() => setShowSql(true)}>
          <Database className="h-3 w-3 mr-1" /> SQL
        </Button>
      </div>

      <Tabs defaultValue="sessions">
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList className="inline-flex w-max">
            <TabsTrigger value="sessions">সেশন ও IP</TabsTrigger>
            <TabsTrigger value="audit">অডিট লগ</TabsTrigger>
            <TabsTrigger value="settings">সেটিংস</TabsTrigger>
          </TabsList>
        </div>

        {/* SESSIONS TAB */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Switch checked={activeOnly} onCheckedChange={v => { setActiveOnly(v); setPage(0); }} />
              <span className="text-sm">শুধু সক্রিয়</span>
            </div>
            <Button variant="outline" size="sm" onClick={loadSessions}>
              <RefreshCw className="h-3 w-3 mr-1" /> রিফ্রেশ
            </Button>
            <span className="text-sm text-muted-foreground ml-auto">মোট: {total}</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
          ) : sessions.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <p>কোনো সেশন নেই।</p>
              <p className="text-xs mt-2">user_sessions টেবিল তৈরি করতে SQL বাটনে ক্লিক করুন।</p>
            </Card>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">ইউজার</th>
                      <th className="text-left px-3 py-2 font-medium">IP</th>
                      <th className="text-left px-3 py-2 font-medium">ডিভাইস</th>
                      <th className="text-left px-3 py-2 font-medium">লগইন</th>
                      <th className="text-left px-3 py-2 font-medium">শেষ সক্রিয়</th>
                      <th className="text-left px-3 py-2 font-medium">স্ট্যাটাস</th>
                      <th className="text-right px-3 py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(s => (
                      <tr key={s.id} className="border-t hover:bg-muted/20">
                        <td className="px-3 py-2 text-xs">{s.user_email || s.user_id?.slice(0, 8)}</td>
                        <td className="px-3 py-2 font-mono text-xs">{s.ip_address || "—"}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            {deviceIcon(s.device_info)}
                            <span className="text-xs">{s.device_info || "—"}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs whitespace-nowrap">{new Date(s.logged_in_at).toLocaleString("bn-BD")}</td>
                        <td className="px-3 py-2 text-xs whitespace-nowrap">{new Date(s.last_active_at).toLocaleString("bn-BD")}</td>
                        <td className="px-3 py-2">
                          {s.is_active
                            ? <Badge className="bg-green-500/10 text-green-600 border-green-200">সক্রিয়</Badge>
                            : <Badge variant="secondary">নিষ্ক্রিয়</Badge>}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {s.is_active && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleKillSession(s.id)} title="সেশন বন্ধ করুন">
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-3 w-3" /></Button>
              <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-3 w-3" /></Button>
            </div>
          )}
        </TabsContent>

        {/* AUDIT TAB */}
        <TabsContent value="audit" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">মোট: {auditTotal}</span>
            <Button variant="outline" size="sm" onClick={loadAuditLogs}><RefreshCw className="h-3 w-3 mr-1" /> রিফ্রেশ</Button>
          </div>
          {auditLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
          ) : auditLogs.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">কোনো অডিট লগ নেই।</Card>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">সময়</th>
                      <th className="text-left px-3 py-2 font-medium">ইউজার</th>
                      <th className="text-left px-3 py-2 font-medium">অ্যাকশন</th>
                      <th className="text-left px-3 py-2 font-medium">টেবিল</th>
                      <th className="text-left px-3 py-2 font-medium">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id} className="border-t hover:bg-muted/20">
                        <td className="px-3 py-2 text-xs whitespace-nowrap">{log.created_at ? new Date(log.created_at).toLocaleString("bn-BD") : "—"}</td>
                        <td className="px-3 py-2 text-xs">{log.user_email || log.user_id?.slice(0, 8)}</td>
                        <td className="px-3 py-2">{actionBadge(log.action)}</td>
                        <td className="px-3 py-2 font-mono text-xs">{log.table_name}</td>
                        <td className="px-3 py-2 font-mono text-xs">{log.ip_address || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {auditTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={auditPage === 0} onClick={() => setAuditPage(p => p - 1)}><ChevronLeft className="h-3 w-3" /></Button>
              <span className="text-sm text-muted-foreground">{auditPage + 1} / {auditTotalPages}</span>
              <Button variant="outline" size="sm" disabled={auditPage >= auditTotalPages - 1} onClick={() => setAuditPage(p => p + 1)}><ChevronRight className="h-3 w-3" /></Button>
            </div>
          )}
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-bold font-heading">সেশন লিমিট</h3>
            <p className="text-sm text-muted-foreground">প্রতিটি ইউজার সর্বোচ্চ কতটি ডিভাইস দিয়ে একসাথে লগইন করতে পারবে তা সেট করুন।</p>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="1"
                max="10"
                value={maxSessions}
                onChange={e => setMaxSessions(e.target.value)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">টি ডিভাইস</span>
              <Button onClick={handleSaveMaxSessions}>সেভ করুন</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SQL Dialog */}
      <Dialog open={showSql} onOpenChange={setShowSql}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>টেবিল SQL</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">এই SQL Supabase SQL Editor-এ রান করুন:</p>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-1">User Sessions:</h4>
              <Textarea rows={12} value={SESSION_TABLES_SQL} readOnly className="font-mono text-xs" />
              <Button size="sm" className="mt-1" onClick={() => { navigator.clipboard.writeText(SESSION_TABLES_SQL); toast({ title: "কপি হয়েছে" }); }}>কপি</Button>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Audit Logs:</h4>
              <Textarea rows={12} value={AUDIT_LOGS_SQL} readOnly className="font-mono text-xs" />
              <Button size="sm" className="mt-1" onClick={() => { navigator.clipboard.writeText(AUDIT_LOGS_SQL); toast({ title: "কপি হয়েছে" }); }}>কপি</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionManager;
