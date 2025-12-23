"use client";

import type { RefObject } from "react";
import { TgsPlayer } from "@/components/ui/tgs-player";

type PaymentId = "ton" | "usd";
type PaymentOption = {
  id: PaymentId;
  title: string;
  description: string;
};

type PurchaseSectionProps = {
  t: (key: string) => string;
  username: string;
  status: "idle" | "checking" | "found" | "notfound";
  avatarUrl: string;
  usernameError?: string;
  onUsernameChange: (value: string) => void;
  onUsernameClear: () => void;
  paymentRef: RefObject<HTMLDivElement | null>;
  paymentOpen: boolean;
  paymentOptions: PaymentOption[];
  paymentMethod: PaymentId | null;
  selectedPayment?: PaymentOption;
  paymentError?: string;
  onTogglePayment: () => void;
  onSelectPayment: (id: PaymentId) => void;
  stars: string;
  onStarsChange: (value: string) => void;
  starsError?: string;
  formattedUsdEstimate: string | null;
  isSending: boolean;
  isTonSelected: boolean;
  onContinue: () => void;
};

export function PurchaseSection({
  t,
  username,
  status,
  avatarUrl,
  usernameError,
  onUsernameChange,
  onUsernameClear,
  paymentRef,
  paymentOpen,
  paymentOptions,
  paymentMethod,
  selectedPayment,
  paymentError,
  onTogglePayment,
  onSelectPayment,
  stars,
  onStarsChange,
  starsError,
  formattedUsdEstimate,
  isSending,
  isTonSelected,
  onContinue,
}: PurchaseSectionProps) {
  return (
    <section className="w-full rounded-[36px] border border-border/80 bg-surface/95 p-10 shadow-2xl backdrop-blur animate-fade-up animate-slower max-md:p-8 max-sm:rounded-[28px] max-sm:p-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center max-md:gap-6 max-sm:gap-5">
        <div>
          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold text-foreground animate-fade-left max-md:text-2xl max-sm:text-xl">
              {t("orderTitle")}
            </h2>
            <p className="text-base text-muted animate-fade-left max-sm:text-sm">
              {t("orderBody")}
            </p>
          </div>

          <div className="mt-6 space-y-5 max-sm:space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-muted max-sm:h-6 max-sm:w-6">
                  {status === "found" && avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="h-7 w-7 rounded-full border border-border/70 object-cover max-sm:h-6 max-sm:w-6"
                    />
                  ) : (
                    <span className="text-base font-semibold">@</span>
                  )}
                </div>
                <input
                  value={username}
                  onChange={(event) => onUsernameChange(event.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  placeholder={t("usernamePlaceholder")}
                  className={`h-12 w-full rounded-full border bg-surface pl-10 pr-10 text-base font-semibold max-sm:h-11 max-sm:text-sm ${
                    username ? "text-foreground" : "text-muted"
                  } outline-none transition placeholder:text-muted focus:shadow-[0_16px_32px_rgba(0,152,234,0.24)] ${
                    status === "notfound" || usernameError
                      ? "border-2 border-danger/80"
                      : "border-border/80 focus:border-accent/60 focus:ring-2 focus:ring-accent/10"
                  }`}
                />
                {usernameError && (
                  <FieldErrorBadge
                    message={usernameError}
                    className="right-3 top-1/2 -translate-y-1/2"
                  />
                )}
                {status === "notfound" && username.length > 0 && (
                  <button
                    type="button"
                    onClick={onUsernameClear}
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-danger/60 bg-surface text-xs font-semibold text-danger transition hover:border-danger hover:text-danger"
                    aria-label="Очистить поле"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div ref={paymentRef} className="space-y-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={onTogglePayment}
                  className={`relative flex h-12 w-full items-center rounded-full border bg-surface pl-10 pr-10 text-left text-base font-semibold text-foreground outline-none transition max-sm:h-11 max-sm:text-sm ${
                    paymentError ? "border-2 border-danger/80" : "border-border/80"
                  }`}
                  aria-expanded={paymentOpen}
                >
                  <span className="pointer-events-none absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-muted max-sm:h-6 max-sm:w-6">
                    {paymentMethod === "ton" ? (
                      <TonIcon className="text-muted" />
                    ) : (
                      <UsdIcon className="text-muted" />
                    )}
                  </span>
                  <span className={selectedPayment ? "text-foreground" : "text-muted"}>
                    {selectedPayment?.title ?? t("paymentPlaceholder")}
                  </span>
                  <span
                    className={`pointer-events-none absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-muted transition max-sm:h-6 max-sm:w-6 ${
                      paymentOpen ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronIcon />
                  </span>
                  {paymentError && (
                    <FieldErrorBadge
                      message={paymentError}
                      className="right-10 top-1/2 -translate-y-1/2"
                    />
                  )}
                </button>

                <div
                  className={`absolute z-20 mt-3 w-full overflow-hidden rounded-[26px] border border-border/80 bg-surface shadow-xl transition max-sm:rounded-[22px] ${
                    paymentOpen
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none -translate-y-2 opacity-0"
                  }`}
                >
                  {paymentOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onSelectPayment(option.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-base font-semibold transition hover:bg-surface-muted focus-visible:outline-none max-sm:px-3 max-sm:text-sm"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface max-sm:h-9 max-sm:w-9">
                        {option.id === "ton" ? <TonIcon /> : <UsdIcon />}
                      </span>
                      <span>
                        {option.title}
                        <span className="ml-2 text-xs font-medium text-muted">
                          {option.description}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-muted max-sm:h-6 max-sm:w-6">
                  <StarIcon />
                </div>
                {formattedUsdEstimate && (
                  <div className="pointer-events-none absolute right-3 top-1/2 flex h-7 items-center -translate-y-1/2 text-sm font-semibold text-muted max-sm:text-xs">
                    ≈ ${formattedUsdEstimate}
                  </div>
                )}
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9.]*"
                  value={stars}
                  onChange={(event) => onStarsChange(event.target.value)}
                  placeholder={t("starsPlaceholder")}
                  className={`h-12 w-full rounded-full border border-border/80 bg-surface pl-10 pr-24 text-base font-semibold max-sm:h-11 max-sm:pr-20 max-sm:text-sm ${
                    stars ? "text-foreground" : "text-muted"
                  } outline-none transition placeholder:text-muted focus:shadow-[0_16px_32px_rgba(0,152,234,0.24)] ${
                    starsError
                      ? "border-2 border-danger/80"
                      : "focus:border-accent/60 focus:ring-2 focus:ring-accent/10"
                  }`}
                />
                {starsError && (
                  <FieldErrorBadge
                    message={starsError}
                    className={`${
                      formattedUsdEstimate ? "right-10" : "right-3"
                    } top-1/2 -translate-y-1/2`}
                  />
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onContinue}
              disabled={isSending}
              className={`ton-shine mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-white transition hover:bg-accent-strong max-sm:px-4 max-sm:py-3 max-sm:text-sm ${
                isSending ? "cursor-not-allowed opacity-70" : ""
              }`}
            >
              {isTonSelected ? t("tonPayAction") : t("continue")}
              <span className="text-white/80">→</span>
            </button>
          </div>
        </div>

        <div className="relative min-h-[320px] max-sm:min-h-[260px]">
          <TgsPlayer
            src="/tgs/card.tgs"
            unstyled
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}

function TonIcon({ className = "text-foreground" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 3 4.5 8.2 12 21l7.5-12.8L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 3v18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsdIcon({ className = "text-foreground" }: { className?: string }) {
  return (
    <span className={`text-sm font-semibold ${className}`} aria-hidden="true">
      $
    </span>
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

function StarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-muted"
    >
      <path
        d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FieldErrorBadge({
  message,
  className,
}: {
  message: string;
  className: string;
}) {
  return (
    <span
      className={`absolute ${className} group z-40 flex h-7 w-7 items-center justify-center rounded-full border border-danger/60 bg-surface text-sm font-semibold text-danger max-sm:h-6 max-sm:w-6 max-sm:text-xs`}
      aria-label={message}
      role="img"
    >
      !
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[240px] -translate-x-1/2 whitespace-normal rounded-lg bg-accent px-3 py-2 text-center text-[14px] font-semibold text-white opacity-0 shadow-[0_12px_30px_rgba(0,152,234,0.25)] transition group-hover:opacity-100 max-sm:max-w-[180px] max-sm:px-2 max-sm:py-1.5 max-sm:text-[12px]">
        {message}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-5 border-t-6 border-x-transparent border-t-accent drop-shadow-[0_2px_0_rgba(0,152,234,0.2)]" />
      </span>
    </span>
  );
}
