import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const LanguageSwitcher = ({ size = "sm" }: { size?: "sm" | "default" }) => {
  const { lang, setLang } = useLanguage();

  return (
    <Button
      variant="ghost"
      size={size}
      className="gap-1.5 font-medium"
      onClick={() => setLang(lang === "bn" ? "en" : "bn")}
      title={lang === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs">{lang === "bn" ? "EN" : "বাং"}</span>
    </Button>
  );
};

export default LanguageSwitcher;
