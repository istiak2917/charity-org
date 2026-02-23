import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HomepageSection {
  id: string; section_key: string; title: string;
  is_visible: boolean; [key: string]: any;
}

const HomepageBuilder = () => {
  const [items, setItems] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSections = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("homepage_sections").select("*");
    if (error) {
      toast({ title: "লোড ব্যর্থ", description: error.message, variant: "destructive" });
    } else if (data) {
      const sorted = [...data].sort((a: any, b: any) => {
        const aOrder = a.sort_order ?? a.display_order ?? a.order_index ?? 0;
        const bOrder = b.sort_order ?? b.display_order ?? b.order_index ?? 0;
        return aOrder - bOrder;
      });
      setItems(sorted);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSections(); }, []);

  const updateSection = async (id: string, updates: any) => {
    const { error } = await supabase.from("homepage_sections").update(updates).eq("id", id);
    if (error) toast({ title: "আপডেট ব্যর্থ", description: error.message, variant: "destructive" });
    else { toast({ title: "আপডেট হয়েছে!" }); fetchSections(); }
  };

  const getOrderCol = () => {
    if (items.length === 0) return "sort_order";
    const sample = items[0];
    if ("sort_order" in sample) return "sort_order";
    if ("display_order" in sample) return "display_order";
    if ("order_index" in sample) return "order_index";
    return "sort_order";
  };

  const moveUp = async (index: number) => {
    if (index <= 0) return;
    const col = getOrderCol();
    const current = items[index];
    const prev = items[index - 1];
    await updateSection(current.id, { [col]: prev[col] });
    await updateSection(prev.id, { [col]: current[col] });
  };

  const moveDown = async (index: number) => {
    if (index >= items.length - 1) return;
    const col = getOrderCol();
    const current = items[index];
    const next = items[index + 1];
    await updateSection(current.id, { [col]: next[col] });
    await updateSection(next.id, { [col]: current[col] });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">হোমপেজ বিল্ডার</h1>
      <p className="text-muted-foreground text-sm">সেকশনগুলো উপরে-নিচে সরাতে তীর চিহ্ন ব্যবহার করুন। দৃশ্যমানতা টগল করতে সুইচ ব্যবহার করুন।</p>
      <div className="space-y-2">
        {items.map((section, index) => (
          <Card key={section.id} className={`p-4 flex items-center gap-4 transition-opacity ${!section.is_visible ? "opacity-50" : ""}`}>
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-medium">{section.title}</div>
              <div className="text-xs text-muted-foreground">{section.section_key}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={() => moveUp(index)} disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => moveDown(index)} disabled={index === items.length - 1}><ArrowDown className="h-4 w-4" /></Button>
              <Switch checked={section.is_visible} onCheckedChange={(checked) => updateSection(section.id, { is_visible: checked })} />
            </div>
          </Card>
        ))}
        {items.length === 0 && <div className="text-center text-muted-foreground py-12">কোনো সেকশন নেই</div>}
      </div>
    </div>
  );
};

export default HomepageBuilder;
