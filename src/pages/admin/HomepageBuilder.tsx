import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowUp, ArrowDown, GripVertical, Pencil, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface HomepageSection {
  id: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  content: any;
  position: number;
  is_visible: boolean;
  created_at: string;
}

const HomepageBuilder = () => {
  const [items, setItems] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<HomepageSection | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const { toast } = useToast();

  const fetchSections = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("position", { ascending: true });
    if (error) {
      toast({ title: "লোড ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      setItems((data || []) as HomepageSection[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSections(); }, []);

  const toggleVisibility = async (section: HomepageSection) => {
    const { error } = await supabase
      .from("homepage_sections")
      .update({ is_visible: !section.is_visible })
      .eq("id", section.id);
    if (error) {
      toast({ title: "আপডেট ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "ভিজিবিলিটি আপডেট হয়েছে!" });
      fetchSections();
    }
  };

  const moveUp = async (index: number) => {
    if (index <= 0) return;
    const current = items[index];
    const prev = items[index - 1];
    const [r1, r2] = await Promise.all([
      supabase.from("homepage_sections").update({ position: prev.position }).eq("id", current.id),
      supabase.from("homepage_sections").update({ position: current.position }).eq("id", prev.id),
    ]);
    if (r1.error || r2.error) {
      toast({ title: "সরানো ব্যর্থ", variant: "destructive" });
    } else {
      fetchSections();
    }
  };

  const moveDown = async (index: number) => {
    if (index >= items.length - 1) return;
    const current = items[index];
    const next = items[index + 1];
    const [r1, r2] = await Promise.all([
      supabase.from("homepage_sections").update({ position: next.position }).eq("id", current.id),
      supabase.from("homepage_sections").update({ position: current.position }).eq("id", next.id),
    ]);
    if (r1.error || r2.error) {
      toast({ title: "সরানো ব্যর্থ", variant: "destructive" });
    } else {
      fetchSections();
    }
  };

  const openEdit = (section: HomepageSection) => {
    setEditItem(section);
    setEditTitle(section.title || "");
    setEditSubtitle(section.subtitle || "");
    setEditContent(section.content ? JSON.stringify(section.content, null, 2) : "{}");
  };

  const saveEdit = async () => {
    if (!editItem) return;
    let parsedContent: any = {};
    try { parsedContent = JSON.parse(editContent); } catch { 
      toast({ title: "JSON ফরম্যাট ভুল", variant: "destructive" }); return; 
    }
    const { error } = await supabase
      .from("homepage_sections")
      .update({ title: editTitle, subtitle: editSubtitle, content: parsedContent })
      .eq("id", editItem.id);
    if (error) {
      toast({ title: "সেভ ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফলভাবে সেভ হয়েছে!" });
      setEditItem(null);
      fetchSections();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">হোমপেজ বিল্ডার</h1>
      <p className="text-muted-foreground text-sm">সেকশনগুলো উপরে-নিচে সরাতে তীর চিহ্ন ব্যবহার করুন। দৃশ্যমানতা টগল করতে সুইচ ব্যবহার করুন। এডিট করতে পেন্সিল আইকনে ক্লিক করুন।</p>
      <div className="space-y-2">
        {items.map((section, index) => (
          <Card key={section.id} className={`p-4 flex items-center gap-4 transition-opacity ${!section.is_visible ? "opacity-50" : ""}`}>
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-medium">{section.title}</div>
              <div className="text-xs text-muted-foreground">{section.section_key}</div>
              {section.subtitle && <div className="text-xs text-muted-foreground mt-1">{section.subtitle}</div>}
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={() => openEdit(section)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => moveUp(index)} disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => moveDown(index)} disabled={index === items.length - 1}><ArrowDown className="h-4 w-4" /></Button>
              <Switch checked={section.is_visible} onCheckedChange={() => toggleVisibility(section)} />
            </div>
          </Card>
        ))}
        {items.length === 0 && <div className="text-center text-muted-foreground py-12">কোনো সেকশন নেই</div>}
      </div>

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>সেকশন এডিট — {editItem?.section_key}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>টাইটেল</Label><Input value={editTitle} onChange={e => setEditTitle(e.target.value)} /></div>
            <div><Label>সাবটাইটেল</Label><Input value={editSubtitle} onChange={e => setEditSubtitle(e.target.value)} /></div>
            <div><Label>কন্টেন্ট (JSON)</Label><Textarea rows={6} value={editContent} onChange={e => setEditContent(e.target.value)} className="font-mono text-xs" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}><X className="h-4 w-4 mr-1" />বাতিল</Button>
            <Button onClick={saveEdit}><Save className="h-4 w-4 mr-1" />সেভ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomepageBuilder;
