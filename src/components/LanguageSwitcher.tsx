import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSwitcher = ({ size = "sm" }: { size?: "sm" | "default" }) => {
  const { lang, setLang, supportedLanguages } = useLanguage();
  const current = supportedLanguages.find(l => l.code === lang);

  // If only 2 languages, use simple toggle
  if (supportedLanguages.length <= 2) {
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
  }

  // Multi-language dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={size} className="gap-1.5 font-medium">
          <Globe className="h-4 w-4" />
          <span className="text-xs">{current?.nativeLabel || lang.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLanguages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code)}
            className={lang === l.code ? "bg-accent" : ""}
          >
            {l.nativeLabel} ({l.label})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
