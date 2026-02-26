import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FlaskConical, BarChart3 } from "lucide-react";

interface Variant {
  id: string;
  name: string;
  content: string;
  impressions: number;
  conversions: number;
}

interface ABTest {
  id: string;
  name: string;
  target: string;
  variants: Variant[];
  is_active: boolean;
  created_at: string;
}

const AB_TARGETS = [
  { value: "hero_headline", label: "হিরো হেডলাইন" },
  { value: "hero_cta", label: "CTA বাটন টেক্সট" },
  { value: "donation_headline", label: "অনুদান সেকশন হেডলাইন" },
  { value: "donation_cta", label: "অনুদান বাটন টেক্সট" },
  { value: "popup_message", label: "পপআপ মেসেজ" },
];

const ABTestManager = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", target: "hero_headline", variants: [{ name: "A", content: "" }, { name: "B", content: "" }] });
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("site_settings").select("*").eq("setting_key", "ab_tests").single();
    if (data) {
      try {
        const raw = typeof data.setting_value === "string" ? JSON.parse(data.setting_value) : data.setting_value;
        if (Array.isArray(raw)) setTests(raw);
      } catch {}
    }
  };

  const save = async (updated: ABTest[]) => {
    await supabase.from("site_settings").upsert({ setting_key: "ab_tests", setting_value: JSON.stringify(updated) }, { onConflict: "setting_key" });
    setTests(updated);
  };

  const addTest = async () => {
    if (!form.name || form.variants.some(v => !v.content)) {
      toast({ title: "সব ফিল্ড পূরণ করুন", variant: "destructive" });
      return;
    }
    const test: ABTest = {
      id: Date.now().toString(),
      name: form.name,
      target: form.target,
      variants: form.variants.map(v => ({ ...v, id: crypto.randomUUID(), impressions: 0, conversions: 0 })),
      is_active: true,
      created_at: new Date().toISOString(),
    };
    await save([...tests, test]);
    setShowAdd(false);
    setForm({ name: "", target: "hero_headline", variants: [{ name: "A", content: "" }, { name: "B", content: "" }] });
    toast({ title: "A/B টেস্ট তৈরি হয়েছে ✅" });
  };

  const deleteTest = async (id: string) => {
    await save(tests.filter(t => t.id !== id));
    toast({ title: "টেস্ট মুছে ফেলা হয়েছে" });
  };

  const toggleTest = async (id: string) => {
    await save(tests.map(t => t.id === id ? { ...t, is_active: !t.is_active } : t));
  };

  const getConversionRate = (v: Variant) => v.impressions > 0 ? ((v.conversions / v.impressions) * 100).toFixed(1) : "0";
  const getWinner = (test: ABTest) => {
    const rates = test.variants.map(v => ({ ...v, rate: v.impressions > 0 ? v.conversions / v.impressions : 0 }));
    const best = rates.reduce((a, b) => a.rate > b.rate ? a : b);
    return best.impressions > 10 ? best.name : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2"><FlaskConical className="h-6 w-6 text-primary" /> A/B টেস্টিং</h1>
        <Button onClick={() => setShowAdd(!showAdd)} className="gap-2"><Plus className="h-4 w-4" /> নতুন টেস্ট</Button>
      </div>

      {showAdd && (
        <Card className="p-6 space-y-4">
          <Input placeholder="টেস্টের নাম" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div>
            <label className="text-sm font-medium mb-2 block">টার্গেট এলিমেন্ট</label>
            <div className="flex flex-wrap gap-2">
              {AB_TARGETS.map(t => (
                <button key={t.value} onClick={() => setForm({ ...form, target: t.value })}
                  className={`text-xs px-3 py-1.5 rounded-full border ${form.target === t.value ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {form.variants.map((v, i) => (
            <div key={i} className="space-y-1">
              <label className="text-sm font-medium">ভেরিয়েন্ট {v.name}</label>
              <Textarea rows={2} value={v.content} onChange={e => {
                const updated = [...form.variants];
                updated[i] = { ...updated[i], content: e.target.value };
                setForm({ ...form, variants: updated });
              }} placeholder={`ভেরিয়েন্ট ${v.name} এর কন্টেন্ট`} />
            </div>
          ))}
          {form.variants.length < 4 && (
            <Button variant="outline" size="sm" onClick={() => setForm({ ...form, variants: [...form.variants, { name: String.fromCharCode(65 + form.variants.length), content: "" }] })}>
              + ভেরিয়েন্ট যোগ করুন
            </Button>
          )}
          <Button onClick={addTest}>টেস্ট শুরু করুন</Button>
        </Card>
      )}

      <div className="space-y-4">
        {tests.map(test => {
          const winner = getWinner(test);
          return (
            <Card key={test.id} className={`p-5 space-y-4 ${!test.is_active ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">{test.name} {winner && <Badge className="bg-green-500">বিজয়ী: {winner}</Badge>}</h3>
                  <p className="text-xs text-muted-foreground">টার্গেট: {AB_TARGETS.find(t => t.value === test.target)?.label || test.target}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={test.is_active} onCheckedChange={() => toggleTest(test.id)} />
                  <Button size="sm" variant="ghost" onClick={() => deleteTest(test.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {test.variants.map(v => {
                  const rate = Number(getConversionRate(v));
                  const maxRate = Math.max(...test.variants.map(x => x.impressions > 0 ? (x.conversions / x.impressions) * 100 : 0));
                  return (
                    <div key={v.id} className={`border rounded-lg p-3 space-y-2 ${winner === v.name ? "border-green-500 bg-green-500/5" : "border-border"}`}>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{v.name}</Badge>
                        <span className="text-sm font-bold">{rate}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{v.content}</p>
                      <Progress value={maxRate > 0 ? (rate / maxRate) * 100 : 0} className="h-2" />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>👁 {v.impressions} ভিউ</span>
                        <span>✅ {v.conversions} কনভার্সন</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
        {tests.length === 0 && !showAdd && <p className="text-center text-muted-foreground py-8">কোনো A/B টেস্ট চলমান নেই</p>}
      </div>
    </div>
  );
};

export default ABTestManager;
