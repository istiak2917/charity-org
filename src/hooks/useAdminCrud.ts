import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface UseAdminCrudOptions {
  table: string;
  orderBy?: string;
  ascending?: boolean;
  select?: string;
}

// Auto-retry insert/update by removing unknown columns
async function safeInsert(table: string, item: Record<string, any>, maxRetries = 5): Promise<{ error: any }> {
  let payload = { ...item };
  for (let i = 0; i < maxRetries; i++) {
    const { error } = await supabase.from(table).insert(payload);
    if (!error) return { error: null };
    if (error.code === "PGRST204" && error.message) {
      const match = error.message.match(/Could not find the '(\w+)' column/);
      if (match) {
        delete payload[match[1]];
        continue;
      }
    }
    return { error };
  }
  return { error: { message: "Too many column mismatches" } };
}

async function safeUpdate(table: string, id: string, updates: Record<string, any>, maxRetries = 5): Promise<{ error: any }> {
  let payload = { ...updates };
  for (let i = 0; i < maxRetries; i++) {
    const { error } = await supabase.from(table).update(payload).eq("id", id);
    if (!error) return { error: null };
    if (error.code === "PGRST204" && error.message) {
      const match = error.message.match(/Could not find the '(\w+)' column/);
      if (match) {
        delete payload[match[1]];
        continue;
      }
    }
    return { error };
  }
  return { error: { message: "Too many column mismatches" } };
}

export function useAdminCrud<T extends { id: string }>({ table, orderBy = "created_at", ascending = false, select = "*" }: UseAdminCrudOptions) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from(table).select(select).order(orderBy, { ascending });
    if (error) {
      // If order column doesn't exist, try without ordering
      if (error.code === "PGRST204" || error.message?.includes("column")) {
        const { data: d2, error: e2 } = await supabase.from(table).select(select);
        if (!e2) { setItems((d2 || []) as unknown as T[]); setLoading(false); return; }
      }
      toast({ title: "ডেটা লোড ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      setItems((data || []) as unknown as T[]);
    }
    setLoading(false);
  }, [table, select, orderBy, ascending]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (item: Partial<T>) => {
    const { error } = await safeInsert(table, item as any);
    if (error) { toast({ title: "তৈরি ব্যর্থ", description: error.message, variant: "destructive" }); return false; }
    toast({ title: "সফলভাবে তৈরি হয়েছে!" });
    fetch();
    return true;
  };

  const update = async (id: string, updates: Partial<T>) => {
    const { error } = await safeUpdate(table, id, updates as any);
    if (error) { toast({ title: "আপডেট ব্যর্থ", description: error.message, variant: "destructive" }); return false; }
    toast({ title: "সফলভাবে আপডেট হয়েছে!" });
    fetch();
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast({ title: "ডিলিট ব্যর্থ", description: error.message, variant: "destructive" }); return false; }
    toast({ title: "সফলভাবে মুছে ফেলা হয়েছে!" });
    fetch();
    return true;
  };

  return { items, loading, fetch, create, update, remove };
}
