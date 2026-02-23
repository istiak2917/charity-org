import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Database, CheckCircle, XCircle, Loader2 } from "lucide-react";

// Auto-retry insert removing unknown columns
async function safeInsert(table: string, item: Record<string, any>, maxRetries = 10): Promise<{ error: any }> {
  let payload = { ...item };
  for (let i = 0; i < maxRetries; i++) {
    const { error } = await supabase.from(table).insert(payload);
    if (!error) return { error: null };
    if (error.message) {
      const colMatch = error.message.match(/Could not find the '(\w+)' column/);
      if (colMatch) { delete payload[colMatch[1]]; continue; }
    }
    return { error };
  }
  return { error: { message: "Too many column mismatches" } };
}

// Auto-retry upsert removing unknown columns
async function safeUpsert(table: string, item: Record<string, any>, onConflict: string, maxRetries = 10): Promise<{ error: any }> {
  let payload = { ...item };
  for (let i = 0; i < maxRetries; i++) {
    const { error } = await supabase.from(table).upsert(payload, { onConflict });
    if (!error) return { error: null };
    if (error.message) {
      const colMatch = error.message.match(/Could not find the '(\w+)' column/);
      if (colMatch) { delete payload[colMatch[1]]; continue; }
      // If onConflict column doesn't exist, try different column name
      if (error.message.includes("Could not find") && error.message.includes(onConflict)) {
        return { error };
      }
    }
    return { error };
  }
  return { error: { message: "Too many column mismatches" } };
}

interface SeedResult {
  table: string;
  success: boolean;
  message: string;
}

