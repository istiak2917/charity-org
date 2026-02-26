import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";

interface WhatsAppSendProps {
  defaultNumber?: string;
  defaultMessage?: string;
}

const WhatsAppSend = ({ defaultNumber, defaultMessage }: WhatsAppSendProps) => {
  const [number, setNumber] = useState(defaultNumber || "");
  const [message, setMessage] = useState(defaultMessage || "");

  const handleSend = () => {
    const cleanNumber = number.replace(/[^0-9]/g, "");
    if (!cleanNumber) return;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp মেসেজ
      </div>
      <Input placeholder="ফোন নম্বর (যেমন: 8801XXXXXXXXX)" value={number} onChange={(e) => setNumber(e.target.value)} />
      <Textarea placeholder="মেসেজ..." rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
      <Button onClick={handleSend} className="gap-2 bg-green-600 hover:bg-green-700">
        <Send className="h-4 w-4" /> WhatsApp এ পাঠান
      </Button>
    </div>
  );
};

export default WhatsAppSend;
