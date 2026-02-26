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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical, Eye, FileText, Settings, Copy, ArrowUp, ArrowDown } from "lucide-react";

interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "number" | "textarea" | "select" | "checkbox" | "radio" | "date" | "file" | "url";
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select/radio
  validation?: string;
  width?: "full" | "half";
}

interface FormConfig {
  fields: FormField[];
  submit_text?: string;
  success_message?: string;
  notify_email?: string;
  is_public?: boolean;
}

const FIELD_TYPES = [
  { value: "text", label: "টেক্সট" },
  { value: "email", label: "ইমেইল" },
  { value: "phone", label: "ফোন" },
  { value: "number", label: "সংখ্যা" },
  { value: "textarea", label: "বড় টেক্সট" },
  { value: "select", label: "ড্রপডাউন" },
  { value: "checkbox", label: "চেকবক্স" },
  { value: "radio", label: "রেডিও" },
  { value: "date", label: "তারিখ" },
  { value: "file", label: "ফাইল" },
  { value: "url", label: "URL" },
];

const FormBuilder = () => {
  const { items: forms, loading, create, update, remove, fetch } = useAdminCrud<any>({ table: "custom_forms" });
  const [editing, setEditing] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", slug: "", description: "" });
  const [fields, setFields] = useState<FormField[]>([]);
  const [formSettings, setFormSettings] = useState<Partial<FormConfig>>({
    submit_text: "জমা দিন",
    success_message: "ফর্ম সফলভাবে জমা হয়েছে!",
    is_public: true,
  });
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [viewingSubs, setViewingSubs] = useState<string | null>(null);
  const { toast } = useToast();

  const addField = () => {
    setFields([...fields, {
      id: crypto.randomUUID(),
      label: "নতুন ফিল্ড",
      type: "text",
      required: false,
      placeholder: "",
      width: "full",
    }]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => setFields(fields.filter(f => f.id !== id));

  const moveField = (idx: number, dir: -1 | 1) => {
    const newFields = [...fields];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= newFields.length) return;
    [newFields[idx], newFields[newIdx]] = [newFields[newIdx], newFields[idx]];
    setFields(newFields);
  };

  const handleCreate = async () => {
    if (!newForm.title) return;
    const slug = newForm.slug || newForm.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const config: FormConfig = { ...formSettings, fields } as FormConfig;
    const ok = await create({ title: newForm.title, slug, description: newForm.description, config, is_active: true });
    if (ok) {
      setShowCreate(false);
      setNewForm({ title: "", slug: "", description: "" });
      setFields([]);
    }
  };

  const handleEdit = (form: any) => {
    setEditing(form);
    const cfg = form.config || {};
    setFields(cfg.fields || []);
    setFormSettings({
      submit_text: cfg.submit_text || "জমা দিন",
      success_message: cfg.success_message || "ফর্ম সফলভাবে জমা হয়েছে!",
      notify_email: cfg.notify_email || "",
      is_public: cfg.is_public !== false,
    });
  };

  const handleUpdate = async () => {
    if (!editing) return;
    const config: FormConfig = { ...formSettings, fields } as FormConfig;
    const ok = await update(editing.id, { config, title: editing.title, description: editing.description });
    if (ok) setEditing(null);
  };

  const viewSubmissions = async (formId: string) => {
    setViewingSubs(formId);
    const { data } = await supabase.from("form_submissions").select("*").eq("form_id", formId).order("created_at", { ascending: false });
    setSubmissions(data || []);
  };

  const FieldEditor = ({ field, index }: { field: FormField; index: number }) => (
    <Card className="p-4 space-y-3 border-l-4 border-l-primary/30">
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <Input value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} className="font-medium" />
        <Select value={field.type} onValueChange={v => updateField(field.id, { type: v as any })}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>{FIELD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => moveField(index, -1)}><ArrowUp className="h-3 w-3" /></Button>
          <Button size="icon" variant="ghost" onClick={() => moveField(index, 1)}><ArrowDown className="h-3 w-3" /></Button>
        </div>
        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeField(field.id)}><Trash2 className="h-4 w-4" /></Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">প্লেসহোল্ডার</Label>
          <Input value={field.placeholder || ""} onChange={e => updateField(field.id, { placeholder: e.target.value })} placeholder="প্লেসহোল্ডার..." />
        </div>
        <div className="flex items-center gap-4 pt-5">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={field.required} onCheckedChange={v => updateField(field.id, { required: v })} />
            আবশ্যক
          </label>
          <Select value={field.width || "full"} onValueChange={v => updateField(field.id, { width: v as any })}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full">পূর্ণ</SelectItem>
              <SelectItem value="half">অর্ধেক</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {(field.type === "select" || field.type === "radio") && (
        <div>
          <Label className="text-xs">অপশনসমূহ (কমা দিয়ে আলাদা)</Label>
          <Input value={(field.options || []).join(", ")} onChange={e => updateField(field.id, { options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} placeholder="অপশন ১, অপশন ২, অপশন ৩" />
        </div>
      )}
    </Card>
  );

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-heading">ফর্ম সম্পাদনা: {editing.title}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>বাতিল</Button>
            <Button onClick={handleUpdate}>সেভ করুন</Button>
          </div>
        </div>

        <Tabs defaultValue="fields">
          <TabsList>
            <TabsTrigger value="fields">ফিল্ডসমূহ</TabsTrigger>
            <TabsTrigger value="settings">সেটিংস</TabsTrigger>
            <TabsTrigger value="preview">প্রিভিউ</TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{fields.length}টি ফিল্ড</p>
              <Button onClick={addField} size="sm" className="gap-1"><Plus className="h-4 w-4" /> ফিল্ড যোগ করুন</Button>
            </div>
            {fields.map((f, i) => <FieldEditor key={f.id} field={f} index={i} />)}
            {fields.length === 0 && <p className="text-center text-muted-foreground py-8">কোনো ফিল্ড নেই। উপরে "ফিল্ড যোগ করুন" বাটনে ক্লিক করুন।</p>}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="p-4 space-y-4">
              <div>
                <Label>ফর্মের শিরোনাম</Label>
                <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <Label>বিবরণ</Label>
                <Textarea value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div>
                <Label>সাবমিট বাটন টেক্সট</Label>
                <Input value={formSettings.submit_text || ""} onChange={e => setFormSettings({ ...formSettings, submit_text: e.target.value })} />
              </div>
              <div>
                <Label>সফল মেসেজ</Label>
                <Input value={formSettings.success_message || ""} onChange={e => setFormSettings({ ...formSettings, success_message: e.target.value })} />
              </div>
              <div>
                <Label>নোটিফিকেশন ইমেইল</Label>
                <Input value={formSettings.notify_email || ""} onChange={e => setFormSettings({ ...formSettings, notify_email: e.target.value })} placeholder="admin@example.com" />
              </div>
              <label className="flex items-center gap-2">
                <Switch checked={formSettings.is_public !== false} onCheckedChange={v => setFormSettings({ ...formSettings, is_public: v })} />
                পাবলিক (বাইরে থেকে দেখা যাবে)
              </label>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card className="p-6 max-w-lg mx-auto space-y-4">
              <h2 className="text-xl font-bold">{editing.title}</h2>
              {editing.description && <p className="text-muted-foreground">{editing.description}</p>}
              {fields.map(f => (
                <div key={f.id} className={f.width === "half" ? "inline-block w-[48%] mr-[2%] align-top" : ""}>
                  <Label>{f.label} {f.required && <span className="text-destructive">*</span>}</Label>
                  {f.type === "textarea" ? <Textarea placeholder={f.placeholder} disabled /> :
                   f.type === "select" ? (
                    <Select disabled><SelectTrigger><SelectValue placeholder={f.placeholder || "নির্বাচন করুন"} /></SelectTrigger></Select>
                   ) : f.type === "checkbox" ? (
                    <div className="flex items-center gap-2"><input type="checkbox" disabled /> <span className="text-sm">{f.label}</span></div>
                   ) : <Input type={f.type} placeholder={f.placeholder} disabled />}
                </div>
              ))}
              <Button disabled>{formSettings.submit_text || "জমা দিন"}</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading">ফর্ম বিল্ডার</h1>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" /> নতুন ফর্ম</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>নতুন ফর্ম তৈরি করুন</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>শিরোনাম</Label><Input value={newForm.title} onChange={e => setNewForm({ ...newForm, title: e.target.value })} placeholder="যোগাযোগ ফর্ম" /></div>
              <div><Label>স্লাগ (URL)</Label><Input value={newForm.slug} onChange={e => setNewForm({ ...newForm, slug: e.target.value })} placeholder="contact-form" /></div>
              <div><Label>বিবরণ</Label><Textarea value={newForm.description} onChange={e => setNewForm({ ...newForm, description: e.target.value })} /></div>
              <Button onClick={handleCreate} className="w-full">তৈরি করুন</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : forms.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">কোনো ফর্ম নেই। নতুন ফর্ম তৈরি করুন।</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form: any) => (
            <Card key={form.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{form.title}</h3>
                  <p className="text-xs text-muted-foreground">/forms/{form.slug}</p>
                </div>
                <Badge variant={form.is_active ? "default" : "secondary"}>{form.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</Badge>
              </div>
              {form.description && <p className="text-sm text-muted-foreground line-clamp-2">{form.description}</p>}
              <p className="text-xs text-muted-foreground">{(form.config?.fields || []).length}টি ফিল্ড</p>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => handleEdit(form)} className="gap-1"><Settings className="h-3 w-3" /> সম্পাদনা</Button>
                <Button size="sm" variant="outline" onClick={() => viewSubmissions(form.id)} className="gap-1"><Eye className="h-3 w-3" /> সাবমিশন</Button>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(`/forms/${form.slug}`); toast({ title: "লিংক কপি হয়েছে!" }); }} className="gap-1"><Copy className="h-3 w-3" /></Button>
                <Button size="sm" variant="outline" onClick={() => update(form.id, { is_active: !form.is_active })}>{form.is_active ? "বন্ধ" : "চালু"}</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(form.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Submissions viewer */}
      <Dialog open={!!viewingSubs} onOpenChange={() => setViewingSubs(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>ফর্ম সাবমিশনসমূহ ({submissions.length}টি)</DialogTitle></DialogHeader>
          {submissions.length === 0 ? <p className="text-muted-foreground text-center py-8">কোনো সাবমিশন নেই।</p> : (
            <div className="space-y-3">
              {submissions.map((sub: any) => (
                <Card key={sub.id} className="p-4">
                  <div className="text-xs text-muted-foreground mb-2">{new Date(sub.created_at).toLocaleString("bn-BD")}</div>
                  <div className="grid gap-2">
                    {Object.entries(sub.data || {}).map(([k, v]) => (
                      <div key={k} className="flex gap-2 text-sm">
                        <span className="font-medium min-w-[120px]">{k}:</span>
                        <span>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormBuilder;
