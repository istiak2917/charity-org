import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BlockRenderer } from "@/components/builder/BlockRenderer";
import { BLOCK_TYPES, BLOCK_CATEGORIES, type HomepageSection, type SectionBlock, type SectionConfig } from "@/types/homepage-builder";
import {
  Plus, Trash2, Copy, ArrowUp, ArrowDown, Eye, EyeOff,
  Settings, Layers, Save, Download, Upload, GripVertical, PanelLeft, PanelRight,
  Undo2, Redo2, Monitor, RefreshCw
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

const HomepageBuilder = () => {
  const { toast } = useToast();

  // ========== State ==========
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [blocks, setBlocks] = useState<Record<string, SectionBlock[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [inspectorTab, setInspectorTab] = useState("content");
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Draft tracking
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Snapshot of DB state for dirty tracking
  const [dbSections, setDbSections] = useState<HomepageSection[]>([]);
  const [dbBlocks, setDbBlocks] = useState<Record<string, SectionBlock[]>>({});

  // Pending deletes
  const [deletedSectionIds, setDeletedSectionIds] = useState<string[]>([]);
  const [deletedBlockIds, setDeletedBlockIds] = useState<string[]>([]);
  const [newBlockQueue, setNewBlockQueue] = useState<Partial<SectionBlock>[]>([]);

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
    setNewBlockQueue([]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ========== LOCAL Section Operations (no DB writes) ==========
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
    // Track for DB delete
    if (!id.startsWith("temp_")) setDeletedSectionIds(prev => [...prev, id]);
    // Also mark blocks for deletion
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
    // Dup blocks
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
      // Swap positions
      const tmpPos = arr[index].position;
      arr[index] = { ...arr[index], position: arr[index - 1].position };
      arr[index - 1] = { ...arr[index - 1], position: tmpPos };
      // Also swap array order
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
      // 1. Delete removed sections
      for (const id of deletedSectionIds) {
        await supabase.from("section_blocks").delete().eq("section_id", id);
        await supabase.from("homepage_sections").delete().eq("id", id);
      }
      // 2. Delete removed blocks
      for (const id of deletedBlockIds) {
        await supabase.from("section_blocks").delete().eq("id", id);
      }

      // 3. Upsert sections (normalize positions)
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
          // Insert new
          let p = { ...payload };
          for (let j = 0; j < 5; j++) {
            const { data, error } = await supabase.from("homepage_sections").insert(p).select();
            if (!error && data?.[0]) {
              // Update local id for block references
              const oldId = s.id;
              const newId = data[0].id;
              sections[i] = { ...s, id: newId, position: i };
              // Update block section_ids
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
          // Update existing
          await safeUpdateSection(s.id, payload);
        }
      }

      // 4. Upsert blocks
      for (const sectionId of Object.keys(blocks)) {
        const sblocks = blocks[sectionId];
        for (let i = 0; i < sblocks.length; i++) {
          const b = sblocks[i];
          if (b.id.startsWith("temp_")) {
            const { data, error } = await safeUpsertBlock({
              section_id: sectionId,
              block_type: b.block_type,
              content: b.content,
              config: b.config,
              position: i,
              is_visible: b.is_visible ?? true,
            });
            if (error) {
              toast({ title: "ব্লক সেভ ব্যর্থ", variant: "destructive" });
            }
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
      // Reload fresh from DB
      await fetchAll();

      // Refresh preview iframe
      if (previewRef.current) {
        previewRef.current.src = previewRef.current.src;
      }
    } catch (err: any) {
      toast({ title: "সেভ ব্যর্থ", description: err?.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Discard all changes
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

  // Template
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

  // ========== Selected items ==========
  const selectedBlock = selectedBlockId
    ? Object.values(blocks).flat().find(b => b.id === selectedBlockId)
    : null;

  const selectedSection = selectedSectionId
    ? sections.find(s => s.id === selectedSectionId)
    : null;

  // ========== Render ==========
  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-2 p-3 border-b bg-background flex-wrap">
        <Button variant="ghost" size="icon" onClick={() => setShowLeftPanel(!showLeftPanel)}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold font-heading">হোমপেজ বিল্ডার</h1>

        {hasChanges && (
          <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
            অসংরক্ষিত পরিবর্তন
          </span>
        )}

        <div className="flex-1" />

        <Button variant="outline" size="icon" className="h-8 w-8" onClick={undo} disabled={undoStack.length === 0} title="আনডু">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={redo} disabled={redoStack.length === 0} title="রিডু">
          <Redo2 className="h-4 w-4" />
        </Button>

        <Button
          variant={showPreview ? "default" : "outline"}
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          title="লাইভ প্রিভিউ"
        >
          <Monitor className="h-3 w-3 mr-1" />প্রিভিউ
        </Button>

        <Button variant="outline" size="sm" onClick={exportTemplate}>
          <Download className="h-3 w-3 mr-1" />এক্সপোর্ট
        </Button>
        <Button variant="outline" size="sm" onClick={() => { setTemplateJson(""); setTemplateDialog("import"); }}>
          <Upload className="h-3 w-3 mr-1" />ইমপোর্ট
        </Button>

        {hasChanges && (
          <Button variant="outline" size="sm" onClick={discardChanges}>
            বাতিল
          </Button>
        )}

        <Button
          size="sm"
          onClick={saveAll}
          disabled={!hasChanges || isSaving}
          className="bg-green-600 hover:bg-green-700 text-white gap-1"
        >
          {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          সেভ করুন
        </Button>

        <Button variant="ghost" size="icon" onClick={() => setShowRightPanel(!showRightPanel)}>
          <PanelRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        {showLeftPanel && (
          <div className="w-72 border-r bg-muted/30 flex flex-col">
            <Tabs defaultValue="sections" className="flex flex-col flex-1">
              <TabsList className="mx-2 mt-2">
                <TabsTrigger value="sections" className="text-xs">সেকশন</TabsTrigger>
                <TabsTrigger value="blocks" className="text-xs">ব্লক</TabsTrigger>
              </TabsList>

              <TabsContent value="sections" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  <div className="p-2 space-y-1">
                    <Button size="sm" className="w-full mb-2" onClick={() => setNewSectionDialog(true)}>
                      <Plus className="h-3 w-3 mr-1" />নতুন সেকশন
                    </Button>
                    {sections.map((section, idx) => (
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
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="blocks" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  <div className="p-2 space-y-3">
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
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* CENTER: Canvas or Preview */}
        <div className="flex-1 overflow-auto bg-muted/20">
          {showPreview ? (
            <iframe
              ref={previewRef}
              src="/"
              className="w-full h-full border-0"
              title="লাইভ প্রিভিউ"
            />
          ) : (
            <ScrollArea className="h-full">
              <div className="max-w-5xl mx-auto py-4">
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
                      className={`relative mb-4 rounded-lg transition-all ${isSelected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/30"} ${!section.is_visible ? "opacity-40" : ""}`}
                      style={sectionStyle}
                      onClick={() => { setSelectedSectionId(section.id); setSelectedBlockId(null); }}
                    >
                      <div className="absolute top-0 left-0 z-10 bg-primary/90 text-primary-foreground text-[10px] px-2 py-0.5 rounded-br-lg flex items-center gap-1">
                        {section.title}
                        {section.id.startsWith("temp_") && <span className="bg-amber-500 text-white text-[8px] px-1 rounded">নতুন</span>}
                      </div>

                      <div className="pt-6 pb-2">
                        {sectionBlocks.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg mx-4">
                            ব্লক ট্যাব থেকে ব্লক যোগ করুন
                          </div>
                        ) : (
                          sectionBlocks.map((block, bIdx) => (
                            <BlockRenderer
                              key={block.id}
                              block={block}
                              isEditing={true}
                              isSelected={selectedBlockId === block.id}
                              onClick={() => { setSelectedBlockId(block.id); setSelectedSectionId(section.id); }}
                              onMoveUp={() => moveBlockUp(block, bIdx)}
                              onMoveDown={() => moveBlockDown(block, bIdx)}
                              onDelete={() => deleteBlockLocal(block.id, section.id)}
                              onDuplicate={() => duplicateBlockLocal(block)}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* RIGHT PANEL: Inspector */}
        {showRightPanel && (
          <div className="w-80 border-l bg-muted/30 flex flex-col">
            <ScrollArea className="flex-1">
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

                    <div>
                      <Label className="text-xs">টাইটেল</Label>
                      <Input
                        value={selectedSection.title}
                        onChange={(e) => updateSectionLocal(selectedSection.id, { title: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">সাবটাইটেল</Label>
                      <Input
                        value={selectedSection.subtitle || ""}
                        onChange={(e) => updateSectionLocal(selectedSection.id, { subtitle: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-xs">দৃশ্যমান</Label>
                      <Switch
                        checked={!!selectedSection.is_visible}
                        onCheckedChange={() => toggleVisibilityLocal(selectedSection)}
                      />
                    </div>

                    <hr />
                    <h4 className="text-xs font-semibold">ব্যাকগ্রাউন্ড</h4>
                    <div>
                      <Label className="text-xs">রঙ</Label>
                      <Input
                        value={(selectedSection.content as SectionConfig)?.background?.color || ""}
                        onChange={(e) => {
                          const cfg = { ...(selectedSection.content || {}), background: { ...(selectedSection.content?.background || {}), color: e.target.value } };
                          updateSectionLocal(selectedSection.id, { content: cfg });
                        }}
                        className="h-8 text-xs"
                        placeholder="#ffffff"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">ইমেজ URL</Label>
                      <Input
                        value={(selectedSection.content as SectionConfig)?.background?.imageUrl || ""}
                        onChange={(e) => {
                          const cfg = { ...(selectedSection.content || {}), background: { ...(selectedSection.content?.background || {}), imageUrl: e.target.value } };
                          updateSectionLocal(selectedSection.id, { content: cfg });
                        }}
                        className="h-8 text-xs"
                        placeholder="https://..."
                      />
                    </div>

                    <hr />
                    <h4 className="text-xs font-semibold">স্পেসিং</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {(["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"] as const).map(key => (
                        <div key={key}>
                          <Label className="text-[10px]">{key.replace("padding", "Pad ")}</Label>
                          <Input
                            value={(selectedSection.content as SectionConfig)?.spacing?.[key] || ""}
                            onChange={(e) => {
                              const cfg = { ...(selectedSection.content || {}), spacing: { ...(selectedSection.content?.spacing || {}), [key]: e.target.value } };
                              updateSectionLocal(selectedSection.id, { content: cfg });
                            }}
                            className="h-7 text-[10px]"
                            placeholder="0px"
                          />
                        </div>
                      ))}
                    </div>

                    <hr />
                    <h4 className="text-xs font-semibold">অ্যাডভান্সড</h4>
                    <div>
                      <Label className="text-xs">কাস্টম CSS ক্লাস</Label>
                      <Input
                        value={(selectedSection.content as SectionConfig)?.advanced?.customClass || ""}
                        onChange={(e) => {
                          const cfg = { ...(selectedSection.content || {}), advanced: { ...(selectedSection.content?.advanced || {}), customClass: e.target.value } };
                          updateSectionLocal(selectedSection.id, { content: cfg });
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">কাস্টম ID</Label>
                      <Input
                        value={(selectedSection.content as SectionConfig)?.advanced?.customId || ""}
                        onChange={(e) => {
                          const cfg = { ...(selectedSection.content || {}), advanced: { ...(selectedSection.content?.advanced || {}), customId: e.target.value } };
                          updateSectionLocal(selectedSection.id, { content: cfg });
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Block Inspector */}
                {selectedBlock && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">ব্লক সেটিংস — {selectedBlock.block_type}</h3>

                    <Tabs value={inspectorTab} onValueChange={setInspectorTab}>
                      <TabsList className="w-full">
                        <TabsTrigger value="content" className="text-xs flex-1">কন্টেন্ট</TabsTrigger>
                        <TabsTrigger value="style" className="text-xs flex-1">স্টাইল</TabsTrigger>
                      </TabsList>

                      <TabsContent value="content" className="space-y-3 mt-3">
                        <div>
                          <Label className="text-xs">কন্টেন্ট JSON</Label>
                          <Textarea
                            rows={12}
                            value={JSON.stringify(selectedBlock.content || selectedBlock.config || {}, null, 2)}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                updateBlockContentLocal(selectedBlock.id, selectedBlock.section_id, parsed);
                              } catch { /* user is typing */ }
                            }}
                            className="font-mono text-[10px]"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="style" className="space-y-3 mt-3">
                        <p className="text-xs text-muted-foreground">স্টাইল কন্টেন্ট JSON-এ config হিসেবে সেট করুন</p>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={newSectionDialog} onOpenChange={setNewSectionDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>নতুন সেকশন</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>সেকশন কী (ইংরেজিতে)</Label>
              <Input value={newSectionKey} onChange={e => setNewSectionKey(e.target.value)} placeholder="e.g. hero_2" />
            </div>
            <div>
              <Label>টাইটেল</Label>
              <Input value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} placeholder="যেমন: হিরো সেকশন ২" />
            </div>
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
            <Button onClick={() => { navigator.clipboard.writeText(templateJson); toast({ title: "কপি হয়েছে!" }); }}>
              কপি করুন
            </Button>
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
