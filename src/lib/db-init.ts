import { supabase } from "./supabase";

let initialized = false;

export const checkDatabaseInitialized = async (): Promise<boolean> => {
  if (initialized) return true;
  
  try {
    const { data, error } = await supabase
      .from("organizations")
      .select("id")
      .limit(1);

    if (error) {
      console.warn("Database not initialized or tables missing:", error.message);
      return false;
    }

    initialized = true;
    return true;
  } catch (err) {
    console.warn("Database check failed:", err);
    return false;
  }
};
