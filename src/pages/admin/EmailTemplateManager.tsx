import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Mail, Eye, Copy } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  variables: string[];
  is_active: boolean;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "donation-thank-you",
    name: "অনুদানের ধন্যবাদ",
    subject: "ধন্যবাদ, {{name}}! আপনার অনুদান পৌঁছে গেছে",
    body_html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<div style="text-align:center;padding:20px;background:linear-gradient(135deg,#10b981,#059669);border-radius:12px;margin-bottom:20px;">
<h1 style="color:white;margin:0;">শিশুফুল ফাউন্ডেশন</h1>
</div>
<h2 style="color:#1f2937;">প্রিয় {{name}},</h2>
<p>আপনার <strong>৳{{amount}}</strong> অনুদানের জন্য আন্তরিক ধন্যবাদ!</p>
<p>আপনার অনুদান <strong>{{project}}</strong> প্রকল্পে ব্যবহার করা হবে।</p>
<p>লেনদেন আইডি: <code>{{transaction_id}}</code></p>
<div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0;">
<p style="margin:0;font-size:14px;color:#6b7280;">রসিদ ডাউনলোড করতে: <a href="{{receipt_url}}">এখানে ক্লিক করুন</a></p>
</div>
<p style="color:#6b7280;font-size:12px;">শিশুফুল ফাউন্ডেশন | info@shishuful.org</p>
</div>`,
    variables: ["name", "amount", "project", "transaction_id", "receipt_url"],
    is_active: true,
  },
  {
    id: "welcome-email",
    name: "স্বাগতম ইমেইল",
    subject: "স্বাগতম {{name}}! শিশুফুল পরিবারে আপনাকে অভিনন্দন",
    body_html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<h1 style="color:#10b981;">স্বাগতম, {{name}}!</h1>
<p>শিশুফুল ফাউন্ডেশনে যোগ দেওয়ার জন্য ধন্যবাদ।</p>
<p>আপনার একাউন্ট: <strong>{{email}}</strong></p>
<a href="{{dashboard_url}}" style="display:inline-block;background:#10b981;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:15px 0;">ড্যাশবোর্ডে যান</a>
<p style="color:#6b7280;font-size:12px;">শিশুফুল ফাউন্ডেশন</p>
</div>`,
    variables: ["name", "email", "dashboard_url"],
    is_active: true,
  },
  {
    id: "event-reminder",
    name: "ইভেন্ট রিমাইন্ডার",
    subject: "রিমাইন্ডার: {{event_name}} আগামীকাল!",
    body_html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<h2>প্রিয় {{name}},</h2>
<p>মনে করিয়ে দিচ্ছি, <strong>{{event_name}}</strong> আগামীকাল অনুষ্ঠিত হবে।</p>
<p>📅 তারিখ: {{event_date}}</p>
<p>📍 স্থান: {{event_location}}</p>
<a href="{{event_url}}" style="display:inline-block;background:#3b82f6;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">বিস্তারিত দেখুন</a>
</div>`,
    variables: ["name", "event_name", "event_date", "event_location", "event_url"],
    is_active: true,
  },
  {
    id: "volunteer-approved",
    name: "স্বেচ্ছাসেবক অনুমোদন",
    subject: "অভিনন্দন {{name}}! আপনি স্বেচ্ছাসেবক হিসেবে অনুমোদিত হয়েছেন",
    body_html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<h2 style="color:#10b981;">অভিনন্দন, {{name}}!</h2>
<p>আপনার স্বেচ্ছাসেবক আবেদন অনুমোদিত হয়েছে।</p>
<p>আপনার দক্ষতা: {{skills}}</p>
<p>যোগাযোগ করুন: {{contact_email}}</p>
</div>`,
    variables: ["name", "skills", "contact_email"],
    is_active: true,
  },
];

const AVAILABLE_VARIABLES = [
  { key: "name", desc: "প্রাপকের নাম" },
  { key: "email", desc: "প্রাপকের ইমেইল" },
  { key: "amount", desc: "অনুদানের পরিমাণ" },
  { key: "project", desc: "প্রকল্পের নাম" },
  { key: "transaction_id", desc: "লেনদেন আইডি" },
  { key: "receipt_url", desc: "রসিদ লিংক" },
  { key: "dashboard_url", desc: "ড্যাশবোর্ড লিংক" },
  { key: "event_name", desc: "ইভেন্টের নাম" },
  { key: "event_date", desc: "ইভেন্টের তারিখ" },
  { key: "event_location", desc: "ইভেন্টের স্থান" },
  { key: "event_url", desc: "ইভেন্ট লিংক" },
  { key: "skills", desc: "দক্ষতা" },
  { key: "contact_email", desc: "যোগাযোগ ইমেইল" },
  { key: "org_name", desc: "সংগঠনের নাম" },
  { key: "date", desc: "বর্তমান তারিখ" },
];

