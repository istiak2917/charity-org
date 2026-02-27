import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BlockRenderer } from "@/components/builder/BlockRenderer";
import { BLOCK_TYPES, BLOCK_CATEGORIES, type HomepageSection, type SectionBlock, type SectionConfig } from "@/types/homepage-builder";
import {
  Plus, Trash2, Copy, ArrowUp, ArrowDown, Eye, EyeOff,
  Settings, Layers, Save, Download, Upload, GripVertical, PanelLeft, PanelRight,
  Undo2, Redo2, Monitor, RefreshCw, X, ChevronRight
} from "lucide-react";

// ========== Safe DB helpers ==========
async function safeUpsertBlock(block: Partial<SectionBlock>): Promise<{ data: any; error: any }> {
  let payload: any = { ...block };
  for (let i = 0; i < 5; i++) {
    if (payload.id) {
      const { data, error } = await supabase.from("section_blocks").update(payload).eq("id", payload.id).select();
      if (!error) return { data, error: null };
      const m = error.message?.match(/Could not find the '(\w+)' column/);
      if (m) { delete payload[m[1]]; continue; }
      return { data: null, error };
    } else {
      const { data, error } = await supabase.from("section_blocks").insert(payload).select();
      if (!error) return { data, error: null };
      const m = error.message?.match(/Could not find the '(\w+)' column/);
      if (m) { delete payload[m[1]]; continue; }
      return { data: null, error };
    }
  }
  return { data: null, error: { message: "Column mismatch" } };
}

async function safeUpdateSection(id: string, updates: any): Promise<{ error: any }> {
  let payload = { ...updates };
  for (let i = 0; i < 5; i++) {
    const { error } = await supabase.from("homepage_sections").update(payload).eq("id", id);
    if (!error) return { error: null };
    const m = error.message?.match(/Could not find the '(\w+)' column/);
    if (m) { delete payload[m[1]]; continue; }
    return { error };
  }
  return { error: { message: "Column mismatch" } };
}

