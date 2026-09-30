import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import en from "../i18n/en.json";
import ta from "../i18n/ta.json";

type Dict = typeof en;
const DICTS: Record<"en" | "ta", Dict> = { en, ta: ta as Dict };

interface LanguageContextValue {
  lang: "en" | "ta";
  setLang: (l: "en" | "ta") => void;
  t: (path: string) => string;
  dict: Dict;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function get(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<"en" | "ta">(
    (localStorage.getItem("agricast_lang") as "en" | "ta") || "en"
  );

  const setLang = useCallback((l: "en" | "ta") => {
    setLangState(l);
    localStorage.setItem("agricast_lang", l);
  }, []);

  const t = useCallback(
    (path: string) => {
      const value = get(DICTS[lang], path);
      return typeof value === "string" ? value : path;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t, dict: DICTS[lang] }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
