import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { SectionBlock } from "@/types/homepage-builder";

// ========== Individual Block Components ==========

const HeroBlock = ({ content }: { content: any }) => (
  <div className="relative py-20 px-6 text-center bg-gradient-to-br from-primary/10 to-primary/5">
    <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">{content?.heading || "শিরোনাম"}</h1>
    <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">{content?.subheading || "উপশিরোনাম"}</p>
    {content?.buttonText && (
      <a href={content.buttonUrl || "#"} className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:opacity-90 transition">
        {content.buttonText}
      </a>
    )}
  </div>
);

const AboutBlock = ({ content }: { content: any }) => (
  <div className="py-12 px-6 max-w-4xl mx-auto text-center">
    <h2 className="text-3xl font-bold font-heading mb-4">{content?.title || "আমাদের সম্পর্কে"}</h2>
    <p className="text-muted-foreground leading-relaxed">{content?.description}</p>
  </div>
);

const MissionBlock = ({ content }: { content: any }) => (
  <div className="py-10 px-6 max-w-3xl mx-auto">
    <h3 className="text-2xl font-bold font-heading mb-3">{content?.title || "মিশন"}</h3>
    <p className="text-muted-foreground">{content?.text}</p>
  </div>
);

const VisionBlock = ({ content }: { content: any }) => (
  <div className="py-10 px-6 max-w-3xl mx-auto">
    <h3 className="text-2xl font-bold font-heading mb-3">{content?.title || "ভিশন"}</h3>
    <p className="text-muted-foreground">{content?.text}</p>
  </div>
);

