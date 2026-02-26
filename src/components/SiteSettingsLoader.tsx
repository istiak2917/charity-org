import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { setPermissionOverrides } from "@/lib/permissions";

/**
 * Loads permission overrides and theme colors from site_settings on mount.
 * Place inside the app tree (after providers).
 */
const SiteSettingsLoader = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      if (!data) return;

      // Load permission overrides
      const permRow = data.find((s: any) => (s.setting_key || s.key) === "permission_overrides");
      if (permRow) {
        try {
          const val = permRow.setting_value || permRow.value || "{}";
          const parsed = JSON.parse(typeof val === "string" ? val.replace(/^"|"$/g, "") : JSON.stringify(val));
          setPermissionOverrides(parsed);
        } catch { /* ignore */ }
      }

      // Load theme colors
      const colorKeys = ["theme_primary", "theme_accent", "theme_background", "theme_foreground", "theme_card", "theme_muted"];
      const cssVarMap: Record<string, string> = {
        theme_primary: "--primary",
        theme_accent: "--accent",
        theme_background: "--background",
        theme_foreground: "--foreground",
        theme_card: "--card",
        theme_muted: "--muted",
      };

      data.forEach((s: any) => {
        const k = s.setting_key || s.key || "";
        const raw = s.setting_value || s.value || "";
        if (colorKeys.includes(k)) {
          const val = typeof raw === "string" ? raw.replace(/^"|"$/g, "") : "";
          if (val.trim()) {
            document.documentElement.style.setProperty(cssVarMap[k], val.trim());
          }
        }
      });
    };
    load();
  }, []);

  return <>{children}</>;
};

export default SiteSettingsLoader;
