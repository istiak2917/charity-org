import { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, MailOpen, Trash2, Reply } from "lucide-react";

interface ContactMessage { id: string; name: string; email: string; subject: string; message: string; is_read: boolean; reply: string; created_at: string; }

const ContactInbox = () => {
  const { items, loading, update, remove } = useAdminCrud<ContactMessage>({ table: "contact_messages" });
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSelect = (msg: ContactMessage) => {
    setSelected(msg);
    setReplyText(msg.reply || "");
    if (!msg.is_read) update(msg.id, { is_read: true } as any);
  };

  const handleReply = async () => {
    if (selected && replyText) {
      await update(selected.id, { reply: replyText } as any);
      setSelected(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const unreadCount = items.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold font-heading">মেসেজ ইনবক্স</h1>
        {unreadCount > 0 && <Badge variant="destructive">{unreadCount} অপঠিত</Badge>}
      </div>
      <div className="space-y-3">
        {items.map((msg) => (
          <Card key={msg.id} className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${!msg.is_read ? "border-primary/30 bg-primary/5" : ""}`} onClick={() => handleSelect(msg)}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {msg.is_read ? <MailOpen className="h-5 w-5 mt-0.5 text-muted-foreground" /> : <Mail className="h-5 w-5 mt-0.5 text-primary" />}
                <div>
                  <div className="font-medium">{msg.name}</div>
                  <div className="text-sm text-muted-foreground">{msg.email}</div>
                  <div className="text-sm font-medium mt-1">{msg.subject || "বিষয় নেই"}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2 mt-1">{msg.message}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleDateString("bn-BD")}</span>
                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); remove(msg.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {items.length === 0 && <div className="text-center text-muted-foreground py-12">কোনো মেসেজ নেই</div>}
      </div>

      <Dialog open={!!selected} onOpenChange={(v) => { if (!v) setSelected(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>মেসেজ বিস্তারিত</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <div className="font-medium">{selected.name} ({selected.email})</div>
                <div className="text-sm text-muted-foreground">{new Date(selected.created_at).toLocaleString("bn-BD")}</div>
              </div>
              <div className="bg-muted p-3 rounded-lg text-sm">{selected.message}</div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1"><Reply className="h-4 w-4" /> উত্তর</label>
                <Textarea rows={4} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="উত্তর লিখুন..." />
                <Button onClick={handleReply} className="w-full">উত্তর সেভ করুন</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactInbox;