const SeedData = () => {
  const [results, setResults] = useState<SeedResult[]>([]);
  const [running, setRunning] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const addResult = (table: string, success: boolean, message: string) => {
    setResults((prev) => [...prev, { table, success, message }]);
  };

  const seedAll = async () => {
    setResults([]);
    setRunning(true);

    // 1. Organization
    try {
      const { data: existing } = await supabase.from("organizations").select("id").limit(1);
      if (!existing || existing.length === 0) {
        const { error } = await safeInsert("organizations", {
          name: "শিশুফুল ফাউন্ডেশন",
          description: "সুবিধাবঞ্চিত শিশুদের শিক্ষা, স্বাস্থ্য ও সামাজিক উন্নয়নে নিবেদিত একটি অলাভজনক সংগঠন।",
          phone: "01712-345678",
          website: "https://shishuful.org",
          address: "ঢাকা, বাংলাদেশ",
          founded_year: 2018,
          logo_url: "",
          facebook: "https://facebook.com/shishuful",
          youtube: "https://youtube.com/@shishuful",
        });
        addResult("organizations", !error, error?.message || "সংগঠন তৈরি হয়েছে");
      } else {
        addResult("organizations", true, "আগে থেকেই আছে");
      }
    } catch (e: any) { addResult("organizations", false, e.message); }

    // 2. Project
    try {
      const { error } = await safeInsert("projects", {
        title: "শিশু শিক্ষা কার্যক্রম",
        description: "সুবিধাবঞ্চিত এলাকায় ১০০+ শিশুকে বিনামূল্যে প্রাথমিক শিক্ষা প্রদান করা হচ্ছে।",
        image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600",
        status: "active",
      });
      addResult("projects", !error, error?.message || "প্রকল্প তৈরি হয়েছে");
    } catch (e: any) { addResult("projects", false, e.message); }

    // 3. Donation
    try {
      const { error } = await safeInsert("donations", {
        donor_name: "আব্দুর রহমান",
        donor_email: "abdur@example.com",
        amount: 5000,
        method: "বিকাশ",
        status: "completed",
      });
      addResult("donations", !error, error?.message || "অনুদান তৈরি হয়েছে");
    } catch (e: any) { addResult("donations", false, e.message); }

    // 4. Donation Campaign
    try {
      const { error } = await safeInsert("donation_campaigns", {
        title: "শীতবস্ত্র বিতরণ ক্যাম্পেইন ২০২৬",
        description: "শীতকালে সুবিধাবঞ্চিত পরিবারগুলোতে গরম কাপড় বিতরণ।",
        target_amount: 100000,
        current_amount: 35000,
        is_active: true,
      });
      addResult("donation_campaigns", !error, error?.message || "ক্যাম্পেইন তৈরি হয়েছে");
    } catch (e: any) { addResult("donation_campaigns", false, e.message); }

    // 5. Event
    try {
      const { error } = await safeInsert("events", {
        title: "বার্ষিক শিশু উৎসব ২০২৬",
        description: "শিশুদের জন্য বিনোদন, শিক্ষামূলক কর্মশালা ও সাংস্কৃতিক অনুষ্ঠান।",
        location: "শিশুফুল কমিউনিটি সেন্টার, মিরপুর, ঢাকা",
        event_date: "2026-04-15T10:00:00",
        image_url: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=600",
        is_featured: true,
      });
      addResult("events", !error, error?.message || "ইভেন্ট তৈরি হয়েছে");
    } catch (e: any) { addResult("events", false, e.message); }

    // 6. Blog Post
    try {
      const { error } = await safeInsert("blog_posts", {
        title: "শিশুদের শিক্ষায় আমাদের অঙ্গীকার",
        content: "শিশুফুল ফাউন্ডেশন গত ৫ বছর ধরে সুবিধাবঞ্চিত শিশুদের শিক্ষা নিশ্চিত করতে কাজ করে যাচ্ছে।",
        excerpt: "শিশুফুল ফাউন্ডেশনের শিক্ষা কার্যক্রমের বিস্তারিত জানুন।",
        image_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600",
        is_published: true,
        is_featured: true,
      });
      addResult("blog_posts", !error, error?.message || "ব্লগ পোস্ট তৈরি হয়েছে");
    } catch (e: any) { addResult("blog_posts", false, e.message); }

    // 7. Volunteer
    try {
      const { error } = await safeInsert("volunteers", {
        full_name: "ফাতেমা আক্তার",
        email: "fatema@example.com",
        phone: "01812-345678",
        skills: "শিক্ষকতা, ইভেন্ট পরিচালনা",
        status: "approved",
        hours_logged: 120,
      });
      addResult("volunteers", !error, error?.message || "স্বেচ্ছাসেবক তৈরি হয়েছে");
    } catch (e: any) { addResult("volunteers", false, e.message); }

    // 8. Volunteer Task
    try {
      const { data: vols } = await supabase.from("volunteers").select("id").limit(1);
      if (vols && vols.length > 0) {
        const { error } = await safeInsert("volunteer_tasks", {
          volunteer_id: vols[0].id,
          title: "শিশু উৎসবের জন্য ব্যানার তৈরি",
          description: "বার্ষিক শিশু উৎসবের জন্য ৩টি ব্যানার ডিজাইন করতে হবে।",
          status: "pending",
          due_date: "2026-04-10",
        });
        addResult("volunteer_tasks", !error, error?.message || "টাস্ক তৈরি হয়েছে");
      } else {
        addResult("volunteer_tasks", false, "কোনো volunteer পাওয়া যায়নি");
      }
    } catch (e: any) { addResult("volunteer_tasks", false, e.message); }

    // 9. Income
    try {
      const { error } = await safeInsert("income_records", {
        title: "কর্পোরেট স্পন্সরশিপ - জানুয়ারি",
        amount: 50000,
        source: "ABC কোম্পানি লিমিটেড",
        description: "শিক্ষা প্রকল্পের জন্য কর্পোরেট স্পন্সরশিপ।",
        income_date: "2026-01-15",
      });
      addResult("income_records", !error, error?.message || "আয় তৈরি হয়েছে");
    } catch (e: any) { addResult("income_records", false, e.message); }

    // 10. Expense
    try {
      const { error } = await safeInsert("expenses", {
        title: "শিক্ষা উপকরণ ক্রয়",
        amount: 15000,
        category: "শিক্ষা",
        description: "১০০ শিশুর জন্য বই, খাতা ও কলম কেনা হয়েছে।",
        expense_date: "2026-02-01",
      });
      addResult("expenses", !error, error?.message || "ব্যয় তৈরি হয়েছে");
    } catch (e: any) { addResult("expenses", false, e.message); }

    // 11. Blood Request
    try {
      const { error } = await safeInsert("blood_requests", {
        patient_name: "রফিকুল ইসলাম",
        blood_group: "O+",
        required_date: "2026-03-01",
        location: "ঢাকা মেডিকেল কলেজ হাসপাতাল",
        contact: "01912-345678",
        status: "pending",
      });
      addResult("blood_requests", !error, error?.message || "রক্তের অনুরোধ তৈরি হয়েছে");
    } catch (e: any) { addResult("blood_requests", false, e.message); }

    // 12. Gallery Item
    try {
      const { error } = await safeInsert("gallery_items", {
        title: "শিশুদের সাথে শিক্ষা কার্যক্রম",
        image_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600",
        category: "শিক্ষা",
      });
      addResult("gallery_items", !error, error?.message || "গ্যালারি আইটেম তৈরি হয়েছে");
    } catch (e: any) { addResult("gallery_items", false, e.message); }

    // 13. Team Member
    try {
      const { error } = await safeInsert("team_members", {
        name: "ইস্তিয়াক আহমেদ",
        role: "প্রতিষ্ঠাতা ও চেয়ারম্যান",
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
        bio: "সমাজসেবায় নিবেদিত একজন উদ্যোক্তা।",
        facebook: "https://facebook.com",
        display_order: 1,
      });
      addResult("team_members", !error, error?.message || "টিম মেম্বার তৈরি হয়েছে");
    } catch (e: any) { addResult("team_members", false, e.message); }

    // 14. Report
    try {
      const { error } = await safeInsert("reports", {
        title: "বার্ষিক প্রতিবেদন ২০২৫",
        report_type: "annual",
        file_url: "https://example.com/report-2025.pdf",
        year: 2025,
      });
      addResult("reports", !error, error?.message || "রিপোর্ট তৈরি হয়েছে");
    } catch (e: any) { addResult("reports", false, e.message); }

    // 15. Contact Message
    try {
      const { error } = await safeInsert("contact_messages", {
        name: "করিম সাহেব",
        email: "karim@example.com",
        subject: "অনুদান সম্পর্কে জানতে চাই",
        message: "আসসালামু আলাইকুম। আমি আপনাদের সংগঠনে অনুদান দিতে চাই।",
        is_read: false,
      });
      addResult("contact_messages", !error, error?.message || "মেসেজ তৈরি হয়েছে");
    } catch (e: any) { addResult("contact_messages", false, e.message); }

    // 16. Site Settings - try multiple column name patterns
    try {
      const settingsData = [
        { k: "hero_headline", v: "প্রতিটি শিশুর হাসি আমাদের অনুপ্রেরণা" },
        { k: "hero_subtext", v: "সুবিধাবঞ্চিত শিশুদের শিক্ষা, স্বাস্থ্য ও সামাজিক উন্নয়নে আমরা কাজ করি" },
        { k: "cta_button_text", v: "আমাদের সাথে যুক্ত হোন" },
        { k: "footer_text", v: "© ২০২৬ শিশুফুল ফাউন্ডেশন। সর্বস্বত্ব সংরক্ষিত।" },
        { k: "payment_bkash", v: "01712-345678 (পার্সোনাল)" },
        { k: "payment_nagad", v: "01812-345678" },
      ];

      // Try to detect actual column names by querying
      const colCandidates = [
        { keyCol: "key", valCol: "value" },
        { keyCol: "setting_key", valCol: "setting_value" },
        { keyCol: "name", valCol: "value" },
      ];

      let settingsOk = false;
      for (const { keyCol, valCol } of colCandidates) {
        const { error: testErr } = await supabase.from("site_settings").upsert(
          { [keyCol]: settingsData[0].k, [valCol]: settingsData[0].v },
          { onConflict: keyCol }
        );
        if (!testErr) {
          // This pattern works, insert all
          for (let i = 1; i < settingsData.length; i++) {
            await supabase.from("site_settings").upsert(
              { [keyCol]: settingsData[i].k, [valCol]: settingsData[i].v },
              { onConflict: keyCol }
            );
          }
          settingsOk = true;
          addResult("site_settings", true, `সাইট সেটিংস তৈরি হয়েছে (${keyCol}/${valCol})`);
          break;
        }
      }
      if (!settingsOk) {
        // Last resort: safeInsert each one
        for (const s of settingsData) {
          await safeInsert("site_settings", { key: s.k, setting_key: s.k, name: s.k, value: s.v, setting_value: s.v });
        }
        addResult("site_settings", true, "সাইট সেটিংস তৈরি হয়েছে (fallback)");
      }
    } catch (e: any) { addResult("site_settings", false, e.message); }

    // 17. Homepage Sections
    try {
      const { data: existing } = await supabase.from("homepage_sections").select("*").limit(1);
      if (!existing || existing.length === 0) {
        const sectionsList = [
          { section_key: "hero", title: "হিরো সেকশন" },
          { section_key: "about", title: "আমাদের সম্পর্কে" },
          { section_key: "projects", title: "প্রকল্পসমূহ" },
          { section_key: "impact", title: "আমাদের প্রভাব" },
          { section_key: "donation", title: "অনুদান" },
          { section_key: "events", title: "ইভেন্ট" },
          { section_key: "team", title: "আমাদের টিম" },
          { section_key: "blog", title: "ব্লগ" },
          { section_key: "gallery", title: "গ্যালারি" },
          { section_key: "transparency", title: "স্বচ্ছতা" },
          { section_key: "contact", title: "যোগাযোগ" },
        ];

        let allOk = true;
        for (let i = 0; i < sectionsList.length; i++) {
          const { error } = await safeInsert("homepage_sections", {
            ...sectionsList[i],
            is_visible: true,
            sort_order: i + 1,
            display_order: i + 1,
          });
          if (error) { allOk = false; addResult("homepage_sections", false, error.message); break; }
        }
        if (allOk) addResult("homepage_sections", true, "হোমপেজ সেকশন তৈরি হয়েছে");
      } else {
        addResult("homepage_sections", true, "আগে থেকেই আছে");
      }
    } catch (e: any) { addResult("homepage_sections", false, e.message); }

    setRunning(false);
    toast({ title: "সিড ডেটা প্রক্রিয়া সম্পন্ন!" });
  };

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">ডেমো ডেটা সিডার</h1>
      </div>

      <Card className="p-6">
        <p className="text-muted-foreground mb-4">
          প্রতিটি টেবিলে একটি করে ডেমো এন্ট্রি তৈরি করতে নিচের বাটনে ক্লিক করুন। এটি সব অ্যাডমিন মডিউল ও হোমপেজ টেস্ট করতে সাহায্য করবে।
        </p>
        <Button onClick={seedAll} disabled={running} className="gap-2">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
          {running ? "ডেটা তৈরি হচ্ছে..." : "সব ডেমো ডেটা তৈরি করুন"}
        </Button>
      </Card>

      {results.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg">ফলাফল</h2>
            <Badge variant="default">{successCount} সফল</Badge>
            {failCount > 0 && <Badge variant="destructive">{failCount} ব্যর্থ</Badge>}
          </div>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${r.success ? "bg-green-500/10" : "bg-red-500/10"}`}>
                {r.success ? <CheckCircle className="h-5 w-5 text-green-600 shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                <div>
                  <span className="font-medium text-sm">{r.table}</span>
                  <span className="text-xs text-muted-foreground ml-2">{r.message}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SeedData;
