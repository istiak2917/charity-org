import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Trash2, Edit, Eye, EyeOff, GripVertical, ExternalLink,
  ChevronUp, ChevronDown, List, Settings2, Copy
} from "lucide-react";

// ── Types ──────────────────────────────────────────────
export interface DirectoryField {
  id: string;
  db_column: string;
  label_bn: string;
  label_en: string;
  field_type: "text" | "image" | "badge" | "email" | "phone" | "date" | "link" | "hidden";
  is_visible: boolean;
  sort_order: number;
}

export interface DirectoryConfig {
  id: string;
  title_bn: string;
  title_en: string;
  slug: string;
  description_bn: string;
  description_en: string;
  source_table: string;
  is_public: boolean;
  filter_column?: string;
  filter_value?: string;
  layout: "grid" | "list" | "table";
  fields: DirectoryField[];
  created_at: string;
}

const SOURCE_TABLES = [
  { value: "volunteers", label_bn: "স্বেচ্ছাসেবক", label_en: "Volunteers" },
  { value: "blood_donors", label_bn: "রক্তদাতা", label_en: "Blood Donors" },
  { value: "donations", label_bn: "দাতা/ডোনেশন", label_en: "Donors/Donations" },
  { value: "team_members", label_bn: "টিম মেম্বার", label_en: "Team Members" },
  { value: "beneficiaries", label_bn: "উপকারভোগী", label_en: "Beneficiaries" },
  { value: "profiles", label_bn: "ইউজার/প্রোফাইল", label_en: "Users/Profiles" },
  { value: "sponsors", label_bn: "স্পন্সর", label_en: "Sponsors" },
];

const FIELD_TYPES: { value: DirectoryField["field_type"]; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "image", label: "Image/Avatar" },
  { value: "badge", label: "Badge/Tag" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "date", label: "Date" },
  { value: "link", label: "Link/URL" },
  { value: "hidden", label: "Hidden" },
];

const SETTINGS_KEY = "public_directories";

const uid = () => Math.random().toString(36).slice(2, 10);

