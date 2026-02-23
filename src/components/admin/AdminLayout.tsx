import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canViewModule, type Module } from "@/lib/permissions";
import { isSessionExpired, updateLastActivity } from "@/lib/security";
import {
  LayoutDashboard, Heart, Users, Calendar, Menu, X, LogOut, ChevronLeft,
  Newspaper, FolderOpen, Shield, Settings, DollarSign, Image, Droplets,
  ClipboardList, MessageSquare, UserCircle, FileText, Megaphone, Home, Database,
  ScrollText, Contact, HandHeart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationCenter from "@/components/NotificationCenter";

const ICON_MAP: Record<string, any> = {
  LayoutDashboard, FolderOpen, Heart, Megaphone, DollarSign, Users, ClipboardList,
  Calendar, Droplets, Newspaper, Image, UserCircle, FileText, MessageSquare,
  Shield, Home, ScrollText, Settings, Database, Contact, HandHeart,
};

interface MenuItem {
  module: Module;
  label: string;
  path: string;
  icon: string;
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { module: "dashboard", label: "ড্যাশবোর্ড", path: "/admin", icon: "LayoutDashboard" },
  { module: "projects", label: "প্রকল্প", path: "/admin/projects", icon: "FolderOpen" },
  { module: "donations", label: "অনুদান", path: "/admin/donations", icon: "Heart" },
  { module: "campaigns", label: "ক্যাম্পেইন", path: "/admin/campaigns", icon: "Megaphone" },
  { module: "finance", label: "আয়-ব্যয়", path: "/admin/finance", icon: "DollarSign" },
  { module: "volunteers", label: "স্বেচ্ছাসেবক", path: "/admin/volunteers", icon: "Users" },
  { module: "tasks", label: "টাস্ক", path: "/admin/tasks", icon: "ClipboardList" },
  { module: "events", label: "ইভেন্ট", path: "/admin/events", icon: "Calendar" },
  { module: "blood", label: "রক্তদান", path: "/admin/blood", icon: "Droplets" },
  { module: "blog", label: "ব্লগ", path: "/admin/blog", icon: "Newspaper" },
  { module: "gallery", label: "গ্যালারি", path: "/admin/gallery", icon: "Image" },
  { module: "team", label: "টিম", path: "/admin/team", icon: "UserCircle" },
  { module: "reports", label: "রিপোর্ট", path: "/admin/reports", icon: "FileText" },
  { module: "messages", label: "মেসেজ", path: "/admin/messages", icon: "MessageSquare" },
  { module: "roles", label: "রোল ও পারমিশন", path: "/admin/roles", icon: "Shield" },
  { module: "homepage", label: "হোমপেজ", path: "/admin/homepage", icon: "Home" },
  { module: "audit", label: "অডিট লগ", path: "/admin/audit", icon: "ScrollText" },
  { module: "settings", label: "সেটিংস", path: "/admin/settings", icon: "Settings" },
  { module: "seed", label: "ডেমো ডেটা", path: "/admin/seed", icon: "Database" },
  { module: "donations", label: "ডোনার CRM", path: "/admin/donor-crm", icon: "Contact" },
  { module: "projects", label: "উপকারভোগী", path: "/admin/beneficiaries", icon: "HandHeart" },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, roles } = useAuth();

  // Session timeout check
  useEffect(() => {
    updateLastActivity();
    const interval = setInterval(() => {
      if (isSessionExpired()) {
        signOut();
        navigate("/login");
      }
    }, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Track activity
  useEffect(() => {
    const handler = () => updateLastActivity();
    window.addEventListener("click", handler);
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Filter menu items by role permissions
  const visibleMenu = ALL_MENU_ITEMS.filter(item => canViewModule(roles, item.module));

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary font-heading">শিশুফুল</span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleMenu.map((item) => {
            const active = location.pathname === item.path;
            const IconComp = ICON_MAP[item.icon] || LayoutDashboard;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                }`}
              >
                <IconComp className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <div className="text-xs text-muted-foreground truncate px-3">{user?.email}</div>
          <div className="text-[10px] text-muted-foreground px-3">
            রোল: {roles.join(", ") || "—"}
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> লগআউট
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 h-14 flex items-center gap-4">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> সাইটে ফিরুন
          </Link>
          <div className="ml-auto">
            <NotificationCenter />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
