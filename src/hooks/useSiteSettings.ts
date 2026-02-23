import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface SiteSettings {
  [key: string]: string;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("settings").select("key, value");
      if (data) {
        const map: SiteSettings = {};
        data.forEach((s) => {
          map[s.key] = typeof s.value === "string"
            ? s.value.replace(/^"|"$/g, "")
            : JSON.stringify(s.value).replace(/^"|"$/g, "");
        });
        setSettings(map);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { settings, loading };
}

export interface HomepageSection {
  id: string;
  section_key: string;
  title: string;
  is_visible: boolean;
  display_order: number;
  config: any;
}

export function useHomepageSections() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("homepage_sections")
        .select("*")
        .order("display_order", { ascending: true });
      if (data) setSections(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return { sections, loading };
}
