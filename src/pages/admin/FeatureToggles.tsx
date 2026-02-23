import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ToggleLeft } from "lucide-react";

interface FeatureToggle { id: string; feature: string; enabled: boolean; }

const featureLabels: Record<string, string> = {
  projects: "প্রকল্পসমূহ",
  donations: "অনুদান",
  blood_donation: "রক্তদান",
  events: "ইভেন্ট",
  blog: "ব্লগ",
  gallery: "গ্যালারি",
  transparency: "স্বচ্ছতা",
  volunteer: "স্বেচ্ছাসেবক",
  documents: "ডকুমেন্ট",
};

const FeatureToggles = () => {
  const { items, loading, update } = useAdminCrud<FeatureToggle>({ table: "feature_toggles", orderBy: "feature", ascending: true });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ToggleLeft className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">ফিচার টগল</h1>
      </div>
      <div className="grid gap-3">
        {items.map((f) => (
          <Card key={f.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{featureLabels[f.feature] || f.feature}</div>
              <div className="text-sm text-muted-foreground">{f.feature}</div>
            </div>
            <Switch checked={f.enabled} onCheckedChange={(checked) => update(f.id, { enabled: checked } as any)} />
          </Card>
        ))}
        {items.length === 0 && <div className="text-center text-muted-foreground py-12">কোনো ফিচার টগল নেই। SQL স্ক্রিপ্ট রান করুন।</div>}
      </div>
    </div>
  );
};

export default FeatureToggles;
