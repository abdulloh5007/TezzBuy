"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useTonConnectModal,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { useI18n } from "@/components/providers/i18n-context";

type TelegramStatus = "idle" | "checking" | "found" | "notfound";
type PaymentId = "ton" | "usd";
type FieldErrors = {
  username?: string;
  payment?: string;
  stars?: string;
};

const easeDelay = (ms: number) =>
  ({ "--delay": `${ms}ms` } as React.CSSProperties);
const TON_MIN_STARS = 50;
const TON_MAX_STARS = 10000;

export function HomeContent() {
  const { t } = useI18n();
  const [tonConnectUI] = useTonConnectUI();
  const tonWallet = useTonWallet();
  const { open: openTonConnectModal } = useTonConnectModal();
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<TelegramStatus>("idle");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentId | null>(null);
  const [stars, setStars] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSending, setIsSending] = useState(false);
  const latestQuery = useRef("");
  const paymentRef = useRef<HTMLDivElement>(null);
  const tonReceiverAddress =
    process.env.NEXT_PUBLIC_TON_RECEIVER_ADDRESS ?? "";
  const tonNanotonsPerStar =
    process.env.NEXT_PUBLIC_TON_NANOTONS_PER_STAR ?? "";
  const usdPerStar = process.env.NEXT_PUBLIC_STARS_USD_RATE ?? "";

  const paymentOptions = useMemo(
    () => [
      {
        id: "ton" as const,
        title: t("tonPayment"),
        description: t("tonPaymentDesc"),
      },
      {
        id: "usd" as const,
        title: t("usdPayment"),
        description: t("usdPaymentDesc"),
      },
    ],
    [t]
  );

  useEffect(() => {
    const handler = (event: PointerEvent) => {
      if (!paymentRef.current?.contains(event.target as Node)) {
        setPaymentOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  useEffect(() => {
    const trimmed = username.trim().replace(/^@+/, "");
    if (!trimmed) {
      setStatus("idle");
      setAvatarUrl("");
      return;
    }

    setStatus("checking");
    latestQuery.current = trimmed;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/telegram?username=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("Request failed");
        }
        const data = (await response.json()) as {
          found: boolean;
          avatarUrl?: string;
        };
        if (latestQuery.current !== trimmed) return;
        if (data.found && data.avatarUrl) {
          setStatus("found");
          setAvatarUrl(data.avatarUrl);
        } else {
          setStatus("notfound");
          setAvatarUrl("");
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        if (latestQuery.current !== trimmed) return;
        setStatus("notfound");
        setAvatarUrl("");
      }
    }, 600);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [username]);

  useEffect(() => {
    setFieldErrors({});
  }, [paymentMethod, stars, tonWallet]);

  const selectedPayment = paymentOptions.find(
    (option) => option.id === paymentMethod
  );
  const isTonSelected = paymentMethod === "ton";
  const usernameError = fieldErrors.username;
  const paymentError = fieldErrors.payment;
  const starsError = fieldErrors.stars;
  const starsValue = stars.trim().replace(/\./g, "");
  const starsAmount = /^\d+$/.test(starsValue) ? Number(starsValue) : null;
  const usdRate = Number(usdPerStar);
  const hasUsdRate = Number.isFinite(usdRate) && usdRate > 0;
  const usdEstimate =
    starsAmount &&
    hasUsdRate &&
    starsAmount >= Number(TON_MIN_STARS) &&
    starsAmount <= Number(TON_MAX_STARS)
      ? starsAmount * usdRate
      : null;
  const formattedUsdEstimate = usdEstimate
    ? usdEstimate.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : null;

  const handleContinue = async () => {
    const nextErrors: FieldErrors = {};

    if (!paymentMethod) {
      nextErrors.payment = t("paymentSelectError");
    }

    if (!isTonSelected) {
      nextErrors.payment = t("paymentSelectError");
    }

    if (!/^\d+$/.test(starsValue)) {
      nextErrors.stars = t("starsInvalid");
    } else {
      const starsCount = BigInt(starsValue);
      if (starsCount < TON_MIN_STARS) {
        nextErrors.stars = t("starsMin");
      } else if (starsCount > TON_MAX_STARS) {
        nextErrors.stars = t("starsMax");
      }
    }

    if (!username.trim()) {
      nextErrors.username = t("usernameRequired");
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    if (!tonReceiverAddress || !/^\S+$/.test(tonReceiverAddress)) {
      setFieldErrors({ payment: t("tonConfigMissing") });
      return;
    }

    if (!/^\d+$/.test(tonNanotonsPerStar)) {
      setFieldErrors({ payment: t("tonConfigMissing") });
      return;
    }

    if (!tonWallet) {
      openTonConnectModal();
      return;
    }

    const starsCount = BigInt(starsValue);
    const amount = (starsCount * BigInt(tonNanotonsPerStar)).toString();
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          address: tonReceiverAddress,
          amount,
        },
      ],
    };

    try {
      setIsSending(true);
      await tonConnectUI.sendTransaction(transaction);
    } catch (error) {
      setFieldErrors({ payment: t("tonFailed") });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <main className="relative mx-auto flex w-full max-w-5xl flex-col px-10 py-20 max-md:px-6 max-md:py-16 max-sm:px-4 max-sm:py-12">
        <div className="mb-8 space-y-4 text-center max-sm:space-y-3">
          <p
            className="font-display text-[60px] font-bold text-foreground max-md:text-[40px] max-sm:text-[24px]"
            aria-label={`${t("headlineLine1")} ${t("headlineLine2")}`}
          >
            <span className="block animate-fade-left animate-slow">
              {renderHeadlineWithIcon(t("headlineLine1"))}
            </span>
            <span className="block animate-fade-left animate-slow">
              {t("headlineLine2")}
            </span>
          </p>
        </div>
        <section
          className="w-full rounded-[36px] border border-border/80 bg-surface/95 p-10 shadow-2xl backdrop-blur animate-fade-up animate-slower max-md:p-8 max-sm:rounded-[28px] max-sm:p-6"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start max-md:gap-6 max-sm:gap-5">
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
                      onChange={(event) => {
                        const nextValue = event.target.value
                          .replace(/\s/g, "")
                          .replace(/^@+/, "")
                          .slice(0, 32);
                        setUsername(nextValue);
                        if (fieldErrors.username) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            username: undefined,
                          }));
                        }
                      }}
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
                        onClick={() => {
                          setUsername("");
                          setStatus("idle");
                          setAvatarUrl("");
                        }}
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
                      onClick={() => setPaymentOpen((prev) => !prev)}
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
                      <span
                        className={selectedPayment ? "text-foreground" : "text-muted"}
                      >
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
                          onClick={() => {
                            setPaymentMethod(option.id);
                            setPaymentOpen(false);
                            if (fieldErrors.payment) {
                              setFieldErrors((prev) => ({
                                ...prev,
                                payment: undefined,
                              }));
                            }
                          }}
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
                      onChange={(event) => {
                        const nextValue = formatStars(event.target.value);
                        setStars(nextValue);
                        if (fieldErrors.stars) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            stars: undefined,
                          }));
                        }
                      }}
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
                  onClick={handleContinue}
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

            <div className="relative overflow-hidden rounded-[28px] border border-border/70 bg-surface-muted p-7 shadow-sm max-md:p-6 max-sm:rounded-[24px] max-sm:p-5">
              <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-accent/20 blur-[50px]" />
              <div className="absolute -right-10 bottom-10 h-44 w-44 rounded-full bg-accent/15 blur-[60px]" />
              <div className="relative flex h-full min-h-[280px] flex-col justify-between max-sm:min-h-[240px]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted max-sm:text-[10px]">
                    {t("badge")}
                  </p>
                  <h3 className="mt-3 font-display text-2xl text-foreground max-sm:text-xl">
                    {t("heroTitle")}
                  </h3>
                  <p className="mt-3 text-base text-muted max-sm:text-sm">
                    {t("heroBody")}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-border/70 bg-surface px-5 py-3 text-sm font-semibold text-muted shadow-sm max-sm:px-4 max-sm:text-xs">
                  <span>TON / USD</span>
                  <span className="text-foreground">★ 100+</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
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


function formatStars(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const clamped = digits.slice(0, 5);
  return clamped.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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

function renderHeadlineWithIcon(text: string) {
  const token = "Telegram";
  const index = text.indexOf(token);
  if (index === -1) {
    return text;
  }
  const before = text.slice(0, index + token.length);
  const after = text.slice(index + token.length);
  return (
    <>
      {before}
              <img
                src="/telegram-plane.svg"
                alt="Telegram"
                draggable={false}
                className="ml-3 inline-block h-[70px] w-[70px] align-middle max-md:h-[58px] max-md:w-[58px] max-sm:h-[50px] max-sm:w-[50px]"
              />
      {after}
    </>
  );
}
