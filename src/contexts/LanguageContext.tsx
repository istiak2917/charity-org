import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, type Lang, type TranslationKey } from "@/lib/translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "bn",
  setLang: () => {},
  t: (key) => translations[key]?.bn || key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("site_lang");
    return (saved === "en" || saved === "bn") ? saved : "bn";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("site_lang", l);
  };

  const t = (key: TranslationKey): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
