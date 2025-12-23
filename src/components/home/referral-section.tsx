"use client";

import { TgsPlayer } from "@/components/ui/tgs-player";

type ReferralSectionProps = {
  headline: string;
  buttonLabel: string;
  isDisabled: boolean;
  onLogin: () => void;
};

export function ReferralSection({
  headline,
  buttonLabel,
  isDisabled,
  onLogin,
}: ReferralSectionProps) {
  return (
    <section className="mt-10 w-full rounded-[36px] border border-border/80 bg-surface/95 p-10 shadow-2xl backdrop-blur animate-fade-up animate-slower max-md:mt-8 max-md:p-8 max-sm:mt-6 max-sm:rounded-[28px] max-sm:p-6">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center max-md:gap-6 max-sm:gap-5">
        <div className="relative min-h-[280px] max-sm:min-h-[220px]">
          <TgsPlayer
            src="/tgs/card2.tgs"
            unstyled
            className="absolute inset-0 h-full w-full"
          />
        </div>
        <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
          <p className="text-2xl font-semibold text-foreground max-md:text-xl max-sm:text-lg">
            {headline}
          </p>
          <button
            type="button"
            onClick={onLogin}
            disabled={isDisabled}
            className="ton-shine inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70 max-sm:px-5 max-sm:py-2.5 max-sm:text-sm"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
