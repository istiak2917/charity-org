import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, Hash, Plus, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessage {
  id: string;
  channel: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  message: string;
  created_at: string;
}

interface Channel {
  name: string;
  label: string;
}

const DEFAULT_CHANNELS: Channel[] = [
  { name: "general", label: "সাধারণ" },
  { name: "volunteers", label: "স্বেচ্ছাসেবক" },
  { name: "announcements", label: "ঘোষণা" },
  { name: "support", label: "সাপোর্ট" },
];

const ChatPage = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [channel, setChannel] = useState("general");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lb = (bn: string, en: string) => lang === "bn" ? bn : en;

  // Load profile
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, username, avatar_url").eq("id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setUsername(data.username || data.full_name || user.email?.split("@")[0] || "User");
          setAvatarUrl(data.avatar_url || "");
        }
      });
  }, [user]);

  // Load messages for channel
  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("channel", channel)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setMessages(data);
    };
    loadMessages();

    // Realtime subscription
    const sub = supabase
      .channel(`chat-${channel}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `channel=eq.${channel}`,
      }, (payload) => {
        const newMsg = payload.new as ChatMessage;
        setMessages((prev) => {
          // Deduplicate: skip if already exists (from optimistic update)
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          // Also remove temp messages from same user with same text
          const cleaned = prev.filter((m) => !(m.id.startsWith("temp-") && m.user_id === newMsg.user_id && m.message === newMsg.message));
          return [...cleaned, newMsg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [channel]);

  // Presence
  useEffect(() => {
    if (!user) return;
    const presenceChannel = supabase.channel("online-users", {
      config: { presence: { key: user.id } },
    });
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        setOnlineCount(Object.keys(presenceChannel.presenceState()).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ user_id: user.id, username });
        }
      });
    return () => { supabase.removeChannel(presenceChannel); };
  }, [user, username]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !user) return;
    const msgText = newMsg.trim();
    const uname = username || user.email?.split("@")[0] || "User";
    
    // Optimistic update - show message immediately
    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      channel,
      user_id: user.id,
      username: uname,
      avatar_url: avatarUrl,
      message: msgText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMsg("");

    const { data, error } = await supabase.from("chat_messages").insert({
      channel,
      user_id: user.id,
      username: uname,
      avatar_url: avatarUrl,
      message: msgText,
    }).select().single();

    if (data) {
      // Replace optimistic message with real one, and deduplicate from realtime
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m.id !== optimisticMsg.id && m.id !== data.id);
        return [...withoutOptimistic, data];
      });
    } else if (error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Sidebar - Channels */}
      <Card className="w-56 shrink-0 hidden md:flex flex-col p-3">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Hash className="h-4 w-4" /> {lb("চ্যানেল", "Channels")}
        </h3>
        <div className="space-y-1 flex-1">
          {DEFAULT_CHANNELS.map((ch) => (
            <button
              key={ch.name}
              onClick={() => setChannel(ch.name)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${channel === ch.name ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground/70"}`}
            >
              # {ch.label}
            </button>
          ))}
        </div>
        <div className="border-t border-border pt-3 mt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{onlineCount} {lb("অনলাইন", "online")}</span>
          </div>
        </div>
      </Card>

      {/* Main Chat */}
      <Card className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{DEFAULT_CHANNELS.find(c => c.name === channel)?.label || channel}</span>
          </div>
          {/* Mobile channel selector */}
          <div className="md:hidden flex gap-1 overflow-x-auto">
            {DEFAULT_CHANNELS.map((ch) => (
              <Badge
                key={ch.name}
                variant={channel === ch.name ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap text-xs"
                onClick={() => setChannel(ch.name)}
              >
                {ch.label}
              </Badge>
            ))}
          </div>
          <Badge variant="secondary" className="hidden md:flex gap-1">
            <Users className="h-3 w-3" /> {onlineCount}
          </Badge>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageCircle className="h-12 w-12 mb-2 opacity-30" />
              <p className="text-sm">{lb("এখনো কোনো মেসেজ নেই", "No messages yet")}</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.user_id === user?.id;
            return (
              <div key={msg.id} className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={msg.avatar_url} />
                  <AvatarFallback className="text-xs">{(msg.username || "U")[0]}</AvatarFallback>
                </Avatar>
                <div className={`max-w-[70%] ${isMe ? "text-right" : ""}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-semibold ${isMe ? "text-primary" : "text-foreground"}`}>{msg.username}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.created_at).toLocaleTimeString(lang === "bn" ? "bn-BD" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className={`inline-block px-3 py-2 rounded-xl text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={lb("মেসেজ লিখুন...", "Type a message...")}
              className="flex-1"
            />
            <Button onClick={sendMessage} size="icon" disabled={!newMsg.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;
