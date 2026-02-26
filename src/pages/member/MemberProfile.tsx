import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Shield, Settings } from "lucide-react";

interface ProfileData {
  full_name: string;
  username: string;
  phone: string;
  address: string;
  avatar_url: string;
  bio: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  occupation: string;
  social_facebook: string;
  social_linkedin: string;
  custom_fields: Record<string, string>;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const MemberProfile = () => {
  const { user, roles } = useAuth();
  const { lang } = useLanguage();
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "", username: "", phone: "", address: "", avatar_url: "",
    bio: "", date_of_birth: "", gender: "", blood_group: "", occupation: "",
    social_facebook: "", social_linkedin: "", custom_fields: {},
  });
  const [customFieldDefs, setCustomFieldDefs] = useState<{ key: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const lb = (bn: string, en: string) => lang === "bn" ? bn : en;

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          username: data.username || "",
          phone: data.phone || "",
          address: data.address || "",
          avatar_url: data.avatar_url || "",
          bio: data.bio || "",
          date_of_birth: data.date_of_birth || "",
          gender: data.gender || "",
          blood_group: data.blood_group || "",
          occupation: data.occupation || "",
          social_facebook: data.social_facebook || "",
          social_linkedin: data.social_linkedin || "",
          custom_fields: data.custom_fields || {},
        });
      }
      // Load admin-defined custom fields
      const { data: sData } = await supabase.from("site_settings").select("*");
      if (sData) {
        const cfRow = sData.find((s: any) => (s.setting_key || s.key) === "profile_custom_fields");
        if (cfRow) {
          try {
            const val = cfRow.setting_value || cfRow.value || "[]";
            const parsed = JSON.parse(typeof val === "string" ? val.replace(/^"|"$/g, "") : JSON.stringify(val));
            if (Array.isArray(parsed)) setCustomFieldDefs(parsed);
          } catch {}
        }
      }
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  const save = async () => {
    if (!user) return;
    const payload: any = { ...profile, updated_at: new Date().toISOString() };
    // Remove empty optional fields to avoid column errors
    Object.keys(payload).forEach(k => { if (payload[k] === "") delete payload[k]; });
    payload.full_name = profile.full_name;
    if (profile.username) payload.username = profile.username;
    
    const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
    if (error) toast({ title: lb("সেভ ব্যর্থ", "Save failed"), description: error.message, variant: "destructive" });
    else toast({ title: lb("প্রোফাইল আপডেট হয়েছে!", "Profile updated!") });
  };

  const updateField = (key: keyof ProfileData, value: string) => setProfile({ ...profile, [key]: value });
  const updateCustom = (key: string, value: string) => setProfile({ ...profile, custom_fields: { ...profile.custom_fields, [key]: value } });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">{lb("আমার প্রোফাইল", "My Profile")}</h1>

      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic" className="gap-1"><User className="h-3.5 w-3.5" /> {lb("মৌলিক", "Basic")}</TabsTrigger>
          <TabsTrigger value="details" className="gap-1"><Settings className="h-3.5 w-3.5" /> {lb("বিস্তারিত", "Details")}</TabsTrigger>
          <TabsTrigger value="security" className="gap-1"><Shield className="h-3.5 w-3.5" /> {lb("নিরাপত্তা", "Security")}</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card className="p-6 space-y-4">
            {/* Avatar & Roles */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-2xl">{(profile.full_name || "U")[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex flex-wrap gap-2 mb-1">
                  {roles.map((r) => <Badge key={r} variant={r === "super_admin" ? "destructive" : "default"}>{r}</Badge>)}
                </div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("পুরো নাম", "Full Name")}</label>
                <Input value={profile.full_name} onChange={(e) => updateField("full_name", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("ইউজারনেম", "Username")}</label>
                <Input value={profile.username} onChange={(e) => updateField("username", e.target.value)} placeholder="@username" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("ফোন", "Phone")}</label>
                <Input value={profile.phone} onChange={(e) => updateField("phone", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("পেশা", "Occupation")}</label>
                <Input value={profile.occupation} onChange={(e) => updateField("occupation", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{lb("ঠিকানা", "Address")}</label>
              <Input value={profile.address} onChange={(e) => updateField("address", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{lb("প্রোফাইল ছবি URL", "Avatar URL")}</label>
              <Input value={profile.avatar_url} onChange={(e) => updateField("avatar_url", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{lb("সংক্ষিপ্ত বায়ো", "Short Bio")}</label>
              <Textarea value={profile.bio} onChange={(e) => updateField("bio", e.target.value)} rows={3} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">{lb("ব্যক্তিগত তথ্য", "Personal Info")}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("জন্ম তারিখ", "Date of Birth")}</label>
                <Input type="date" value={profile.date_of_birth} onChange={(e) => updateField("date_of_birth", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("লিঙ্গ", "Gender")}</label>
                <Select value={profile.gender} onValueChange={(v) => updateField("gender", v)}>
                  <SelectTrigger><SelectValue placeholder={lb("বাছাই করুন", "Select")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{lb("পুরুষ", "Male")}</SelectItem>
                    <SelectItem value="female">{lb("মহিলা", "Female")}</SelectItem>
                    <SelectItem value="other">{lb("অন্যান্য", "Other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{lb("রক্তের গ্রুপ", "Blood Group")}</label>
                <Select value={profile.blood_group} onValueChange={(v) => updateField("blood_group", v)}>
                  <SelectTrigger><SelectValue placeholder={lb("বাছাই করুন", "Select")} /></SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <h2 className="font-semibold text-lg mt-4">{lb("সোশ্যাল মিডিয়া", "Social Media")}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Facebook</label>
                <Input value={profile.social_facebook} onChange={(e) => updateField("social_facebook", e.target.value)} placeholder="https://facebook.com/..." />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">LinkedIn</label>
                <Input value={profile.social_linkedin} onChange={(e) => updateField("social_linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
              </div>
            </div>

            {/* Custom Fields */}
            {customFieldDefs.length > 0 && (
              <>
                <h2 className="font-semibold text-lg mt-4">{lb("অতিরিক্ত তথ্য", "Additional Info")}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {customFieldDefs.map((cf) => (
                    <div key={cf.key} className="space-y-1">
                      <label className="text-sm font-medium">{cf.label}</label>
                      <Input
                        value={profile.custom_fields[cf.key] || ""}
                        onChange={(e) => updateCustom(cf.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">{lb("অ্যাকাউন্ট তথ্য", "Account Info")}</h2>
            <div className="text-sm space-y-2">
              <p><span className="font-medium">{lb("ইমেইল", "Email")}:</span> {user?.email}</p>
              <p><span className="font-medium">{lb("রোল", "Roles")}:</span> {roles.join(", ") || "member"}</p>
              <p><span className="font-medium">{lb("অ্যাকাউন্ট তৈরি", "Account Created")}:</span> {user?.created_at ? new Date(user.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US") : "-"}</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={save} className="gap-2"><Save className="h-4 w-4" /> {lb("সেভ করুন", "Save")}</Button>
    </div>
  );
};

export default MemberProfile;
