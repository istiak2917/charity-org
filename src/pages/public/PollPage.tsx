import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Vote, CheckCircle } from "lucide-react";

const PollPage = () => {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("polls").select("*").eq("is_active", true).order("created_at", { ascending: false });
      setPolls(data || []);
      // Check localStorage for already voted
      const votedSet = new Set<string>();
      (data || []).forEach((p: any) => {
        if (localStorage.getItem(`poll_voted_${p.id}`)) votedSet.add(p.id);
      });
      setVoted(votedSet);
      setLoading(false);
    };
    load();
  }, []);

  const handleVote = async (poll: any) => {
    const optionId = selected[poll.id];
    if (!optionId) { toast({ title: "একটি অপশন নির্বাচন করুন", variant: "destructive" }); return; }

    // Update vote count in options
    const updatedOptions = (poll.options || []).map((o: any) =>
      o.id === optionId ? { ...o, votes: (o.votes || 0) + 1 } : o
    );
    const { error } = await supabase.from("polls").update({
      options: updatedOptions,
      total_votes: (poll.total_votes || 0) + 1,
    }).eq("id", poll.id);

    if (!error) {
      localStorage.setItem(`poll_voted_${poll.id}`, "1");
      setVoted(new Set([...voted, poll.id]));
      setPolls(polls.map(p => p.id === poll.id ? { ...p, options: updatedOptions, total_votes: (p.total_votes || 0) + 1 } : p));
      toast({ title: "ভোট দেওয়া হয়েছে!" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Vote className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold font-heading">পোল ও সার্ভে</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : polls.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">বর্তমানে কোনো সক্রিয় পোল নেই।</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {polls.map(poll => {
              const total = (poll.options || []).reduce((s: number, o: any) => s + (o.votes || 0), 0);
              const hasVoted = voted.has(poll.id);

              return (
                <Card key={poll.id} className="p-6 space-y-4">
                  <h2 className="text-lg font-bold">{poll.question}</h2>
                  {poll.description && <p className="text-sm text-muted-foreground">{poll.description}</p>}

                  {hasVoted || poll.show_results ? (
                    <div className="space-y-3">
                      {(poll.options || []).map((opt: any) => {
                        const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                        return (
                          <div key={opt.id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{opt.text}</span>
                              <span className="font-medium">{pct}%</span>
                            </div>
                            <Progress value={pct} className="h-3" />
                          </div>
                        );
                      })}
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {hasVoted && <CheckCircle className="h-3 w-3 text-green-500" />}
                        মোট {total} জন ভোট দিয়েছেন
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(poll.options || []).map((opt: any) => (
                        <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selected[poll.id] === opt.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                          <input type="radio" name={poll.id} checked={selected[poll.id] === opt.id} onChange={() => setSelected({ ...selected, [poll.id]: opt.id })} className="accent-primary" />
                          <span>{opt.text}</span>
                        </label>
                      ))}
                      <Button onClick={() => handleVote(poll)} className="w-full mt-2">ভোট দিন</Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PollPage;
