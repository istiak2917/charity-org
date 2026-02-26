import { useState, useEffect, useCallback } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Show banner after delay for all platforms
    const timer = setTimeout(() => setShowBanner(true), 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // For iOS or when prompt isn't available, show instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert("Safari-এ Share বাটন (⬆️) চাপুন → তারপর \"Add to Home Screen\" সিলেক্ট করুন।");
      } else {
        alert("ব্রাউজারের মেনু (⋮) চাপুন → তারপর \"Install app\" বা \"Add to Home Screen\" সিলেক্ট করুন।");
      }
    }
  }, [deferredPrompt]);

  // Listen for footer install button
  useEffect(() => {
    const footerInstallHandler = () => handleInstall();
    window.addEventListener("show-pwa-install", footerInstallHandler);
    return () => window.removeEventListener("show-pwa-install", footerInstallHandler);
  }, [handleInstall]);

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg animate-in slide-in-from-bottom duration-500">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="bg-white/20 p-2 rounded-xl shrink-0">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">শিশুফুল অ্যাপ ইনস্টল করুন!</p>
            <p className="text-xs opacity-90 truncate">মোবাইলে অ্যাপের মতো ব্যবহার করুন</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleInstall}
            className="gap-1.5 bg-white text-primary hover:bg-white/90 font-bold text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            ইনস্টল
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;
