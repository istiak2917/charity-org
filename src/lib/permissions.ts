// ==========================================
// RBAC Permission System — Extended
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
  | "audit"
  | "sponsorships"
  | "grants"
  | "emergency"
  | "cases"
  | "documents"
  | "notifications"
  | "impact"
  | "inventory"
  | "branches"
  | "analytics"
  | "newsletter"
  | "pages";

export type Permission = "view" | "create" | "edit" | "delete";

// Full CRUD shorthand
const FULL: Permission[] = ["view", "create", "edit", "delete"];
const VCE: Permission[] = ["view", "create", "edit"];
const V: Permission[] = ["view"];

// Permission matrix: which roles can do what on which modules
const PERMISSION_MATRIX: Record<AppRole, Partial<Record<Module, Permission[]>>> = {
  super_admin: {
    dashboard: FULL, projects: FULL, donations: FULL, campaigns: FULL,
    finance: FULL, volunteers: FULL, tasks: FULL, events: FULL,
    blood: FULL, blog: FULL, gallery: FULL, team: FULL,
    reports: FULL, messages: FULL, roles: FULL, homepage: FULL,
    settings: FULL, seed: FULL, audit: V,
    sponsorships: FULL, grants: FULL, emergency: FULL, cases: FULL,
    documents: FULL, notifications: FULL, impact: V,
    inventory: FULL, branches: FULL, analytics: V, newsletter: FULL, pages: FULL,
  },
  admin: {
    dashboard: V, projects: VCE, donations: VCE, campaigns: VCE,
    finance: V, volunteers: VCE, tasks: VCE, events: VCE,
    blood: VCE, blog: VCE, gallery: VCE, team: VCE,
    reports: V, messages: ["view", "edit"], roles: V,
    homepage: ["view", "edit"], settings: ["view", "edit"], audit: V,
    sponsorships: VCE, grants: VCE, emergency: VCE, cases: VCE,
    documents: VCE, notifications: VCE, impact: V,
    inventory: VCE, branches: VCE, analytics: V, newsletter: VCE, pages: VCE,
  },
  finance_manager: {
    dashboard: V, donations: VCE, campaigns: VCE,
    finance: FULL, reports: V, grants: FULL, sponsorships: V,
  },
  content_manager: {
    dashboard: V, blog: FULL, gallery: FULL, events: VCE,
    homepage: ["view", "edit"], team: VCE, pages: FULL, newsletter: VCE,
  },
  volunteer_manager: {
    dashboard: V, volunteers: FULL, tasks: FULL, events: V,
  },
  blood_manager: {
    dashboard: V, blood: FULL,
  },
  editor: {
    dashboard: V, blog: VCE, gallery: VCE, events: VCE, pages: VCE,
  },
  viewer: {
    dashboard: V, projects: V, donations: V, events: V, reports: V, impact: V,
  },
  volunteer: {
    dashboard: V, tasks: V, events: V,
  },
  member: {
    dashboard: V, blood: ["view", "create"], donations: ["view", "create"],
  },
};

// Runtime permission overrides (loaded from site_settings)
// Format: { "admin:projects:create": false, "editor:blog:delete": true }
let _permissionOverrides: Record<string, boolean> = {};

export function setPermissionOverrides(overrides: Record<string, boolean>) {
  _permissionOverrides = overrides || {};
}

export function getPermissionOverrides(): Record<string, boolean> {
  return _permissionOverrides;
}

/** Get default permission (from static matrix, ignoring overrides) */
export function getDefaultPermission(role: AppRole, module: Module, permission: Permission): boolean {
  return PERMISSION_MATRIX[role]?.[module]?.includes(permission) ?? false;
}

/**
 * Check if any of the given roles has a specific permission on a module
 * Checks runtime overrides first, then falls back to static matrix
 */
export function hasPermission(
  roles: string[],
  module: Module,
  permission: Permission
): boolean {
  return roles.some((role) => {
    const overrideKey = `${role}:${module}:${permission}`;
    if (overrideKey in _permissionOverrides) {
      return _permissionOverrides[overrideKey];
    }
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
  sponsorships: "স্পনসরশিপ",
  grants: "গ্রান্ট",
  emergency: "জরুরি ক্যাম্পেইন",
  cases: "কেস ট্র্যাকিং",
  documents: "ডকুমেন্ট",
  notifications: "নোটিফিকেশন",
  impact: "ইমপ্যাক্ট",
  inventory: "ইনভেন্টরি",
  branches: "শাখা",
  analytics: "অ্যানালিটিক্স",
  newsletter: "নিউজলেটার",
  pages: "পেজ",
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