const FeatureGridBlock = ({ content }: { content: any }) => {
  const cols = content?.columns || 3;
  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold font-heading text-center mb-8">{content?.title || ""}</h2>
      <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-6`}>
        {(content?.features || []).map((f: any, i: number) => (
          <div key={i} className="border rounded-xl p-6 bg-card text-center">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h4 className="font-semibold mb-2">{f.title}</h4>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const IconGridBlock = ({ content }: { content: any }) => {
  const cols = content?.columns || 4;
  return (
    <div className="py-10 px-6 max-w-5xl mx-auto">
      <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-4`}>
        {(content?.items || []).map((item: any, i: number) => (
          <div key={i} className="text-center p-4">
            <div className="text-4xl mb-2">{item.icon}</div>
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CounterBlock = ({ content }: { content: any }) => (
  <div className="py-12 px-6 bg-primary/5">
    <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      {(content?.items || []).map((item: any, i: number) => (
        <div key={i}>
          <div className="text-4xl font-bold text-primary">{item.value}{item.suffix}</div>
          <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  </div>
);

const CTABlock = ({ content }: { content: any }) => (
  <div className="py-16 px-6 text-center bg-primary text-primary-foreground">
    <h2 className="text-3xl font-bold mb-4">{content?.heading || "যোগ দিন"}</h2>
    <p className="mb-6 opacity-90">{content?.subheading}</p>
    {content?.buttonText && (
      <a href={content.buttonUrl || "#"} className="inline-block bg-background text-foreground px-8 py-3 rounded-lg font-medium hover:opacity-90 transition">
        {content.buttonText}
      </a>
    )}
  </div>
);

const DonationProgressBlock = ({ content }: { content: any }) => {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    supabase.from("donations").select("amount").then(({ data }) => {
      if (data) setTotal(data.reduce((s, d) => s + (d.amount || 0), 0));
    });
  }, []);
  const goal = content?.goal || 100000;
  const pct = Math.min((total / goal) * 100, 100);
  return (
    <div className="py-12 px-6 max-w-2xl mx-auto text-center">
      <h3 className="text-2xl font-bold mb-4">{content?.title || "ডোনেশন"}</h3>
      <div className="w-full bg-muted rounded-full h-4 mb-2">
        <div className="bg-primary h-4 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-sm text-muted-foreground">৳{total.toLocaleString()} / ৳{goal.toLocaleString()}</p>
    </div>
  );
};

const TestimonialBlock = ({ content }: { content: any }) => (
  <div className="py-12 px-6 max-w-4xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {(content?.testimonials || []).map((t: any, i: number) => (
        <div key={i} className="border rounded-xl p-6 bg-card">
          <p className="italic text-muted-foreground mb-4">"{t.text}"</p>
          <div className="font-semibold">{t.name}</div>
          <div className="text-xs text-muted-foreground">{t.role}</div>
        </div>
      ))}
    </div>
  </div>
);

const FAQBlock = ({ content }: { content: any }) => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="py-12 px-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">{content?.title || "FAQ"}</h2>
      <div className="space-y-2">
        {(content?.items || []).map((item: any, i: number) => (
          <div key={i} className="border rounded-lg">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left p-4 font-medium flex justify-between items-center">
              {item.question}
              <span>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <div className="px-4 pb-4 text-muted-foreground text-sm">{item.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

const BlogPreviewBlock = ({ content }: { content: any }) => {
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("blog_posts").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(content?.limit || 3)
      .then(({ data }) => data && setPosts(data));
  }, [content?.limit]);
  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">{content?.title || "ব্লগ"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map(p => (
          <div key={p.id} className="border rounded-xl p-5 bg-card">
            <h4 className="font-semibold mb-2">{p.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">{p.excerpt || p.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const EventsPreviewBlock = ({ content }: { content: any }) => {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("events").select("*").order("event_date", { ascending: true }).limit(content?.limit || 4)
      .then(({ data }) => data && setEvents(data));
  }, [content?.limit]);
  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">{content?.title || "ইভেন্ট"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(e => (
          <div key={e.id} className="border rounded-xl p-5 bg-card">
            <h4 className="font-semibold">{e.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{e.location}</p>
            <p className="text-xs text-primary mt-1">{new Date(e.event_date).toLocaleDateString("bn-BD")}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const GalleryGridBlock = ({ content }: { content: any }) => {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("gallery_items").select("*").order("created_at", { ascending: false }).limit(content?.limit || 8)
      .then(({ data }) => data && setItems(data));
  }, [content?.limit]);
  const cols = content?.columns || 4;
  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">{content?.title || "গ্যালারি"}</h2>
      <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-3`}>
        {items.map(g => (
          <div key={g.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img src={g.image_url} alt={g.title} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};

const TeamGridBlock = ({ content }: { content: any }) => {
  const [members, setMembers] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("team_members").select("*").order("created_at", { ascending: true })
      .then(({ data }) => data && setMembers(data));
  }, []);
  const cols = content?.columns || 3;
  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">{content?.title || "আমাদের টিম"}</h2>
      <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-6`}>
        {members.map(m => (
          <div key={m.id} className="text-center">
            {m.image_url && <img src={m.image_url} alt={m.name} className="w-24 h-24 rounded-full mx-auto mb-3 object-cover" />}
            <h4 className="font-semibold">{m.name}</h4>
            <p className="text-sm text-muted-foreground">{m.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomHTMLBlock = ({ content }: { content: any }) => (
  <div className="py-6 px-6" dangerouslySetInnerHTML={{ __html: content?.html || "" }} />
);

const SpacerBlock = ({ content }: { content: any }) => (
  <div style={{ height: content?.height || "40px" }} />
);

const DividerBlock = ({ content }: { content: any }) => (
  <div className="px-6 py-2">
    <hr style={{
      borderStyle: content?.style || "solid",
      borderColor: content?.color || "hsl(var(--border))",
      width: content?.width || "100%",
    }} />
  </div>
);

// ========== Block Renderer Map ==========
const BLOCK_RENDERERS: Record<string, React.ComponentType<{ content: any }>> = {
  hero: HeroBlock,
  about: AboutBlock,
  mission: MissionBlock,
  vision: VisionBlock,
  feature_grid: FeatureGridBlock,
  icon_grid: IconGridBlock,
  counter: CounterBlock,
  cta: CTABlock,
  donation_progress: DonationProgressBlock,
  testimonial_slider: TestimonialBlock,
  faq_accordion: FAQBlock,
  blog_preview: BlogPreviewBlock,
  events_preview: EventsPreviewBlock,
  gallery_grid: GalleryGridBlock,
  team_grid: TeamGridBlock,
  custom_html: CustomHTMLBlock,
  spacer: SpacerBlock,
  divider: DividerBlock,
};

interface BlockRendererProps {
  block: SectionBlock;
  isEditing?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const BlockRenderer = ({ block, isEditing, isSelected, onClick, onMoveUp, onMoveDown, onDelete, onDuplicate }: BlockRendererProps) => {
  const Comp = BLOCK_RENDERERS[block.block_type];
  if (!Comp) return <div className="p-4 text-muted-foreground text-center text-sm">অজানা ব্লক: {block.block_type}</div>;

  const blockContent = block.content || block.config || {};

  if (!isEditing) {
    return <Comp content={blockContent} />;
  }

  return (
    <div
      className={`relative group border-2 rounded-lg transition-colors cursor-pointer ${isSelected ? "border-primary" : "border-transparent hover:border-primary/30"}`}
      onClick={onClick}
    >
      {/* Toolbar */}
      <div className="absolute -top-8 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
        <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">{block.block_type}</span>
        <div className="ml-auto flex gap-1">
          {onMoveUp && <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="bg-background border rounded p-0.5 text-xs hover:bg-muted">↑</button>}
          {onMoveDown && <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="bg-background border rounded p-0.5 text-xs hover:bg-muted">↓</button>}
          {onDuplicate && <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="bg-background border rounded p-0.5 text-xs hover:bg-muted">⧉</button>}
          {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="bg-destructive text-destructive-foreground rounded p-0.5 text-xs hover:opacity-80">✕</button>}
        </div>
      </div>
      <Comp content={blockContent} />
    </div>
  );
};

export default BlockRenderer;
