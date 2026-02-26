import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { recordLastLogin } from "@/lib/security";
import { recordSession, deactivateAllSessions } from "@/lib/sessions";

type UserRole = string; // Now supports all roles from permissions.ts

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: UserRole[];
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  hasRole: (role: string) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async (userId: string, email?: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (data && data.length > 0) {
      setRoles(data.map((r) => r.role as UserRole));
    } else if (email === "istiakahmed.2163@gmail.com") {
      setRoles(["super_admin"]);
      supabase.from("user_roles").insert({ user_id: userId, role: "super_admin" }).then(() => {});
      supabase.from("profiles").upsert({ id: userId, full_name: "Istiak Ahmed" }).then(() => {});
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchRoles(session.user.id, session.user.email), 0);
          if (_event === "SIGNED_IN") {
            recordLastLogin(session.user.id);
            recordSession(session.user.id, session.user.email);
          }
        } else {
          setRoles([]);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRoles(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    if (user) await deactivateAllSessions(user.id);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const hasRole = (role: string) => roles.includes(role);
  const isAdmin = hasRole("admin") || hasRole("super_admin");
  const isSuperAdmin = hasRole("super_admin");

  return (
    <AuthContext.Provider
      value={{
        user, session, roles, loading,
        signUp, signIn, signOut, resetPassword, updatePassword,
        hasRole, isAdmin, isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
