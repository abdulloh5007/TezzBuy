"use client";

import { useI18n } from "@/components/providers/i18n-context";

export function ProfileUnauthorized() {
  const { t } = useI18n();

  return (
    <main className="relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-10 py-16 text-center max-md:px-6 max-md:py-12 max-sm:px-4 max-sm:py-10">
      <section className="w-full rounded-[36px] border border-border/80 bg-surface/95 p-10 shadow-2xl backdrop-blur animate-fade-up animate-slower max-md:p-8 max-sm:rounded-[28px] max-sm:p-6">
        <div className="space-y-4">
          <h1 className="font-display text-3xl font-bold text-foreground max-sm:text-2xl">
            {t("profileAuthTitle")}
          </h1>
          <p className="text-base text-muted max-sm:text-sm">
            {t("profileAuthBody")}
          </p>
          <a
            href="/"
            className="ton-shine inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-white transition hover:bg-accent-strong max-sm:px-5 max-sm:py-2.5 max-sm:text-sm"
          >
            {t("profileAuthCta")}
          </a>
        </div>
      </section>
    </main>
  );
}
