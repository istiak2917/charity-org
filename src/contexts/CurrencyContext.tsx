import { createContext, useContext, useState, ReactNode } from "react";
import { currencies, type Currency } from "@/lib/currencies";
import { useLanguage } from "./LanguageContext";

interface CurrencyContextType {
  currency: Currency;
  setCurrencyCode: (code: string) => void;
  formatAmount: (amount: number) => string;
  allCurrencies: Currency[];
}

const defaultCurrency = currencies[0]; // BDT

const CurrencyContext = createContext<CurrencyContextType>({
  currency: defaultCurrency,
  setCurrencyCode: () => {},
  formatAmount: (n) => `৳${n}`,
  allCurrencies: currencies,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem("site_currency");
    return currencies.find(c => c.code === saved) || defaultCurrency;
  });

  const setCurrencyCode = (code: string) => {
    const found = currencies.find(c => c.code === code);
    if (found) {
      setCurrency(found);
      localStorage.setItem("site_currency", code);
    }
  };

  const formatAmount = (amount: number): string => {
    try {
      return new Intl.NumberFormat(currency.code === "BDT" ? "bn-BD" : "en-US", {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency.symbol}${amount.toLocaleString()}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyCode, formatAmount, allCurrencies: currencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};
