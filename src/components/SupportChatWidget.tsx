import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle, X, Send, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PresetMessage {
  bn: string;
  en: string;
}

const PRESET_MESSAGES: PresetMessage[] = [
  { bn: "আসসালামু আলাইকুম", en: "Hello" },
  { bn: "আমি অনুদান দিতে চাই", en: "I want to donate" },
  { bn: "স্বেচ্ছাসেবক হতে চাই", en: "I want to volunteer" },
  { bn: "একটি সমস্যা আছে", en: "I have an issue" },
  { bn: "ধন্যবাদ", en: "Thank you" },
];

interface ChatMsg {
  id: string;
  message: string;
  sender: "user" | "support";
  created_at: string;
}

const SupportChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"chat" | "contact">("chat");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const { lang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const lb = (bn: string, en: string) => lang === "bn" ? bn : en;

  // Load settings (WhatsApp, Messenger, support presets)
  useEffect(() => {
    supabase.from("site_settings").select("*").then(({ data }) => {
      if (!data) return;
      const map: Record<string, string> = {};
      data.forEach((s: any) => {
        const k = s.setting_key || s.key || "";
        const v = s.setting_value || s.value || "";
        if (k) map[k] = typeof v === "string" ? v.replace(/^"|"$/g, "") : "";
      });
      setSettings(map);
    });
  }, []);

  // Load support chat messages for this user
  useEffect(() => {
    if (!user || !open) return;
    supabase.from("chat_messages")
      .select("*")
      .eq("channel", `support-${user.id}`)
      .order("created_at", { ascending: true })
      .limit(50)
      .then(({ data }) => { if (data) setMessages(data.map(d => ({ ...d, sender: d.user_id === user.id ? "user" : "support" } as ChatMsg))); });

    const sub = supabase.channel(`support-${user.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `channel=eq.support-${user.id}`,
      }, (payload: any) => {
        const msg = payload.new;
        setMessages(prev => [...prev, { ...msg, sender: msg.user_id === user.id ? "user" : "support" }]);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [user, open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || newMsg.trim();
    if (!msg || !user) return;
    await supabase.from("chat_messages").insert({
      channel: `support-${user.id}`,
      user_id: user.id,
      username: user.email?.split("@")[0] || "User",
      message: msg,
    });
    setNewMsg("");
  };

  const waNumber = (settings.whatsapp_number || "").replace(/[^0-9]/g, "");
  const messengerUrl = settings.social_facebook ? `https://m.me/${settings.social_facebook.split("/").pop()}` : "";

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-36 right-4 z-40 bg-primary hover:bg-primary/90 text-primary-foreground p-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          aria-label="Support Chat"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-20 sm:right-4 z-50 w-full sm:w-96 bg-card border border-border sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col" style={{ maxHeight: "85vh" }}>
          {/* Header */}
          <div className="bg-primary text-primary-foreground rounded-t-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">{lb("সাপোর্ট চ্যাট", "Support Chat")}</h3>
              <p className="text-xs opacity-80">{lb("আমরা সবসময় আপনার পাশে", "We're here to help")}</p>
            </div>
            <button onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button onClick={() => setTab("chat")} className={`flex-1 text-xs py-2 font-medium ${tab === "chat" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
              💬 {lb("চ্যাট", "Chat")}
            </button>
            <button onClick={() => setTab("contact")} className={`flex-1 text-xs py-2 font-medium ${tab === "contact" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
              📞 {lb("যোগাযোগ", "Contact")}
            </button>
          </div>

          {tab === "chat" ? (
            <>
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 200, maxHeight: "40vh" }}>
                {/* Welcome */}
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground text-xs py-4">
                    <p className="mb-3">{lb("আপনার প্রশ্ন লিখুন বা নিচের থেকে বেছে নিন", "Type your question or choose below")}</p>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {PRESET_MESSAGES.map((pm, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(lang === "bn" ? pm.bn : pm.en)}
                          className="px-3 py-1.5 bg-muted rounded-full text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {lang === "bn" ? pm.bn : pm.en}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick replies */}
              {messages.length > 0 && (
                <div className="px-3 pb-1 flex gap-1 overflow-x-auto">
                  {PRESET_MESSAGES.slice(0, 3).map((pm, i) => (
                    <button key={i} onClick={() => sendMessage(lang === "bn" ? pm.bn : pm.en)}
                      className="px-2 py-1 bg-muted rounded-full text-[10px] hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap shrink-0">
                      {lang === "bn" ? pm.bn : pm.en}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              {user ? (
                <div className="p-3 border-t border-border flex gap-2">
                  <Input
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } }}
                    placeholder={lb("মেসেজ লিখুন...", "Type message...")}
                    className="text-xs h-9"
                  />
                  <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => sendMessage()} disabled={!newMsg.trim()}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="p-3 border-t border-border text-center text-xs text-muted-foreground">
                  {lb("চ্যাট করতে লগইন করুন", "Login to chat")}
                </div>
              )}
            </>
          ) : (
            /* Contact Tab */
            <div className="p-4 space-y-3">
              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(settings.whatsapp_message || lb("আসসালামু আলাইকুম", "Hello"))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 transition-colors"
                >
                  <div className="bg-green-500 text-white p-2 rounded-full"><Phone className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">{lb("সরাসরি মেসেজ করুন", "Send direct message")}</p>
                  </div>
                </a>
              )}
              {messengerUrl && (
                <a
                  href={messengerUrl}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                >
                  <div className="bg-blue-500 text-white p-2 rounded-full"><MessageCircle className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Messenger</p>
                    <p className="text-xs text-muted-foreground">{lb("ফেসবুকে মেসেজ করুন", "Message on Facebook")}</p>
                  </div>
                </a>
              )}
              {settings.from_email && (
                <a
                  href={`mailto:${settings.from_email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <div className="bg-primary text-primary-foreground p-2 rounded-full"><MessageCircle className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-xs text-muted-foreground">{settings.from_email}</p>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SupportChatWidget;
