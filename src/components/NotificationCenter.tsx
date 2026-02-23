import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Heart, Users, Droplets, DollarSign, FileText, CheckCheck, Trash2 } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

const TYPE_ICONS: Record<string, any> = {
  donation: Heart,
  volunteer: Users,
  blood: Droplets,
  expense: DollarSign,
  report: FileText,
  general: Bell,
};

const TYPE_COLORS: Record<string, string> = {
  donation: "text-pink-500",
  volunteer: "text-green-500",
  blood: "text-red-500",
  expense: "text-amber-500",
  report: "text-blue-500",
  general: "text-muted-foreground",
};

// Helper to generate notifications from recent DB activity
const generateNotifications = async (): Promise<Notification[]> => {
  const notifications: Notification[] = [];
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const isoDay = dayAgo.toISOString();

  try {
    const [donRes, volRes, bloodRes, expRes] = await Promise.all([
      supabase.from("donations").select("id, donor_name, amount, created_at").gte("created_at", isoDay).order("created_at", { ascending: false }).limit(10),
      supabase.from("volunteers").select("id, full_name, status, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
      supabase.from("blood_requests").select("id, patient_name, blood_group, status, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
      supabase.from("expenses").select("id, title, amount, status, created_at").order("created_at", { ascending: false }).limit(5),
    ]);

    // Donation notifications
    (donRes.data || []).forEach(d => {
      notifications.push({
        id: `don-${d.id}`,
        type: "donation",
        title: "নতুন অনুদান",
        message: `${d.donor_name || "বেনামী"} ৳${d.amount?.toLocaleString("bn-BD")} অনুদান দিয়েছেন`,
        is_read: false,
        created_at: d.created_at,
      });
    });

    // Volunteer notifications
    (volRes.data || []).forEach(v => {
      notifications.push({
        id: `vol-${v.id}`,
        type: "volunteer",
        title: "নতুন ভলান্টিয়ার আবেদন",
        message: `${v.full_name} স্বেচ্ছাসেবক হিসেবে আবেদন করেছেন`,
        is_read: false,
        created_at: v.created_at,
      });
    });

    // Blood request notifications
    (bloodRes.data || []).forEach(b => {
      notifications.push({
        id: `bld-${b.id}`,
        type: "blood",
        title: "জরুরি রক্তের অনুরোধ",
        message: `${b.patient_name} — ${b.blood_group} গ্রুপের রক্ত প্রয়োজন`,
        is_read: false,
        created_at: b.created_at,
      });
    });

    // Expense notifications (pending approval)
    (expRes.data || []).filter(e => e.status === "pending").forEach(e => {
      notifications.push({
        id: `exp-${e.id}`,
        type: "expense",
        title: "ব্যয় অনুমোদন বাকি",
        message: `"${e.title}" — ৳${e.amount?.toLocaleString("bn-BD")} অনুমোদনের জন্য অপেক্ষমান`,
        is_read: false,
        created_at: e.created_at,
      });
    });
  } catch {
    // Silently fail if tables don't have expected columns
  }

  return notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const items = await generateNotifications();
    setNotifications(items);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAllRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "এইমাত্র";
    if (mins < 60) return `${mins} মিনিট আগে`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ঘণ্টা আগে`;
    return `${Math.floor(hours / 24)} দিন আগে`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">নোটিফিকেশন</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={markAllRead}>
              <CheckCheck className="h-3 w-3" /> সব পড়া হয়েছে
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map(n => {
                const Icon = TYPE_ICONS[n.type] || Bell;
                const color = TYPE_COLORS[n.type] || "text-muted-foreground";
                const isRead = readIds.has(n.id);
                return (
                  <div key={n.id} className={`p-3 flex gap-3 hover:bg-muted/50 transition-colors ${!isRead ? "bg-primary/5" : ""}`}>
                    <div className={`mt-0.5 ${color}`}><Icon className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{n.title}</span>
                        {!isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-muted-foreground">{getTimeAgo(n.created_at)}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => dismissNotification(n.id)}>
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8 text-sm">কোনো নোটিফিকেশন নেই</div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
