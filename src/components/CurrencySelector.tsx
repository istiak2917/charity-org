import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CurrencySelector = ({ compact = false }: { compact?: boolean }) => {
  const { currency, setCurrencyCode, allCurrencies } = useCurrency();
  const { lang } = useLanguage();

  return (
    <Select value={currency.code} onValueChange={setCurrencyCode}>
      <SelectTrigger className={compact ? "w-[80px] h-8 text-xs" : "w-[160px]"}>
        <SelectValue>{compact ? currency.code : `${currency.symbol} ${currency.code}`}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {allCurrencies.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <span className="flex items-center gap-2">
              <span className="font-mono text-xs w-6">{c.symbol}</span>
              <span>{c.code}</span>
              <span className="text-muted-foreground text-xs ml-1">
                {lang === "bn" ? c.name_bn : c.name}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CurrencySelector;
