import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Database, CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react";

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

async function safeUpsert(table: string, item: Record<string, any>, onConflict: string, maxRetries = 10): Promise<{ error: any }> {
  let payload = { ...item };
  for (let i = 0; i < maxRetries; i++) {
    const { error } = await supabase.from(table).upsert(payload, { onConflict });
    if (!error) return { error: null };
    if (error.message) {
      const colMatch = error.message.match(/Could not find the '(\w+)' column/);
      if (colMatch) { delete payload[colMatch[1]]; continue; }
    }
    return { error };
  }
  return { error: { message: "Too many column mismatches" } };
}

interface SeedResult { table: string; success: boolean; message: string; }

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
          description: "সুবিধাবঞ্চিত শিশুদের শিক্ষা, স্বাস্থ্য ও সামাজিক উন্নয়নে নিবেদিত একটি অলাভজনক সংগঠন। আমরা ২০১৮ সাল থেকে বাংলাদেশের প্রত্যন্ত অঞ্চলে শিক্ষা কার্যক্রম পরিচালনা করে আসছি।",
          phone: "01712-345678",
          email: "info@shishuful.org",
          contact_email: "contact@shishuful.org",
          website: "https://shishuful.org",
          address: "বাড়ি #১২, রোড #৫, মিরপুর-১০, ঢাকা-১২১৬, বাংলাদেশ",
          founded_year: 2018,
          logo_url: "",
          facebook: "https://facebook.com/shishuful",
          youtube: "https://youtube.com/@shishuful",
          registration_number: "S-১২৩৪৫/২০১৮",
          mission: "প্রতিটি শিশুর শিক্ষা ও সুন্দর ভবিষ্যত নিশ্চিত করা",
          vision: "একটি শিক্ষিত, সুস্থ ও আত্মনির্ভরশীল সমাজ গড়ে তোলা",
        });
        addResult("organizations", !error, error?.message || "সংগঠন তৈরি হয়েছে");
      } else {
        addResult("organizations", true, "আগে থেকেই আছে");
      }
    } catch (e: any) { addResult("organizations", false, e.message); }

    // 2. Projects (3 items)
    const projectsData = [
      { title: "শিশু শিক্ষা কার্যক্রম", slug: "shishu-shikkha", description: "সুবিধাবঞ্চিত এলাকায় ১০০+ শিশুকে বিনামূল্যে প্রাথমিক শিক্ষা প্রদান করা হচ্ছে।", image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600", status: "active", budget: 500000, spent: 320000, start_date: "2025-01-15", end_date: "2026-12-31", location: "মিরপুর, ঢাকা", beneficiary_count: 120 },
      { title: "স্বাস্থ্য ক্যাম্প", slug: "health-camp", description: "গ্রামীণ এলাকায় বিনামূল্যে স্বাস্থ্য পরীক্ষা ও ওষুধ বিতরণ।", image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600", status: "active", budget: 300000, spent: 150000, start_date: "2025-06-01", end_date: "2026-05-31", location: "সিলেট", beneficiary_count: 500 },
      { title: "বৃত্তি কার্যক্রম", slug: "scholarship", description: "মেধাবী কিন্তু আর্থিকভাবে অসচ্ছল শিক্ষার্থীদের বৃত্তি প্রদান।", image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600", status: "active", budget: 200000, spent: 80000, start_date: "2025-03-01", end_date: "2026-02-28", location: "চট্টগ্রাম", beneficiary_count: 50 },
    ];
    for (const p of projectsData) {
      try {
        const { error } = await safeUpsert("projects", p, "slug");
        addResult("projects", !error, error?.message || `প্রকল্প: ${p.title}`);
      } catch (e: any) { addResult("projects", false, e.message); }
    }

    // 3. Donations (3 items)
    const donationsData = [
      { donor_name: "আব্দুর রহমান", donor_email: "abdur@example.com", donor_phone: "01712-111111", amount: 5000, method: "বিকাশ", status: "completed", notes: "শিক্ষা প্রকল্পের জন্য" },
      { donor_name: "ফাতেমা বেগম", donor_email: "fatema@example.com", donor_phone: "01812-222222", amount: 10000, method: "নগদ", status: "completed", notes: "স্বাস্থ্য ক্যাম্পের জন্য" },
      { donor_name: "তানভীর হাসান", donor_email: "tanvir@example.com", donor_phone: "01912-333333", amount: 25000, method: "ব্যাংক ট্রান্সফার", status: "completed", notes: "বার্ষিক অনুদান" },
    ];
    for (const d of donationsData) {
      try {
        const { error } = await safeInsert("donations", d);
        addResult("donations", !error, error?.message || `অনুদান: ৳${d.amount}`);
      } catch (e: any) { addResult("donations", false, e.message); }
    }

    // 4. Donation Campaigns (2 items)
    const campaignsData = [
      { title: "শীতবস্ত্র বিতরণ ক্যাম্পেইন ২০২৬", description: "শীতকালে সুবিধাবঞ্চিত পরিবারগুলোতে গরম কাপড় বিতরণ।", target_amount: 100000, current_amount: 35000, is_active: true, start_date: "2026-01-01", end_date: "2026-03-31" },
      { title: "রমজান ফুড প্যাকেজ ২০২৬", description: "রমজান মাসে ১০০০ পরিবারকে খাদ্য সামগ্রী বিতরণ।", target_amount: 500000, current_amount: 120000, is_active: true, start_date: "2026-02-15", end_date: "2026-04-15" },
    ];
    for (const c of campaignsData) {
      try {
        const { error } = await safeInsert("donation_campaigns", c);
        addResult("donation_campaigns", !error, error?.message || `ক্যাম্পেইন: ${c.title}`);
      } catch (e: any) { addResult("donation_campaigns", false, e.message); }
    }

    // 5. Events (3 items)
    const eventsData = [
      { title: "বার্ষিক শিশু উৎসব ২০২৬", slug: "annual-children-festival", description: "শিশুদের জন্য বিনোদন, শিক্ষামূলক কর্মশালা ও সাংস্কৃতিক অনুষ্ঠান।", location: "শিশুফুল কমিউনিটি সেন্টার, মিরপুর, ঢাকা", event_date: "2026-04-15T10:00:00", image_url: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=600", is_featured: true, max_participants: 200, registration_open: true },
      { title: "শিক্ষক প্রশিক্ষণ কর্মশালা", slug: "teacher-training", description: "স্বেচ্ছাসেবক শিক্ষকদের জন্য আধুনিক শিক্ষণ পদ্ধতি প্রশিক্ষণ।", location: "ঢাকা বিশ্ববিদ্যালয়", event_date: "2026-05-20T09:00:00", image_url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600", is_featured: false, max_participants: 50, registration_open: true },
      { title: "রক্তদান ক্যাম্প", slug: "blood-donation-camp", description: "জরুরি রক্তের চাহিদা মেটাতে স্বেচ্ছা রক্তদান ক্যাম্প।", location: "ধানমন্ডি, ঢাকা", event_date: "2026-06-14T08:00:00", image_url: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600", is_featured: true, max_participants: 100, registration_open: true },
    ];
    for (const ev of eventsData) {
      try {
        const { error } = await safeUpsert("events", ev, "slug");
        addResult("events", !error, error?.message || `ইভেন্ট: ${ev.title}`);
      } catch (e: any) { addResult("events", false, e.message); }
    }

    // 6. Blog Posts (3 items)
    const blogData = [
      { title: "শিশুদের শিক্ষায় আমাদের অঙ্গীকার", slug: "education-commitment", content: "<h2>শিক্ষা কার্যক্রম</h2><p>শিশুফুল ফাউন্ডেশন গত ৫ বছর ধরে সুবিধাবঞ্চিত শিশুদের শিক্ষা নিশ্চিত করতে কাজ করে যাচ্ছে। আমাদের ১০টি শিক্ষা কেন্দ্রে প্রতিদিন ৫০০+ শিশু পড়াশোনা করে।</p><p>আমরা বিশ্বাস করি প্রতিটি শিশুর শিক্ষার অধিকার আছে।</p>", excerpt: "শিশুফুল ফাউন্ডেশনের শিক্ষা কার্যক্রমের বিস্তারিত জানুন।", image_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600", is_published: true, is_featured: true, author: "ইস্তিয়াক আহমেদ", category: "শিক্ষা", tags: "শিক্ষা,শিশু,উন্নয়ন" },
      { title: "স্বাস্থ্য ক্যাম্পে ৫০০ জনকে সেবা", slug: "health-camp-500", content: "<h2>স্বাস্থ্য সেবা</h2><p>গত মাসে আমাদের স্বাস্থ্য ক্যাম্পে ৫০০ জনকে বিনামূল্যে চিকিৎসা সেবা দেওয়া হয়েছে। এতে ডাক্তার, নার্স ও স্বেচ্ছাসেবকরা অংশ নিয়েছেন।</p>", excerpt: "গ্রামীণ এলাকায় বিনামূল্যে স্বাস্থ্য সেবা কার্যক্রম।", image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600", is_published: true, is_featured: false, author: "ফাতেমা আক্তার", category: "স্বাস্থ্য", tags: "স্বাস্থ্য,ক্যাম্প,সেবা" },
      { title: "স্বেচ্ছাসেবক নিয়োগ ২০২৬", slug: "volunteer-recruitment-2026", content: "<h2>আমাদের সাথে যোগ দিন</h2><p>শিশুফুল ফাউন্ডেশন নতুন স্বেচ্ছাসেবক খুঁজছে। আপনার সময় ও দক্ষতা দিয়ে সমাজে পরিবর্তন আনুন।</p>", excerpt: "নতুন স্বেচ্ছাসেবক হিসেবে যোগ দিন।", image_url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600", is_published: true, is_featured: true, author: "তানভীর হাসান", category: "স্বেচ্ছাসেবা", tags: "স্বেচ্ছাসেবক,নিয়োগ" },
    ];
    for (const b of blogData) {
      try {
        const { error } = await safeUpsert("blog_posts", b, "slug");
        addResult("blog_posts", !error, error?.message || `ব্লগ: ${b.title}`);
      } catch (e: any) { addResult("blog_posts", false, e.message); }
    }

    // 7. Volunteers (3 items)
    const volunteersData = [
      { full_name: "ফাতেমা আক্তার", email: "fatema@example.com", phone: "01812-345678", skills: ["শিক্ষকতা", "ইভেন্ট পরিচালনা", "গ্রাফিক ডিজাইন"], status: "approved", hours_logged: 120, address: "মিরপুর, ঢাকা", blood_group: "A+", occupation: "শিক্ষিকা", emergency_contact: "01912-111111", user_id: user?.id },
      { full_name: "রাকিব হাসান", email: "rakib@example.com", phone: "01912-456789", skills: ["ওয়েব ডেভেলপমেন্ট", "ফটোগ্রাফি"], status: "approved", hours_logged: 85, address: "ধানমন্ডি, ঢাকা", blood_group: "O+", occupation: "সফটওয়্যার ইঞ্জিনিয়ার", emergency_contact: "01812-222222", user_id: user?.id },
      { full_name: "সাদিয়া ইসলাম", email: "sadia@example.com", phone: "01712-567890", skills: ["কাউন্সেলিং", "সোশ্যাল মিডিয়া", "কন্টেন্ট রাইটিং"], status: "approved", hours_logged: 200, address: "গুলশান, ঢাকা", blood_group: "B+", occupation: "মনোবিদ", emergency_contact: "01712-333333", user_id: user?.id },
    ];
    for (const v of volunteersData) {
      try {
        const { error } = await safeInsert("volunteers", v);
        addResult("volunteers", !error, error?.message || `ভলান্টিয়ার: ${v.full_name}`);
      } catch (e: any) { addResult("volunteers", false, e.message); }
    }

    // 8. Volunteer Tasks
    try {
      const { data: vols } = await supabase.from("volunteers").select("id").limit(1);
      if (vols && vols.length > 0) {
        const tasksData = [
          { volunteer_id: vols[0].id, title: "শিশু উৎসবের জন্য ব্যানার তৈরি", description: "বার্ষিক শিশু উৎসবের জন্য ৩টি ব্যানার ডিজাইন করতে হবে।", status: "pending", due_date: "2026-04-10", priority: "high", hours_spent: 0 },
          { volunteer_id: vols[0].id, title: "নতুন শিক্ষার্থী তালিকা তৈরি", description: "নতুন সেশনের জন্য শিক্ষার্থী তালিকা প্রস্তুত করা।", status: "in_progress", due_date: "2026-03-15", priority: "medium", hours_spent: 3 },
        ];
        for (const t of tasksData) {
          const { error } = await safeInsert("volunteer_tasks", t);
          addResult("volunteer_tasks", !error, error?.message || `টাস্ক: ${t.title}`);
        }
      }
    } catch (e: any) { addResult("volunteer_tasks", false, e.message); }

    // 9. Income Records
    const incomeData = [
      { title: "কর্পোরেট স্পন্সরশিপ - জানুয়ারি", amount: 50000, source: "ABC কোম্পানি লিমিটেড", description: "শিক্ষা প্রকল্পের জন্য কর্পোরেট স্পন্সরশিপ।", income_date: "2026-01-15", category: "স্পন্সরশিপ", receipt_number: "INC-2026-001" },
      { title: "ব্যক্তিগত অনুদান - ফেব্রুয়ারি", amount: 75000, source: "বিভিন্ন দাতা", description: "ফেব্রুয়ারি মাসের সমষ্টিগত ব্যক্তিগত অনুদান।", income_date: "2026-02-01", category: "অনুদান", receipt_number: "INC-2026-002" },
    ];
    for (const inc of incomeData) {
      try {
        const { error } = await safeInsert("income_records", inc);
        addResult("income_records", !error, error?.message || `আয়: ${inc.title}`);
      } catch (e: any) { addResult("income_records", false, e.message); }
    }

    // 10. Expenses
    const expensesData = [
      { title: "শিক্ষা উপকরণ ক্রয়", amount: 15000, category: "শিক্ষা", description: "১০০ শিশুর জন্য বই, খাতা ও কলম কেনা হয়েছে।", expense_date: "2026-02-01", approved_by: "ইস্তিয়াক আহমেদ", receipt_number: "EXP-2026-001" },
      { title: "অফিস ভাড়া - জানুয়ারি", amount: 20000, category: "প্রশাসনিক", description: "মিরপুর অফিসের মাসিক ভাড়া।", expense_date: "2026-01-05", approved_by: "ইস্তিয়াক আহমেদ", receipt_number: "EXP-2026-002" },
      { title: "ইভেন্ট আয়োজন ব্যয়", amount: 35000, category: "ইভেন্ট", description: "শীতবস্ত্র বিতরণ ইভেন্টের ব্যয়।", expense_date: "2026-01-20", approved_by: "ইস্তিয়াক আহমেদ", receipt_number: "EXP-2026-003" },
    ];
    for (const exp of expensesData) {
      try {
        const { error } = await safeInsert("expenses", exp);
        addResult("expenses", !error, error?.message || `ব্যয়: ${exp.title}`);
      } catch (e: any) { addResult("expenses", false, e.message); }
    }

    // 11. Blood Requests
    const bloodData = [
      { patient_name: "রফিকুল ইসলাম", blood_group: "O+", required_date: "2026-03-01", location: "ঢাকা মেডিকেল কলেজ হাসপাতাল", contact: "01912-345678", status: "pending", bags_needed: 2, reason: "অপারেশন" },
      { patient_name: "নাসরিন আক্তার", blood_group: "A-", required_date: "2026-03-05", location: "বারডেম হাসপাতাল, ঢাকা", contact: "01812-654321", status: "pending", bags_needed: 1, reason: "রক্তশূন্যতা" },
    ];
    for (const br of bloodData) {
      try {
        const { error } = await safeInsert("blood_requests", br);
        addResult("blood_requests", !error, error?.message || `রক্ত: ${br.patient_name}`);
      } catch (e: any) { addResult("blood_requests", false, e.message); }
    }

    // 12. Beneficiaries
    const beneficiariesData = [
      { name: "আরিফ হোসেন", age: 10, gender: "male", guardian_name: "করিম হোসেন", guardian_phone: "01712-111222", address: "মিরপুর-১০, ঢাকা", education_level: "৩য় শ্রেণি", status: "active", notes: "মেধাবী ছাত্র, নিয়মিত উপস্থিত", created_by: user?.id },
      { name: "সুমাইয়া আক্তার", age: 8, gender: "female", guardian_name: "জাহানারা বেগম", guardian_phone: "01812-333444", address: "কল্যাণপুর, ঢাকা", education_level: "১ম শ্রেণি", status: "active", notes: "অঙ্কে ভালো", created_by: user?.id },
      { name: "তামিম ইকবাল", age: 12, gender: "male", guardian_name: "ইকবাল হোসেন", guardian_phone: "01912-555666", address: "মোহাম্মদপুর, ঢাকা", education_level: "৫ম শ্রেণি", status: "active", notes: "বিজ্ঞান অলিম্পিয়াডে অংশগ্রহণকারী", created_by: user?.id },
    ];
    for (const ben of beneficiariesData) {
      try {
        const { error } = await safeInsert("beneficiaries", ben);
        addResult("beneficiaries", !error, error?.message || `উপকারভোগী: ${ben.name}`);
      } catch (e: any) { addResult("beneficiaries", false, e.message); }
    }

    // 13. Inventory Items
    const inventoryData = [
      { name: "নোটবুক (২০০ পৃষ্ঠা)", category: "শিক্ষা উপকরণ", quantity: 500, unit: "পিস", min_stock: 100, location: "মূল গুদাম", unit_price: 45, description: "শিক্ষার্থীদের জন্য নোটবুক", created_by: user?.id },
      { name: "বলপেন (নীল)", category: "শিক্ষা উপকরণ", quantity: 1000, unit: "পিস", min_stock: 200, location: "মূল গুদাম", unit_price: 15, description: "শিক্ষার্থীদের জন্য বলপেন", created_by: user?.id },
      { name: "শীতের কম্বল", category: "ত্রাণ সামগ্রী", quantity: 200, unit: "পিস", min_stock: 50, location: "শাখা গুদাম", unit_price: 350, description: "শীতবস্ত্র বিতরণের জন্য", created_by: user?.id },
    ];
    for (const inv of inventoryData) {
      try {
        const { error } = await safeInsert("inventory_items", inv);
        addResult("inventory_items", !error, error?.message || `ইনভেন্টরি: ${inv.name}`);
      } catch (e: any) { addResult("inventory_items", false, e.message); }
    }

    // 14. Gallery Items
    const galleryData = [
      { title: "শিশুদের সাথে শিক্ষা কার্যক্রম", image_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600", category: "শিক্ষা", description: "ক্লাসরুমে শিশুদের পড়াশোনার দৃশ্য" },
      { title: "শীতবস্ত্র বিতরণ", image_url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600", category: "ত্রাণ", description: "শীতকালে গরম কাপড় বিতরণ" },
      { title: "স্বাস্থ্য ক্যাম্প", image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600", category: "স্বাস্থ্য", description: "গ্রামীণ এলাকায় স্বাস্থ্য সেবা" },
      { title: "রক্তদান ক্যাম্প", image_url: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600", category: "রক্তদান", description: "স্বেচ্ছা রক্তদান কার্যক্রম" },
    ];
    for (const g of galleryData) {
      try {
        const { error } = await safeInsert("gallery_items", g);
        addResult("gallery_items", !error, error?.message || `গ্যালারি: ${g.title}`);
      } catch (e: any) { addResult("gallery_items", false, e.message); }
    }

    // 15. Team Members
    const teamData = [
      { name: "ইস্তিয়াক আহমেদ", role: "প্রতিষ্ঠাতা ও চেয়ারম্যান", image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300", bio: "সমাজসেবায় নিবেদিত একজন উদ্যোক্তা। ঢাকা বিশ্ববিদ্যালয় থেকে স্নাতকোত্তর।", facebook: "https://facebook.com", display_order: 1, phone: "01712-000001", email: "istiak@shishuful.org" },
      { name: "নাফিসা আহমেদ", role: "নির্বাহী পরিচালক", image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300", bio: "১০ বছরের NGO অভিজ্ঞতাসম্পন্ন পেশাদার।", facebook: "https://facebook.com", display_order: 2, phone: "01712-000002", email: "nafisa@shishuful.org" },
      { name: "মাহমুদুল হাসান", role: "অর্থ পরিচালক", image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300", bio: "চার্টার্ড অ্যাকাউন্ট্যান্ট, আর্থিক স্বচ্ছতায় বিশ্বাসী।", facebook: "https://facebook.com", display_order: 3, phone: "01712-000003", email: "mahmud@shishuful.org" },
    ];
    for (const tm of teamData) {
      try {
        const { error } = await safeInsert("team_members", tm);
        addResult("team_members", !error, error?.message || `টিম: ${tm.name}`);
      } catch (e: any) { addResult("team_members", false, e.message); }
    }

    // 16. Reports
    const reportsData = [
      { title: "বার্ষিক প্রতিবেদন ২০২৫", report_type: "annual", file_url: "https://example.com/report-2025.pdf", year: 2025, description: "২০২৫ সালের সম্পূর্ণ কার্যক্রম ও আর্থিক প্রতিবেদন" },
      { title: "ত্রৈমাসিক প্রতিবেদন Q4-2025", report_type: "quarterly", file_url: "https://example.com/q4-2025.pdf", year: 2025, description: "অক্টোবর-ডিসেম্বর ২০২৫ ত্রৈমাসিক প্রতিবেদন" },
    ];
    for (const r of reportsData) {
      try {
        const { error } = await safeInsert("reports", r);
        addResult("reports", !error, error?.message || `রিপোর্ট: ${r.title}`);
      } catch (e: any) { addResult("reports", false, e.message); }
    }

    // 17. Contact Messages
    try {
      const { error } = await safeInsert("contact_messages", {
        name: "করিম সাহেব", email: "karim@example.com", subject: "অনুদান সম্পর্কে জানতে চাই",
        message: "আসসালামু আলাইকুম। আমি আপনাদের সংগঠনে মাসিক অনুদান দিতে চাই। বিকাশ ও নগদ দুটোই কি গ্রহণ করেন? বিস্তারিত জানালে উপকৃত হবো।",
        is_read: false, phone: "01712-999888", user_id: user?.id,
      });
      addResult("contact_messages", !error, error?.message || "মেসেজ তৈরি হয়েছে");
    } catch (e: any) { addResult("contact_messages", false, e.message); }

    // 18. Site Settings
    try {
      const settingsData = [
        { k: "hero_headline", v: "প্রতিটি শিশুর হাসি আমাদের অনুপ্রেরণা" },
        { k: "hero_subtext", v: "সুবিধাবঞ্চিত শিশুদের শিক্ষা, স্বাস্থ্য ও সামাজিক উন্নয়নে আমরা কাজ করি" },
        { k: "cta_button_text", v: "আমাদের সাথে যুক্ত হোন" },
        { k: "footer_text", v: "© ২০২৬ শিশুফুল ফাউন্ডেশন। সর্বস্বত্ব সংরক্ষিত।" },
        { k: "payment_bkash", v: "01712-345678 (পার্সোনাল)" },
        { k: "payment_nagad", v: "01812-345678" },
        { k: "social_facebook", v: "https://facebook.com/shishuful" },
        { k: "social_youtube", v: "https://youtube.com/@shishuful" },
        { k: "social_instagram", v: "https://instagram.com/shishuful" },
        { k: "social_twitter", v: "https://twitter.com/shishuful" },
        { k: "social_linkedin", v: "https://linkedin.com/company/shishuful" },
        { k: "social_whatsapp", v: "https://wa.me/8801712345678" },
        { k: "social_telegram", v: "https://t.me/shishuful" },
        { k: "map_embed_url", v: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.0!2d90.3654!3d23.8103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ4JzM3LjEiTiA5MMKwMjEnNTUuNCJF!5e0!3m2!1sen!2sbd!4v1234567890" },
        { k: "map_url", v: "https://maps.google.com/?q=23.8103,90.3654" },
      ];
      const colCandidates = [
        { keyCol: "key", valCol: "value" },
        { keyCol: "setting_key", valCol: "setting_value" },
        { keyCol: "name", valCol: "value" },
      ];
      let settingsOk = false;
      for (const { keyCol, valCol } of colCandidates) {
        const { error: testErr } = await supabase.from("site_settings").upsert(
          { [keyCol]: settingsData[0].k, [valCol]: settingsData[0].v }, { onConflict: keyCol }
        );
        if (!testErr) {
          for (let i = 1; i < settingsData.length; i++) {
            await supabase.from("site_settings").upsert(
              { [keyCol]: settingsData[i].k, [valCol]: settingsData[i].v }, { onConflict: keyCol }
            );
          }
          settingsOk = true;
          addResult("site_settings", true, `সাইট সেটিংস তৈরি হয়েছে (${settingsData.length}টি)`);
          break;
        }
      }
      if (!settingsOk) addResult("site_settings", false, "সেটিংস টেবিলের কলাম মিলেনি");
    } catch (e: any) { addResult("site_settings", false, e.message); }

    // 19. Homepage Sections
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
            ...sectionsList[i], is_visible: true, sort_order: i + 1, display_order: i + 1,
          });
          if (error) { allOk = false; addResult("homepage_sections", false, error.message); break; }
        }
        if (allOk) addResult("homepage_sections", true, "হোমপেজ সেকশন তৈরি হয়েছে");
      } else {
        addResult("homepage_sections", true, "আগে থেকেই আছে");
      }
    } catch (e: any) { addResult("homepage_sections", false, e.message); }

    // 20. Policy Pages
    const policyPages = [
      { title: "গোপনীয়তা নীতি", slug: "privacy-policy", type: "policy", status: "published", content: "<h1>গোপনীয়তা নীতি</h1><p>শিশুফুল ফাউন্ডেশন আপনার ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ।</p><h2>তথ্য সংগ্রহ</h2><p>আমরা শুধুমাত্র প্রয়োজনীয় তথ্য সংগ্রহ করি যা আমাদের সেবা প্রদানে সহায়ক।</p><h2>তথ্য ব্যবহার</h2><p>সংগৃহীত তথ্য শুধুমাত্র সংগঠনের কার্যক্রমে ব্যবহৃত হয়।</p>", meta_title: "গোপনীয়তা নীতি - শিশুফুল", meta_description: "শিশুফুল ফাউন্ডেশনের গোপনীয়তা নীতি" },
      { title: "ব্যবহারের শর্তাবলী", slug: "terms-and-conditions", type: "policy", status: "published", content: "<h1>ব্যবহারের শর্তাবলী</h1><p>এই ওয়েবসাইট ব্যবহার করে আপনি নিম্নলিখিত শর্তাবলীতে সম্মত হচ্ছেন।</p><h2>সেবা</h2><p>আমরা তথ্য প্রদান ও অনুদান গ্রহণের সেবা দিই।</p>", meta_title: "শর্তাবলী - শিশুফুল", meta_description: "শিশুফুল ফাউন্ডেশনের ব্যবহারের শর্তাবলী" },
      { title: "কুকি নীতি", slug: "cookies-policy", type: "policy", status: "published", content: "<h1>কুকি নীতি</h1><p>এই ওয়েবসাইট কুকি ব্যবহার করে ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে।</p>", meta_title: "কুকি নীতি - শিশুফুল", meta_description: "কুকি ব্যবহার সম্পর্কে জানুন" },
      { title: "রিফান্ড নীতি", slug: "refund-policy", type: "policy", status: "published", content: "<h1>রিফান্ড নীতি</h1><p>অনুদানের অর্থ ফেরতযোগ্য নয়, তবে বিশেষ ক্ষেত্রে যোগাযোগ করুন।</p>", meta_title: "রিফান্ড নীতি - শিশুফুল", meta_description: "অনুদান রিফান্ড সম্পর্কে জানুন" },
      { title: "শিশু সুরক্ষা নীতি", slug: "child-protection-policy", type: "policy", status: "published", content: "<h1>শিশু সুরক্ষা নীতি</h1><p>শিশুফুল ফাউন্ডেশন শিশুদের সুরক্ষা ও নিরাপত্তায় দৃঢ়ভাবে প্রতিশ্রুতিবদ্ধ।</p><h2>নীতিমালা</h2><p>সকল কর্মী ও স্বেচ্ছাসেবককে শিশু সুরক্ষা প্রশিক্ষণ নিতে হবে।</p>", meta_title: "শিশু সুরক্ষা - শিশুফুল", meta_description: "শিশু সুরক্ষা নীতিমালা" },
      { title: "স্বচ্ছতা নীতি", slug: "transparency-policy", type: "policy", status: "published", content: "<h1>স্বচ্ছতা নীতি</h1><p>আমরা সকল আর্থিক লেনদেন ও কার্যক্রমে সম্পূর্ণ স্বচ্ছতা বজায় রাখি।</p>", meta_title: "স্বচ্ছতা নীতি - শিশুফুল", meta_description: "আর্থিক স্বচ্ছতা নীতিমালা" },
    ];
    for (const p of policyPages) {
      try {
        const { error } = await safeInsert("pages", p);
        addResult("pages", !error, error?.message || `পেজ: ${p.title}`);
      } catch (e: any) { addResult("pages", false, e.message); }
    }

    // 21. Branches
    try {
      const { error } = await safeInsert("branches", {
        name: "মিরপুর শাখা", address: "বাড়ি #১২, রোড #৫, মিরপুর-১০, ঢাকা",
        phone: "01712-345678", email: "mirpur@shishuful.org", manager_name: "রাকিব হাসান",
        is_active: true, established_date: "2020-01-01", created_by: user?.id,
      });
      addResult("branches", !error, error?.message || "শাখা তৈরি হয়েছে");
    } catch (e: any) { addResult("branches", false, e.message); }

    setRunning(false);
    toast({ title: "✅ সিড ডেটা প্রক্রিয়া সম্পন্ন!" });
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
          প্রতিটি টেবিলে একাধিক ডেমো এন্ট্রি তৈরি করতে নিচের বাটনে ক্লিক করুন। এটি সব অ্যাডমিন মডিউল, হোমপেজ, পাবলিক পেজ ও পলিসি পেজ টেস্ট করতে সাহায্য করবে। সকল ঐচ্ছিক ফিল্ড বাস্তবসম্মত ডেটা দিয়ে পূরণ করা হবে।
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
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
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
