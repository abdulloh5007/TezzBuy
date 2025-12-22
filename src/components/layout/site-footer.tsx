"use client";

import { useI18n } from "@/components/providers/i18n-context";
import { useTheme } from "@/components/providers/theme-context";
import { Globe, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function SiteFooter() {
  const { language, setLanguage, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: PointerEvent) => {
      if (!languageRef.current?.contains(event.target as Node)) {
        setLanguageOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  return (
    <footer className="border-t border-border/70 bg-transparent">
      <div className="mx-auto flex w-full max-w-6xl flex-row items-center justify-between gap-6 px-10 py-12 text-left max-md:flex-col max-md:items-center max-md:text-center max-md:px-6 max-md:py-10 max-sm:px-4 max-sm:py-8">
        <div className="flex flex-col items-start max-md:items-center">
          <p className="font-display text-xl text-foreground max-sm:text-lg">
            {t("footerTitle")}
          </p>
          <p className="mt-2 text-base text-muted max-sm:text-sm">
            {t("footerBody")}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold text-muted max-sm:gap-3">
          <div ref={languageRef} className="relative">
            <button
              type="button"
              onClick={() => setLanguageOpen((prev) => !prev)}
              className="relative flex h-11 items-center gap-2 rounded-full border border-border/70 bg-surface pl-10 pr-5 text-sm font-semibold uppercase tracking-[0.2em] text-foreground shadow-sm transition hover:bg-surface-muted focus-visible:outline-none max-sm:h-10 max-sm:pr-4 max-sm:text-xs"
              aria-expanded={languageOpen}
            >
              <Globe className="absolute left-3 h-4 w-4 text-muted" aria-hidden="true" />
              <span>
                {language === "ru" ? "Русский" : language === "uz" ? "O'zbek" : "English"}
              </span>
              <span
                className={`text-muted transition ${
                  languageOpen ? "rotate-180" : ""
                }`}
              >
                <ChevronIcon />
              </span>
            </button>
            <div
              className={`absolute bottom-12 left-0 z-20 w-52 overflow-hidden rounded-[26px] border border-border/80 bg-surface shadow-xl transition max-sm:w-44 max-sm:rounded-[22px] ${
                languageOpen
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-2 opacity-0"
              }`}
            >
              {(["ru", "uz", "en"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setLanguage(code);
                    setLanguageOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-base font-semibold transition hover:bg-surface-muted focus-visible:outline-none max-sm:px-3 max-sm:text-sm"
                >
                  <span className="text-lg">
                    {code === "ru" ? "🇷🇺" : code === "uz" ? "🇺🇿" : "🇺🇸"}
                  </span>
                  <span>
                    {code === "ru"
                      ? "Русский"
                      : code === "uz"
                        ? "O'zbek"
                        : "English"}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="relative flex h-11 items-center rounded-full border border-border/70 bg-surface pl-10 pr-5 text-sm font-semibold uppercase tracking-[0.2em] text-foreground shadow-sm transition hover:bg-surface-muted max-sm:h-10 max-sm:pr-4 max-sm:text-xs"
            aria-label={t("footerTheme")}
          >
            {theme === "light" ? (
              <Moon
                className="absolute left-3 h-4 w-4 text-muted"
                aria-hidden="true"
              />
            ) : (
              <Sun
                className="absolute left-3 h-4 w-4 text-muted"
                aria-hidden="true"
              />
            )}
            <span>{theme === "light" ? t("footerLight") : t("footerDark")}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-muted"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
