import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, QrCode, Copy, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface QRCodeGeneratorProps {
  defaultUrl?: string;
  title?: string;
  compact?: boolean;
}

// Simple QR code using Google Charts API (no external dependency)
const getQRUrl = (text: string, size = 200) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=8`;

const QRCodeGenerator = ({ defaultUrl, title, compact = false }: QRCodeGeneratorProps) => {
  const [url, setUrl] = useState(defaultUrl || window.location.href);
  const [copied, setCopied] = useState(false);
  const { lang } = useLanguage();
  const lb = (bn: string, en: string) => lang === "bn" ? bn : en;

  const qrSrc = getQRUrl(url, 250);

  const handleDownload = async () => {
    try {
      const res = await fetch(qrSrc);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "qr-code.png";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(qrSrc, "_blank");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2">
        <img src={qrSrc} alt="QR Code" className="w-24 h-24 rounded-lg border border-border" />
        <p className="text-xs text-muted-foreground">{lb("স্ক্যান করুন", "Scan me")}</p>
      </div>
    );
  }

  return (
    <Card className="p-6 max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="h-5 w-5 text-primary" />
        <h3 className="font-bold font-heading">{title || lb("QR কোড জেনারেটর", "QR Code Generator")}</h3>
      </div>

      <div className="flex justify-center mb-4">
        <img src={qrSrc} alt="QR Code" className="w-48 h-48 rounded-xl border-2 border-border shadow-sm" />
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={lb("লিংক দিন", "Enter URL")}
            className="text-sm"
          />
          <Button size="icon" variant="outline" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <Button onClick={handleDownload} className="w-full gap-2" variant="outline">
          <Download className="h-4 w-4" /> {lb("ডাউনলোড করুন", "Download QR")}
        </Button>
      </div>
    </Card>
  );
};

export default QRCodeGenerator;
