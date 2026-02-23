// ==========================================
// Audit Log System
// ==========================================

import { supabase } from "@/lib/supabase";

export interface AuditEntry {
  id?: string;
  user_id: string;
  user_email?: string;
  action: "create" | "update" | "delete";
  table_name: string;
  record_id?: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  created_at?: string;
}

/**
 * Log an audit entry. Silently fails if audit_logs table doesn't exist.
 */
export async function logAudit(entry: Omit<AuditEntry, "id" | "created_at">) {
  let payload: any = {
    user_id: entry.user_id,
    user_email: entry.user_email || null,
    action: entry.action,
    table_name: entry.table_name,
    record_id: entry.record_id || null,
    old_value: entry.old_value ? JSON.stringify(entry.old_value) : null,
    new_value: entry.new_value ? JSON.stringify(entry.new_value) : null,
    ip_address: entry.ip_address || null,
  };

  // Resilient insert - strip unknown columns
  for (let i = 0; i < 5; i++) {
    const { error } = await supabase.from("audit_logs").insert(payload);
    if (!error) return;
    if (error.code === "42P01") return; // Table doesn't exist, skip silently
    const m = error.message?.match(/Could not find the '(\w+)' column/);
    if (m) { delete payload[m[1]]; continue; }
    console.warn("Audit log failed:", error.message);
    return;
  }
}

/**
 * Fetch audit logs with pagination
 */
export async function fetchAuditLogs(options: {
  limit?: number;
  offset?: number;
  tableName?: string;
  action?: string;
  userId?: string;
}): Promise<{ data: AuditEntry[]; count: number }> {
  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options.tableName) query = query.eq("table_name", options.tableName);
  if (options.action) query = query.eq("action", options.action);
  if (options.userId) query = query.eq("user_id", options.userId);

  query = query.range(options.offset || 0, (options.offset || 0) + (options.limit || 50) - 1);

  const { data, count, error } = await query;
  if (error) {
    if (error.code === "42P01") return { data: [], count: 0 }; // Table doesn't exist
    console.warn("Audit fetch failed:", error.message);
    return { data: [], count: 0 };
  }
  return { data: (data || []) as AuditEntry[], count: count || 0 };
}

// SQL to create audit_logs table (for user to run in Supabase SQL Editor)
export const AUDIT_LOGS_SQL = `
-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  table_name text NOT NULL,
  record_id text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin')
  )
);

-- Authenticated users can insert audit logs
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
`;
