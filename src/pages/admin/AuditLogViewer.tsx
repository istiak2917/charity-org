import { useState, useEffect } from "react";
import { fetchAuditLogs, AUDIT_LOGS_SQL, type AuditEntry } from "@/lib/audit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Eye, Database, ChevronLeft, ChevronRight } from "lucide-react";

const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filterTable, setFilterTable] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [detailLog, setDetailLog] = useState<AuditEntry | null>(null);
  const [showSql, setShowSql] = useState(false);
  const pageSize = 25;

  const load = async () => {
    setLoading(true);
    const { data, count } = await fetchAuditLogs({
      limit: pageSize,
      offset: page * pageSize,
      tableName: filterTable || undefined,
      action: filterAction || undefined,
    });
    setLogs(data);
    setTotal(count);
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, filterTable, filterAction]);

  const actionBadge = (action: string) => {
    switch (action) {
      case "create": return <Badge className="bg-green-500/10 text-green-600 border-green-200">তৈরি</Badge>;
      case "update": return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">আপডেট</Badge>;
      case "delete": return <Badge className="bg-red-500/10 text-red-600 border-red-200">ডিলিট</Badge>;
      default: return <Badge variant="outline">{action}</Badge>;
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">অডিট লগ</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSql(true)}>
            <Database className="h-3 w-3 mr-1" />SQL
          </Button>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-3 w-3 mr-1" />রিফ্রেশ
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="টেবিল ফিল্টার..."
          value={filterTable}
          onChange={e => { setFilterTable(e.target.value); setPage(0); }}
          className="w-48 h-9"
        />
        <Select value={filterAction} onValueChange={v => { setFilterAction(v === "all" ? "" : v); setPage(0); }}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="সব অ্যাকশন" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব অ্যাকশন</SelectItem>
            <SelectItem value="create">তৈরি</SelectItem>
            <SelectItem value="update">আপডেট</SelectItem>
            <SelectItem value="delete">ডিলিট</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground self-center">মোট: {total}</span>
      </div>

      {/* Log Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : logs.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <p>কোনো অডিট লগ নেই।</p>
          <p className="text-xs mt-2">audit_logs টেবিল তৈরি করতে SQL বাটনে ক্লিক করুন।</p>
        </Card>
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
                  <th className="text-left px-3 py-2 font-medium">রেকর্ড</th>
                  <th className="text-right px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-t hover:bg-muted/20">
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString("bn-BD") : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs truncate max-w-[150px]">{log.user_email || log.user_id?.slice(0, 8)}</td>
                    <td className="px-3 py-2">{actionBadge(log.action)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{log.table_name}</td>
                    <td className="px-3 py-2 font-mono text-xs truncate max-w-[100px]">{log.record_id?.slice(0, 8) || "—"}</td>
                    <td className="px-3 py-2 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailLog(log)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailLog} onOpenChange={() => setDetailLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>অডিট লগ ডিটেইল</DialogTitle></DialogHeader>
          {detailLog && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-medium">ইউজার:</span> {detailLog.user_email || detailLog.user_id}</div>
                <div><span className="font-medium">অ্যাকশন:</span> {detailLog.action}</div>
                <div><span className="font-medium">টেবিল:</span> {detailLog.table_name}</div>
                <div><span className="font-medium">রেকর্ড ID:</span> {detailLog.record_id || "—"}</div>
                <div><span className="font-medium">সময়:</span> {detailLog.created_at ? new Date(detailLog.created_at).toLocaleString("bn-BD") : "—"}</div>
                <div><span className="font-medium">IP:</span> {detailLog.ip_address || "—"}</div>
              </div>
              {detailLog.old_value && (
                <div>
                  <span className="font-medium block mb-1">পুরাতন মান:</span>
                  <pre className="bg-muted rounded p-2 text-xs overflow-auto max-h-40">
                    {typeof detailLog.old_value === "string" ? detailLog.old_value : JSON.stringify(detailLog.old_value, null, 2)}
                  </pre>
                </div>
              )}
              {detailLog.new_value && (
                <div>
                  <span className="font-medium block mb-1">নতুন মান:</span>
                  <pre className="bg-muted rounded p-2 text-xs overflow-auto max-h-40">
                    {typeof detailLog.new_value === "string" ? detailLog.new_value : JSON.stringify(detailLog.new_value, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* SQL Dialog */}
      <Dialog open={showSql} onOpenChange={setShowSql}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>audit_logs টেবিল SQL</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">এই SQL Supabase SQL Editor-এ রান করুন:</p>
          <Textarea rows={18} value={AUDIT_LOGS_SQL} readOnly className="font-mono text-xs" />
          <Button onClick={() => { navigator.clipboard.writeText(AUDIT_LOGS_SQL); }}>কপি করুন</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogViewer;
