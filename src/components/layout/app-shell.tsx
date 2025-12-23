"use client";

import type { ReactNode } from "react";
import { TonConnectProvider } from "@/components/providers/ton-connect-provider";
import {
  I18nProvider,
  type Language,
} from "@/components/providers/i18n-context";
import {
  ThemeProvider,
  type Theme,
} from "@/components/providers/theme-context";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

type AppShellProps = {
  children: ReactNode;
  initialLanguage: Language;
  initialTheme: Theme;
};

export function AppShell({
  children,
  initialLanguage,
  initialTheme,
}: AppShellProps) {
  return (
    <TonConnectProvider>
      <ThemeProvider initialTheme={initialTheme}>
        <I18nProvider initialLanguage={initialLanguage}>
          <div className="relative flex min-h-screen flex-col overflow-hidden text-foreground">
            <div className="pointer-events-none absolute -left-24 top-32 h-64 w-64 rounded-full bg-[#9fd8f7] opacity-35 blur-[110px]" />
            <div className="pointer-events-none absolute -right-16 top-8 h-72 w-72 rounded-full bg-[#7bd3ff] opacity-25 blur-[130px]" />
            <div className="pointer-events-none absolute left-1/2 top-[55%] h-80 w-[520px] -translate-x-1/2 rounded-full bg-[#b3e3ff] opacity-25 blur-[160px]" />
            <div className="pointer-events-none absolute right-10 bottom-24 h-48 w-48 rounded-full bg-[#a7dcff] opacity-20 blur-[120px]" />
            <div className="pointer-events-none absolute left-16 bottom-10 h-40 w-40 rounded-full bg-[#d2efff] opacity-25 blur-[110px]" />
            <SiteHeader />
            <div className="relative flex-1">{children}</div>
            <SiteFooter />
          </div>
        </I18nProvider>
      </ThemeProvider>
    </TonConnectProvider>
  );
}
