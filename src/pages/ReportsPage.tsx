import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink } from "lucide-react";

interface Report { id: string; title: string; report_type: string; file_url: string; year: number; description: string; }

const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    supabase.from("reports").select("*").order("year", { ascending: false }).then(({ data }) => {
      if (data) setReports(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">প্রতিবেদন</h1>
          <p className="text-muted-foreground">আমাদের স্বচ্ছতা ও জবাবদিহিতার অংশ হিসেবে সকল প্রতিবেদন</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {reports.map((r) => (
            <Card key={r.id} className="p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold font-heading">{r.title}</h3>
                  <Badge variant="secondary">{r.report_type}</Badge>
                  <Badge variant="outline">{r.year}</Badge>
                </div>
                {r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}
              </div>
              {r.file_url && (
                <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm shrink-0">
                  ডাউনলোড <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </Card>
          ))}
          {reports.length === 0 && <div className="text-center text-muted-foreground py-12">কোনো প্রতিবেদন নেই</div>}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportsPage;
