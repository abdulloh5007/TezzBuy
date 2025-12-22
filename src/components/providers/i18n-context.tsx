"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import en from "@/i18n/en.json";
import ru from "@/i18n/ru.json";
import uz from "@/i18n/uz.json";

const dictionaries = { en, ru, uz } as const;

export type Language = keyof typeof dictionaries;
type DictionaryKey = keyof (typeof dictionaries)["ru"];

type I18nContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: DictionaryKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function persistLanguage(next: Language) {
  if (typeof document === "undefined") return;
  document.cookie = `language=${next}; path=/; max-age=31536000; samesite=lax`;
  window.localStorage.setItem("language", next);
  document.documentElement.lang = next;
}

export function I18nProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage: Language;
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage: (lang) => {
        setLanguage(lang);
        persistLanguage(lang);
      },
      t: (key) => dictionaries[language][key],
    }),
    [language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
