import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Webhook, Send, CheckCircle, XCircle } from "lucide-react";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret?: string;
  last_triggered?: string;
  last_status?: "success" | "failed";
}

const EVENT_TYPES = [
  { value: "donation.created", label: "নতুন অনুদান" },
  { value: "donation.updated", label: "অনুদান আপডেট" },
  { value: "volunteer.registered", label: "নতুন স্বেচ্ছাসেবক" },
  { value: "event.created", label: "নতুন ইভেন্ট" },
  { value: "contact.received", label: "নতুন মেসেজ" },
  { value: "blog.published", label: "ব্লগ প্রকাশিত" },
  { value: "form.submitted", label: "ফর্ম সাবমিশন" },
  { value: "member.joined", label: "নতুন সদস্য" },
];

const WebhookManager = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [form, setForm] = useState({ name: "", url: "", events: [] as string[], secret: "" });
  const [showAdd, setShowAdd] = useState(false);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("site_settings").select("*").eq("setting_key", "webhooks").single();
    if (data) {
      try {
        const raw = typeof data.setting_value === "string" ? JSON.parse(data.setting_value) : data.setting_value;
        if (Array.isArray(raw)) setWebhooks(raw);
      } catch {}
    }
  };

  const save = async (updated: WebhookConfig[]) => {
    await supabase.from("site_settings").upsert({ setting_key: "webhooks", setting_value: JSON.stringify(updated) }, { onConflict: "setting_key" });
    setWebhooks(updated);
  };

  const addWebhook = async () => {
    if (!form.name || !form.url || form.events.length === 0) {
      toast({ title: "নাম, URL ও ইভেন্ট প্রয়োজন", variant: "destructive" });
      return;
    }
    const wh: WebhookConfig = { id: Date.now().toString(), ...form, is_active: true };
    await save([...webhooks, wh]);
    setForm({ name: "", url: "", events: [], secret: "" });
    setShowAdd(false);
    toast({ title: "ওয়েবহুক যোগ হয়েছে ✅" });
  };

  const toggleEvent = (event: string) => {
    setForm(f => ({
      ...f,
      events: f.events.includes(event) ? f.events.filter(e => e !== event) : [...f.events, event],
    }));
  };

  const removeWebhook = async (id: string) => {
    await save(webhooks.filter(w => w.id !== id));
    toast({ title: "ওয়েবহুক মুছে ফেলা হয়েছে" });
  };

  const toggleWebhook = async (id: string) => {
    await save(webhooks.map(w => w.id === id ? { ...w, is_active: !w.is_active } : w));
  };

  const testWebhook = async (wh: WebhookConfig) => {
    try {
      const res = await fetch(wh.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(wh.secret ? { "X-Webhook-Secret": wh.secret } : {}) },
        body: JSON.stringify({ event: "test", data: { message: "Webhook test from Shishuful" }, timestamp: new Date().toISOString() }),
      });
      const updated = webhooks.map(w => w.id === wh.id ? { ...w, last_triggered: new Date().toISOString(), last_status: (res.ok ? "success" : "failed") as "success" | "failed" } : w);
      await save(updated);
      toast({ title: res.ok ? "টেস্ট সফল ✅" : "টেস্ট ব্যর্থ ❌" });
    } catch {
      toast({ title: "টেস্ট ব্যর্থ ❌", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2"><Webhook className="h-6 w-6 text-primary" /> ওয়েবহুক ম্যানেজার</h1>
        <Button onClick={() => setShowAdd(!showAdd)} className="gap-2"><Plus className="h-4 w-4" /> নতুন ওয়েবহুক</Button>
      </div>

      {showAdd && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">নতুন ওয়েবহুক</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder="ওয়েবহুকের নাম" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="URL (https://...)" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
          </div>
          <Input placeholder="Secret (ঐচ্ছিক)" value={form.secret} onChange={e => setForm({ ...form, secret: e.target.value })} type="password" />
          <div>
            <label className="text-sm font-medium mb-2 block">ইভেন্ট নির্বাচন করুন</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map(ev => (
                <button key={ev.value} onClick={() => toggleEvent(ev.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.events.includes(ev.value) ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border hover:bg-muted/80"}`}>
                  {ev.label}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={addWebhook}>ওয়েবহুক যোগ করুন</Button>
        </Card>
      )}

      <div className="space-y-4">
        {webhooks.map(wh => (
          <Card key={wh.id} className={`p-4 ${!wh.is_active ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{wh.name}</h3>
                  {wh.last_status && (
                    wh.last_status === "success"
                      ? <CheckCircle className="h-4 w-4 text-green-500" />
                      : <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate">{wh.url}</p>
                <div className="flex flex-wrap gap-1">
                  {wh.events.map(ev => <Badge key={ev} variant="outline" className="text-[10px]">{EVENT_TYPES.find(e => e.value === ev)?.label || ev}</Badge>)}
                </div>
                {wh.last_triggered && <p className="text-[10px] text-muted-foreground">শেষ ট্রিগার: {new Date(wh.last_triggered).toLocaleString("bn-BD")}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={wh.is_active} onCheckedChange={() => toggleWebhook(wh.id)} />
                <Button size="sm" variant="outline" className="gap-1" onClick={() => testWebhook(wh)}><Send className="h-3 w-3" /> টেস্ট</Button>
                <Button size="sm" variant="ghost" onClick={() => removeWebhook(wh.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {webhooks.length === 0 && !showAdd && <p className="text-center text-muted-foreground py-8">কোনো ওয়েবহুক কনফিগার করা হয়নি</p>}
      </div>
    </div>
  );
};

export default WebhookManager;