// ========== Block Content Editor ==========
const BlockContentEditor = ({ block, onChange }: { block: SectionBlock; onChange: (content: any) => void }) => {
  const content = block.content || block.config || {};
  const type = block.block_type;

  const updateField = (key: string, value: any) => {
    onChange({ ...content, [key]: value });
  };

  const updateArrayItem = (arrKey: string, index: number, field: string, value: any) => {
    const arr = [...(content[arrKey] || [])];
    arr[index] = { ...arr[index], [field]: value };
    onChange({ ...content, [arrKey]: arr });
  };

  const addArrayItem = (arrKey: string, defaultItem: any) => {
    const arr = [...(content[arrKey] || []), defaultItem];
    onChange({ ...content, [arrKey]: arr });
  };

  const removeArrayItem = (arrKey: string, index: number) => {
    const arr = (content[arrKey] || []).filter((_: any, i: number) => i !== index);
    onChange({ ...content, [arrKey]: arr });
  };

  switch (type) {
    case "hero":
      return (
        <div className="space-y-3">
          <div><Label className="text-xs">শিরোনাম (Heading)</Label><Input value={content.heading || ""} onChange={e => updateField("heading", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-xs">উপশিরোনাম (Subheading)</Label><Textarea rows={2} value={content.subheading || ""} onChange={e => updateField("subheading", e.target.value)} className="text-xs" /></div>
          <div><Label className="text-xs">বাটন টেক্সট</Label><Input value={content.buttonText || ""} onChange={e => updateField("buttonText", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-xs">বাটন লিংক</Label><Input value={content.buttonUrl || ""} onChange={e => updateField("buttonUrl", e.target.value)} className="h-8 text-xs" placeholder="https://..." /></div>
        </div>
      );
    case "about":
      return (
        <div className="space-y-3">
          <div><Label className="text-xs">শিরোনাম</Label><Input value={content.title || ""} onChange={e => updateField("title", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-xs">বিবরণ</Label><Textarea rows={4} value={content.description || ""} onChange={e => updateField("description", e.target.value)} className="text-xs" /></div>
        </div>
      );
    case "mission":
    case "vision":
      return (
        <div className="space-y-3">
          <div><Label className="text-xs">শিরোনাম</Label><Input value={content.title || ""} onChange={e => updateField("title", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-xs">বিবরণ</Label><Textarea rows={4} value={content.text || ""} onChange={e => updateField("text", e.target.value)} className="text-xs" /></div>
        </div>
      );
    case "cta":
      return (
        <div className="space-y-3">
          <div><Label className="text-xs">শিরোনাম</Label><Input value={content.heading || ""} onChange={e => updateField("heading", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-xs">উপশিরোনাম</Label><Input value={content.subheading || ""} onChange={e => updateField("subheading", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-xs">বাটন টেক্সট</Label><Input value={content.buttonText || ""} onChange={e => updateField("buttonText", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-xs">বাটন লিংক</Label><Input value={content.buttonUrl || ""} onChange={e => updateField("buttonUrl", e.target.value)} className="h-8 text-xs" /></div>
        </div>
      );
    case "feature_grid":
      return (
        <div className="space-y-3">
          <div><Label className="text-xs">শিরোনাম</Label><Input value={content.title || ""} onChange={e => updateField("title", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-xs">কলাম সংখ্যা</Label><Input type="number" min={1} max={6} value={content.columns || 3} onChange={e => updateField("columns", Number(e.target.value))} className="h-8 text-xs" /></div>
          <Label className="text-xs font-semibold">ফিচারসমূহ</Label>
          {(content.features || []).map((f: any, i: number) => (
            <Card key={i} className="p-2 space-y-2">
              <div className="flex justify-between items-center"><span className="text-xs font-medium">ফিচার {i + 1}</span><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeArrayItem("features", i)}><X className="h-3 w-3 text-destructive" /></Button></div>
              <Input value={f.icon || ""} onChange={e => updateArrayItem("features", i, "icon", e.target.value)} className="h-7 text-xs" placeholder="আইকন (ইমোজি)" />
              <Input value={f.title || ""} onChange={e => updateArrayItem("features", i, "title", e.target.value)} className="h-7 text-xs" placeholder="শিরোনাম" />
              <Input value={f.desc || ""} onChange={e => updateArrayItem("features", i, "desc", e.target.value)} className="h-7 text-xs" placeholder="বিবরণ" />
            </Card>
          ))}
          <Button variant="outline" size="sm" className="w-full" onClick={() => addArrayItem("features", { title: "নতুন ফিচার", desc: "বিবরণ", icon: "⭐" })}>+ ফিচার যোগ</Button>
        </div>
      );
    case "icon_grid":
      return (
        <div className="space-y-3">
          <div><Label className="text-xs">কলাম সংখ্যা</Label><Input type="number" min={1} max={6} value={content.columns || 4} onChange={e => updateField("columns", Number(e.target.value))} className="h-8 text-xs" /></div>
          <Label className="text-xs font-semibold">আইটেমসমূহ</Label>
          {(content.items || []).map((item: any, i: number) => (
            <Card key={i} className="p-2 space-y-2">
              <div className="flex justify-between items-center"><span className="text-xs font-medium">আইটেম {i + 1}</span><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeArrayItem("items", i)}><X className="h-3 w-3 text-destructive" /></Button></div>
              <Input value={item.icon || ""} onChange={e => updateArrayItem("items", i, "icon", e.target.value)} className="h-7 text-xs" placeholder="আইকন (ইমোজি)" />
              <Input value={item.label || ""} onChange={e => updateArrayItem("items", i, "label", e.target.value)} className="h-7 text-xs" placeholder="লেবেল" />
            </Card>
          ))}
          <Button variant="outline" size="sm" className="w-full" onClick={() => addArrayItem("items", { icon: "🎓", label: "নতুন আইটেম" })}>+ আইটেম যোগ</Button>
        </div>
      );
    case "counter":
      return (
        <div className="space-y-3">
          <Label className="text-xs font-semibold">কাউন্টার আইটেম</Label>
          {(content.items || []).map((item: any, i: number) => (
            <Card key={i} className="p-2 space-y-2">
              <div className="flex justify-between items-center"><span className="text-xs font-medium">কাউন্টার {i + 1}</span><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeArrayItem("items", i)}><X className="h-3 w-3 text-destructive" /></Button></div>
              <Input type="number" value={item.value || 0} onChange={e => updateArrayItem("items", i, "value", Number(e.target.value))} className="h-7 text-xs" placeholder="সংখ্যা" />
              <Input value={item.label || ""} onChange={e => updateArrayItem("items", i, "label", e.target.value)} className="h-7 text-xs" placeholder="লেবেল" />
              <Input value={item.suffix || ""} onChange={e => updateArrayItem("items", i, "suffix", e.target.value)} className="h-7 text-xs" placeholder="সাফিক্স (যেমন: +)" />
            </Card>
          ))}
          <Button variant="outline" size="sm" className="w-full" onClick={() => addArrayItem("items", { value: 100, label: "নতুন কাউন্টার", suffix: "+" })}>+ কাউন্টার যোগ</Button>
        </div>
      );
    case "testimonial_slider":
      return (
        <div className="space-y-3">
          <Label className="text-xs font-semibold">টেস্টিমোনিয়াল</Label>
          {(content.testimonials || []).map((t: any, i: number) => (
            <Card key={i} className="p-2 space-y-2">
              <div className="flex justify-between items-center"><span className="text-xs font-medium">মতামত {i + 1}</span><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeArrayItem("testimonials", i)}><X className="h-3 w-3 text-destructive" /></Button></div>
              <Input value={t.name || ""} onChange={e => updateArrayItem("testimonials", i, "name", e.target.value)} className="h-7 text-xs" placeholder="নাম" />
              <Input value={t.role || ""} onChange={e => updateArrayItem("testimonials", i, "role", e.target.value)} className="h-7 text-xs" placeholder="পদবী" />
              <Textarea rows={2} value={t.text || ""} onChange={e => updateArrayItem("testimonials", i, "text", e.target.value)} className="text-xs" placeholder="মন্তব্য" />
            </Card>
          ))}
          <Button variant="outline" size="sm" className="w-full" onClick={() => addArrayItem("testimonials", { name: "নাম", role: "সদস্য", text: "মন্তব্য" })}>+ মতামত যোগ</Button>
        </div>
      );
    case "faq_accordion":
      return (
        <div className="space-y-3">
          <div><Label className="text-xs">শিরোনাম</Label><Input value={content.title || ""} onChange={e => updateField("title", e.target.value)} className="h-8 text-xs" /></div>
          <Label className="text-xs font-semibold">প্রশ্নোত্তর</Label>
          {(content.items || []).map((item: any, i: number) => (
            <Card key={i} className="p-2 space-y-2">
              <div className="flex justify-between items-center"><span className="text-xs font-medium">FAQ {i + 1}</span><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeArrayItem("items", i)}><X className="h-3 w-3 text-destructive" /></Button></div>
              <Input value={item.question || ""} onChange={e => updateArrayItem("items", i, "question", e.target.value)} className="h-7 text-xs" placeholder="প্রশ্ন" />
              <Textarea rows={2} value={item.answer || ""} onChange={e => updateArrayItem("items", i, "answer", e.target.value)} className="text-xs" placeholder="উত্তর" />
            </Card>
          ))}
          <Button variant="outline" size="sm" className="w-full" onClick={() => addArrayItem("items", { question: "নতুন প্রশ্ন?", answer: "উত্তর" })}>+ FAQ যোগ</Button>
        </div>
      );
    case "donation_progress":
      return (
        <div className="space-y-3">
          <div><Label className="text-xs">শিরোনাম</Label><Input value={content.title || ""} onChange={e => updateField("title", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-xs">লক্ষ্যমাত্রা (৳)</Label><Input type="number" value={content.goal || 100000} onChange={e => updateField("goal", Number(e.target.value))} className="h-8 text-xs" /></div>
        </div>
      );
    case "blog_preview":
    case "events_preview":
      return (
        <div className="space-y-3">
          <div><Label className="text-xs">শিরোনাম</Label><Input value={content.title || ""} onChange={e => updateField("title", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-xs">সর্বোচ্চ সংখ্যা</Label><Input type="number" min={1} max={20} value={content.limit || 3} onChange={e => updateField("limit", Number(e.target.value))} className="h-8 text-xs" /></div>
        </div>
      );
    case "gallery_grid":
    case "team_grid":
      return (
        <div className="space-y-3">
          <div><Label className="text-xs">শিরোনাম</Label><Input value={content.title || ""} onChange={e => updateField("title", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-xs">কলাম সংখ্যা</Label><Input type="number" min={1} max={6} value={content.columns || 3} onChange={e => updateField("columns", Number(e.target.value))} className="h-8 text-xs" /></div>
          {type === "gallery_grid" && <div><Label className="text-xs">সর্বোচ্চ সংখ্যা</Label><Input type="number" min={1} max={30} value={content.limit || 8} onChange={e => updateField("limit", Number(e.target.value))} className="h-8 text-xs" /></div>}
        </div>
      );
    case "custom_html":
      return (
        <div className="space-y-3">
          <div><Label className="text-xs">HTML কোড</Label><Textarea rows={8} value={content.html || ""} onChange={e => updateField("html", e.target.value)} className="text-xs font-mono" /></div>
        </div>
      );
    case "spacer":
      return (
        <div className="space-y-3">
          <div><Label className="text-xs">উচ্চতা</Label><Input value={content.height || "40px"} onChange={e => updateField("height", e.target.value)} className="h-8 text-xs" placeholder="40px" /></div>
        </div>
      );
    case "divider":
      return (
        <div className="space-y-3">
          <div><Label className="text-xs">স্টাইল</Label><Input value={content.style || "solid"} onChange={e => updateField("style", e.target.value)} className="h-8 text-xs" placeholder="solid, dashed, dotted" /></div>
          <div><Label className="text-xs">রঙ</Label><Input value={content.color || ""} onChange={e => updateField("color", e.target.value)} className="h-8 text-xs" placeholder="#e5e7eb" /></div>
          <div><Label className="text-xs">প্রস্থ</Label><Input value={content.width || "100%"} onChange={e => updateField("width", e.target.value)} className="h-8 text-xs" placeholder="100%" /></div>
        </div>
      );
    default:
      return (
        <div className="space-y-3">
          <Label className="text-xs">কন্টেন্ট JSON</Label>
          <Textarea
            rows={8}
            value={JSON.stringify(content, null, 2)}
            onChange={e => { try { onChange(JSON.parse(e.target.value)); } catch {} }}
            className="font-mono text-[10px]"
          />
        </div>
      );
  }
};

const HomepageBuilder = () => {
  const { toast } = useToast();

  // ========== State ==========
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [blocks, setBlocks] = useState<Record<string, SectionBlock[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Mobile panel state
  const [mobilePanel, setMobilePanel] = useState<"sections" | "canvas" | "inspector">("sections");

  // Draft tracking
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Snapshot of DB state
  const [dbSections, setDbSections] = useState<HomepageSection[]>([]);
  const [dbBlocks, setDbBlocks] = useState<Record<string, SectionBlock[]>>({});

  // Pending deletes
  const [deletedSectionIds, setDeletedSectionIds] = useState<string[]>([]);
  const [deletedBlockIds, setDeletedBlockIds] = useState<string[]>([]);

  // Undo/Redo
  type Snapshot = { sections: HomepageSection[]; blocks: Record<string, SectionBlock[]> };
  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
  const [redoStack, setRedoStack] = useState<Snapshot[]>([]);

  const pushSnapshot = () => {
    setUndoStack(prev => [...prev.slice(-30), { sections: JSON.parse(JSON.stringify(sections)), blocks: JSON.parse(JSON.stringify(blocks)) }]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, { sections: JSON.parse(JSON.stringify(sections)), blocks: JSON.parse(JSON.stringify(blocks)) }]);
    setUndoStack(u => u.slice(0, -1));
    setSections(prev.sections);
    setBlocks(prev.blocks);
    setHasChanges(true);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, { sections: JSON.parse(JSON.stringify(sections)), blocks: JSON.parse(JSON.stringify(blocks)) }]);
    setRedoStack(r => r.slice(0, -1));
    setSections(next.sections);
    setBlocks(next.blocks);
    setHasChanges(true);
  };

  // Dialogs
  const [templateDialog, setTemplateDialog] = useState<"import" | "export" | null>(null);
  const [templateJson, setTemplateJson] = useState("");
  const [newSectionDialog, setNewSectionDialog] = useState(false);
  const [newSectionKey, setNewSectionKey] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");

  // ========== Load Data ==========
  const fetchAll = useCallback(async () => {
    const [sRes, bRes] = await Promise.all([
      supabase.from("homepage_sections").select("*").order("position", { ascending: true }),
      supabase.from("section_blocks").select("*").order("position", { ascending: true }),
    ]);

    const sData = (sRes.data || []) as HomepageSection[];
    setSections(sData);
    setDbSections(JSON.parse(JSON.stringify(sData)));

    const grouped: Record<string, SectionBlock[]> = {};
    (bRes.data || []).forEach((b: any) => {
      const sid = b.section_id;
      if (!grouped[sid]) grouped[sid] = [];
      grouped[sid].push(b as SectionBlock);
    });
    setBlocks(grouped);
    setDbBlocks(JSON.parse(JSON.stringify(grouped)));

    setHasChanges(false);
    setDeletedSectionIds([]);
    setDeletedBlockIds([]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ========== LOCAL Section Operations ==========
  const addSectionLocal = () => {
    if (!newSectionKey.trim() || !newSectionTitle.trim()) return;
    pushSnapshot();
    const maxPos = sections.length > 0 ? Math.max(...sections.map(s => s.position || 0)) : -1;
    const tempId = `temp_${Date.now()}`;
    const newSec: HomepageSection = {
      id: tempId,
      section_key: newSectionKey.trim().toLowerCase().replace(/\s+/g, "_"),
      title: newSectionTitle.trim(),
      position: maxPos + 1,
      is_visible: true,
      content: {},
      created_at: new Date().toISOString(),
    };
    setSections(prev => [...prev, newSec]);
    setNewSectionDialog(false);
    setNewSectionKey("");
    setNewSectionTitle("");
    setHasChanges(true);
  };

  const deleteSectionLocal = (id: string) => {
    pushSnapshot();
    if (!id.startsWith("temp_")) setDeletedSectionIds(prev => [...prev, id]);
    const sblocks = blocks[id] || [];
    setDeletedBlockIds(prev => [...prev, ...sblocks.filter(b => !b.id.startsWith("temp_")).map(b => b.id)]);
    setSections(prev => prev.filter(s => s.id !== id));
    setBlocks(prev => { const n = { ...prev }; delete n[id]; return n; });
    if (selectedSectionId === id) { setSelectedSectionId(null); setSelectedBlockId(null); }
    setHasChanges(true);
  };

  const duplicateSectionLocal = (section: HomepageSection) => {
    pushSnapshot();
    const maxPos = Math.max(...sections.map(s => s.position || 0));
    const tempId = `temp_${Date.now()}`;
    const dup: HomepageSection = {
      ...JSON.parse(JSON.stringify(section)),
      id: tempId,
      section_key: section.section_key + "_copy",
      title: section.title + " (কপি)",
      position: maxPos + 1,
      is_visible: false,
    };
    setSections(prev => [...prev, dup]);
    const sblocks = blocks[section.id] || [];
    if (sblocks.length > 0) {
      const dupBlocks = sblocks.map((b, i) => ({
        ...JSON.parse(JSON.stringify(b)),
        id: `temp_${Date.now()}_${i}`,
        section_id: tempId,
      }));
      setBlocks(prev => ({ ...prev, [tempId]: dupBlocks }));
    }
    setHasChanges(true);
  };

  const toggleVisibilityLocal = (section: HomepageSection) => {
    pushSnapshot();
    setSections(prev => prev.map(s => s.id === section.id ? { ...s, is_visible: !s.is_visible } : s));
    setHasChanges(true);
  };

  const moveSectionUp = (index: number) => {
    if (index <= 0) return;
    pushSnapshot();
    setSections(prev => {
      const arr = [...prev];
      const tmpPos = arr[index].position;
      arr[index] = { ...arr[index], position: arr[index - 1].position };
      arr[index - 1] = { ...arr[index - 1], position: tmpPos };
      [arr[index], arr[index - 1]] = [arr[index - 1], arr[index]];
      return arr;
    });
    setHasChanges(true);
  };

  const moveSectionDown = (index: number) => {
    if (index >= sections.length - 1) return;
    pushSnapshot();
    setSections(prev => {
      const arr = [...prev];
      const tmpPos = arr[index].position;
      arr[index] = { ...arr[index], position: arr[index + 1].position };
      arr[index + 1] = { ...arr[index + 1], position: tmpPos };
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
    setHasChanges(true);
  };

  const updateSectionLocal = (id: string, updates: Partial<HomepageSection>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    setHasChanges(true);
  };

  // ========== LOCAL Block Operations ==========
  const addBlockLocal = (sectionId: string, blockType: string) => {
    pushSnapshot();
    const sectionBlocks = blocks[sectionId] || [];
    const maxPos = sectionBlocks.length > 0 ? Math.max(...sectionBlocks.map(b => b.position || 0)) : -1;
    const blockInfo = BLOCK_TYPES.find(bt => bt.type === blockType);
    const tempId = `temp_blk_${Date.now()}`;
    const newBlock: SectionBlock = {
      id: tempId,
      section_id: sectionId,
      block_type: blockType,
      content: blockInfo?.defaultContent || {},
      position: maxPos + 1,
      is_visible: true,
    };
    setBlocks(prev => ({
      ...prev,
      [sectionId]: [...(prev[sectionId] || []), newBlock],
    }));
    setSelectedBlockId(tempId);
    setSelectedSectionId(sectionId);
    setMobilePanel("inspector");
    setHasChanges(true);
    toast({ title: "ব্লক যোগ হয়েছে (সেভ করুন)" });
  };

  const deleteBlockLocal = (blockId: string, sectionId: string) => {
    pushSnapshot();
    if (!blockId.startsWith("temp_")) setDeletedBlockIds(prev => [...prev, blockId]);
    setBlocks(prev => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).filter(b => b.id !== blockId),
    }));
    if (selectedBlockId === blockId) setSelectedBlockId(null);
    setHasChanges(true);
  };

  const duplicateBlockLocal = (block: SectionBlock) => {
    pushSnapshot();
    const sectionBlocks = blocks[block.section_id] || [];
    const maxPos = sectionBlocks.length > 0 ? Math.max(...sectionBlocks.map(b => b.position || 0)) : 0;
    const tempId = `temp_blk_${Date.now()}`;
    const dup: SectionBlock = {
      ...JSON.parse(JSON.stringify(block)),
      id: tempId,
      position: maxPos + 1,
    };
    setBlocks(prev => ({
      ...prev,
      [block.section_id]: [...(prev[block.section_id] || []), dup],
    }));
    setHasChanges(true);
  };

  const moveBlockUp = (block: SectionBlock, index: number) => {
    const sectionBlocks = blocks[block.section_id] || [];
    if (index <= 0) return;
    pushSnapshot();
    const arr = [...sectionBlocks];
    const tmpPos = arr[index].position;
    arr[index] = { ...arr[index], position: arr[index - 1].position };
    arr[index - 1] = { ...arr[index - 1], position: tmpPos };
    [arr[index], arr[index - 1]] = [arr[index - 1], arr[index]];
    setBlocks(prev => ({ ...prev, [block.section_id]: arr }));
    setHasChanges(true);
  };

  const moveBlockDown = (block: SectionBlock, index: number) => {
    const sectionBlocks = blocks[block.section_id] || [];
    if (index >= sectionBlocks.length - 1) return;
    pushSnapshot();
    const arr = [...sectionBlocks];
    const tmpPos = arr[index].position;
    arr[index] = { ...arr[index], position: arr[index + 1].position };
    arr[index + 1] = { ...arr[index + 1], position: tmpPos };
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    setBlocks(prev => ({ ...prev, [block.section_id]: arr }));
    setHasChanges(true);
  };

  const updateBlockContentLocal = (blockId: string, sectionId: string, content: any) => {
    setBlocks(prev => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).map(b => b.id === blockId ? { ...b, content } : b),
    }));
    setHasChanges(true);
  };

  // ========== SAVE ALL ==========
  const saveAll = async () => {
    setIsSaving(true);
    try {
      for (const id of deletedSectionIds) {
        await supabase.from("section_blocks").delete().eq("section_id", id);
        await supabase.from("homepage_sections").delete().eq("id", id);
      }
      for (const id of deletedBlockIds) {
        await supabase.from("section_blocks").delete().eq("id", id);
      }

      for (let i = 0; i < sections.length; i++) {
        const s = sections[i];
        const payload: any = {
          section_key: s.section_key,
          title: s.title,
          subtitle: s.subtitle || null,
          content: s.content || {},
          is_visible: s.is_visible ?? true,
          position: i,
        };

        if (s.id.startsWith("temp_")) {
          let p = { ...payload };
          for (let j = 0; j < 5; j++) {
            const { data, error } = await supabase.from("homepage_sections").insert(p).select();
            if (!error && data?.[0]) {
              const oldId = s.id;
              const newId = data[0].id;
              sections[i] = { ...s, id: newId, position: i };
              if (blocks[oldId]) {
                blocks[newId] = blocks[oldId];
                delete blocks[oldId];
                blocks[newId] = blocks[newId].map(b => ({ ...b, section_id: newId }));
              }
              break;
            }
            const m = error?.message?.match(/Could not find the '(\w+)' column/);
            if (m) { delete p[m[1]]; continue; }
            toast({ title: "সেকশন সেভ ব্যর্থ", description: error?.message, variant: "destructive" });
            break;
          }
        } else {
          await safeUpdateSection(s.id, payload);
        }
      }

      for (const sectionId of Object.keys(blocks)) {
        const sblocks = blocks[sectionId];
        for (let i = 0; i < sblocks.length; i++) {
          const b = sblocks[i];
          if (b.id.startsWith("temp_")) {
            const { error } = await safeUpsertBlock({
              section_id: sectionId,
              block_type: b.block_type,
              content: b.content,
              config: b.config,
              position: i,
              is_visible: b.is_visible ?? true,
            });
            if (error) toast({ title: "ব্লক সেভ ব্যর্থ", variant: "destructive" });
          } else {
            await safeUpsertBlock({
              id: b.id,
              content: b.content,
              config: b.config,
              position: i,
              is_visible: b.is_visible ?? true,
            });
          }
        }
      }

      toast({ title: "✅ সব পরিবর্তন সেভ হয়েছে!" });
      await fetchAll();
      if (previewRef.current) previewRef.current.src = previewRef.current.src;
    } catch (err: any) {
      toast({ title: "সেভ ব্যর্থ", description: err?.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    setSections(JSON.parse(JSON.stringify(dbSections)));
    setBlocks(JSON.parse(JSON.stringify(dbBlocks)));
    setDeletedSectionIds([]);
    setDeletedBlockIds([]);
    setHasChanges(false);
    setUndoStack([]);
    setRedoStack([]);
    toast({ title: "পরিবর্তন বাতিল করা হয়েছে" });
  };

  const exportTemplate = () => {
    const template = {
      sections: sections.map(s => ({
        ...s,
        blocks: (blocks[s.id] || []).map(b => ({
          block_type: b.block_type, content: b.content, config: b.config, position: b.position,
        })),
      })),
    };
    setTemplateJson(JSON.stringify(template, null, 2));
    setTemplateDialog("export");
  };

  const importTemplate = async () => {
    try {
      const template = JSON.parse(templateJson);
      if (!template.sections) throw new Error("Invalid");
      toast({ title: "টেমপ্লেট ইমপোর্ট সফল!", description: "ডেটা পার্স হয়েছে।" });
      setTemplateDialog(null);
    } catch {
      toast({ title: "JSON ফরম্যাট ভুল", variant: "destructive" });
    }
  };

  const selectedBlock = selectedBlockId
    ? Object.values(blocks).flat().find(b => b.id === selectedBlockId)
    : null;

  const selectedSection = selectedSectionId
    ? sections.find(s => s.id === selectedSectionId)
    : null;

  // Get block content preview text
  const getBlockPreview = (block: SectionBlock): string => {
    const c = block.content || {};
    if (c.heading) return c.heading;
    if (c.title) return c.title;
    if (c.text) return c.text?.substring(0, 40);
    if (c.description) return c.description?.substring(0, 40);
    return block.block_type;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-0">
      {/* Top Bar */}
      <div className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 border-b bg-background flex-wrap sticky top-0 z-20">
        <h1 className="text-sm sm:text-lg font-bold font-heading">হোমপেজ বিল্ডার</h1>

        {hasChanges && (
          <span className="text-[10px] sm:text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
            অসংরক্ষিত
          </span>
        )}

        <div className="flex-1" />

        <Button variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={undo} disabled={undoStack.length === 0} title="আনডু">
          <Undo2 className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={redo} disabled={redoStack.length === 0} title="রিডু">
          <Redo2 className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        <Button variant={showPreview ? "default" : "outline"} size="sm" className="h-7 sm:h-8 text-xs" onClick={() => setShowPreview(!showPreview)}>
          <Monitor className="h-3 w-3 mr-1" /><span className="hidden sm:inline">প্রিভিউ</span>
        </Button>

        <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs hidden sm:flex" onClick={exportTemplate}>
          <Download className="h-3 w-3 mr-1" />এক্সপোর্ট
        </Button>
        <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs hidden sm:flex" onClick={() => { setTemplateJson(""); setTemplateDialog("import"); }}>
          <Upload className="h-3 w-3 mr-1" />ইমপোর্ট
        </Button>

        {hasChanges && (
          <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs" onClick={discardChanges}>
            বাতিল
          </Button>
        )}

        <Button
          size="sm"
          onClick={saveAll}
          disabled={!hasChanges || isSaving}
          className="bg-green-600 hover:bg-green-700 text-white gap-1 h-7 sm:h-8 text-xs"
        >
          {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          সেভ করুন
        </Button>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden flex border-b bg-muted/30">
        <button
          onClick={() => setMobilePanel("sections")}
          className={`flex-1 py-2 text-xs font-medium text-center border-b-2 transition-colors ${mobilePanel === "sections" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
        >
          সেকশন
        </button>
        <button
          onClick={() => setMobilePanel("canvas")}
          className={`flex-1 py-2 text-xs font-medium text-center border-b-2 transition-colors ${mobilePanel === "canvas" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
        >
          ক্যানভাস
        </button>
        <button
          onClick={() => setMobilePanel("inspector")}
          className={`flex-1 py-2 text-xs font-medium text-center border-b-2 transition-colors ${mobilePanel === "inspector" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
        >
          সেটিংস
        </button>
      </div>

      {/* Main Content - Desktop: 3 panels, Mobile: tab-based */}
      <div className="lg:flex lg:h-[calc(100vh-160px)]">
        {/* LEFT PANEL: Sections & Blocks */}
        <div className={`lg:w-72 lg:border-r bg-muted/30 lg:flex lg:flex-col overflow-y-auto ${mobilePanel === "sections" ? "block" : "hidden lg:flex"}`} style={{ maxHeight: "calc(100vh - 160px)" }}>
          <Tabs defaultValue="sections" className="flex flex-col flex-1">
            <TabsList className="mx-2 mt-2">
              <TabsTrigger value="sections" className="text-xs">সেকশন</TabsTrigger>
              <TabsTrigger value="blocks" className="text-xs">ব্লক</TabsTrigger>
            </TabsList>

            <TabsContent value="sections" className="flex-1 m-0 overflow-y-auto p-2 space-y-1">
              <Button size="sm" className="w-full mb-2" onClick={() => setNewSectionDialog(true)}>
                <Plus className="h-3 w-3 mr-1" />নতুন সেকশন
              </Button>
              {sections.map((section, idx) => {
                const sblocks = blocks[section.id] || [];
                return (
                  <Card
                    key={section.id}
                    className={`p-2 cursor-pointer transition-colors ${selectedSectionId === section.id ? "ring-2 ring-primary" : ""} ${!section.is_visible ? "opacity-50" : ""}`}
                    onClick={() => { setSelectedSectionId(section.id); setSelectedBlockId(null); }}
                  >
                    <div className="flex items-center gap-1">
                      <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{section.title}</div>
                        <div className="text-[10px] text-muted-foreground">{section.section_key} • pos:{section.position}</div>
                        {/* Show block content previews */}
                        {sblocks.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {sblocks.slice(0, 3).map(b => (
                              <div key={b.id} className="text-[9px] text-muted-foreground truncate flex items-center gap-1">
                                <ChevronRight className="h-2 w-2 shrink-0" />
                                <span className="text-primary/70">{b.block_type}:</span> {getBlockPreview(b)}
                              </div>
                            ))}
                            {sblocks.length > 3 && <div className="text-[9px] text-muted-foreground">+{sblocks.length - 3} আরো</div>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveSectionUp(idx); }} disabled={idx === 0}>
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveSectionDown(idx); }} disabled={idx === sections.length - 1}>
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleVisibilityLocal(section); }}>
                          {section.is_visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); duplicateSectionLocal(section); }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); deleteSectionLocal(section.id); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="blocks" className="flex-1 m-0 overflow-y-auto p-2 space-y-3">
              {!selectedSectionId && (
                <p className="text-xs text-muted-foreground text-center py-4">প্রথমে একটি সেকশন সিলেক্ট করুন</p>
              )}
              {selectedSectionId && BLOCK_CATEGORIES.map(cat => (
                <div key={cat}>
                  <h4 className="text-[10px] font-semibold uppercase text-muted-foreground mb-1 px-1">{cat}</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {BLOCK_TYPES.filter(bt => bt.category === cat).map(bt => (
                      <button
                        key={bt.type}
                        onClick={() => addBlockLocal(selectedSectionId!, bt.type)}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg border bg-card hover:bg-accent transition text-center"
                      >
                        <span className="text-lg">{bt.icon}</span>
                        <span className="text-[10px] font-medium leading-tight">{bt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* CENTER: Canvas or Preview */}
        <div className={`flex-1 overflow-auto bg-muted/20 ${mobilePanel === "canvas" ? "block" : "hidden lg:block"}`} style={{ maxHeight: "calc(100vh - 160px)" }}>
        {showPreview ? (
            <iframe
              ref={previewRef}
              src="/"
              className="w-full h-full border-0 min-h-[60vh]"
              title="লাইভ প্রিভিউ"
            />
          ) : (
            <div className="max-w-5xl mx-auto py-4 px-2 space-y-3">
              {sections.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>"নতুন সেকশন" বাটনে ক্লিক করে শুরু করুন</p>
                </div>
              )}

              {sections.map((section) => {
                const sectionBlocks = blocks[section.id] || [];
                const sectionConfig: SectionConfig = section.content || {};
                const isSelected = selectedSectionId === section.id;

                const sectionStyle: React.CSSProperties = {};
                if (sectionConfig.background?.color) sectionStyle.backgroundColor = sectionConfig.background.color;
                if (sectionConfig.background?.gradient) sectionStyle.background = sectionConfig.background.gradient;
                if (sectionConfig.background?.imageUrl) {
                  sectionStyle.backgroundImage = `url(${sectionConfig.background.imageUrl})`;
                  sectionStyle.backgroundSize = "cover";
                  sectionStyle.backgroundPosition = "center";
                }
                if (sectionConfig.spacing?.paddingTop) sectionStyle.paddingTop = sectionConfig.spacing.paddingTop;
                if (sectionConfig.spacing?.paddingBottom) sectionStyle.paddingBottom = sectionConfig.spacing.paddingBottom;

                return (
                  <div
                    key={section.id}
                    className={`relative rounded-lg transition-all border-2 ${isSelected ? "border-primary shadow-lg" : "border-transparent hover:border-primary/30"} ${!section.is_visible ? "opacity-40" : ""}`}
                    style={sectionStyle}
                    onClick={() => { setSelectedSectionId(section.id); setSelectedBlockId(null); setMobilePanel("inspector"); }}
                  >
                    {/* Section header badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <GripVertical className="h-3 w-3 shrink-0" />
                      <span className="font-semibold">{section.title}</span>
                      <span className="opacity-60">({section.section_key})</span>
                      {section.id.startsWith("temp_") && <span className="bg-amber-500 text-white text-[8px] px-1 rounded">নতুন</span>}
                      {!section.is_visible && <EyeOff className="h-3 w-3 ml-auto" />}
                    </div>

                    {/* Section content preview - shows actual text */}
                    <div className="p-3 min-h-[60px]">
                      {/* If section has subtitle, show it */}
                      {section.subtitle && (
                        <p className="text-xs text-muted-foreground mb-2 italic">"{section.subtitle}"</p>
                      )}

                      {sectionBlocks.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed rounded-lg bg-muted/20">
                          <Plus className="h-5 w-5 mx-auto mb-1 opacity-40" />
                          ব্লক ট্যাব থেকে ব্লক যোগ করুন
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {sectionBlocks.map((block, bIdx) => {
                            const blockContent = block.content || block.config || {};
                            const blockInfo = BLOCK_TYPES.find(bt => bt.type === block.block_type);
                            const isBlockSelected = selectedBlockId === block.id;

                            return (
                              <div
                                key={block.id}
                                className={`relative rounded-md border p-3 cursor-pointer transition-all ${isBlockSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 hover:border-primary/40 hover:bg-accent/30"}`}
                                onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); setSelectedSectionId(section.id); setMobilePanel("inspector"); }}
                              >
                                {/* Block type label */}
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <span className="text-sm">{blockInfo?.icon || "📦"}</span>
                                  <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">{blockInfo?.label || block.block_type}</span>
                                  <div className="ml-auto flex gap-0.5 opacity-0 group-hover:opacity-100">
                                    <button onClick={(e) => { e.stopPropagation(); moveBlockUp(block, bIdx); }} className="p-0.5 hover:bg-muted rounded" title="উপরে"><ArrowUp className="h-3 w-3" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); moveBlockDown(block, bIdx); }} className="p-0.5 hover:bg-muted rounded" title="নিচে"><ArrowDown className="h-3 w-3" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); duplicateBlockLocal(block); }} className="p-0.5 hover:bg-muted rounded" title="কপি"><Copy className="h-3 w-3" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteBlockLocal(block.id, section.id); }} className="p-0.5 hover:bg-destructive/20 rounded text-destructive" title="ডিলিট"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                </div>

                                {/* Inline content preview - show actual text */}
                                <div className="text-xs space-y-0.5">
                                  {blockContent.heading && (
                                    <div className="font-bold text-sm text-foreground">{blockContent.heading}</div>
                                  )}
                                  {blockContent.title && !blockContent.heading && (
                                    <div className="font-bold text-sm text-foreground">{blockContent.title}</div>
                                  )}
                                  {blockContent.subheading && (
                                    <div className="text-muted-foreground">{blockContent.subheading}</div>
                                  )}
                                  {blockContent.description && (
                                    <div className="text-muted-foreground line-clamp-2">{blockContent.description}</div>
                                  )}
                                  {blockContent.text && (
                                    <div className="text-muted-foreground line-clamp-2">{blockContent.text}</div>
                                  )}
                                  {blockContent.buttonText && (
                                    <div className="mt-1"><span className="inline-block bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded">{blockContent.buttonText}</span></div>
                                  )}
                                  {blockContent.features && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {blockContent.features.slice(0, 4).map((f: any, i: number) => (
                                        <span key={i} className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{f.icon} {f.title}</span>
                                      ))}
                                      {blockContent.features.length > 4 && <span className="text-[10px] text-muted-foreground">+{blockContent.features.length - 4}</span>}
                                    </div>
                                  )}
                                  {blockContent.items && !blockContent.features && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {blockContent.items.slice(0, 4).map((item: any, i: number) => (
                                        <span key={i} className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                          {item.icon || item.question?.substring(0, 20) || `${item.value}${item.suffix || ''}`} {item.label || ''}
                                        </span>
                                      ))}
                                      {blockContent.items.length > 4 && <span className="text-[10px] text-muted-foreground">+{blockContent.items.length - 4}</span>}
                                    </div>
                                  )}
                                  {blockContent.testimonials && (
                                    <div className="mt-1 text-[10px] text-muted-foreground">
                                      {blockContent.testimonials.length}টি টেস্টিমোনিয়াল
                                    </div>
                                  )}
                                  {blockContent.html && (
                                    <div className="mt-1 font-mono text-[10px] text-muted-foreground bg-muted p-1 rounded line-clamp-2">{blockContent.html}</div>
                                  )}
                                  {block.block_type === "spacer" && (
                                    <div className="text-muted-foreground">↕ {blockContent.height || "40px"}</div>
                                  )}
                                  {block.block_type === "divider" && (
                                    <hr className="my-1" style={{ borderStyle: blockContent.style || "solid", borderColor: blockContent.color || "hsl(var(--border))" }} />
                                  )}
                                  {block.block_type === "donation_progress" && (
                                    <div className="text-muted-foreground">লক্ষ্যমাত্রা: ৳{(blockContent.goal || 100000).toLocaleString()}</div>
                                  )}
                                  {(block.block_type === "blog_preview" || block.block_type === "events_preview" || block.block_type === "gallery_grid" || block.block_type === "team_grid") && (
                                    <div className="text-muted-foreground">সর্বোচ্চ: {blockContent.limit || blockContent.columns || 3}টি আইটেম</div>
                                  )}
                                </div>

                                {/* Click hint */}
                                {isBlockSelected && (
                                  <div className="mt-2 text-[10px] text-primary flex items-center gap-1">
                                    <ChevronRight className="h-3 w-3" /> ডানপাশে এডিট করুন
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Inspector */}
        <div className={`lg:w-80 lg:border-l bg-muted/30 overflow-y-auto ${mobilePanel === "inspector" ? "block" : "hidden lg:block"}`} style={{ maxHeight: "calc(100vh - 160px)" }}>
          <div className="p-3">
            {!selectedBlockId && !selectedSectionId && (
              <p className="text-sm text-muted-foreground text-center py-8">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-30" />
                সেকশন বা ব্লক সিলেক্ট করুন
              </p>
            )}

            {/* Section Inspector */}
            {selectedSectionId && !selectedBlockId && selectedSection && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">সেকশন সেটিংস</h3>
                <div><Label className="text-xs">টাইটেল</Label><Input value={selectedSection.title} onChange={(e) => updateSectionLocal(selectedSection.id, { title: e.target.value })} className="h-8 text-xs" /></div>
                <div><Label className="text-xs">সাবটাইটেল</Label><Input value={selectedSection.subtitle || ""} onChange={(e) => updateSectionLocal(selectedSection.id, { subtitle: e.target.value })} className="h-8 text-xs" /></div>
                <div className="flex items-center justify-between"><Label className="text-xs">দৃশ্যমান</Label><Switch checked={!!selectedSection.is_visible} onCheckedChange={() => toggleVisibilityLocal(selectedSection)} /></div>

                <hr />
                <h4 className="text-xs font-semibold">ব্যাকগ্রাউন্ড</h4>
                <div><Label className="text-xs">রঙ</Label><Input value={(selectedSection.content as SectionConfig)?.background?.color || ""} onChange={(e) => { const cfg = { ...(selectedSection.content || {}), background: { ...(selectedSection.content?.background || {}), color: e.target.value } }; updateSectionLocal(selectedSection.id, { content: cfg }); }} className="h-8 text-xs" placeholder="#ffffff" /></div>
                <div><Label className="text-xs">ইমেজ URL</Label><Input value={(selectedSection.content as SectionConfig)?.background?.imageUrl || ""} onChange={(e) => { const cfg = { ...(selectedSection.content || {}), background: { ...(selectedSection.content?.background || {}), imageUrl: e.target.value } }; updateSectionLocal(selectedSection.id, { content: cfg }); }} className="h-8 text-xs" placeholder="https://..." /></div>

                <hr />
                <h4 className="text-xs font-semibold">স্পেসিং</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"] as const).map(key => (
                    <div key={key}>
                      <Label className="text-[10px]">{key.replace("padding", "Pad ")}</Label>
                      <Input value={(selectedSection.content as SectionConfig)?.spacing?.[key] || ""} onChange={(e) => { const cfg = { ...(selectedSection.content || {}), spacing: { ...(selectedSection.content?.spacing || {}), [key]: e.target.value } }; updateSectionLocal(selectedSection.id, { content: cfg }); }} className="h-7 text-[10px]" placeholder="0px" />
                    </div>
                  ))}
                </div>

                {/* Show section's blocks for quick editing */}
                {(blocks[selectedSection.id] || []).length > 0 && (
                  <>
                    <hr />
                    <h4 className="text-xs font-semibold">এই সেকশনের ব্লকসমূহ — ক্লিক করে এডিট করুন</h4>
                    <div className="space-y-1.5">
                      {(blocks[selectedSection.id] || []).map(b => {
                        const bc = b.content || b.config || {};
                        const previewText = bc.heading || bc.title || bc.text?.substring(0, 50) || bc.description?.substring(0, 50) || bc.html?.substring(0, 30) || "";
                        return (
                          <button
                            key={b.id}
                            onClick={() => setSelectedBlockId(b.id)}
                            className={`w-full text-left text-xs p-2.5 rounded-lg border transition flex items-start gap-2 ${selectedBlockId === b.id ? "border-primary bg-primary/5" : "bg-card hover:bg-accent"}`}
                          >
                            <span className="text-sm shrink-0 mt-0.5">{BLOCK_TYPES.find(bt => bt.type === b.block_type)?.icon || "📦"}</span>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium">{BLOCK_TYPES.find(bt => bt.type === b.block_type)?.label || b.block_type}</div>
                              {previewText && <div className="text-[10px] text-muted-foreground truncate mt-0.5">"{previewText}"</div>}
                              {bc.buttonText && <div className="text-[10px] text-primary mt-0.5">🔗 {bc.buttonText}</div>}
                              {bc.features && <div className="text-[10px] text-muted-foreground mt-0.5">{bc.features.length}টি ফিচার</div>}
                              {bc.items && <div className="text-[10px] text-muted-foreground mt-0.5">{bc.items.length}টি আইটেম</div>}
                              {bc.testimonials && <div className="text-[10px] text-muted-foreground mt-0.5">{bc.testimonials.length}টি মতামত</div>}
                            </div>
                            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground mt-1" />
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Block Inspector - User-friendly forms */}
            {selectedBlock && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-1">
                    {BLOCK_TYPES.find(bt => bt.type === selectedBlock.block_type)?.icon} {BLOCK_TYPES.find(bt => bt.type === selectedBlock.block_type)?.label || selectedBlock.block_type}
                  </h3>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setSelectedBlockId(null)}>
                    ← সেকশনে ফিরুন
                  </Button>
                </div>

                <Tabs defaultValue="content">
                  <TabsList className="w-full">
                    <TabsTrigger value="content" className="text-xs flex-1">কন্টেন্ট</TabsTrigger>
                    <TabsTrigger value="json" className="text-xs flex-1">JSON</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="mt-3">
                    <BlockContentEditor
                      block={selectedBlock}
                      onChange={(content) => updateBlockContentLocal(selectedBlock.id, selectedBlock.section_id, content)}
                    />
                  </TabsContent>

                  <TabsContent value="json" className="mt-3">
                    <Label className="text-xs">Raw JSON</Label>
                    <Textarea
                      rows={12}
                      value={JSON.stringify(selectedBlock.content || selectedBlock.config || {}, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          updateBlockContentLocal(selectedBlock.id, selectedBlock.section_id, parsed);
                        } catch {}
                      }}
                      className="font-mono text-[10px]"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={newSectionDialog} onOpenChange={setNewSectionDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>নতুন সেকশন</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>সেকশন কী (ইংরেজিতে)</Label><Input value={newSectionKey} onChange={e => setNewSectionKey(e.target.value)} placeholder="e.g. hero_2" /></div>
            <div><Label>টাইটেল</Label><Input value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} placeholder="যেমন: হিরো সেকশন ২" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewSectionDialog(false)}>বাতিল</Button>
            <Button onClick={addSectionLocal}>তৈরি করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templateDialog === "export"} onOpenChange={() => setTemplateDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>টেমপ্লেট এক্সপোর্ট</DialogTitle></DialogHeader>
          <Textarea rows={15} value={templateJson} readOnly className="font-mono text-xs" />
          <DialogFooter>
            <Button onClick={() => { navigator.clipboard.writeText(templateJson); toast({ title: "কপি হয়েছে!" }); }}>কপি করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templateDialog === "import"} onOpenChange={() => setTemplateDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>টেমপ্লেট ইমপোর্ট</DialogTitle></DialogHeader>
          <Textarea rows={15} value={templateJson} onChange={e => setTemplateJson(e.target.value)} className="font-mono text-xs" placeholder="JSON পেস্ট করুন..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialog(null)}>বাতিল</Button>
            <Button onClick={importTemplate}>ইমপোর্ট করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomepageBuilder;
