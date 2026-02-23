// ==========================================
// RBAC Permission System
// ==========================================

export type AppRole =
  | "super_admin"
  | "admin"
  | "finance_manager"
  | "content_manager"
  | "volunteer_manager"
  | "blood_manager"
  | "viewer"
  | "editor"
  | "volunteer"
  | "member";

export type Module =
  | "dashboard"
  | "projects"
  | "donations"
  | "campaigns"
  | "finance"
  | "volunteers"
  | "tasks"
  | "events"
  | "blood"
  | "blog"
  | "gallery"
  | "team"
  | "reports"
  | "messages"
  | "roles"
  | "homepage"
  | "settings"
  | "seed"
  | "audit";

export type Permission = "view" | "create" | "edit" | "delete";

// Permission matrix: which roles can do what on which modules
const PERMISSION_MATRIX: Record<AppRole, Partial<Record<Module, Permission[]>>> = {
  super_admin: {
    dashboard: ["view", "create", "edit", "delete"],
    projects: ["view", "create", "edit", "delete"],
    donations: ["view", "create", "edit", "delete"],
    campaigns: ["view", "create", "edit", "delete"],
    finance: ["view", "create", "edit", "delete"],
    volunteers: ["view", "create", "edit", "delete"],
    tasks: ["view", "create", "edit", "delete"],
    events: ["view", "create", "edit", "delete"],
    blood: ["view", "create", "edit", "delete"],
    blog: ["view", "create", "edit", "delete"],
    gallery: ["view", "create", "edit", "delete"],
    team: ["view", "create", "edit", "delete"],
    reports: ["view", "create", "edit", "delete"],
    messages: ["view", "create", "edit", "delete"],
    roles: ["view", "create", "edit", "delete"],
    homepage: ["view", "create", "edit", "delete"],
    settings: ["view", "create", "edit", "delete"],
    seed: ["view", "create", "edit", "delete"],
    audit: ["view"],
  },
  admin: {
    dashboard: ["view"],
    projects: ["view", "create", "edit"],
    donations: ["view", "create", "edit"],
    campaigns: ["view", "create", "edit"],
    finance: ["view"],
    volunteers: ["view", "create", "edit"],
    tasks: ["view", "create", "edit"],
    events: ["view", "create", "edit"],
    blood: ["view", "create", "edit"],
    blog: ["view", "create", "edit"],
    gallery: ["view", "create", "edit"],
    team: ["view", "create", "edit"],
    reports: ["view"],
    messages: ["view", "edit"],
    roles: ["view"],
    homepage: ["view", "edit"],
    settings: ["view", "edit"],
    audit: ["view"],
  },
  finance_manager: {
    dashboard: ["view"],
    donations: ["view", "create", "edit"],
    campaigns: ["view", "create", "edit"],
    finance: ["view", "create", "edit", "delete"],
    reports: ["view"],
  },
  content_manager: {
    dashboard: ["view"],
    blog: ["view", "create", "edit", "delete"],
    gallery: ["view", "create", "edit", "delete"],
    events: ["view", "create", "edit"],
    homepage: ["view", "edit"],
    team: ["view", "create", "edit"],
  },
  volunteer_manager: {
    dashboard: ["view"],
    volunteers: ["view", "create", "edit", "delete"],
    tasks: ["view", "create", "edit", "delete"],
    events: ["view"],
  },
  blood_manager: {
    dashboard: ["view"],
    blood: ["view", "create", "edit", "delete"],
  },
  editor: {
    dashboard: ["view"],
    blog: ["view", "create", "edit"],
    gallery: ["view", "create", "edit"],
    events: ["view", "create", "edit"],
  },
  viewer: {
    dashboard: ["view"],
    projects: ["view"],
    donations: ["view"],
    events: ["view"],
    reports: ["view"],
  },
  volunteer: {
    dashboard: ["view"],
  },
  member: {
    dashboard: ["view"],
  },
};

/**
 * Check if any of the given roles has a specific permission on a module
 */
export function hasPermission(
  roles: string[],
  module: Module,
  permission: Permission
): boolean {
  return roles.some((role) => {
    const perms = PERMISSION_MATRIX[role as AppRole]?.[module];
    return perms?.includes(permission) ?? false;
  });
}

/**
 * Check if any role can view a module (used for menu visibility)
 */
export function canViewModule(roles: string[], module: Module): boolean {
  return hasPermission(roles, module, "view");
}

/**
 * Check if any role can create in a module
 */
export function canCreate(roles: string[], module: Module): boolean {
  return hasPermission(roles, module, "create");
}

/**
 * Check if any role can edit in a module
 */
export function canEdit(roles: string[], module: Module): boolean {
  return hasPermission(roles, module, "edit");
}

/**
 * Check if any role can delete in a module
 */
export function canDelete(roles: string[], module: Module): boolean {
  return hasPermission(roles, module, "delete");
}

/**
 * Get all modules accessible to a set of roles
 */
export function getAccessibleModules(roles: string[]): Module[] {
  const modules = new Set<Module>();
  roles.forEach((role) => {
    const rolePerms = PERMISSION_MATRIX[role as AppRole];
    if (rolePerms) {
      Object.keys(rolePerms).forEach((m) => {
        if (rolePerms[m as Module]?.includes("view")) {
          modules.add(m as Module);
        }
      });
    }
  });
  return Array.from(modules);
}

// Role labels for display
export const ROLE_LABELS: Record<string, string> = {
  super_admin: "সুপার অ্যাডমিন",
  admin: "অ্যাডমিন",
  finance_manager: "ফিন্যান্স ম্যানেজার",
  content_manager: "কন্টেন্ট ম্যানেজার",
  volunteer_manager: "ভলান্টিয়ার ম্যানেজার",
  blood_manager: "ব্লাড ম্যানেজার",
  editor: "এডিটর",
  viewer: "ভিউয়ার",
  volunteer: "স্বেচ্ছাসেবক",
  member: "সদস্য",
};

export const ALL_ROLES: AppRole[] = [
  "super_admin", "admin", "finance_manager", "content_manager",
  "volunteer_manager", "blood_manager", "editor", "viewer",
  "volunteer", "member",
];

// Module labels
export const MODULE_LABELS: Record<Module, string> = {
  dashboard: "ড্যাশবোর্ড",
  projects: "প্রকল্প",
  donations: "অনুদান",
  campaigns: "ক্যাম্পেইন",
  finance: "আয়-ব্যয়",
  volunteers: "স্বেচ্ছাসেবক",
  tasks: "টাস্ক",
  events: "ইভেন্ট",
  blood: "রক্তদান",
  blog: "ব্লগ",
  gallery: "গ্যালারি",
  team: "টিম",
  reports: "রিপোর্ট",
  messages: "মেসেজ",
  roles: "রোল",
  homepage: "হোমপেজ",
  settings: "সেটিংস",
  seed: "ডেমো ডেটা",
  audit: "অডিট লগ",
};

// Menu items with module mapping
export const ADMIN_MENU_ITEMS: { module: Module; label: string; path: string; icon: string }[] = [
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
];
