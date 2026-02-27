import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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

async function safeUpsert(table: string, item: Record<string, any>, onConflict: string, maxRetries = 10): Promise<{ error: any }> {
  let payload = { ...item };
  for (let i = 0; i < maxRetries; i++) {
    const { error } = await supabase.from(table).upsert(payload, { onConflict, ignoreDuplicates: true });
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
  const { t } = useLanguage();

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
          phone: "01712-345678", email: "info@shishuful.org", contact_email: "contact@shishuful.org",
          website: "https://shishuful.org", address: "বাড়ি #১২, রোড #৫, মিরপুর-১০, ঢাকা-১২১৬",
          founded_year: 2018, logo_url: "", facebook: "https://facebook.com/shishuful",
          youtube: "https://youtube.com/@shishuful", registration_number: "S-১২৩৪৫/২০১৮",
          mission: "প্রতিটি শিশুর শিক্ষা ও সুন্দর ভবিষত নিশ্চিত করা",
          vision: "একটি শিক্ষিত, সুস্থ ও আত্মনির্ভরশীল সমাজ গড়ে তোলা",
        });
        addResult("organizations", !error, error?.message || "Organization created");
      } else {
        addResult("organizations", true, t("seed_already_exists"));
      }
    } catch (e: any) { addResult("organizations", false, e.message); }

    // 2. Projects
    const projectsData = [
      { title: "শিশু শিক্ষা কার্যক্রম", slug: "shishu-shikkha", description: "সুবিধাবঞ্চিত এলাকায় ১০০+ শিশুকে বিনামূল্যে প্রাথমিক শিক্ষা প্রদান।", image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600", status: "active", budget: 500000, spent: 320000, start_date: "2025-01-15", end_date: "2026-12-31", location: "মিরপুর, ঢাকা", beneficiary_count: 120 },
      { title: "স্বাস্থ্য ক্যাম্প", slug: "health-camp", description: "গ্রামীণ এলাকায় বিনামূল্যে স্বাস্থ্য পরীক্ষা ও ওষুধ বিতরণ।", image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600", status: "active", budget: 300000, spent: 150000, start_date: "2025-06-01", end_date: "2026-05-31", location: "সিলেট", beneficiary_count: 500 },
      { title: "বৃত্তি কার্যক্রম", slug: "scholarship", description: "মেধাবী কিন্তু আর্থিকভাবে অসচ্ছল শিক্ষার্থীদের বৃত্তি প্রদান।", image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600", status: "active", budget: 200000, spent: 80000, start_date: "2025-03-01", end_date: "2026-02-28", location: "চট্টগ্রাম", beneficiary_count: 50 },
    ];
    for (const p of projectsData) {
      try { const { error } = await safeUpsert("projects", p, "slug"); addResult("projects", !error, error?.message || `Project: ${p.title}`); } catch (e: any) { addResult("projects", false, e.message); }
    }

    // 3. Donations
    const donationsData = [
      { donor_name: "আব্দুর রহমান", donor_email: "abdur@example.com", donor_phone: "01712-111111", amount: 5000, method: "বিকাশ", status: "completed", notes: "শিক্ষা প্রকল্পের জন্য" },
      { donor_name: "ফাতেমা বেগম", donor_email: "fatema@example.com", donor_phone: "01812-222222", amount: 10000, method: "নগদ", status: "completed", notes: "স্বাস্থ্য ক্যাম্পের জন্য" },
      { donor_name: "তানভীর হাসান", donor_email: "tanvir@example.com", donor_phone: "01912-333333", amount: 25000, method: "ব্যাংক ট্রান্সফার", status: "completed", notes: "বার্ষিক অনুদান" },
      { donor_name: "রাহেলা খাতুন", donor_email: "rahela@example.com", donor_phone: "01612-444444", amount: 3000, method: "রকেট", status: "confirmed", notes: "মাসিক অনুদান" },
      { donor_name: "জামাল উদ্দিন", donor_email: "jamal@example.com", donor_phone: "01512-555555", amount: 50000, method: "ব্যাংক ট্রান্সফার", status: "completed", notes: "কর্পোরেট অনুদান" },
    ];
    for (const d of donationsData) {
      try { const { error } = await safeInsert("donations", d); addResult("donations", !error, error?.message || `Donation: ৳${d.amount}`); } catch (e: any) { addResult("donations", false, e.message); }
    }

    // 4. Donation Campaigns
    const campaignsData = [
      { title: "শীতবস্ত্র বিতরণ ক্যাম্পেইন ২০২৬", description: "শীতকালে সুবিধাবঞ্চিত পরিবারগুলোতে গরম কাপড় বিতরণ।", target_amount: 100000, current_amount: 35000, is_active: true, start_date: "2026-01-01", end_date: "2026-03-31" },
      { title: "রমজান ফুড প্যাকেজ ২০২৬", description: "রমজান মাসে ১০০০ পরিবারকে খাদ্য সামগ্রী বিতরণ।", target_amount: 500000, current_amount: 120000, is_active: true, start_date: "2026-02-15", end_date: "2026-04-15" },
    ];
    for (const c of campaignsData) {
      try { const { error } = await safeInsert("donation_campaigns", c); addResult("donation_campaigns", !error, error?.message || `Campaign: ${c.title}`); } catch (e: any) { addResult("donation_campaigns", false, e.message); }
    }

    // 5. Events
    const eventsData = [
      { title: "বার্ষিক শিশু উৎসব ২০২৬", slug: "annual-children-festival", description: "শিশুদের জন্য বিনোদন, শিক্ষামূলক কর্মশালা ও সাংস্কৃতিক অনুষ্ঠান।", location: "শিশুফুল কমিউনিটি সেন্টার, মিরপুর, ঢাকা", event_date: "2026-04-15T10:00:00", image_url: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=600", is_featured: true, max_participants: 200, registration_open: true },
      { title: "শিক্ষক প্রশিক্ষণ কর্মশালা", slug: "teacher-training", description: "স্বেচ্ছাসেবক শিক্ষকদের জন্য আধুনিক শিক্ষণ পদ্ধতি প্রশিক্ষণ।", location: "ঢাকা বিশ্ববিদ্যালয়", event_date: "2026-05-20T09:00:00", image_url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600", is_featured: false, max_participants: 50, registration_open: true },
      { title: "রক্তদান ক্যাম্প", slug: "blood-donation-camp", description: "জরুরি রক্তের চাহিদা মেটাতে স্বেচ্ছা রক্তদান ক্যাম্প।", location: "ধানমন্ডি, ঢাকা", event_date: "2026-06-14T08:00:00", image_url: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600", is_featured: true, max_participants: 100, registration_open: true },
    ];
    for (const ev of eventsData) {
      try { const { error } = await safeUpsert("events", ev, "slug"); addResult("events", !error, error?.message || `Event: ${ev.title}`); } catch (e: any) { addResult("events", false, e.message); }
    }

    // 6. Blog Posts
    const blogData = [
      { title: "শিশুদের শিক্ষায় আমাদের অঙ্গীকার", slug: "education-commitment", content: "<h2>শিক্ষা কার্যক্রম</h2><p>শিশুফুল ফাউন্ডেশন গত ৫ বছর ধরে সুবিধাবঞ্চিত শিশুদের শিক্ষা নিশ্চিত করতে কাজ করে যাচ্ছে।</p>", excerpt: "শিশুফুল ফাউন্ডেশনের শিক্ষা কার্যক্রমের বিস্তারিত জানুন।", image_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600", is_published: true, is_featured: true, author: "ইস্তিয়াক আহমেদ", category: "শিক্ষা", tags: "শিক্ষা,শিশু,উন্নয়ন" },
      { title: "স্বাস্থ্য ক্যাম্পে ৫০০ জনকে সেবা", slug: "health-camp-500", content: "<h2>স্বাস্থ্য সেবা</h2><p>গত মাসে আমাদের স্বাস্থ্য ক্যাম্পে ৫০০ জনকে বিনামূল্যে চিকিৎসা সেবা দেওয়া হয়েছে।</p>", excerpt: "গ্রামীণ এলাকায় বিনামূল্যে স্বাস্থ্য সেবা কার্যক্রম।", image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600", is_published: true, is_featured: false, author: "ফাতেমা আক্তার", category: "স্বাস্থ্য", tags: "স্বাস্থ্য,ক্যাম্প,সেবা" },
      { title: "স্বেচ্ছাসেবক নিয়োগ ২০২৬", slug: "volunteer-recruitment-2026", content: "<h2>আমাদের সাথে যোগ দিন</h2><p>শিশুফুল ফাউন্ডেশন নতুন স্বেচ্ছাসেবক খুঁজছে।</p>", excerpt: "নতুন স্বেচ্ছাসেবক হিসেবে যোগ দিন।", image_url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600", is_published: true, is_featured: true, author: "তানভীর হাসান", category: "স্বেচ্ছাসেবা", tags: "স্বেচ্ছাসেবক,নিয়োগ" },
    ];
    for (const b of blogData) {
      try { const { error } = await safeUpsert("blog_posts", b, "slug"); addResult("blog_posts", !error, error?.message || `Blog: ${b.title}`); } catch (e: any) { addResult("blog_posts", false, e.message); }
    }

    // 7. Volunteers
    const volunteersData = [
      { full_name: "ফাতেমা আক্তার", email: "fatema@example.com", phone: "01812-345678", skills: ["শিক্ষকতা", "ইভেন্ট পরিচালনা", "গ্রাফিক ডিজাইন"], status: "approved", hours_logged: 120, address: "মিরপুর, ঢাকা", blood_group: "A+", occupation: "শিক্ষিকা", emergency_contact: "01912-111111", user_id: user?.id },
      { full_name: "রাকিব হাসান", email: "rakib@example.com", phone: "01912-456789", skills: ["ওয়েব ডেভেলপমেন্ট", "ফটোগ্রাফি"], status: "approved", hours_logged: 85, address: "ধানমন্ডি, ঢাকা", blood_group: "O+", occupation: "সফটওয়্যার ইঞ্জিনিয়ার", emergency_contact: "01812-222222", user_id: user?.id },
      { full_name: "সাদিয়া ইসলাম", email: "sadia@example.com", phone: "01712-567890", skills: ["কাউন্সেলিং", "সোশ্যাল মিডিয়া", "কন্টেন্ট রাইটিং"], status: "approved", hours_logged: 200, address: "গুলশান, ঢাকা", blood_group: "B+", occupation: "মনোবিদ", emergency_contact: "01712-333333", user_id: user?.id },
    ];
    for (const v of volunteersData) {
      try { const { error } = await safeInsert("volunteers", v); addResult("volunteers", !error, error?.message || `Volunteer: ${v.full_name}`); } catch (e: any) { addResult("volunteers", false, e.message); }
    }

    // 8. Volunteer Tasks
    try {
      const { data: vols } = await supabase.from("volunteers").select("id").limit(1);
      if (vols && vols.length > 0) {
        const tasksData = [
          { volunteer_id: vols[0].id, title: "শিশু উৎসবের জন্য ব্যানার তৈরি", description: "বার্ষিক শিশু উৎসবের জন্য ৩টি ব্যানার ডিজাইন।", status: "pending", due_date: "2026-04-10", priority: "high", hours_spent: 0 },
          { volunteer_id: vols[0].id, title: "নতুন শিক্ষার্থী তালিকা তৈরি", description: "নতুন সেশনের জন্য শিক্ষার্থী তালিকা প্রস্তুত।", status: "in_progress", due_date: "2026-03-15", priority: "medium", hours_spent: 3 },
        ];
        for (const t of tasksData) {
          const { error } = await safeInsert("volunteer_tasks", t);
          addResult("volunteer_tasks", !error, error?.message || `Task: ${t.title}`);
        }
      }
    } catch (e: any) { addResult("volunteer_tasks", false, e.message); }

    // 9. Income Records
    const incomeData = [
      { title: "কর্পোরেট স্পন্সরশিপ - জানুয়ারি", amount: 50000, source: "ABC কোম্পানি লিমিটেড", description: "শিক্ষা প্রকল্পের জন্য কর্পোরেট স্পন্সরশিপ।", income_date: "2026-01-15", category: "স্পন্সরশিপ", receipt_number: "INC-2026-001" },
      { title: "ব্যক্তিগত অনুদান - ফেব্রুয়ারি", amount: 75000, source: "বিভিন্ন দাতা", description: "ফেব্রুয়ারি মাসের সমষ্টিগত ব্যক্তিগত অনুদান।", income_date: "2026-02-01", category: "অনুদান", receipt_number: "INC-2026-002" },
    ];
    for (const inc of incomeData) {
      try { const { error } = await safeInsert("income_records", inc); addResult("income_records", !error, error?.message || `Income: ${inc.title}`); } catch (e: any) { addResult("income_records", false, e.message); }
    }

    // 10. Expenses
    const expensesData = [
      { title: "শিক্ষা উপকরণ ক্রয়", amount: 15000, category: "শিক্ষা", description: "১০০ শিশুর জন্য বই, খাতা ও কলম।", expense_date: "2026-02-01", approved_by: "ইস্তিয়াক আহমেদ", receipt_number: "EXP-2026-001" },
      { title: "অফিস ভাড়া - জানুয়ারি", amount: 20000, category: "প্রশাসনিক", description: "মিরপুর অফিসের মাসিক ভাড়া।", expense_date: "2026-01-05", approved_by: "ইস্তিয়াক আহমেদ", receipt_number: "EXP-2026-002" },
      { title: "ইভেন্ট আয়োজন ব্যয়", amount: 35000, category: "ইভেন্ট", description: "শীতবস্ত্র বিতরণ ইভেন্টের ব্যয়।", expense_date: "2026-01-20", approved_by: "ইস্তিয়াক আহমেদ", receipt_number: "EXP-2026-003" },
    ];
    for (const exp of expensesData) {
      try { const { error } = await safeInsert("expenses", exp); addResult("expenses", !error, error?.message || `Expense: ${exp.title}`); } catch (e: any) { addResult("expenses", false, e.message); }
    }

    // 11. Blood Donors (NEW)
    const bloodDonorsData = [
      { name: "রহিমুল ইসলাম", blood_group: "A+", phone: "01712-111001", location: "মিরপুর, ঢাকা", last_donation_date: "2026-01-15", is_available: true },
      { name: "করিম আহমেদ", blood_group: "O-", phone: "01798-222002", location: "চট্টগ্রাম", last_donation_date: "2025-12-01", is_available: true },
      { name: "সালমা আক্তার", blood_group: "B+", phone: "01611-333003", location: "রাজশাহী", last_donation_date: "2026-02-10", is_available: true },
      { name: "নাসিমুল হক", blood_group: "AB+", phone: "01512-444004", location: "সিলেট", last_donation_date: null, is_available: true },
      { name: "ফারুক হোসেন", blood_group: "O+", phone: "01612-555005", location: "খুলনা", last_donation_date: "2025-11-20", is_available: false },
    ];
    for (const bd of bloodDonorsData) {
      try { const { error } = await safeInsert("blood_donors", bd); addResult("blood_donors", !error, error?.message || `Blood Donor: ${bd.name}`); } catch (e: any) { addResult("blood_donors", false, e.message); }
    }

    // 12. Blood Requests
    const bloodData = [
      { patient_name: "রফিকুল ইসলাম", blood_group: "O+", required_date: "2026-03-01", location: "ঢাকা মেডিকেল কলেজ", contact: "01912-345678", status: "pending", bags_needed: 2, reason: "অপারেশন" },
      { patient_name: "নাসরিন আক্তার", blood_group: "A-", required_date: "2026-03-05", location: "বারডেম হাসপাতাল", contact: "01812-654321", status: "pending", bags_needed: 1, reason: "রক্তশূন্যতা" },
    ];
    for (const br of bloodData) {
      try { const { error } = await safeInsert("blood_requests", br); addResult("blood_requests", !error, error?.message || `Blood Request: ${br.patient_name}`); } catch (e: any) { addResult("blood_requests", false, e.message); }
    }

    // 13. Beneficiaries
    const beneficiariesData = [
      { name: "আরিফ হোসেন", age: 10, gender: "male", guardian_name: "করিম হোসেন", guardian_phone: "01712-111222", address: "মিরপুর-১০, ঢাকা", education_level: "৩য় শ্রেণি", status: "active", notes: "মেধাবী ছাত্র", created_by: user?.id },
      { name: "সুমাইয়া আক্তার", age: 8, gender: "female", guardian_name: "জাহানারা বেগম", guardian_phone: "01812-333444", address: "কল্যাণপুর, ঢাকা", education_level: "১ম শ্রেণি", status: "active", notes: "অঙ্কে ভালো", created_by: user?.id },
      { name: "তামিম ইকবাল", age: 12, gender: "male", guardian_name: "ইকবাল হোসেন", guardian_phone: "01912-555666", address: "মোহাম্মদপুর, ঢাকা", education_level: "৫ম শ্রেণি", status: "active", notes: "বিজ্ঞানে ভালো", created_by: user?.id },
    ];
    for (const ben of beneficiariesData) {
      try { const { error } = await safeInsert("beneficiaries", ben); addResult("beneficiaries", !error, error?.message || `Beneficiary: ${ben.name}`); } catch (e: any) { addResult("beneficiaries", false, e.message); }
    }

    // 14. Inventory Items
    const inventoryData = [
      { name: "নোটবুক (২০০ পৃষ্ঠা)", category: "শিক্ষা উপকরণ", quantity: 500, unit: "পিস", min_stock: 100, location: "মূল গুদাম", unit_price: 45, description: "শিক্ষার্থীদের জন্য নোটবুক", created_by: user?.id },
      { name: "বলপেন (নীল)", category: "শিক্ষা উপকরণ", quantity: 1000, unit: "পিস", min_stock: 200, location: "মূল গুদাম", unit_price: 15, description: "শিক্ষার্থীদের জন্য বলপেন", created_by: user?.id },
      { name: "শীতের কম্বল", category: "ত্রাণ সামগ্রী", quantity: 200, unit: "পিস", min_stock: 50, location: "শাখা গুদাম", unit_price: 350, description: "শীতবস্ত্র বিতরণের জন্য", created_by: user?.id },
    ];
    for (const inv of inventoryData) {
      try { const { error } = await safeInsert("inventory_items", inv); addResult("inventory_items", !error, error?.message || `Inventory: ${inv.name}`); } catch (e: any) { addResult("inventory_items", false, e.message); }
    }

    // 15. Gallery Items
    const galleryData = [
      { title: "শিশুদের সাথে শিক্ষা কার্যক্রম", image_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600", category: "শিক্ষা", description: "ক্লাসরুমে শিশুদের পড়াশোনার দৃশ্য" },
      { title: "শীতবস্ত্র বিতরণ", image_url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600", category: "ত্রাণ", description: "শীতকালে গরম কাপড় বিতরণ" },
      { title: "স্বাস্থ্য ক্যাম্প", image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600", category: "স্বাস্থ্য", description: "গ্রামীণ এলাকায় স্বাস্থ্য সেবা" },
      { title: "রক্তদান ক্যাম্প", image_url: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600", category: "রক্তদান", description: "স্বেচ্ছা রক্তদান কার্যক্রম" },
    ];
    for (const g of galleryData) {
      try { const { error } = await safeInsert("gallery_items", g); addResult("gallery_items", !error, error?.message || `Gallery: ${g.title}`); } catch (e: any) { addResult("gallery_items", false, e.message); }
    }

    // 16. Team Members
    const teamData = [
      { name: "ইস্তিয়াক আহমেদ", role: "প্রতিষ্ঠাতা ও চেয়ারম্যান", image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300", bio: "সমাজসেবায় নিবেদিত একজন উদ্যোক্তা।", facebook: "https://facebook.com", display_order: 1, phone: "01712-000001", email: "istiak@shishuful.org" },
      { name: "নাফিসা আহমেদ", role: "নির্বাহী পরিচালক", image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300", bio: "১০ বছরের NGO অভিজ্ঞতাসম্পন্ন।", facebook: "https://facebook.com", display_order: 2, phone: "01712-000002", email: "nafisa@shishuful.org" },
      { name: "মাহমুদুল হাসান", role: "অর্থ পরিচালক", image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300", bio: "চার্টার্ড অ্যাকাউন্ট্যান্ট।", facebook: "https://facebook.com", display_order: 3, phone: "01712-000003", email: "mahmud@shishuful.org" },
    ];
    for (const tm of teamData) {
      try { const { error } = await safeInsert("team_members", tm); addResult("team_members", !error, error?.message || `Team: ${tm.name}`); } catch (e: any) { addResult("team_members", false, e.message); }
    }

    // 17. Reports
    const reportsData = [
      { title: "বার্ষিক প্রতিবেদন ২০২৫", report_type: "annual", file_url: "https://example.com/report-2025.pdf", year: 2025, description: "২০২৫ সালের সম্পূর্ণ কার্যক্রম ও আর্থিক প্রতিবেদন" },
      { title: "ত্রৈমাসিক প্রতিবেদন Q4-2025", report_type: "quarterly", file_url: "https://example.com/q4-2025.pdf", year: 2025, description: "অক্টোবর-ডিসেম্বর ২০২৫ ত্রৈমাসিক প্রতিবেদন" },
    ];
    for (const r of reportsData) {
      try { const { error } = await safeInsert("reports", r); addResult("reports", !error, error?.message || `Report: ${r.title}`); } catch (e: any) { addResult("reports", false, e.message); }
    }

    // 18. Contact Messages
    try {
      const { error } = await safeInsert("contact_messages", {
        name: "করিম সাহেব", email: "karim@example.com", subject: "অনুদান সম্পর্কে জানতে চাই",
        message: "আমি আপনাদের সংগঠনে মাসিক অনুদান দিতে চাই। বিকাশ ও নগদ দুটোই কি গ্রহণ করেন?",
        is_read: false, phone: "01712-999888", user_id: user?.id,
      });
      addResult("contact_messages", !error, error?.message || "Contact message created");
    } catch (e: any) { addResult("contact_messages", false, e.message); }

    // 19. Site Settings
    try {
      const demoFaqs = [
        { id: crypto.randomUUID(), question: "আপনারা কীভাবে কাজ করেন?", answer: "আমরা সুবিধাবঞ্চিত শিশুদের শিক্ষা, স্বাস্থ্য ও খাদ্য সহায়তা দিই।", is_active: true, sort_order: 0 },
        { id: crypto.randomUUID(), question: "কীভাবে অনুদান দিতে পারি?", answer: "বিকাশ, নগদ, ব্যাংক ট্রান্সফার বা ওয়েবসাইটের মাধ্যমে অনুদান দিতে পারেন।", is_active: true, sort_order: 1 },
        { id: crypto.randomUUID(), question: "স্বেচ্ছাসেবক হতে চাইলে কী করতে হবে?", answer: "ওয়েবসাইটে রেজিস্ট্রেশন করুন এবং স্বেচ্ছাসেবক ফর্ম পূরণ করুন।", is_active: true, sort_order: 2 },
        { id: crypto.randomUUID(), question: "অনুদানের অর্থ কোথায় ব্যয় হয়?", answer: "সকল অনুদানের বিস্তারিত হিসাব আমাদের স্বচ্ছতা পেজে প্রকাশিত।", is_active: true, sort_order: 3 },
      ];
      const demoReviews = [
        { id: crypto.randomUUID(), name: "আব্দুর রহমান", role: "নিয়মিত দাতা", image_url: "", text: "শিশুফুল ফাউন্ডেশনের কাজে আমি অত্যন্ত সন্তুষ্ট।", rating: 5, is_active: true, sort_order: 0 },
        { id: crypto.randomUUID(), name: "ফাতেমা বেগম", role: "স্বেচ্ছাসেবক", image_url: "", text: "স্বেচ্ছাসেবক হিসেবে কাজ করে দারুণ অভিজ্ঞতা হয়েছে।", rating: 5, is_active: true, sort_order: 1 },
        { id: crypto.randomUUID(), name: "তানভীর হাসান", role: "কর্পোরেট স্পন্সর", image_url: "", text: "একটি স্বচ্ছ ও দায়বদ্ধ সংগঠন।", rating: 4, is_active: true, sort_order: 2 },
      ];

      const settingsRows = [
        { setting_key: "hero_headline", setting_value: JSON.stringify("প্রতিটি শিশুর হাসি আমাদের অনুপ্রেরণা") },
        { setting_key: "hero_subtext", setting_value: JSON.stringify("সুবিধাবঞ্চিত শিশুদের শিক্ষা, স্বাস্থ্য ও সামাজিক উন্নয়নে আমরা কাজ করি") },
        { setting_key: "cta_button_text", setting_value: JSON.stringify("আমাদের সাথে যুক্ত হোন") },
        { setting_key: "footer_text", setting_value: JSON.stringify("© ২০২৬ শিশুফুল ফাউন্ডেশন। সর্বস্বত্ব সংরক্ষিত।") },
        { setting_key: "payment_bkash", setting_value: JSON.stringify("01712-345678 (পার্সোনাল)") },
        { setting_key: "payment_nagad", setting_value: JSON.stringify("01812-345678") },
        { setting_key: "social_facebook", setting_value: JSON.stringify("https://facebook.com/shishuful") },
        { setting_key: "social_youtube", setting_value: JSON.stringify("https://youtube.com/@shishuful") },
        { setting_key: "social_instagram", setting_value: JSON.stringify("https://instagram.com/shishuful") },
        { setting_key: "social_twitter", setting_value: JSON.stringify("https://twitter.com/shishuful") },
        { setting_key: "social_linkedin", setting_value: JSON.stringify("https://linkedin.com/company/shishuful") },
        { setting_key: "social_whatsapp", setting_value: JSON.stringify("https://wa.me/8801712345678") },
        { setting_key: "social_telegram", setting_value: JSON.stringify("https://t.me/shishuful") },
        { setting_key: "map_embed_url", setting_value: JSON.stringify("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.0!2d90.3654!3d23.8103") },
        { setting_key: "map_url", setting_value: JSON.stringify("https://maps.google.com/?q=23.8103,90.3654") },
        { setting_key: "chat_enabled", setting_value: JSON.stringify("true") },
        { setting_key: "support_chat_enabled", setting_value: JSON.stringify("true") },
        { setting_key: "support_welcome_message", setting_value: JSON.stringify("আমরা সবসময় আপনার পাশে আছি!") },
        { setting_key: "seo_title", setting_value: JSON.stringify("শিশুফুল ফাউন্ডেশন - সুবিধাবঞ্চিত শিশুদের পাশে") },
        { setting_key: "seo_description", setting_value: JSON.stringify("শিশুফুল ফাউন্ডেশন সুবিধাবঞ্চিত শিশুদের শিক্ষা, স্বাস্থ্য ও সামাজিক উন্নয়নে কাজ করে।") },
        { setting_key: "seo_keywords", setting_value: JSON.stringify("চ্যারিটি, এনজিও, শিশু শিক্ষা, অনুদান, বাংলাদেশ") },
        { setting_key: "homepage_faqs", setting_value: JSON.stringify(demoFaqs) },
        { setting_key: "homepage_reviews", setting_value: JSON.stringify(demoReviews) },
        { setting_key: "auto_donation_email", setting_value: JSON.stringify("true") },
        { setting_key: "auto_welcome_email", setting_value: JSON.stringify("true") },
        { setting_key: "auto_volunteer_email", setting_value: JSON.stringify("true") },
        { setting_key: "auto_event_reminder", setting_value: JSON.stringify("true") },
        { setting_key: "donation_email_template", setting_value: JSON.stringify("প্রিয় {{name}}, আপনার ৳{{amount}} অনুদানের জন্য আন্তরিক ধন্যবাদ!") },
        { setting_key: "messenger_url", setting_value: JSON.stringify("https://m.me/shishuful") },
      ];
      const { error } = await supabase.from("site_settings").upsert(settingsRows, { onConflict: "setting_key" });
      addResult("site_settings", !error, error?.message || `Settings created (${settingsRows.length})`);
    } catch (e: any) { addResult("site_settings", false, e.message); }

    // 20. Homepage Sections
    try {
      const { data: existing } = await supabase.from("homepage_sections").select("*").limit(1);
      if (!existing || existing.length === 0) {
        const sectionsList = [
          { section_key: "hero", title: "হিরো সেকশন" }, { section_key: "about", title: "আমাদের সম্পর্কে" },
          { section_key: "projects", title: "প্রকল্পসমূহ" }, { section_key: "impact", title: "আমাদের প্রভাব" },
          { section_key: "goals", title: "লক্ষ্য ও অগ্রগতি" }, { section_key: "donation", title: "অনুদান" },
          { section_key: "events", title: "ইভেন্ট" }, { section_key: "team", title: "আমাদের টিম" },
          { section_key: "blog", title: "ব্লগ" }, { section_key: "gallery", title: "গ্যালারি" },
          { section_key: "transparency", title: "স্বচ্ছতা" }, { section_key: "contact", title: "যোগাযোগ" },
          { section_key: "faq", title: "সচরাচর জিজ্ঞাসা" }, { section_key: "reviews", title: "রিভিউ ও মতামত" },
        ];
        let allOk = true;
        for (let i = 0; i < sectionsList.length; i++) {
          const { error } = await safeInsert("homepage_sections", { ...sectionsList[i], is_visible: true, sort_order: i + 1, display_order: i + 1, position: i + 1 });
          if (error) { allOk = false; addResult("homepage_sections", false, error.message); break; }
        }
        if (allOk) addResult("homepage_sections", true, "Homepage sections created");
      } else {
        addResult("homepage_sections", true, t("seed_already_exists"));
      }
    } catch (e: any) { addResult("homepage_sections", false, e.message); }

    // 21. Policy Pages
    const policyPages = [
      { title: "গোপনীয়তা নীতি", slug: "privacy-policy", type: "policy", status: "published", content: "<h1>গোপনীয়তা নীতি</h1><p>শিশুফুল ফাউন্ডেশন আপনার ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ।</p>", meta_title: "গোপনীয়তা নীতি - শিশুফুল", meta_description: "শিশুফুল ফাউন্ডেশনের গোপনীয়তা নীতি" },
      { title: "ব্যবহারের শর্তাবলী", slug: "terms-and-conditions", type: "policy", status: "published", content: "<h1>ব্যবহারের শর্তাবলী</h1><p>এই ওয়েবসাইট ব্যবহার করে আপনি নিম্নলিখিত শর্তাবলীতে সম্মত হচ্ছেন।</p>", meta_title: "শর্তাবলী - শিশুফুল", meta_description: "ব্যবহারের শর্তাবলী" },
      { title: "কুকি নীতি", slug: "cookies-policy", type: "policy", status: "published", content: "<h1>কুকি নীতি</h1><p>এই ওয়েবসাইট কুকি ব্যবহার করে।</p>", meta_title: "কুকি নীতি - শিশুফুল", meta_description: "কুকি ব্যবহার সম্পর্কে" },
      { title: "রিফান্ড নীতি", slug: "refund-policy", type: "policy", status: "published", content: "<h1>রিফান্ড নীতি</h1><p>অনুদানের অর্থ ফেরতযোগ্য নয়।</p>", meta_title: "রিফান্ড নীতি - শিশুফুল", meta_description: "রিফান্ড সম্পর্কে" },
      { title: "শিশু সুরক্ষা নীতি", slug: "child-protection-policy", type: "policy", status: "published", content: "<h1>শিশু সুরক্ষা নীতি</h1><p>শিশুফুল ফাউন্ডেশন শিশুদের সুরক্ষায় প্রতিশ্রুতিবদ্ধ।</p>", meta_title: "শিশু সুরক্ষা - শিশুফুল", meta_description: "শিশু সুরক্ষা নীতিমালা" },
      { title: "স্বচ্ছতা নীতি", slug: "transparency-policy", type: "policy", status: "published", content: "<h1>স্বচ্ছতা নীতি</h1><p>আমরা সকল আর্থিক লেনদেনে সম্পূর্ণ স্বচ্ছতা বজায় রাখি।</p>", meta_title: "স্বচ্ছতা নীতি - শিশুফুল", meta_description: "স্বচ্ছতা নীতিমালা" },
    ];
    for (const p of policyPages) {
      try { const { error } = await safeUpsert("pages", p, "slug"); addResult("pages", !error, error?.message || `Page: ${p.title}`); } catch (e: any) { addResult("pages", false, e.message); }
    }

    // 22. Branches
    try {
      const { data: existingBranch } = await supabase.from("branches").select("id").eq("name", "মিরপুর শাখা").limit(1);
      if (existingBranch && existingBranch.length > 0) {
        addResult("branches", true, t("seed_already_exists"));
      } else {
        const branchData: Record<string, any> = {
          name: "মিরপুর শাখা", address: "বাড়ি #১২, রোড #৫, মিরপুর-১০, ঢাকা",
          phone: "01712-345678", email: "mirpur@shishuful.org", manager_name: "রাকিব হাসান",
          is_active: true, established_date: "2020-01-01", created_by: user?.id,
        };
        let { error } = await safeInsert("branches", branchData);
        if (error && error.message?.includes("row-level security")) {
          delete branchData.created_by;
          const res = await safeInsert("branches", branchData);
          error = res.error;
        }
        addResult("branches", !error, error?.message || "Branch created");
      }
    } catch (e: any) { addResult("branches", false, e.message); }

    // 23. Chat Messages
    try {
      if (user) {
        const chatData = [
          { channel: "general", user_id: user.id, username: "Admin", message: "সবাইকে স্বাগতম! এটি সাধারণ চ্যানেল।" },
          { channel: "volunteers", user_id: user.id, username: "Admin", message: "স্বেচ্ছাসেবকদের জন্য গুরুত্বপূর্ণ: আগামী শনিবার মিটিং আছে।" },
          { channel: "announcements", user_id: user.id, username: "Admin", message: "📢 নতুন প্রকল্প শুরু হচ্ছে!" },
        ];
        for (const cm of chatData) {
          const { error } = await safeInsert("chat_messages", cm);
          addResult("chat_messages", !error, error?.message || `Chat: ${cm.channel}`);
        }
      }
    } catch (e: any) { addResult("chat_messages", false, e.message); }

    // 24. Demo Form
    try {
      const formSlug = "volunteer-registration";
      const { data: existingForm } = await supabase.from("custom_forms").select("id").eq("slug", formSlug).limit(1);
      if (!existingForm || existingForm.length === 0) {
        await safeInsert("custom_forms", {
          title: "স্বেচ্ছাসেবক রেজিস্ট্রেশন ফর্ম", slug: formSlug,
          description: "স্বেচ্ছাসেবক হিসেবে যোগ দিতে এই ফর্মটি পূরণ করুন।",
          config: {
            fields: [
              { id: crypto.randomUUID(), label: "পুরো নাম", type: "text", required: true, width: "full" },
              { id: crypto.randomUUID(), label: "ইমেইল", type: "email", required: true, width: "half" },
              { id: crypto.randomUUID(), label: "ফোন নম্বর", type: "phone", required: true, width: "half" },
              { id: crypto.randomUUID(), label: "ঠিকানা", type: "textarea", required: false, width: "full" },
              { id: crypto.randomUUID(), label: "দক্ষতা", type: "select", required: true, options: ["শিক্ষকতা", "গ্রাফিক ডিজাইন", "ফটোগ্রাফি", "ইভেন্ট ম্যানেজমেন্ট", "অন্যান্য"], width: "full" },
            ],
            submit_text: "আবেদন করুন", success_message: "আপনার আবেদন সফলভাবে জমা হয়েছে!", is_public: true,
          },
          is_active: true,
        });
        addResult("custom_forms", true, "Demo form created");
      } else {
        addResult("custom_forms", true, t("seed_already_exists"));
      }
    } catch (e: any) { addResult("custom_forms", false, e.message); }

    // 25. Demo Poll
    try {
      const { data: existingPoll } = await supabase.from("polls").select("id").limit(1);
      if (!existingPoll || existingPoll.length === 0) {
        await safeInsert("polls", {
          question: "আপনি কোন খাতে অনুদান দিতে চান?",
          description: "আপনার পছন্দ জানান।",
          options: [
            { id: crypto.randomUUID(), text: "শিশু শিক্ষা", votes: 45 },
            { id: crypto.randomUUID(), text: "স্বাস্থ্য সেবা", votes: 30 },
            { id: crypto.randomUUID(), text: "খাদ্য সহায়তা", votes: 25 },
            { id: crypto.randomUUID(), text: "শীতবস্ত্র বিতরণ", votes: 20 },
          ],
          is_active: true, show_results: true, total_votes: 120,
        });
        addResult("polls", true, "Demo poll created");
      } else {
        addResult("polls", true, t("seed_already_exists"));
      }
    } catch (e: any) { addResult("polls", false, e.message); }

    // 26. Sponsorships (NEW)
    const sponsorshipsData = [
      { sponsor_name: "ABC কোম্পানি লিমিটেড", sponsor_email: "abc@company.com", sponsor_phone: "01700-111222", amount: 100000, type: "corporate", status: "active", start_date: "2026-01-01", end_date: "2026-12-31", notes: "বার্ষিক কর্পোরেট স্পনসরশিপ" },
      { sponsor_name: "রহমান ফাউন্ডেশন", sponsor_email: "rahman@foundation.org", sponsor_phone: "01800-333444", amount: 50000, type: "individual", status: "active", start_date: "2026-01-01", end_date: "2026-06-30", notes: "শিক্ষা প্রকল্পের জন্য" },
    ];
    for (const sp of sponsorshipsData) {
      try { const { error } = await safeInsert("sponsorships", sp); addResult("sponsorships", !error, error?.message || `Sponsorship: ${sp.sponsor_name}`); } catch (e: any) { addResult("sponsorships", false, e.message); }
    }

    // 27. Grants (NEW)
    const grantsData = [
      { title: "UNICEF শিশু শিক্ষা গ্রান্ট", donor_organization: "UNICEF Bangladesh", amount: 500000, status: "approved", start_date: "2026-01-01", end_date: "2026-12-31", description: "সুবিধাবঞ্চিত শিশুদের প্রাথমিক শিক্ষার জন্য গ্রান্ট", reporting_frequency: "quarterly" },
      { title: "সরকারি এনজিও সহায়তা তহবিল", donor_organization: "সমাজসেবা অধিদপ্তর", amount: 200000, status: "pending", start_date: "2026-03-01", end_date: "2027-02-28", description: "এনজিও কার্যক্রম পরিচালনার জন্য সরকারি সহায়তা", reporting_frequency: "annual" },
    ];
    for (const gr of grantsData) {
      try { const { error } = await safeInsert("grants", gr); addResult("grants", !error, error?.message || `Grant: ${gr.title}`); } catch (e: any) { addResult("grants", false, e.message); }
    }

    // 28. Recurring Donations (NEW)
    const recurringData = [
      { donor_name: "সালমা খাতুন", donor_email: "salma@example.com", amount: 1000, frequency: "monthly", status: "active", start_date: "2026-01-01", payment_method: "বিকাশ", next_payment_date: "2026-03-01" },
      { donor_name: "মোঃ আলী", donor_email: "ali@example.com", amount: 5000, frequency: "monthly", status: "active", start_date: "2025-06-01", payment_method: "ব্যাংক ট্রান্সফার", next_payment_date: "2026-03-01" },
      { donor_name: "জাহানারা ইসলাম", donor_email: "jahanara@example.com", amount: 2000, frequency: "quarterly", status: "active", start_date: "2026-01-01", payment_method: "নগদ", next_payment_date: "2026-04-01" },
    ];
    for (const rd of recurringData) {
      try { const { error } = await safeInsert("recurring_donations", rd); addResult("recurring_donations", !error, error?.message || `Recurring: ${rd.donor_name}`); } catch (e: any) { addResult("recurring_donations", false, e.message); }
    }

    // 29. Emergency Campaigns (NEW)
    try {
      const { error } = await safeInsert("emergency_campaigns", {
        title: "বন্যা ত্রাণ তহবিল ২০২৬",
        description: "সিলেট ও সুনামগঞ্জে বন্যায় ক্ষতিগ্রস্তদের জন্য জরুরি ত্রাণ সহায়তা।",
        target_amount: 1000000, current_amount: 250000, is_active: true,
        start_date: "2026-02-01", end_date: "2026-04-30", priority: "high",
      });
      addResult("emergency_campaigns", !error, error?.message || "Emergency campaign created");
    } catch (e: any) { addResult("emergency_campaigns", false, e.message); }

    // 30. Cases (NEW)
    const casesData = [
      { title: "আরিফের চিকিৎসা সহায়তা", description: "আরিফ হোসেন (১০ বছর) হৃদরোগে আক্রান্ত। অপারেশনের জন্য ৫ লক্ষ টাকা প্রয়োজন।", status: "open", priority: "high", category: "চিকিৎসা", assigned_to: user?.id },
      { title: "সুমাইয়ার বৃত্তি আবেদন", description: "সুমাইয়া আক্তার (৮ বছর) মেধাবী ছাত্রী কিন্তু পরিবার আর্থিকভাবে অসচ্ছল।", status: "in_progress", priority: "medium", category: "শিক্ষা", assigned_to: user?.id },
    ];
    for (const cs of casesData) {
      try { const { error } = await safeInsert("cases", cs); addResult("cases", !error, error?.message || `Case: ${cs.title}`); } catch (e: any) { addResult("cases", false, e.message); }
    }

    // 31. Documents (NEW)
    try {
      const docsData = [
        { title: "সংগঠনের নিবন্ধন সার্টিফিকেট", category: "legal", file_url: "https://example.com/registration.pdf", description: "সমাজসেবা অধিদপ্তর থেকে প্রাপ্ত নিবন্ধন সার্টিফিকেট", uploaded_by: user?.id },
        { title: "বার্ষিক অডিট রিপোর্ট ২০২৫", category: "finance", file_url: "https://example.com/audit-2025.pdf", description: "চার্টার্ড অ্যাকাউন্ট্যান্ট দ্বারা নিরীক্ষিত", uploaded_by: user?.id },
      ];
      for (const doc of docsData) {
        const { error } = await safeInsert("documents", doc);
        addResult("documents", !error, error?.message || `Document: ${doc.title}`);
      }
    } catch (e: any) { addResult("documents", false, e.message); }

    setRunning(false);
    toast({ title: t("seed_complete") });
  };

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">{t("seed_title")}</h1>
      </div>

      <Card className="p-6">
        <p className="text-muted-foreground mb-4">{t("seed_desc")}</p>
        <Button onClick={seedAll} disabled={running} className="gap-2">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
          {running ? t("seed_running") : t("seed_run")}
        </Button>
      </Card>

      {results.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg">{t("seed_results")}</h2>
            <Badge variant="default">{successCount} {t("seed_success")}</Badge>
            {failCount > 0 && <Badge variant="destructive">{failCount} {t("seed_failed")}</Badge>}
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