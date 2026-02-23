import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface SiteSettings {
  [key: string]: string;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      if (data) {
        const map: SiteSettings = {};
        data.forEach((s: any) => {
          // Handle different possible column names
          const k = s.key || s.setting_key || s.name || "";
          const v = s.value || s.setting_value || "";
          if (k) {
            map[k] = typeof v === "string"
              ? v.replace(/^"|"$/g, "")
              : JSON.stringify(v).replace(/^"|"$/g, "");
          }
        });
        setSettings(map);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  return { settings, loading };
}

export interface HomepageSection {
  id: string;
  section_key: string;
  title: string;
  is_visible: boolean;
  sort_order?: number;
  display_order?: number;
  config: any;
}

export function useHomepageSections() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      const { data } = await supabase
        .from("homepage_sections")
        .select("*");
      if (data) {
        // Sort by whatever order column exists, or by id
        const sorted = [...data].sort((a: any, b: any) => {
          const aOrder = a.sort_order ?? a.display_order ?? a.order_index ?? 0;
          const bOrder = b.sort_order ?? b.display_order ?? b.order_index ?? 0;
          return aOrder - bOrder;
        });
        setSections(sorted);
      }
      setLoading(false);
    };
    fetchSections();
  }, []);

  return { sections, loading };
}
