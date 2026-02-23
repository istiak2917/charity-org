import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Database, CheckCircle, XCircle, Loader2 } from "lucide-react";

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
        const { error } = await supabase.from("organizations").insert({
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
      const { error } = await supabase.from("projects").insert({
        title: "শিশু শিক্ষা কার্যক্রম",
        description: "সুবিধাবঞ্চিত এলাকায় ১০০+ শিশুকে বিনামূল্যে প্রাথমিক শিক্ষা প্রদান করা হচ্ছে। বই, খাতা, কলম সরবরাহসহ প্রশিক্ষিত শিক্ষক দ্বারা পাঠদান চলছে।",
        image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600",
        status: "active",
      });
      addResult("projects", !error, error?.message || "প্রকল্প তৈরি হয়েছে");
    } catch (e: any) { addResult("projects", false, e.message); }

    // 3. Donation
    try {
      const { error } = await supabase.from("donations").insert({
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
      const { error } = await supabase.from("donation_campaigns").insert({
        title: "শীতবস্ত্র বিতরণ ক্যাম্পেইন ২০২৬",
        description: "শীতকালে সুবিধাবঞ্চিত পরিবারগুলোতে গরম কাপড় বিতরণ। টার্গেট ৫০০ পরিবার।",
        target_amount: 100000,
        current_amount: 35000,
        is_active: true,
      });
      addResult("donation_campaigns", !error, error?.message || "ক্যাম্পেইন তৈরি হয়েছে");
    } catch (e: any) { addResult("donation_campaigns", false, e.message); }

    // 5. Event
    try {
      const { error } = await supabase.from("events").insert({
        title: "বার্ষিক শিশু উৎসব ২০২৬",
        description: "শিশুদের জন্য বিনোদন, শিক্ষামূলক কর্মশালা, পুরস্কার বিতরণ ও সাংস্কৃতিক অনুষ্ঠান। সবাইকে আমন্ত্রণ।",
        location: "শিশুফুল কমিউনিটি সেন্টার, মিরপুর, ঢাকা",
        event_date: "2026-04-15T10:00:00",
        image_url: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=600",
        is_featured: true,
      });
      addResult("events", !error, error?.message || "ইভেন্ট তৈরি হয়েছে");
    } catch (e: any) { addResult("events", false, e.message); }

    // 6. Blog Post
    try {
      const { error } = await supabase.from("blog_posts").insert({
        title: "শিশুদের শিক্ষায় আমাদের অঙ্গীকার",
        content: "শিশুফুল ফাউন্ডেশন গত ৫ বছর ধরে সুবিধাবঞ্চিত শিশুদের শিক্ষা নিশ্চিত করতে কাজ করে যাচ্ছে। আমরা বিশ্বাস করি প্রতিটি শিশুর শিক্ষার অধিকার আছে। আমাদের স্বেচ্ছাসেবক দল প্রতিনিয়ত মাঠপর্যায়ে কাজ করে যাচ্ছে।\n\nআমাদের লক্ষ্য হলো আগামী ৩ বছরে ১০,০০০ শিশুকে বিনামূল্যে শিক্ষা প্রদান করা।",
        excerpt: "শিশুফুল ফাউন্ডেশনের শিক্ষা কার্যক্রমের বিস্তারিত জানুন।",
        image_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600",
        is_published: true,
        is_featured: true,
      });
      addResult("blog_posts", !error, error?.message || "ব্লগ পোস্ট তৈরি হয়েছে");
    } catch (e: any) { addResult("blog_posts", false, e.message); }

    // 7. Volunteer
    try {
      const { error } = await supabase.from("volunteers").insert({
        full_name: "ফাতেমা আক্তার",
        email: "fatema@example.com",
        phone: "01812-345678",
        skills: "শিক্ষকতা, ইভেন্ট পরিচালনা",
        status: "approved",
        hours_logged: 120,
      });
      addResult("volunteers", !error, error?.message || "স্বেচ্ছাসেবক তৈরি হয়েছে");
    } catch (e: any) { addResult("volunteers", false, e.message); }

    // 8. Volunteer Task (need volunteer id)
    try {
      const { data: vols } = await supabase.from("volunteers").select("id").eq("status", "approved").limit(1);
      if (vols && vols.length > 0) {
        const { error } = await supabase.from("volunteer_tasks").insert({
          volunteer_id: vols[0].id,
          title: "শিশু উৎসবের জন্য ব্যানার তৈরি",
          description: "বার্ষিক শিশু উৎসবের জন্য ৩টি ব্যানার ডিজাইন ও প্রিন্ট করতে হবে।",
          status: "pending",
          due_date: "2026-04-10",
        });
        addResult("volunteer_tasks", !error, error?.message || "টাস্ক তৈরি হয়েছে");
      } else {
        addResult("volunteer_tasks", false, "কোনো approved volunteer পাওয়া যায়নি");
      }
    } catch (e: any) { addResult("volunteer_tasks", false, e.message); }

    // 9. Income
    try {
      const { error } = await supabase.from("income_records").insert({
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
      const { error } = await supabase.from("expenses").insert({
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
      const { error } = await supabase.from("blood_requests").insert({
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
      const { error } = await supabase.from("gallery_items").insert({
        title: "শিশুদের সাথে শিক্ষা কার্যক্রম",
        image_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600",
        category: "শিক্ষা",
      });
      addResult("gallery_items", !error, error?.message || "গ্যালারি আইটেম তৈরি হয়েছে");
    } catch (e: any) { addResult("gallery_items", false, e.message); }

    // 13. Team Member
    try {
      const { error } = await supabase.from("team_members").insert({
        name: "ইস্তিয়াক আহমেদ",
        role: "প্রতিষ্ঠাতা ও চেয়ারম্যান",
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
        bio: "সমাজসেবায় নিবেদিত একজন উদ্যোক্তা। ১০ বছরেরও বেশি সময় ধরে শিশু কল্যাণে কাজ করছেন।",
        facebook: "https://facebook.com",
        display_order: 1,
      });
      addResult("team_members", !error, error?.message || "টিম মেম্বার তৈরি হয়েছে");
    } catch (e: any) { addResult("team_members", false, e.message); }

    // 14. Report
    try {
      const { error } = await supabase.from("reports").insert({
        title: "বার্ষিক প্রতিবেদন ২০২৫",
        report_type: "annual",
        file_url: "https://example.com/report-2025.pdf",
        year: 2025,
      });
      addResult("reports", !error, error?.message || "রিপোর্ট তৈরি হয়েছে");
    } catch (e: any) { addResult("reports", false, e.message); }

    // 15. Contact Message
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: "করিম সাহেব",
        email: "karim@example.com",
        subject: "অনুদান সম্পর্কে জানতে চাই",
        message: "আসসালামু আলাইকুম। আমি আপনাদের সংগঠনে অনুদান দিতে চাই। বিস্তারিত জানালে খুশি হব। ধন্যবাদ।",
        is_read: false,
      });
      addResult("contact_messages", !error, error?.message || "মেসেজ তৈরি হয়েছে");
    } catch (e: any) { addResult("contact_messages", false, e.message); }

    // 16. Site Settings
    try {
      const settingsToInsert = [
        { key: "hero_headline", value: "প্রতিটি শিশুর হাসি আমাদের অনুপ্রেরণা" },
        { key: "hero_subtext", value: "সুবিধাবঞ্চিত শিশুদের শিক্ষা, স্বাস্থ্য ও সামাজিক উন্নয়নে আমরা কাজ করি" },
        { key: "cta_button_text", value: "আমাদের সাথে যুক্ত হোন" },
        { key: "footer_text", value: "© ২০২৬ শিশুফুল ফাউন্ডেশন। সর্বস্বত্ব সংরক্ষিত।" },
        { key: "payment_bkash", value: "01712-345678 (পার্সোনাল)" },
        { key: "payment_nagad", value: "01812-345678" },
        { key: "payment_bank", value: "শিশুফুল ফাউন্ডেশন, ব্র্যাক ব্যাংক, অ্যাকাউন্ট: 1234567890" },
      ];

      // Detect column names
      const { data: existingSettings } = await supabase.from("site_settings").select("*").limit(1);
      const sample = existingSettings?.[0] || {};
      const keyCol = "key" in sample ? "key" : "setting_key" in sample ? "setting_key" : "key";
      const valCol = "value" in sample ? "value" : "setting_value" in sample ? "setting_value" : "value";

      let settingsOk = true;
      for (const s of settingsToInsert) {
        const { error } = await supabase.from("site_settings").upsert(
          { [keyCol]: s.key, [valCol]: s.value },
          { onConflict: keyCol }
        );
        if (error) { settingsOk = false; addResult("site_settings", false, `${s.key}: ${error.message}`); break; }
      }
      if (settingsOk) addResult("site_settings", true, "সাইট সেটিংস তৈরি হয়েছে");
    } catch (e: any) { addResult("site_settings", false, e.message); }

    // 17. Homepage Sections
    try {
      const { data: existing } = await supabase.from("homepage_sections").select("id").limit(1);
      if (!existing || existing.length === 0) {
        const sections = [
          { section_key: "hero", title: "হিরো সেকশন", is_visible: true },
          { section_key: "about", title: "আমাদের সম্পর্কে", is_visible: true },
          { section_key: "projects", title: "প্রকল্পসমূহ", is_visible: true },
          { section_key: "impact", title: "আমাদের প্রভাব", is_visible: true },
          { section_key: "donation", title: "অনুদান", is_visible: true },
          { section_key: "events", title: "ইভেন্ট", is_visible: true },
          { section_key: "team", title: "আমাদের টিম", is_visible: true },
          { section_key: "blog", title: "ব্লগ", is_visible: true },
          { section_key: "gallery", title: "গ্যালারি", is_visible: true },
          { section_key: "transparency", title: "স্বচ্ছতা", is_visible: true },
          { section_key: "contact", title: "যোগাযোগ", is_visible: true },
        ];
        // Try inserting with sort_order, fallback to without
        const withOrder = sections.map((s, i) => ({ ...s, sort_order: i + 1 }));
        const { error } = await supabase.from("homepage_sections").insert(withOrder);
        if (error && error.message?.includes("column")) {
          // Try without sort_order
          const { error: e2 } = await supabase.from("homepage_sections").insert(sections);
          addResult("homepage_sections", !e2, e2?.message || "হোমপেজ সেকশন তৈরি হয়েছে");
        } else {
          addResult("homepage_sections", !error, error?.message || "হোমপেজ সেকশন তৈরি হয়েছে");
        }
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
