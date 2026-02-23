// ==========================================
// Homepage Builder Types
// ==========================================

export interface SectionConfig {
  layout?: {
    fullWidth?: boolean;
    containerWidth?: string; // e.g. "1200px", "100%"
    columns?: number; // 1-6
    equalHeight?: boolean;
    verticalAlign?: "top" | "center" | "bottom";
    horizontalAlign?: "left" | "center" | "right";
  };
  background?: {
    type?: "solid" | "gradient" | "image" | "video";
    color?: string;
    gradient?: string;
    imageUrl?: string;
    videoUrl?: string;
    overlayColor?: string;
    overlayOpacity?: number;
    parallax?: boolean;
  };
  spacing?: {
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    marginTop?: string;
    marginBottom?: string;
  };
  border?: {
    style?: string;
    width?: string;
    color?: string;
    radius?: string;
    shadow?: string;
  };
  animation?: {
    type?: "none" | "fade-in" | "slide-up" | "slide-left" | "slide-right" | "zoom-in";
    delay?: string;
    duration?: string;
    scrollTrigger?: boolean;
  };
  visibility?: {
    desktop?: boolean;
    tablet?: boolean;
    mobile?: boolean;
    hideWhenLoggedOut?: boolean;
    hideByRole?: string[];
  };
  advanced?: {
    customCss?: string;
    customId?: string;
    customClass?: string;
  };
}

export interface HomepageSection {
  id: string;
  section_key: string;
  title: string;
  subtitle?: string | null;
  content?: any;
  image_url?: string | null;
  is_active?: boolean;
  is_visible?: boolean;
  position: number;
  created_at: string;
}

export interface SectionBlock {
  id: string;
  section_id: string;
  block_type: string;
  title?: string;
  content?: any;
  config?: any;
  position: number;
  is_visible?: boolean;
  created_at?: string;
}

export type BlockType =
  | "hero"
  | "about"
  | "mission"
  | "vision"
  | "feature_grid"
  | "icon_grid"
  | "counter"
  | "cta"
  | "donation_progress"
  | "testimonial_slider"
  | "faq_accordion"
  | "blog_preview"
  | "events_preview"
  | "gallery_grid"
  | "team_grid"
  | "custom_html"
  | "spacer"
  | "divider";

export interface BlockTypeInfo {
  type: BlockType;
  label: string;
  icon: string;
  category: string;
  defaultContent: Record<string, any>;
}

export const BLOCK_TYPES: BlockTypeInfo[] = [
  { type: "hero", label: "হিরো", icon: "🏠", category: "লেআউট", defaultContent: { heading: "শিরোনাম", subheading: "উপশিরোনাম", buttonText: "বিস্তারিত", buttonUrl: "#" } },
  { type: "about", label: "আমাদের সম্পর্কে", icon: "ℹ️", category: "কন্টেন্ট", defaultContent: { title: "আমাদের সম্পর্কে", description: "বিবরণ লিখুন" } },
  { type: "mission", label: "মিশন", icon: "🎯", category: "কন্টেন্ট", defaultContent: { title: "আমাদের মিশন", text: "মিশন বিবরণ" } },
  { type: "vision", label: "ভিশন", icon: "👁️", category: "কন্টেন্ট", defaultContent: { title: "আমাদের ভিশন", text: "ভিশন বিবরণ" } },
  { type: "feature_grid", label: "ফিচার গ্রিড", icon: "📋", category: "গ্রিড", defaultContent: { columns: 3, features: [{ title: "ফিচার ১", desc: "বিবরণ", icon: "⭐" }] } },
  { type: "icon_grid", label: "আইকন গ্রিড", icon: "🔲", category: "গ্রিড", defaultContent: { columns: 4, items: [{ icon: "🎓", label: "আইটেম" }] } },
  { type: "counter", label: "কাউন্টার", icon: "🔢", category: "ডাটা", defaultContent: { items: [{ value: 100, label: "শিশু", suffix: "+" }] } },
  { type: "cta", label: "CTA", icon: "📢", category: "লেআউট", defaultContent: { heading: "যোগ দিন", buttonText: "এখনই শুরু করুন", buttonUrl: "#" } },
  { type: "donation_progress", label: "ডোনেশন প্রোগ্রেস", icon: "💰", category: "ডাটা", defaultContent: { title: "ডোনেশন", showProgress: true } },
  { type: "testimonial_slider", label: "টেস্টিমোনিয়াল", icon: "💬", category: "কন্টেন্ট", defaultContent: { testimonials: [{ name: "নাম", text: "মন্তব্য", role: "সদস্য" }] } },
  { type: "faq_accordion", label: "FAQ", icon: "❓", category: "কন্টেন্ট", defaultContent: { items: [{ question: "প্রশ্ন?", answer: "উত্তর" }] } },
  { type: "blog_preview", label: "ব্লগ প্রিভিউ", icon: "📝", category: "ডাটা", defaultContent: { limit: 3, title: "সাম্প্রতিক ব্লগ" } },
  { type: "events_preview", label: "ইভেন্ট প্রিভিউ", icon: "📅", category: "ডাটা", defaultContent: { limit: 4, title: "আসন্ন ইভেন্ট" } },
  { type: "gallery_grid", label: "গ্যালারি গ্রিড", icon: "🖼️", category: "গ্রিড", defaultContent: { columns: 4, limit: 8, title: "গ্যালারি" } },
  { type: "team_grid", label: "টিম গ্রিড", icon: "👥", category: "গ্রিড", defaultContent: { columns: 3, title: "আমাদের টিম" } },
  { type: "custom_html", label: "কাস্টম HTML", icon: "🧩", category: "অ্যাডভান্সড", defaultContent: { html: "<div>কাস্টম কন্টেন্ট</div>" } },
  { type: "spacer", label: "স্পেসার", icon: "↕️", category: "লেআউট", defaultContent: { height: "40px" } },
  { type: "divider", label: "ডিভাইডার", icon: "➖", category: "লেআউট", defaultContent: { style: "solid", color: "#e5e7eb", width: "100%" } },
];

export const BLOCK_CATEGORIES = ["লেআউট", "কন্টেন্ট", "গ্রিড", "ডাটা", "অ্যাডভান্সড"];