const EmailTemplateManager = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [form, setForm] = useState({ name: "", subject: "", body_html: "", variables: "" as string });
  const [previewHtml, setPreviewHtml] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data } = await supabase.from("site_settings").select("*").eq("setting_key", "email_templates").single();
    if (data) {
      try {
        const raw = typeof data.setting_value === "string" ? JSON.parse(data.setting_value) : data.setting_value;
        if (Array.isArray(raw) && raw.length > 0) { setTemplates(raw); return; }
      } catch {}
    }
    setTemplates(DEFAULT_TEMPLATES);
  };

  const saveTemplates = async (updated: EmailTemplate[]) => {
    await supabase.from("site_settings").upsert(
      { setting_key: "email_templates", setting_value: JSON.stringify(updated) },
      { onConflict: "setting_key" }
    );
    setTemplates(updated);
    toast({ title: "টেমপ্লেট সেভ হয়েছে ✅" });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.subject) return;
    const vars = form.body_html.match(/\{\{(\w+)\}\}/g)?.map(v => v.replace(/\{\{|\}\}/g, "")) || [];
    const template: EmailTemplate = {
      id: editing?.id || Date.now().toString(),
      name: form.name,
      subject: form.subject,
      body_html: form.body_html,
      variables: vars,
      is_active: true,
    };
    const updated = editing
      ? templates.map(t => t.id === editing.id ? template : t)
      : [...templates, template];
    await saveTemplates(updated);
    setOpen(false);
    setForm({ name: "", subject: "", body_html: "", variables: "" });
    setEditing(null);
  };

  const handleEdit = (t: EmailTemplate) => {
    setEditing(t);
    setForm({ name: t.name, subject: t.subject, body_html: t.body_html, variables: t.variables.join(", ") });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    await saveTemplates(updated);
  };

  const handleToggle = async (id: string) => {
    const updated = templates.map(t => t.id === id ? { ...t, is_active: !t.is_active } : t);
    await saveTemplates(updated);
  };

  const showPreview = (t: EmailTemplate) => {
    let html = t.body_html;
    t.variables.forEach(v => {
      const sampleValues: Record<string, string> = {
        name: "আব্দুর রহমান", email: "abdur@example.com", amount: "5,000",
        project: "শিশু শিক্ষা কার্যক্রম", transaction_id: "TXN-20260226-001",
        receipt_url: "#", dashboard_url: "#", event_name: "বার্ষিক শিশু উৎসব",
        event_date: "১৫ এপ্রিল, ২০২৬", event_location: "মিরপুর, ঢাকা",
        event_url: "#", skills: "শিক্ষকতা, ফটোগ্রাফি", contact_email: "info@shishuful.org",
        org_name: "শিশুফুল ফাউন্ডেশন", date: new Date().toLocaleDateString("bn-BD"),
      };
      html = html.replace(new RegExp(`\\{\\{${v}\\}\\}`, "g"), sampleValues[v] || `[${v}]`);
    });
    setPreviewHtml(html);
    setPreviewOpen(true);
  };

  const copyVariable = (v: string) => {
    navigator.clipboard.writeText(`{{${v}}}`);
    toast({ title: `{{${v}}} কপি হয়েছে` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2"><Mail className="h-6 w-6 text-primary" /> ইমেইল টেমপ্লেট</h1>
          <p className="text-sm text-muted-foreground mt-1">{"{{name}}"} এর মতো ভেরিয়েবল ব্যবহার করে ডায়নামিক ইমেইল তৈরি করুন</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ name: "", subject: "", body_html: "", variables: "" }); } }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন টেমপ্লেট</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "টেমপ্লেট সম্পাদনা" : "নতুন টেমপ্লেট"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="টেমপ্লেটের নাম" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="বিষয় (Subject) — {{name}} ব্যবহার করুন" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
              <div>
                <label className="text-sm font-medium mb-1 block">HTML বডি</label>
                <Textarea rows={12} className="font-mono text-xs" placeholder="<div>...</div>" value={form.body_html} onChange={e => setForm({ ...form, body_html: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">ভেরিয়েবল (ক্লিক করে কপি করুন)</label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_VARIABLES.map(v => (
                    <button key={v.key} onClick={() => copyVariable(v.key)} className="text-xs px-2 py-1 rounded bg-muted hover:bg-primary/10 transition-colors" title={v.desc}>
                      <Copy className="h-3 w-3 inline mr-1" />{`{{${v.key}}}`}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">{editing ? "আপডেট" : "তৈরি করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map(t => (
          <Card key={t.id} className={`p-4 space-y-3 ${!t.is_active ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-sm">{t.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[250px]">{t.subject}</p>
              </div>
              <Badge variant={t.is_active ? "default" : "secondary"} className="cursor-pointer" onClick={() => handleToggle(t.id)}>
                {t.is_active ? "সচল" : "বন্ধ"}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {t.variables.map(v => <Badge key={v} variant="outline" className="text-[10px]">{`{{${v}}}`}</Badge>)}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={() => showPreview(t)}><Eye className="h-3 w-3" /> প্রিভিউ</Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => handleEdit(t)}><Pencil className="h-3 w-3" /> সম্পাদনা</Button>
              <Button size="sm" variant="ghost" className="gap-1 text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>ইমেইল প্রিভিউ</DialogTitle></DialogHeader>
          <div className="border rounded-lg p-4 bg-white" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplateManager;
