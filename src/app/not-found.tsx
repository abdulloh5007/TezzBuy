"use client";

import { TgsPlayer } from "@/components/ui/tgs-player";
import { useI18n } from "@/components/providers/i18n-context";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-10 py-20 text-center max-md:px-6 max-md:py-16 max-sm:px-4 max-sm:py-12">
      <div className="w-full rounded-[36px] border border-border/80 bg-surface/95 p-10 shadow-2xl backdrop-blur animate-fade-up animate-slower max-md:p-8 max-sm:rounded-[28px] max-sm:p-6">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 font-display text-[72px] font-bold text-foreground max-md:gap-3 max-md:text-[56px] max-sm:gap-2 max-sm:text-[44px]">
            <span className="inline-block animate-float-left">4</span>
            <span className="inline-block animate-float-up">0</span>
            <span className="inline-block animate-float-right">4</span>
          </div>
          <p className="text-xl font-semibold text-foreground max-md:text-lg max-sm:text-base">
            {t("notFoundTitle")}
          </p>
          <p className="max-w-2xl text-base text-muted max-sm:text-sm">
            {t("notFoundBody")}
          </p>
          <div className="relative mt-2 h-[240px] w-full max-w-md max-sm:h-[200px]">
            <TgsPlayer
              src="/tgs/notfound.tgs"
              unstyled
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <a
            href="/"
            className="ton-shine inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-white transition hover:bg-accent-strong max-sm:px-5 max-sm:py-2.5 max-sm:text-sm"
          >
            {t("notFoundCta")}
          </a>
        </div>
      </div>
    </main>
  );
}
