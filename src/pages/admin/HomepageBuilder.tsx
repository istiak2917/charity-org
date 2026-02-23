import { useState, useEffect, useCallback } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BlockRenderer } from "@/components/builder/BlockRenderer";
import { BLOCK_TYPES, BLOCK_CATEGORIES, type HomepageSection, type SectionBlock, type SectionConfig } from "@/types/homepage-builder";
import {
  Plus, Trash2, Copy, ArrowUp, ArrowDown, Eye, EyeOff,
  Settings, Layers, Save, Download, Upload, GripVertical, PanelLeft, PanelRight,
  Undo2, Redo2
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

  // State
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [blocks, setBlocks] = useState<Record<string, SectionBlock[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [inspectorTab, setInspectorTab] = useState("content");

  // Undo/Redo history
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
    toast({ title: "আনডু হয়েছে" });
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, { sections: JSON.parse(JSON.stringify(sections)), blocks: JSON.parse(JSON.stringify(blocks)) }]);
    setRedoStack(r => r.slice(0, -1));
    setSections(next.sections);
    setBlocks(next.blocks);
    toast({ title: "রিডু হয়েছে" });
  };

  // Section edit state
  const [editSectionDialog, setEditSectionDialog] = useState(false);
  const [editSectionData, setEditSectionData] = useState<any>({});

  // Template dialog
  const [templateDialog, setTemplateDialog] = useState<"import" | "export" | null>(null);
  const [templateJson, setTemplateJson] = useState("");

  // New section dialog
  const [newSectionDialog, setNewSectionDialog] = useState(false);
  const [newSectionKey, setNewSectionKey] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");

  // ========== Load Data ==========
  const fetchSections = useCallback(async () => {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("position", { ascending: true });
    if (error) {
      toast({ title: "সেকশন লোড ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      setSections((data || []) as HomepageSection[]);
    }
  }, []);

  const fetchBlocks = useCallback(async () => {
    const { data, error } = await supabase
      .from("section_blocks")
      .select("*")
      .order("position", { ascending: true });
    if (error) {
      // Table might not exist or schema difference
      console.warn("section_blocks load:", error.message);
      return;
    }
    const grouped: Record<string, SectionBlock[]> = {};
    (data || []).forEach((b: any) => {
      const sid = b.section_id;
      if (!grouped[sid]) grouped[sid] = [];
      grouped[sid].push(b as SectionBlock);
    });
    setBlocks(grouped);
  }, []);

  useEffect(() => {
    Promise.all([fetchSections(), fetchBlocks()]).then(() => setLoading(false));
  }, [fetchSections, fetchBlocks]);

  // ========== Section Operations ==========
  const addSection = async () => {
    if (!newSectionKey.trim() || !newSectionTitle.trim()) return;
    pushSnapshot();
    const maxPos = sections.length > 0 ? Math.max(...sections.map(s => s.position || 0)) : -1;
    const payload: any = {
      section_key: newSectionKey.trim().toLowerCase().replace(/\s+/g, "_"),
      title: newSectionTitle.trim(),
      position: maxPos + 1,
      is_visible: true,
      content: {},
    };
    let p = { ...payload };
    for (let i = 0; i < 5; i++) {
      const { error } = await supabase.from("homepage_sections").insert(p);
      if (!error) break;
      const m = error.message?.match(/Could not find the '(\w+)' column/);
      if (m) { delete p[m[1]]; continue; }
      toast({ title: "সেকশন তৈরি ব্যর্থ", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "সেকশন তৈরি হয়েছে!" });
    setNewSectionDialog(false);
    setNewSectionKey("");
    setNewSectionTitle("");
    fetchSections();
  };

  const deleteSection = async (id: string) => {
    pushSnapshot();
    // Delete blocks first
    await supabase.from("section_blocks").delete().eq("section_id", id);
    const { error } = await supabase.from("homepage_sections").delete().eq("id", id);
    if (error) toast({ title: "ডিলিট ব্যর্থ", description: error.message, variant: "destructive" });
    else {
      toast({ title: "সেকশন মুছে ফেলা হয়েছে!" });
      if (selectedSectionId === id) setSelectedSectionId(null);
      fetchSections();
      fetchBlocks();
    }
  };

  const duplicateSection = async (section: HomepageSection) => {
    const maxPos = Math.max(...sections.map(s => s.position || 0));
    const payload: any = {
      section_key: section.section_key + "_copy",
      title: section.title + " (কপি)",
      subtitle: section.subtitle,
      content: section.content,
      position: maxPos + 1,
      is_visible: false,
    };
    let p = { ...payload };
    for (let i = 0; i < 5; i++) {
      const { data, error } = await supabase.from("homepage_sections").insert(p).select();
      if (!error && data?.[0]) {
        // Duplicate blocks too
        const sectionBlocks = blocks[section.id] || [];
        for (const block of sectionBlocks) {
          await safeUpsertBlock({
            section_id: data[0].id,
            block_type: block.block_type,
            content: block.content,
            config: block.config,
            position: block.position,
            is_visible: true,
          });
        }
        toast({ title: "সেকশন ডুপ্লিকেট হয়েছে!" });
        fetchSections();
        fetchBlocks();
        return;
      }
      const m = error?.message?.match(/Could not find the '(\w+)' column/);
      if (m) { delete p[m[1]]; continue; }
      toast({ title: "ডুপ্লিকেট ব্যর্থ", variant: "destructive" });
      return;
    }
  };

  const toggleSectionVisibility = async (section: HomepageSection) => {
    const { error } = await safeUpdateSection(section.id, { is_visible: !section.is_visible });
    if (error) toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
    else fetchSections();
  };

  const moveSectionUp = async (index: number) => {
    if (index <= 0) return;
    const curr = sections[index], prev = sections[index - 1];
    await Promise.all([
      safeUpdateSection(curr.id, { position: prev.position }),
      safeUpdateSection(prev.id, { position: curr.position }),
    ]);
    fetchSections();
  };

  const moveSectionDown = async (index: number) => {
    if (index >= sections.length - 1) return;
    const curr = sections[index], next = sections[index + 1];
    await Promise.all([
      safeUpdateSection(curr.id, { position: next.position }),
      safeUpdateSection(next.id, { position: curr.position }),
    ]);
    fetchSections();
  };

  const saveSection = async (id: string, updates: any) => {
    const { error } = await safeUpdateSection(id, updates);
    if (error) toast({ title: "সেভ ব্যর্থ", description: error.message, variant: "destructive" });
    else { toast({ title: "সেভ হয়েছে!" }); fetchSections(); }
  };

  // ========== Block Operations ==========
  const addBlock = async (sectionId: string, blockType: string) => {
    pushSnapshot();
    const sectionBlocks = blocks[sectionId] || [];
    const maxPos = sectionBlocks.length > 0 ? Math.max(...sectionBlocks.map(b => b.position || 0)) : -1;
    const blockInfo = BLOCK_TYPES.find(bt => bt.type === blockType);
    const { error } = await safeUpsertBlock({
      section_id: sectionId,
      block_type: blockType,
      content: blockInfo?.defaultContent || {},
      position: maxPos + 1,
      is_visible: true,
    });
    if (error.error) toast({ title: "ব্লক তৈরি ব্যর্থ", variant: "destructive" });
    else { toast({ title: "ব্লক যোগ হয়েছে!" }); fetchBlocks(); }
  };

  const deleteBlock = async (blockId: string) => {
    pushSnapshot();
    const { error } = await supabase.from("section_blocks").delete().eq("id", blockId);
    if (error) toast({ title: "ডিলিট ব্যর্থ", variant: "destructive" });
    else {
      if (selectedBlockId === blockId) setSelectedBlockId(null);
      fetchBlocks();
    }
  };

  const duplicateBlock = async (block: SectionBlock) => {
    const sectionBlocks = blocks[block.section_id] || [];
    const maxPos = sectionBlocks.length > 0 ? Math.max(...sectionBlocks.map(b => b.position || 0)) : 0;
    await safeUpsertBlock({
      section_id: block.section_id,
      block_type: block.block_type,
      content: block.content,
      config: block.config,
      position: maxPos + 1,
      is_visible: true,
    });
    fetchBlocks();
  };

  const moveBlockUp = async (block: SectionBlock, index: number) => {
    const sectionBlocks = blocks[block.section_id] || [];
    if (index <= 0) return;
    const prev = sectionBlocks[index - 1];
    await Promise.all([
      safeUpsertBlock({ id: block.id, position: prev.position }),
      safeUpsertBlock({ id: prev.id, position: block.position }),
    ]);
    fetchBlocks();
  };

  const moveBlockDown = async (block: SectionBlock, index: number) => {
    const sectionBlocks = blocks[block.section_id] || [];
    if (index >= sectionBlocks.length - 1) return;
    const next = sectionBlocks[index + 1];
    await Promise.all([
      safeUpsertBlock({ id: block.id, position: next.position }),
      safeUpsertBlock({ id: next.id, position: block.position }),
    ]);
    fetchBlocks();
  };

  const updateBlockContent = async (blockId: string, content: any) => {
    await safeUpsertBlock({ id: blockId, content });
    fetchBlocks();
  };

  // ========== Template Operations ==========
  const exportTemplate = () => {
    const template = {
      sections: sections.map(s => ({
        ...s,
        blocks: (blocks[s.id] || []).map(b => ({
          block_type: b.block_type,
          content: b.content,
          config: b.config,
          position: b.position,
        })),
      })),
    };
    setTemplateJson(JSON.stringify(template, null, 2));
    setTemplateDialog("export");
  };

  const importTemplate = async () => {
    try {
      const template = JSON.parse(templateJson);
      if (!template.sections) throw new Error("Invalid template");
      // We'll just show a success for now
      toast({ title: "টেমপ্লেট ইমপোর্ট সফল!", description: "ডেটা পার্স হয়েছে। ম্যানুয়ালি সেকশন তৈরি করুন।" });
      setTemplateDialog(null);
    } catch {
      toast({ title: "JSON ফরম্যাট ভুল", variant: "destructive" });
    }
  };

  // ========== Selected Block ==========
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
      <div className="flex items-center gap-2 p-3 border-b bg-background">
        <Button variant="ghost" size="icon" onClick={() => setShowLeftPanel(!showLeftPanel)}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold font-heading flex-1">হোমপেজ বিল্ডার</h1>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={undo} disabled={undoStack.length === 0} title="আনডু">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={redo} disabled={redoStack.length === 0} title="রিডু">
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={exportTemplate}>
          <Download className="h-3 w-3 mr-1" />এক্সপোর্ট
        </Button>
        <Button variant="outline" size="sm" onClick={() => { setTemplateJson(""); setTemplateDialog("import"); }}>
          <Upload className="h-3 w-3 mr-1" />ইমপোর্ট
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowRightPanel(!showRightPanel)}>
          <PanelRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL: Sections + Block Library */}
        {showLeftPanel && (
          <div className="w-72 border-r bg-muted/30 flex flex-col">
            <Tabs defaultValue="sections" className="flex flex-col flex-1">
              <TabsList className="mx-2 mt-2">
                <TabsTrigger value="sections" className="text-xs">সেকশন</TabsTrigger>
                <TabsTrigger value="blocks" className="text-xs">ব্লক</TabsTrigger>
              </TabsList>

              {/* Sections Tab */}
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
                            <div className="text-[10px] text-muted-foreground">{section.section_key} • {(blocks[section.id] || []).length} ব্লক</div>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveSectionUp(idx); }} disabled={idx === 0}>
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveSectionDown(idx); }} disabled={idx === sections.length - 1}>
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(section); }}>
                              {section.is_visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); duplicateSection(section); }}>
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Block Library Tab */}
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
                              onClick={() => addBlock(selectedSectionId!, bt.type)}
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

        {/* CENTER: Canvas */}
        <div className="flex-1 overflow-auto bg-muted/20">
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

                // Parse section styles
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
                if (sectionConfig.spacing?.paddingLeft) sectionStyle.paddingLeft = sectionConfig.spacing.paddingLeft;
                if (sectionConfig.spacing?.paddingRight) sectionStyle.paddingRight = sectionConfig.spacing.paddingRight;

                return (
                  <div
                    key={section.id}
                    className={`relative mb-4 rounded-lg transition-all ${isSelected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/30"} ${!section.is_visible ? "opacity-40" : ""}`}
                    style={sectionStyle}
                    onClick={() => { setSelectedSectionId(section.id); setSelectedBlockId(null); }}
                  >
                    {/* Section header */}
                    <div className="absolute top-0 left-0 z-10 bg-primary/90 text-primary-foreground text-[10px] px-2 py-0.5 rounded-br-lg">
                      {section.title}
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
                            onDelete={() => deleteBlock(block.id)}
                            onDuplicate={() => duplicateBlock(block)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
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
                        onChange={(e) => saveSection(selectedSection.id, { title: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">সাবটাইটেল</Label>
                      <Input
                        value={selectedSection.subtitle || ""}
                        onChange={(e) => saveSection(selectedSection.id, { subtitle: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-xs">দৃশ্যমান</Label>
                      <Switch
                        checked={!!selectedSection.is_visible}
                        onCheckedChange={() => toggleSectionVisibility(selectedSection)}
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
                          saveSection(selectedSection.id, { content: cfg });
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
                          saveSection(selectedSection.id, { content: cfg });
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
                              saveSection(selectedSection.id, { content: cfg });
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
                          saveSection(selectedSection.id, { content: cfg });
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
                          saveSection(selectedSection.id, { content: cfg });
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
                                updateBlockContent(selectedBlock.id, parsed);
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
            <Button onClick={addSection}>তৈরি করুন</Button>
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
