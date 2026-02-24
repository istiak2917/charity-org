import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, Database, FileText, AlertCircle } from "lucide-react";

const EXPORT_MODULES = [
  { key: "donations", label: "অনুদান", table: "donations" },
  { key: "projects", label: "প্রকল্প", table: "projects" },
  { key: "volunteers", label: "স্বেচ্ছাসেবক", table: "volunteers" },
  { key: "blood_requests", label: "রক্তের অনুরোধ", table: "blood_requests" },
  { key: "inventory_items", label: "ইনভেন্টরি", table: "inventory_items" },
  { key: "beneficiaries", label: "উপকারভোগী", table: "beneficiaries" },
  { key: "events", label: "ইভেন্ট", table: "events" },
  { key: "blog_posts", label: "ব্লগ", table: "blog_posts" },
  { key: "expenses", label: "ব্যয়", table: "expenses" },
  { key: "income_records", label: "আয়", table: "income_records" },
  { key: "gallery_items", label: "গ্যালারি", table: "gallery_items" },
  { key: "team_members", label: "টিম", table: "team_members" },
  { key: "contact_messages", label: "মেসেজ", table: "contact_messages" },
];

const ALL_TABLES = [
  "projects", "donations", "donation_campaigns", "events", "blog_posts",
  "volunteers", "volunteer_tasks", "expenses", "income_records",
  "blood_donors", "blood_requests", "beneficiaries", "inventory_items",
  "inventory_transactions", "branches", "gallery_items", "team_members",
  "reports", "contact_messages", "site_settings", "homepage_sections",
  "section_blocks", "pages",
];

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(data: any[]): string {
  if (!data.length) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    const val = row[h];
    const str = val === null || val === undefined ? "" : typeof val === "object" ? JSON.stringify(val) : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  }).join(","));
  return [headers.join(","), ...rows].join("\n");
}

const BackupManager = () => {
  const [exporting, setExporting] = useState<string | null>(null);
  const { toast } = useToast();

  const exportModule = async (mod: typeof EXPORT_MODULES[0], format: "json" | "csv") => {
    setExporting(mod.key);
    try {
      const { data, error } = await supabase.from(mod.table).select("*");
      if (error) throw error;
      const items = data || [];
      const timestamp = new Date().toISOString().slice(0, 10);
      if (format === "json") {
        downloadFile(JSON.stringify(items, null, 2), `${mod.key}_${timestamp}.json`, "application/json");
      } else {
        downloadFile(toCsv(items), `${mod.key}_${timestamp}.csv`, "text/csv");
      }
      toast({ title: `${mod.label} এক্সপোর্ট সম্পন্ন`, description: `${items.length}টি রেকর্ড` });
    } catch (e: any) {
      toast({ title: "এক্সপোর্ট ব্যর্থ", description: e.message, variant: "destructive" });
    }
    setExporting(null);
  };

  const exportFullDatabase = async (format: "json" | "csv") => {
    setExporting("full");
    try {
      const allData: Record<string, any[]> = {};
      for (const table of ALL_TABLES) {
        const { data } = await supabase.from(table).select("*");
        if (data && data.length > 0) allData[table] = data;
      }
      const timestamp = new Date().toISOString().slice(0, 10);
      if (format === "json") {
        downloadFile(JSON.stringify(allData, null, 2), `full_backup_${timestamp}.json`, "application/json");
      } else {
        // CSV bundle: combine all tables with table name prefix
        let csvContent = "";
        for (const [table, rows] of Object.entries(allData)) {
          csvContent += `\n--- ${table} ---\n${toCsv(rows)}\n`;
        }
        downloadFile(csvContent, `full_backup_${timestamp}.csv`, "text/csv");
      }
      const totalRecords = Object.values(allData).reduce((s, arr) => s + arr.length, 0);
      toast({ title: "সম্পূর্ণ ব্যাকআপ সম্পন্ন", description: `${Object.keys(allData).length}টি টেবিল, ${totalRecords}টি রেকর্ড` });
    } catch (e: any) {
      toast({ title: "ব্যাকআপ ব্যর্থ", description: e.message, variant: "destructive" });
    }
    setExporting(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">ডেটা ব্যাকআপ</h1>
        <p className="text-muted-foreground">সম্পূর্ণ ডেটাবেস বা মডিউল-ভিত্তিক এক্সপোর্ট</p>
      </div>

      {/* Full Backup */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary"><Database className="h-6 w-6" /></div>
          <div className="flex-1">
            <h3 className="font-bold font-heading text-lg">সম্পূর্ণ ডেটাবেস ব্যাকআপ</h3>
            <p className="text-sm text-muted-foreground mb-4">সকল টেবিলের ডেটা একসাথে এক্সপোর্ট করুন (ব্যক্তিগত auth ডেটা ব্যতীত)</p>
            <div className="flex gap-2">
              <Button onClick={() => exportFullDatabase("json")} disabled={!!exporting}>
                <Download className="h-4 w-4 mr-2" /> JSON এক্সপোর্ট
              </Button>
              <Button variant="outline" onClick={() => exportFullDatabase("csv")} disabled={!!exporting}>
                <FileText className="h-4 w-4 mr-2" /> CSV এক্সপোর্ট
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Per-module Export */}
      <div>
        <h2 className="text-lg font-bold font-heading mb-3">মডিউল-ভিত্তিক এক্সপোর্ট</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EXPORT_MODULES.map((mod) => (
            <Card key={mod.key} className="p-4 flex items-center justify-between">
              <div>
                <span className="font-medium">{mod.label}</span>
                <span className="text-xs text-muted-foreground ml-2">({mod.table})</span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => exportModule(mod, "json")} disabled={exporting === mod.key}>
                  JSON
                </Button>
                <Button size="sm" variant="ghost" onClick={() => exportModule(mod, "csv")} disabled={exporting === mod.key}>
                  CSV
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Restore Instructions */}
      <Card className="p-6 border-amber-200 bg-amber-50/30">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold mb-2">রিস্টোর নির্দেশিকা</h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>JSON ফাইলটি ডাউনলোড করুন</li>
              <li>Supabase Dashboard → SQL Editor খুলুন</li>
              <li>প্রতিটি টেবিলের জন্য INSERT স্টেটমেন্ট তৈরি করুন</li>
              <li>অথবা Supabase Dashboard → Table Editor → Import CSV ব্যবহার করুন</li>
              <li>রিস্টোরের আগে বিদ্যমান ডেটা ব্যাকআপ রাখুন</li>
              <li>foreign key constraints মেনে টেবিল অর্ডার অনুসরণ করুন</li>
            </ol>
          </div>
        </div>
      </Card>

      {exporting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">এক্সপোর্ট হচ্ছে...</p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BackupManager;
