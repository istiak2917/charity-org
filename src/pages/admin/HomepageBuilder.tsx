import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";

interface HomepageSection {
  id: string; section_key: string; title: string;
  is_visible: boolean; display_order: number; config: any;
}

const HomepageBuilder = () => {
  const { items, loading, update } = useAdminCrud<HomepageSection>({
    table: "homepage_sections", orderBy: "display_order", ascending: true,
  });

  const moveUp = async (index: number) => {
    if (index <= 0) return;
    const current = items[index];
    const prev = items[index - 1];
    await update(current.id, { display_order: prev.display_order } as any);
    await update(prev.id, { display_order: current.display_order } as any);
  };

  const moveDown = async (index: number) => {
    if (index >= items.length - 1) return;
    const current = items[index];
    const next = items[index + 1];
    await update(current.id, { display_order: next.display_order } as any);
    await update(next.id, { display_order: current.display_order } as any);
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
              <Switch checked={section.is_visible} onCheckedChange={(checked) => update(section.id, { is_visible: checked } as any)} />
            </div>
          </Card>
        ))}
        {items.length === 0 && <div className="text-center text-muted-foreground py-12">কোনো সেকশন নেই</div>}
      </div>
    </div>
  );
};

export default HomepageBuilder;
