"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/providers/i18n-context";

type ProfileContentProps = {
  slug: string;
};

export function ProfileContent({ slug }: ProfileContentProps) {
  const { t } = useI18n();
  const [isCopied, setIsCopied] = useState(false);

  const profile = useMemo(() => {
    const decoded = decodeURIComponent(slug);
    const cleaned = decoded.trim();
    const isNumeric = /^\d+$/.test(cleaned);
    const displayName = isNumeric || !cleaned ? t("profileUserLabel") : cleaned;
    const handle = !cleaned
      ? t("profileDetailUnknown")
      : isNumeric
      ? `${t("profileIdLabel")} ${cleaned}`
      : `@${cleaned}`;
    const telegramUrl = !isNumeric && cleaned ? `https://t.me/${cleaned}` : "";
    const initial = cleaned ? cleaned[0]?.toUpperCase() : "T";
    const telegramId = isNumeric ? cleaned : t("profileDetailUnknown");
    const username = !isNumeric && cleaned ? `@${cleaned}` : t("profileDetailUnknown");

    return {
      cleaned,
      displayName,
      handle,
      telegramUrl,
      initial,
      telegramId,
      username,
      isNumeric,
    };
  }, [slug, t]);

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    try {
      const url = `${window.location.origin}/u/${encodeURIComponent(
        profile.cleaned || slug
      )}`;
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1600);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-col px-10 py-16 max-md:px-6 max-md:py-12 max-sm:px-4 max-sm:py-10">
      <section className="w-full rounded-[36px] border border-border/80 bg-surface/95 p-10 shadow-2xl backdrop-blur animate-fade-up animate-slower max-md:p-8 max-sm:rounded-[28px] max-sm:p-6">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start max-md:gap-6 max-sm:gap-5">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-border/70 bg-surface-muted p-6 shadow-sm max-sm:p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br from-[#4bb8ff] via-[#49a6f5] to-[#2d89c9] text-3xl font-semibold text-white shadow-lg max-sm:h-16 max-sm:w-16 max-sm:text-2xl">
                  {profile.initial}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    {t("profileTitle")}
                  </p>
                  <h1 className="font-display text-3xl font-bold text-foreground max-sm:text-2xl">
                    {profile.displayName}
                  </h1>
                  <p className="text-base text-muted">{profile.handle}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  t("profileStatsPurchases"),
                  t("profileStatsStars"),
                  t("profileStatsReferrals"),
                ].map((label) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-border/60 bg-surface px-4 py-4 text-center"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      —
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-border/60 bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  {t("profileBadge")}
                </span>
                <span className="rounded-full border border-border/60 bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  {t("profileBadgeSecure")}
                </span>
              </div>
            </div>

            <div className="rounded-[28px] border border-border/70 bg-surface-muted p-6 shadow-sm max-sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-xl font-bold text-foreground max-sm:text-lg">
                  {t("profileActionsTitle")}
                </h2>
                {isCopied && (
                  <span className="text-xs font-semibold text-accent">
                    {t("profileActionCopied")}
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center rounded-full border border-border/70 bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-accent/70 max-sm:text-xs"
                >
                  {t("profileActionCopy")}
                </button>
                {profile.telegramUrl ? (
                  <a
                    href={profile.telegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-border/70 bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-accent/70 max-sm:text-xs"
                  >
                    {t("profileActionOpenTelegram")}
                  </a>
                ) : null}
                <a
                  href="/"
                  className="ton-shine inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong max-sm:text-xs"
                >
                  {t("profileActionBuyStars")}
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-border/70 bg-surface-muted p-6 shadow-sm max-sm:p-5">
              <h2 className="font-display text-xl font-bold text-foreground max-sm:text-lg">
                {t("profileDetailsTitle")}
              </h2>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-surface px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    {t("profileDetailId")}
                  </span>
                  <span className="text-base font-semibold text-foreground">
                    {profile.telegramId}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-border/70 bg-surface-muted p-6 shadow-sm max-sm:p-5">
              <h2 className="font-display text-xl font-bold text-foreground max-sm:text-lg">
                {t("profileActivityTitle")}
              </h2>
              <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-surface px-4 py-6 text-center text-sm text-muted">
                {t("profileActivityEmpty")}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
