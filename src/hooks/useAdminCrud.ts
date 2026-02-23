import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface UseAdminCrudOptions {
  table: string;
  orderBy?: string;
  ascending?: boolean;
  select?: string;
}

export function useAdminCrud<T extends { id: string }>({ table, orderBy = "created_at", ascending = false, select = "*" }: UseAdminCrudOptions) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from(table).select(select).order(orderBy, { ascending });
    if (error) {
      toast({ title: "ডেটা লোড ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      setItems((data || []) as unknown as T[]);
    }
    setLoading(false);
  }, [table, select, orderBy, ascending]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (item: Partial<T>) => {
    const { error } = await supabase.from(table).insert(item as any);
    if (error) { toast({ title: "তৈরি ব্যর্থ", description: error.message, variant: "destructive" }); return false; }
    toast({ title: "সফলভাবে তৈরি হয়েছে!" });
    fetch();
    return true;
  };

  const update = async (id: string, updates: Partial<T>) => {
    const { error } = await supabase.from(table).update(updates as any).eq("id", id);
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