// ── Component ──────────────────────────────────────────
const DirectoryManager = () => {
  const { lang, t } = useLanguage();
  const [directories, setDirectories] = useState<DirectoryConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDir, setEditDir] = useState<DirectoryConfig | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);

  // ── Load directories from site_settings ──
  const loadDirectories = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .eq("setting_key", SETTINGS_KEY)
      .maybeSingle();
    if (data?.setting_value) {
      try {
        const parsed = JSON.parse(data.setting_value);
        setDirectories(Array.isArray(parsed) ? parsed : []);
      } catch { setDirectories([]); }
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadDirectories(); }, [loadDirectories]);

  // ── Save all directories ──
  const saveDirectories = async (dirs: DirectoryConfig[]) => {
    const { error } = await supabase.from("site_settings").upsert(
      { setting_key: SETTINGS_KEY, setting_value: JSON.stringify(dirs) },
      { onConflict: "setting_key" }
    );
    if (error) {
      toast({ title: lang === "bn" ? "সেভ ব্যর্থ" : "Save failed", variant: "destructive" });
    } else {
      setDirectories(dirs);
      toast({ title: lang === "bn" ? "সেভ হয়েছে!" : "Saved!" });
    }
  };

  // ── Detect columns from a table ──
  const detectColumns = async (table: string) => {
    try {
      const { data } = await supabase.from(table).select("*").limit(1);
      if (data && data.length > 0) {
        setDetectedColumns(Object.keys(data[0]));
      } else {
        // Try empty table - get column names from empty result
        const { data: emptyData, error } = await supabase.from(table).select("*").limit(0);
        setDetectedColumns([]);
      }
    } catch {
      setDetectedColumns([]);
    }
  };

  // ── Toggle public visibility ──
  const togglePublic = (id: string) => {
    const updated = directories.map(d => d.id === id ? { ...d, is_public: !d.is_public } : d);
    saveDirectories(updated);
  };

  // ── Delete directory ──
  const deleteDirectory = (id: string) => {
    if (!confirm(lang === "bn" ? "এই ডিরেক্টরি মুছতে চান?" : "Delete this directory?")) return;
    saveDirectories(directories.filter(d => d.id !== id));
  };

  // ── Duplicate directory ──
  const duplicateDirectory = (dir: DirectoryConfig) => {
    const newDir: DirectoryConfig = {
      ...dir,
      id: uid(),
      slug: dir.slug + "-copy",
      title_bn: dir.title_bn + " (কপি)",
      title_en: dir.title_en + " (Copy)",
      is_public: false,
      created_at: new Date().toISOString(),
    };
    saveDirectories([...directories, newDir]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading">
            {lang === "bn" ? "পাবলিক ডিরেক্টরি" : "Public Directories"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {lang === "bn"
              ? "ডোনার, স্বেচ্ছাসেবক, রক্তদাতা ইত্যাদির পাবলিক তালিকা তৈরি ও পরিচালনা করুন। কাস্টম ফিল্ড দিয়ে তথ্য নিয়ন্ত্রণ করুন।"
              : "Create & manage public lists of donors, volunteers, blood donors etc. Control data with custom fields."}
          </p>
        </div>
        <Button className="gap-1" onClick={() => { setCreateOpen(true); setDetectedColumns([]); }}>
          <Plus className="h-4 w-4" />
          {lang === "bn" ? "নতুন ডিরেক্টরি" : "New Directory"}
        </Button>
      </div>

      {/* ── Create Dialog ── */}
      <CreateEditDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        lang={lang}
        detectedColumns={detectedColumns}
        onDetectColumns={detectColumns}
        onSave={(dir) => {
          saveDirectories([...directories, dir]);
          setCreateOpen(false);
        }}
      />

      {/* ── Edit Dialog ── */}
      {editDir && (
        <CreateEditDialog
          open={!!editDir}
          onClose={() => setEditDir(null)}
          lang={lang}
          initial={editDir}
          detectedColumns={detectedColumns}
          onDetectColumns={detectColumns}
          onSave={(dir) => {
            saveDirectories(directories.map(d => d.id === dir.id ? dir : d));
            setEditDir(null);
          }}
        />
      )}

      {/* ── Directory List ── */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : directories.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <List className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>{lang === "bn" ? "কোনো ডিরেক্টরি নেই। নতুন একটি তৈরি করুন।" : "No directories yet. Create one."}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {directories.map((dir) => (
            <Card key={dir.id} className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg">{lang === "bn" ? dir.title_bn : dir.title_en}</h3>
                    <Badge variant={dir.is_public ? "default" : "secondary"} className="gap-1">
                      {dir.is_public ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {dir.is_public ? (lang === "bn" ? "পাবলিক" : "Public") : (lang === "bn" ? "বন্ধ" : "Hidden")}
                    </Badge>
                    <Badge variant="outline">{dir.source_table}</Badge>
                    <Badge variant="outline">{dir.layout}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    /directory/{dir.slug} · {dir.fields.filter(f => f.is_visible).length} {lang === "bn" ? "টি ফিল্ড দৃশ্যমান" : "fields visible"}
                  </p>
                  {dir.description_bn && (
                    <p className="text-xs text-muted-foreground mt-1">{lang === "bn" ? dir.description_bn : dir.description_en}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Switch checked={dir.is_public} onCheckedChange={() => togglePublic(dir.id)} />
                  {dir.is_public && (
                    <a href={`/directory/${dir.slug}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost"><ExternalLink className="h-4 w-4" /></Button>
                    </a>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => { setEditDir(dir); detectColumns(dir.source_table); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => duplicateDirectory(dir)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteDirectory(dir.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Field preview */}
              <div className="mt-3 flex flex-wrap gap-1">
                {dir.fields.map(f => (
                  <Badge key={f.id} variant={f.is_visible ? "default" : "outline"} className="text-xs gap-1">
                    {f.is_visible ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
                    {lang === "bn" ? f.label_bn : f.label_en} ({f.db_column})
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Presets ── */}
      <Card className="p-4">
        <h3 className="font-bold mb-3">{lang === "bn" ? "দ্রুত তৈরি (প্রিসেট)" : "Quick Create (Presets)"}</h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(preset => (
            <Button key={preset.slug} variant="outline" size="sm" onClick={() => {
              if (directories.some(d => d.slug === preset.slug)) {
                toast({ title: lang === "bn" ? "এই স্লাগ আছে!" : "Slug exists!", variant: "destructive" });
                return;
              }
              saveDirectories([...directories, { ...preset, id: uid(), created_at: new Date().toISOString() }]);
            }}>
              <Plus className="h-3 w-3 mr-1" />
              {lang === "bn" ? preset.title_bn : preset.title_en}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ── Presets ──────────────────────────────────────────────
const PRESETS: Omit<DirectoryConfig, "id" | "created_at">[] = [
  {
    title_bn: "দাতা তালিকা", title_en: "Donor List",
    slug: "donors", description_bn: "আমাদের সম্মানিত দাতাদের তালিকা", description_en: "List of our honored donors",
    source_table: "donations", is_public: false, layout: "grid",
    fields: [
      { id: "f1", db_column: "donor_name", label_bn: "নাম", label_en: "Name", field_type: "text", is_visible: true, sort_order: 1 },
      { id: "f2", db_column: "amount", label_bn: "পরিমাণ", label_en: "Amount", field_type: "text", is_visible: true, sort_order: 2 },
      { id: "f3", db_column: "donation_date", label_bn: "তারিখ", label_en: "Date", field_type: "date", is_visible: true, sort_order: 3 },
      { id: "f4", db_column: "message", label_bn: "মেসেজ", label_en: "Message", field_type: "text", is_visible: false, sort_order: 4 },
    ],
  },
  {
    title_bn: "স্বেচ্ছাসেবক তালিকা", title_en: "Volunteer List",
    slug: "volunteer-list", description_bn: "আমাদের নিবেদিত স্বেচ্ছাসেবকদের তালিকা", description_en: "Our dedicated volunteers",
    source_table: "volunteers", is_public: false, layout: "grid",
    fields: [
      { id: "f1", db_column: "full_name", label_bn: "নাম", label_en: "Name", field_type: "text", is_visible: true, sort_order: 1 },
      { id: "f2", db_column: "avatar_url", label_bn: "ছবি", label_en: "Photo", field_type: "image", is_visible: true, sort_order: 2 },
      { id: "f3", db_column: "phone", label_bn: "ফোন", label_en: "Phone", field_type: "phone", is_visible: true, sort_order: 3 },
      { id: "f4", db_column: "skills", label_bn: "দক্ষতা", label_en: "Skills", field_type: "badge", is_visible: true, sort_order: 4 },
      { id: "f5", db_column: "status", label_bn: "স্ট্যাটাস", label_en: "Status", field_type: "badge", is_visible: true, sort_order: 5 },
    ],
  },
  {
    title_bn: "রক্তদাতা তালিকা", title_en: "Blood Donor List",
    slug: "blood-donors", description_bn: "রক্তদাতাদের তালিকা", description_en: "Blood donor directory",
    source_table: "blood_donors", is_public: false, layout: "grid",
    fields: [
      { id: "f1", db_column: "name", label_bn: "নাম", label_en: "Name", field_type: "text", is_visible: true, sort_order: 1 },
      { id: "f2", db_column: "blood_group", label_bn: "রক্তের গ্রুপ", label_en: "Blood Group", field_type: "badge", is_visible: true, sort_order: 2 },
      { id: "f3", db_column: "phone", label_bn: "ফোন", label_en: "Phone", field_type: "phone", is_visible: true, sort_order: 3 },
      { id: "f4", db_column: "location", label_bn: "এলাকা", label_en: "Location", field_type: "text", is_visible: true, sort_order: 4 },
      { id: "f5", db_column: "last_donation_date", label_bn: "সর্বশেষ দান", label_en: "Last Donation", field_type: "date", is_visible: true, sort_order: 5 },
    ],
  },
  {
    title_bn: "টিম মেম্বার", title_en: "Team Members",
    slug: "team", description_bn: "আমাদের টিম", description_en: "Our Team",
    source_table: "team_members", is_public: false, layout: "grid",
    fields: [
      { id: "f1", db_column: "name", label_bn: "নাম", label_en: "Name", field_type: "text", is_visible: true, sort_order: 1 },
      { id: "f2", db_column: "image_url", label_bn: "ছবি", label_en: "Photo", field_type: "image", is_visible: true, sort_order: 2 },
      { id: "f3", db_column: "role", label_bn: "পদবী", label_en: "Role", field_type: "badge", is_visible: true, sort_order: 3 },
      { id: "f4", db_column: "bio", label_bn: "পরিচিতি", label_en: "Bio", field_type: "text", is_visible: true, sort_order: 4 },
    ],
  },
];

// ── Create/Edit Dialog ──────────────────────────────────
interface DialogProps {
  open: boolean;
  onClose: () => void;
  lang: "bn" | "en";
  initial?: DirectoryConfig;
  detectedColumns: string[];
  onDetectColumns: (table: string) => void;
  onSave: (dir: DirectoryConfig) => void;
}

const CreateEditDialog = ({ open, onClose, lang, initial, detectedColumns, onDetectColumns, onSave }: DialogProps) => {
  const isEdit = !!initial;
  const [form, setForm] = useState<DirectoryConfig>(
    initial || {
      id: uid(),
      title_bn: "", title_en: "",
      slug: "",
      description_bn: "", description_en: "",
      source_table: "volunteers",
      is_public: false,
      layout: "grid",
      fields: [],
      created_at: new Date().toISOString(),
    }
  );

  useEffect(() => {
    if (initial) setForm(initial);
    else setForm({
      id: uid(), title_bn: "", title_en: "", slug: "", description_bn: "", description_en: "",
      source_table: "volunteers", is_public: false, layout: "grid", fields: [], created_at: new Date().toISOString(),
    });
  }, [initial, open]);

  const addField = () => {
    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, {
        id: uid(), db_column: "", label_bn: "", label_en: "",
        field_type: "text", is_visible: true, sort_order: prev.fields.length + 1,
      }],
    }));
  };

  const updateField = (fid: string, patch: Partial<DirectoryField>) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === fid ? { ...f, ...patch } : f),
    }));
  };

  const removeField = (fid: string) => {
    setForm(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== fid) }));
  };

  const moveField = (fid: string, dir: -1 | 1) => {
    setForm(prev => {
      const idx = prev.fields.findIndex(f => f.id === fid);
      if ((dir === -1 && idx === 0) || (dir === 1 && idx === prev.fields.length - 1)) return prev;
      const copy = [...prev.fields];
      [copy[idx], copy[idx + dir]] = [copy[idx + dir], copy[idx]];
      return { ...prev, fields: copy.map((f, i) => ({ ...f, sort_order: i + 1 })) };
    });
  };

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

  const addColumnAsField = (col: string) => {
    if (form.fields.some(f => f.db_column === col)) return;
    const label = col.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const type: DirectoryField["field_type"] =
      col.includes("image") || col.includes("avatar") || col.includes("photo") ? "image" :
      col.includes("email") ? "email" :
      col.includes("phone") ? "phone" :
      col.includes("date") ? "date" :
      col.includes("url") || col.includes("link") ? "link" :
      col === "id" || col === "user_id" || col === "created_at" || col === "updated_at" ? "hidden" : "text";
    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, {
        id: uid(), db_column: col, label_bn: label, label_en: label,
        field_type: type, is_visible: type !== "hidden", sort_order: prev.fields.length + 1,
      }],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? (lang === "bn" ? "ডিরেক্টরি সম্পাদনা" : "Edit Directory")
              : (lang === "bn" ? "নতুন ডিরেক্টরি তৈরি" : "Create New Directory")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{lang === "bn" ? "শিরোনাম (বাংলা)" : "Title (Bengali)"}</Label>
              <Input value={form.title_bn} onChange={e => setForm({ ...form, title_bn: e.target.value, slug: form.slug || autoSlug(e.target.value) })} />
            </div>
            <div>
              <Label>{lang === "bn" ? "শিরোনাম (ইংরেজি)" : "Title (English)"}</Label>
              <Input value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value, slug: form.slug || autoSlug(e.target.value) })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Slug (URL)</Label>
              <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="e.g. donors" />
              <p className="text-xs text-muted-foreground mt-1">/directory/{form.slug}</p>
            </div>
            <div>
              <Label>{lang === "bn" ? "সোর্স টেবিল" : "Source Table"}</Label>
              <Select value={form.source_table} onValueChange={v => { setForm({ ...form, source_table: v }); onDetectColumns(v); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCE_TABLES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      {lang === "bn" ? t.label_bn : t.label_en} ({t.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{lang === "bn" ? "বিবরণ (বাংলা)" : "Description (Bengali)"}</Label>
              <Textarea value={form.description_bn} onChange={e => setForm({ ...form, description_bn: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>{lang === "bn" ? "বিবরণ (ইংরেজি)" : "Description (English)"}</Label>
              <Textarea value={form.description_en} onChange={e => setForm({ ...form, description_en: e.target.value })} rows={2} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Layout</Label>
              <Select value={form.layout} onValueChange={(v: any) => setForm({ ...form, layout: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{lang === "bn" ? "ফিল্টার কলাম (ঐচ্ছিক)" : "Filter Column (optional)"}</Label>
              <Input value={form.filter_column || ""} onChange={e => setForm({ ...form, filter_column: e.target.value })} placeholder="e.g. status" />
            </div>
            <div>
              <Label>{lang === "bn" ? "ফিল্টার ভ্যালু" : "Filter Value"}</Label>
              <Input value={form.filter_value || ""} onChange={e => setForm({ ...form, filter_value: e.target.value })} placeholder="e.g. approved" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.is_public} onCheckedChange={v => setForm({ ...form, is_public: v })} />
            <Label>{lang === "bn" ? "পাবলিকলি দৃশ্যমান" : "Publicly Visible"}</Label>
          </div>

          {/* Detected columns */}
          {detectedColumns.length > 0 && (
            <Card className="p-3">
              <p className="text-sm font-medium mb-2">
                {lang === "bn" ? "ডিটেক্টেড কলাম (ক্লিক করে ফিল্ড যোগ করুন):" : "Detected columns (click to add as field):"}
              </p>
              <div className="flex flex-wrap gap-1">
                {detectedColumns.map(col => (
                  <Button key={col} size="sm" variant={form.fields.some(f => f.db_column === col) ? "default" : "outline"}
                    onClick={() => addColumnAsField(col)} className="text-xs h-7">
                    {col}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Custom Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base font-bold">
                {lang === "bn" ? "কাস্টম ফিল্ড" : "Custom Fields"} ({form.fields.length})
              </Label>
              <Button size="sm" variant="outline" onClick={addField} className="gap-1">
                <Plus className="h-3 w-3" /> {lang === "bn" ? "ফিল্ড যোগ" : "Add Field"}
              </Button>
            </div>

            {form.fields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {lang === "bn" ? "কোনো ফিল্ড নেই। উপরের কলাম থেকে ক্লিক করুন বা ম্যানুয়ালি যোগ করুন।" : "No fields. Click columns above or add manually."}
              </p>
            )}

            <div className="space-y-2">
              {form.fields.sort((a, b) => a.sort_order - b.sort_order).map((field) => (
                <Card key={field.id} className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col gap-0.5 mt-1">
                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => moveField(field.id, -1)}>
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => moveField(field.id, 1)}>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <Label className="text-xs">DB Column</Label>
                        <Input value={field.db_column} className="h-8 text-xs"
                          onChange={e => updateField(field.id, { db_column: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">{lang === "bn" ? "লেবেল (বাংলা)" : "Label (BN)"}</Label>
                        <Input value={field.label_bn} className="h-8 text-xs"
                          onChange={e => updateField(field.id, { label_bn: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">{lang === "bn" ? "লেবেল (ইংরেজি)" : "Label (EN)"}</Label>
                        <Input value={field.label_en} className="h-8 text-xs"
                          onChange={e => updateField(field.id, { label_en: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Select value={field.field_type} onValueChange={(v: any) => updateField(field.id, { field_type: v })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPES.map(ft => <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-4">
                      <Switch checked={field.is_visible} onCheckedChange={v => updateField(field.id, { is_visible: v })} />
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeField(field.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={() => onSave(form)}>
            {isEdit ? (lang === "bn" ? "আপডেট করুন" : "Update") : (lang === "bn" ? "তৈরি করুন" : "Create")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DirectoryManager;
