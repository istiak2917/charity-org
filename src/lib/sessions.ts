// ==========================================
// User Session & IP Tracking
// ==========================================

import { supabase } from "@/lib/supabase";

export interface UserSession {
  id: string;
  user_id: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: string;
  logged_in_at: string;
  last_active_at: string;
  is_active: boolean;
}

// Get user's public IP
async function getPublicIP(): Promise<string> {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip || "unknown";
  } catch {
    return "unknown";
  }
}

// Parse device info from user agent
function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown";
}

/**
 * Record a new session when user logs in.
 * Checks max session limit and deactivates oldest if exceeded.
 */
export async function recordSession(userId: string, email?: string): Promise<void> {
  const ip = await getPublicIP();
  const device = getDeviceInfo();
  const ua = navigator.userAgent.slice(0, 255);

  // Get max sessions setting
  let maxSessions = 1;
  const { data: setting } = await supabase
    .from("site_settings")
    .select("setting_value")
    .eq("setting_key", "max_sessions_per_user")
    .maybeSingle();
  if (setting?.setting_value) {
    try { maxSessions = parseInt(JSON.parse(setting.setting_value), 10) || 1; } catch { }
  }

  // Get current active sessions
  const { data: activeSessions } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("logged_in_at", { ascending: true });

  // Deactivate excess sessions (keep newest, deactivate oldest)
  if (activeSessions && activeSessions.length >= maxSessions) {
    const toDeactivate = activeSessions.slice(0, activeSessions.length - maxSessions + 1);
    for (const s of toDeactivate) {
      await supabase.from("user_sessions").update({ is_active: false }).eq("id", s.id);
    }
  }

  // Insert new session
  const payload: any = {
    user_id: userId,
    user_email: email || null,
    ip_address: ip,
    user_agent: ua,
    device_info: device,
  };

  // Resilient insert
  for (let i = 0; i < 3; i++) {
    const { error } = await supabase.from("user_sessions").insert(payload);
    if (!error) return;
    if (error.code === "42P01") return; // Table doesn't exist
    const m = error.message?.match(/Could not find the '(\w+)' column/);
    if (m) { delete payload[m[1]]; continue; }
    console.warn("Session record failed:", error.message);
    return;
  }
}

/**
 * Mark all sessions for a user as inactive (on sign out)
 */
export async function deactivateAllSessions(userId: string): Promise<void> {
  await supabase
    .from("user_sessions")
    .update({ is_active: false })
    .eq("user_id", userId);
}

/**
 * Update last active timestamp for heartbeat
 */
export async function heartbeatSession(userId: string): Promise<void> {
  // Update the most recent active session
  const { data } = await supabase
    .from("user_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("logged_in_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data?.id) {
    await supabase
      .from("user_sessions")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", data.id);
  }
}

/**
 * Fetch all sessions (admin view)
 */
export async function fetchAllSessions(options?: {
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ data: UserSession[]; count: number }> {
  let query = supabase
    .from("user_sessions")
    .select("*", { count: "exact" })
    .order("logged_in_at", { ascending: false });

  if (options?.activeOnly) query = query.eq("is_active", true);
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) {
    if (error.code === "42P01") return { data: [], count: 0 };
    console.warn("Session fetch failed:", error.message);
    return { data: [], count: 0 };
  }
  return { data: (data || []) as UserSession[], count: count || 0 };
}

// SQL for creating the tables
export const SESSION_TABLES_SQL = `-- User Sessions & IP Tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email text,
  ip_address text,
  user_agent text,
  device_info text,
  logged_in_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
ON public.user_sessions FOR SELECT TO authenticated
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin')
));

CREATE POLICY "Users can insert own sessions"
ON public.user_sessions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
ON public.user_sessions FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin')
));

CREATE POLICY "Super admin can delete sessions"
ON public.user_sessions FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin')
));

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active);

INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('max_sessions_per_user', '"1"')
ON CONFLICT (setting_key) DO NOTHING;`;
