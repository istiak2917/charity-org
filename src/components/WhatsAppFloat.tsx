import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MessageCircle } from "lucide-react";

const WhatsAppFloat = () => {
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.from("site_settings").select("*").then(({ data }) => {
      if (!data) return;
      data.forEach((s: any) => {
        const k = s.setting_key || s.key || "";
        const v = s.setting_value || s.value || "";
        const val = typeof v === "string" ? v.replace(/^"|"$/g, "") : "";
        if (k === "whatsapp_number") setNumber(val);
        if (k === "whatsapp_message") setMessage(val);
      });
    });
  }, []);

  if (!number) return null;

  const cleanNumber = number.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message || "আসসালামু আলাইকুম, আমি আপনাদের ওয়েবসাইট থেকে যোগাযোগ করছি।")}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-40 bg-green-500 hover:bg-green-600 text-white p-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label="WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-card text-foreground text-xs px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-border">
        WhatsApp এ মেসেজ করুন
      </span>
    </a>
  );
};

export default WhatsAppFloat;
