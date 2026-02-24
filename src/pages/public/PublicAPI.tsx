import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Check } from "lucide-react";

const PublicAPI = () => {
  const [donationSummary, setDonationSummary] = useState<any>(null);
  const [projectFunding, setProjectFunding] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: donations } = await supabase.from("donations").select("amount, status, created_at");
      const { data: projects } = await supabase.from("projects").select("id, title, budget_total, budget_spent, status");

      const d = donations || [];
      setDonationSummary({
        total_donations: d.length,
        total_amount: d.reduce((s, x) => s + (x.amount || 0), 0),
        approved: d.filter(x => x.status === "approved").length,
        currency: "BDT",
        last_updated: new Date().toISOString(),
      });

      setProjectFunding((projects || []).map(p => ({
        id: p.id,
        title: p.title,
        budget_total: p.budget_total || 0,
        budget_spent: p.budget_spent || 0,
        status: p.status,
      })));

      setLoading(false);
    };
    load();
  }, []);

  const copy = (data: any, key: string) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <Code className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-3xl font-bold font-heading">পাবলিক ট্রান্সপারেন্সি API</h1>
          <p className="text-muted-foreground">রিড-অনলি পাবলিক ডেটা — JSON ফরম্যাটে</p>
        </div>

        <Tabs defaultValue="donations">
          <TabsList className="w-full">
            <TabsTrigger value="donations" className="flex-1">অনুদান সারাংশ</TabsTrigger>
            <TabsTrigger value="projects" className="flex-1">প্রকল্প ফান্ডিং</TabsTrigger>
          </TabsList>

          <TabsContent value="donations">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">GET /api/donations/summary</h3>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => copy(donationSummary, "d")}>
                  {copied === "d" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} কপি
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto font-mono">{JSON.stringify(donationSummary, null, 2)}</pre>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">GET /api/projects/funding</h3>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => copy(projectFunding, "p")}>
                  {copied === "p" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} কপি
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto font-mono max-h-96">{JSON.stringify(projectFunding, null, 2)}</pre>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublicAPI;
