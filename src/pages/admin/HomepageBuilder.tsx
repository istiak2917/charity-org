import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HomepageSection {
  id: string; section_key: string; title: string;
  [key: string]: any;
}

const getVisCol = (sample: any) => {
  if ("is_visible" in sample) return "is_visible";
  if ("visible" in sample) return "visible";
  if ("enabled" in sample) return "enabled";
  return null; // no visibility column exists
};

const getOrderCol = (sample: any) => {
  if ("sort_order" in sample) return "sort_order";
  if ("display_order" in sample) return "display_order";
  if ("order_index" in sample) return "order_index";
  return "sort_order";
};

const HomepageBuilder = () => {
  const [items, setItems] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [visCol, setVisCol] = useState<string | null>(null);
  const [orderCol, setOrderCol] = useState("sort_order");
  const { toast } = useToast();

  const fetchSections = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("homepage_sections").select("*");
    if (error) {
      toast({ title: "লোড ব্যর্থ", description: error.message, variant: "destructive" });
    } else if (data && data.length > 0) {
      const sample = data[0];
      const vc = getVisCol(sample);
      const oc = getOrderCol(sample);
      setVisCol(vc);
      setOrderCol(oc);
      const sorted = [...data].sort((a: any, b: any) => (a[oc] ?? 0) - (b[oc] ?? 0));
      setItems(sorted);
    } else {
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSections(); }, []);

  const updateSection = async (id: string, updates: Record<string, any>) => {
    // Strip unknown columns by retrying
    let payload = { ...updates };
    for (let i = 0; i < 5; i++) {
      const { error } = await supabase.from("homepage_sections").update(payload).eq("id", id);
      if (!error) {
        toast({ title: "আপডেট হয়েছে!" });
        fetchSections();
        return;
      }
      const match = error.message?.match(/Could not find the '(\w+)' column/);
      if (match) { delete payload[match[1]]; continue; }
      toast({ title: "আপডেট ব্যর্থ", description: error.message, variant: "destructive" });
      return;
    }
  };

  const isVisible = (section: any) => {
    if (!visCol) return true; // no visibility column = always visible
    return section[visCol] !== false;
  };

  const toggleVisibility = (section: any) => {
    if (!visCol) {
      toast({ title: "ভিজিবিলিটি কলাম নেই", description: "ডাটাবেজে is_visible কলাম যোগ করুন", variant: "destructive" });
      return;
    }
    updateSection(section.id, { [visCol]: !isVisible(section) });
  };

  const moveUp = async (index: number) => {
    if (index <= 0) return;
    const current = items[index];
    const prev = items[index - 1];
    await updateSection(current.id, { [orderCol]: prev[orderCol] ?? index - 1 });
    await updateSection(prev.id, { [orderCol]: current[orderCol] ?? index });
  };

  const moveDown = async (index: number) => {
    if (index >= items.length - 1) return;
    const current = items[index];
    const next = items[index + 1];
    await updateSection(current.id, { [orderCol]: next[orderCol] ?? index + 1 });
    await updateSection(next.id, { [orderCol]: current[orderCol] ?? index });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">হোমপেজ বিল্ডার</h1>
      <p className="text-muted-foreground text-sm">সেকশনগুলো উপরে-নিচে সরাতে তীর চিহ্ন ব্যবহার করুন। দৃশ্যমানতা টগল করতে সুইচ ব্যবহার করুন।</p>
      {!visCol && <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">⚠️ ডাটাবেজে is_visible কলাম নেই — সব সেকশন দৃশ্যমান থাকবে।</p>}
      <div className="space-y-2">
        {items.map((section, index) => (
          <Card key={section.id} className={`p-4 flex items-center gap-4 transition-opacity ${!isVisible(section) ? "opacity-50" : ""}`}>
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-medium">{section.title}</div>
              <div className="text-xs text-muted-foreground">{section.section_key}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={() => moveUp(index)} disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => moveDown(index)} disabled={index === items.length - 1}><ArrowDown className="h-4 w-4" /></Button>
              <Switch checked={isVisible(section)} onCheckedChange={() => toggleVisibility(section)} />
            </div>
          </Card>
        ))}
        {items.length === 0 && <div className="text-center text-muted-foreground py-12">কোনো সেকশন নেই</div>}
      </div>
    </div>
  );
};

export default HomepageBuilder;
