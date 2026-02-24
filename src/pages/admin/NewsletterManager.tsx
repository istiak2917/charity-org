import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Send, Users, Loader2 } from "lucide-react";

const NewsletterManager = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const fetchSubscribers = async () => {
    setLoading(true);
    const { data } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
    setSubscribers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const handleBroadcast = async () => {
    if (!broadcastSubject || !broadcastBody) {
      toast({ title: "বিষয় ও বডি দিন", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-broadcast", {
        body: { subject: broadcastSubject, body: broadcastBody },
      });
      if (error) throw error;
      toast({ title: `নিউজলেটার পাঠানো হয়েছে!`, description: `${data?.sent || 0} জনকে পাঠানো হয়েছে` });
      setBroadcastSubject("");
      setBroadcastBody("");
    } catch (err: any) {
      toast({ title: "ব্রডকাস্ট ব্যর্থ", description: err.message, variant: "destructive" });
    }
    setSending(false);
  };

  const activeCount = subscribers.filter(s => s.status === "active").length;
  const totalCount = subscribers.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">নিউজলেটার ম্যানেজার</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{activeCount}</div>
          <div className="text-sm text-muted-foreground">সক্রিয় সাবস্ক্রাইবার</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{totalCount}</div>
          <div className="text-sm text-muted-foreground">মোট সাবস্ক্রাইবার</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-muted-foreground">{totalCount - activeCount}</div>
          <div className="text-sm text-muted-foreground">আনসাবস্ক্রাইবড</div>
        </Card>
      </div>

      <Tabs defaultValue="broadcast">
        <TabsList>
          <TabsTrigger value="broadcast">ব্রডকাস্ট</TabsTrigger>
          <TabsTrigger value="subscribers">সাবস্ক্রাইবার তালিকা</TabsTrigger>
        </TabsList>

        <TabsContent value="broadcast" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-lg">নিউজলেটার ব্রডকাস্ট</h3>
            <div className="space-y-1">
              <label className="text-sm font-medium">বিষয় <span className="text-destructive">*</span></label>
              <Input placeholder="নিউজলেটারের বিষয় লিখুন" value={broadcastSubject} onChange={e => setBroadcastSubject(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">বডি (HTML সাপোর্টেড) <span className="text-destructive">*</span></label>
              <Textarea rows={8} placeholder="<h1>শিরোনাম</h1><p>আপনার বার্তা...</p>" value={broadcastBody} onChange={e => setBroadcastBody(e.target.value)} />
            </div>
            <Button onClick={handleBroadcast} disabled={sending} className="gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "পাঠানো হচ্ছে..." : `ব্রডকাস্ট (${activeCount} জন)`}
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            {loading ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ইমেইল</TableHead>
                    <TableHead>নাম</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>তারিখ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.email}</TableCell>
                      <TableCell>{s.name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status === "active" ? "সক্রিয়" : "আনসাবস্ক্রাইবড"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.created_at ? new Date(s.created_at).toLocaleDateString("bn-BD") : "-"}</TableCell>
                    </TableRow>
                  ))}
                  {subscribers.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">কোনো সাবস্ক্রাইবার নেই</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsletterManager;
