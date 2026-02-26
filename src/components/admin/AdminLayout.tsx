import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { canViewModule, type Module } from "@/lib/permissions";
import { isSessionExpired, updateLastActivity } from "@/lib/security";
import {
  LayoutDashboard, Heart, Users, Calendar, Menu, X, LogOut, ChevronLeft,
  Newspaper, FolderOpen, Shield, Settings, DollarSign, Image, Droplets,
  ClipboardList, MessageSquare, UserCircle, FileText, Megaphone, Home, Database,
  ScrollText, Contact, HandHeart, Package, Building2, BarChart3, HardDrive, BookOpen,
  Sparkles, Landmark, AlertTriangle, BriefcaseMedical, CalendarDays, ClipboardCheck,
  FolderLock, TrendingUp, Bell, Code, List, MessageCircle, Mail, FlaskConical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationCenter from "@/components/NotificationCenter";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CurrencySelector from "@/components/CurrencySelector";
import ThemeToggle from "@/components/ThemeToggle";
import type { TranslationKey } from "@/lib/translations";

const ICON_MAP: Record<string, any> = {
  LayoutDashboard, FolderOpen, Heart, Megaphone, DollarSign, Users, ClipboardList,
  Calendar, Droplets, Newspaper, Image, UserCircle, FileText, MessageSquare,
  Shield, Home, ScrollText, Settings, Database, Contact, HandHeart, Package, Building2, BarChart3, HardDrive, BookOpen,
  Sparkles, Landmark, AlertTriangle, BriefcaseMedical, CalendarDays, ClipboardCheck,
  FolderLock, TrendingUp, Bell, Code, List, MessageCircle, Mail, FlaskConical,
};

interface MenuItem {
  module: Module;
  labelKey: TranslationKey;
  path: string;
  icon: string;
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { module: "dashboard", labelKey: "admin_dashboard", path: "/admin", icon: "LayoutDashboard" },
  { module: "projects", labelKey: "admin_projects", path: "/admin/projects", icon: "FolderOpen" },
  { module: "donations", labelKey: "admin_donations", path: "/admin/donations", icon: "Heart" },
  { module: "campaigns", labelKey: "admin_campaigns", path: "/admin/campaigns", icon: "Megaphone" },
  { module: "finance", labelKey: "admin_finance", path: "/admin/finance", icon: "DollarSign" },
  { module: "volunteers", labelKey: "admin_volunteers", path: "/admin/volunteers", icon: "Users" },
  { module: "tasks", labelKey: "admin_tasks", path: "/admin/tasks", icon: "ClipboardList" },
  { module: "events", labelKey: "admin_events", path: "/admin/events", icon: "Calendar" },
  { module: "blood", labelKey: "admin_blood", path: "/admin/blood", icon: "Droplets" },
  { module: "blog", labelKey: "admin_blog", path: "/admin/blog", icon: "Newspaper" },
  { module: "gallery", labelKey: "admin_gallery", path: "/admin/gallery", icon: "Image" },
  { module: "team", labelKey: "admin_team", path: "/admin/team", icon: "UserCircle" },
  { module: "reports", labelKey: "admin_reports", path: "/admin/reports", icon: "FileText" },
  { module: "messages", labelKey: "admin_messages", path: "/admin/messages", icon: "MessageSquare" },
  { module: "roles", labelKey: "admin_roles", path: "/admin/roles", icon: "Shield" },
  { module: "homepage", labelKey: "admin_homepage", path: "/admin/homepage", icon: "Home" },
  { module: "audit", labelKey: "admin_audit", path: "/admin/audit", icon: "ScrollText" },
  { module: "settings", labelKey: "admin_settings", path: "/admin/settings", icon: "Settings" },
  { module: "seed", labelKey: "admin_seed", path: "/admin/seed", icon: "Database" },
  { module: "donations", labelKey: "admin_donor_crm", path: "/admin/donor-crm", icon: "Contact" },
  { module: "projects", labelKey: "admin_beneficiaries", path: "/admin/beneficiaries", icon: "HandHeart" },
  { module: "dashboard", labelKey: "admin_inventory", path: "/admin/inventory", icon: "Package" },
  { module: "dashboard", labelKey: "admin_branches", path: "/admin/branches", icon: "Building2" },
  { module: "dashboard", labelKey: "admin_analytics", path: "/admin/analytics", icon: "BarChart3" },
  { module: "dashboard", labelKey: "admin_backup", path: "/admin/backup", icon: "HardDrive" },
  { module: "dashboard", labelKey: "admin_pages", path: "/admin/pages", icon: "BookOpen" },
  { module: "dashboard", labelKey: "admin_newsletter", path: "/admin/newsletter", icon: "MessageSquare" },
  { module: "donations", labelKey: "admin_sponsorships", path: "/admin/sponsorships", icon: "Sparkles" },
  { module: "finance", labelKey: "admin_grants", path: "/admin/grants", icon: "Landmark" },
  { module: "dashboard", labelKey: "admin_emergency", path: "/admin/emergency", icon: "AlertTriangle" },
  { module: "projects", labelKey: "admin_cases", path: "/admin/cases", icon: "BriefcaseMedical" },
  { module: "volunteers", labelKey: "admin_volunteer_calendar", path: "/admin/volunteer-calendar", icon: "CalendarDays" },
  { module: "events", labelKey: "admin_attendance", path: "/admin/attendance", icon: "ClipboardCheck" },
  { module: "dashboard", labelKey: "admin_documents", path: "/admin/documents", icon: "FolderLock" },
  { module: "dashboard", labelKey: "admin_impact", path: "/admin/impact", icon: "TrendingUp" },
  { module: "dashboard", labelKey: "admin_notifications", path: "/admin/notifications", icon: "Bell" },
  { module: "dashboard", labelKey: "admin_directories", path: "/admin/directories", icon: "List" },
  { module: "dashboard", labelKey: "admin_forms", path: "/admin/forms", icon: "FileText" },
  { module: "dashboard", labelKey: "admin_polls", path: "/admin/polls", icon: "BarChart3" },
  { module: "dashboard", labelKey: "admin_faq_reviews", path: "/admin/faq-reviews", icon: "MessageCircle" },
  { module: "dashboard", labelKey: "admin_email_templates", path: "/admin/email-templates", icon: "Mail" },
  { module: "dashboard", labelKey: "admin_webhooks", path: "/admin/webhooks", icon: "Code" },
  { module: "dashboard", labelKey: "admin_ab_testing", path: "/admin/ab-testing", icon: "FlaskConical" },
  { module: "dashboard", labelKey: "admin_advanced_reports", path: "/admin/advanced-reports", icon: "TrendingUp" },
  { module: "audit", labelKey: "admin_sessions" as TranslationKey, path: "/admin/sessions", icon: "Shield" },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, roles } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    updateLastActivity();
    const interval = setInterval(() => {
      if (isSessionExpired()) { signOut(); navigate("/login"); }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = () => updateLastActivity();
    window.addEventListener("click", handler);
    window.addEventListener("keydown", handler);
    return () => { window.removeEventListener("click", handler); window.removeEventListener("keydown", handler); };
  }, []);

  const handleLogout = async () => { await signOut(); navigate("/"); };
  const visibleMenu = ALL_MENU_ITEMS.filter(item => canViewModule(roles, item.module));

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary font-heading">শিশুফুল</span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleMenu.map((item) => {
            const active = location.pathname === item.path;
            const IconComp = ICON_MAP[item.icon] || LayoutDashboard;
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted hover:text-foreground"}`}>
                <IconComp className="h-4 w-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <div className="text-xs text-muted-foreground truncate px-3">{user?.email}</div>
          <div className="text-[10px] text-muted-foreground px-3">{t("admin_role_label")}: {roles.join(", ") || "—"}</div>
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> {t("nav_logout")}
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen min-w-0 max-w-full overflow-hidden">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-2 sm:px-3 h-14 flex items-center gap-1 sm:gap-2 min-w-0 max-w-full">
          <button className="lg:hidden shrink-0" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></button>
          <Link to="/" className="text-xs sm:text-sm text-muted-foreground hover:text-primary flex items-center gap-1 shrink-0">
            <ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">{t("admin_return_site")}</span><span className="sm:hidden">হোম</span>
          </Link>
          <div className="ml-auto flex items-center gap-0.5 sm:gap-1 shrink-0">
            <ThemeToggle size="sm" />
            <LanguageSwitcher size="sm" />
            <span className="hidden sm:inline-flex"><CurrencySelector compact /></span>
            <NotificationCenter />
          </div>
        </header>
        <main className="flex-1 p-2 sm:p-3 md:p-6 w-full min-w-0 max-w-full overflow-x-hidden overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
