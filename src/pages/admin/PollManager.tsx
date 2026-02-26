import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, BarChart3, Vote, Eye } from "lucide-react";

const PollManager = () => {
  const { items: polls, loading, create, update, remove, fetch } = useAdminCrud<any>({ table: "polls" });
  const [showCreate, setShowCreate] = useState(false);
  const [newPoll, setNewPoll] = useState({ question: "", description: "", options: ["", ""] });
  const [viewingResults, setViewingResults] = useState<any>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!newPoll.question || newPoll.options.filter(Boolean).length < 2) {
      toast({ title: "কমপক্ষে ২টি অপশন দিন", variant: "destructive" });
      return;
    }
    const options = newPoll.options.filter(Boolean).map((text, i) => ({ id: crypto.randomUUID(), text, votes: 0 }));
    const ok = await create({
      question: newPoll.question,
      description: newPoll.description,
      options,
      is_active: true,
      allow_multiple: false,
      show_results: true,
      total_votes: 0,
    });
    if (ok) {
      setShowCreate(false);
      setNewPoll({ question: "", description: "", options: ["", ""] });
    }
  };

  const viewResults = async (poll: any) => {
    setViewingResults(poll);
    const { data } = await supabase.from("poll_votes").select("*").eq("poll_id", poll.id);
    setVotes(data || []);
  };

  const totalVotes = (poll: any) => (poll.options || []).reduce((s: number, o: any) => s + (o.votes || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Vote className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading">পোল/সার্ভে ম্যানেজার</h1>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" /> নতুন পোল</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>নতুন পোল তৈরি করুন</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>প্রশ্ন</Label><Input value={newPoll.question} onChange={e => setNewPoll({ ...newPoll, question: e.target.value })} placeholder="আপনার প্রশ্ন লিখুন" /></div>
              <div><Label>বিবরণ (ঐচ্ছিক)</Label><Textarea value={newPoll.description} onChange={e => setNewPoll({ ...newPoll, description: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>অপশনসমূহ</Label>
                {newPoll.options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={opt} onChange={e => { const opts = [...newPoll.options]; opts[i] = e.target.value; setNewPoll({ ...newPoll, options: opts }); }} placeholder={`অপশন ${i + 1}`} />
                    {newPoll.options.length > 2 && <Button size="icon" variant="ghost" onClick={() => setNewPoll({ ...newPoll, options: newPoll.options.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                ))}
                {newPoll.options.length < 8 && <Button variant="outline" size="sm" onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, ""] })}>+ অপশন যোগ করুন</Button>}
              </div>
              <Button onClick={handleCreate} className="w-full">তৈরি করুন</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : polls.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">কোনো পোল নেই।</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {polls.map((poll: any) => {
            const total = totalVotes(poll);
            return (
              <Card key={poll.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold">{poll.question}</h3>
                  <Badge variant={poll.is_active ? "default" : "secondary"}>{poll.is_active ? "সক্রিয়" : "বন্ধ"}</Badge>
                </div>
                {poll.description && <p className="text-sm text-muted-foreground">{poll.description}</p>}
                <div className="space-y-2">
                  {(poll.options || []).map((opt: any) => {
                    const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                    return (
                      <div key={opt.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{opt.text}</span>
                          <span className="text-muted-foreground">{opt.votes} ({pct}%)</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">মোট ভোট: {total}</p>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => update(poll.id, { is_active: !poll.is_active })}>{poll.is_active ? "বন্ধ করুন" : "চালু করুন"}</Button>
                  <Button size="sm" variant="outline" onClick={() => update(poll.id, { show_results: !poll.show_results })}>{poll.show_results ? "ফলাফল লুকান" : "ফলাফল দেখান"}</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(poll.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PollManager;
