import { createContext, useContext, useState, ReactNode } from "react";
import { translations, supportedLanguages, type Lang } from "@/lib/translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  supportedLanguages: typeof supportedLanguages;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "bn",
  setLang: () => {},
  t: (key) => translations[key]?.bn || key,
  supportedLanguages,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("site_lang");
    if (saved && supportedLanguages.some(l => l.code === saved)) return saved;
    return "bn";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("site_lang", l);
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] || translations[key]?.bn || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, supportedLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};
