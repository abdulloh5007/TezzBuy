"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useTonConnectModal,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { useI18n } from "@/components/providers/i18n-context";
import { HomeHeadline } from "@/components/home/home-headline";
import { PurchaseSection } from "@/components/home/purchase-section";
import { ReferralSection } from "@/components/home/referral-section";

type TelegramStatus = "idle" | "checking" | "found" | "notfound";
type PaymentId = "ton" | "usd";
type FieldErrors = {
  username?: string;
  payment?: string;
  stars?: string;
};
type TelegramAuthPayload = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date?: number;
  hash: string;
};

declare global {
  interface Window {
    Telegram?: {
      Login?: {
        auth: (
          params: {
            bot_id: number;
            request_access?: boolean | "write" | "read";
          },
          callback: (user: TelegramAuthPayload | false) => void
        ) => void;
      };
    };
  }
}

const TON_MIN_STARS = 50;
const TON_MAX_STARS = 10000;

export function HomeContent() {
  const { t } = useI18n();
  const translate = t as (key: string) => string;
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
  const [isTelegramReady, setIsTelegramReady] = useState(false);
  const [isTelegramAuthLoading, setIsTelegramAuthLoading] = useState(false);
  const latestQuery = useRef("");
  const paymentRef = useRef<HTMLDivElement>(null);
  const telegramBotId = Number(process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || 0);
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
    if (!telegramBotId || typeof window === "undefined") return;
    if (window.Telegram?.Login?.auth) {
      setIsTelegramReady(true);
      return;
    }

    const scriptId = "telegram-login-widget";
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => {
          if (window.Telegram?.Login?.auth) {
            setIsTelegramReady(true);
          }
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.onload = () => {
      if (window.Telegram?.Login?.auth) {
        setIsTelegramReady(true);
      }
    };
    script.onerror = () => setIsTelegramReady(false);
    document.body.appendChild(script);
  }, [telegramBotId]);

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

  const handleUsernameChange = (value: string) => {
    const nextValue = value
      .replace(/\s/g, "")
      .replace(/^@+/, "")
      .slice(0, 32);
    setUsername(nextValue);
    if (fieldErrors.username) {
      setFieldErrors((prev) => ({ ...prev, username: undefined }));
    }
  };

  const handleUsernameClear = () => {
    setUsername("");
    setStatus("idle");
    setAvatarUrl("");
  };

  const handleTogglePayment = () => {
    setPaymentOpen((prev) => !prev);
  };

  const handleSelectPayment = (nextPayment: PaymentId) => {
    setPaymentMethod(nextPayment);
    setPaymentOpen(false);
    if (fieldErrors.payment) {
      setFieldErrors((prev) => ({ ...prev, payment: undefined }));
    }
  };

  const handleStarsChange = (value: string) => {
    const nextValue = formatStars(value);
    setStars(nextValue);
    if (fieldErrors.stars) {
      setFieldErrors((prev) => ({ ...prev, stars: undefined }));
    }
  };

  const handleTelegramLogin = () => {
    if (!telegramBotId || !window.Telegram?.Login?.auth) {
      return;
    }

    setIsTelegramAuthLoading(true);
    window.Telegram.Login.auth(
      { bot_id: telegramBotId, request_access: "write" },
      async (user) => {
        setIsTelegramAuthLoading(false);
        if (!user) return;

        try {
          const response = await fetch("/api/telegram/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
          });
          if (!response.ok) return;

          const data = (await response.json()) as { redirectUrl?: string };
          if (data?.redirectUrl) {
            window.location.assign(data.redirectUrl);
          }
        } catch (error) {
          console.error("Telegram auth failed:", error);
        }
      }
    );
  };

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
        <HomeHeadline line1={t("headlineLine1")} line2={t("headlineLine2")} />
        <PurchaseSection
          t={translate}
          username={username}
          status={status}
          avatarUrl={avatarUrl}
          usernameError={usernameError}
          onUsernameChange={handleUsernameChange}
          onUsernameClear={handleUsernameClear}
          paymentRef={paymentRef}
          paymentOpen={paymentOpen}
          paymentOptions={paymentOptions}
          paymentMethod={paymentMethod}
          selectedPayment={selectedPayment}
          paymentError={paymentError}
          onTogglePayment={handleTogglePayment}
          onSelectPayment={handleSelectPayment}
          stars={stars}
          onStarsChange={handleStarsChange}
          starsError={starsError}
          formattedUsdEstimate={formattedUsdEstimate}
          isSending={isSending}
          isTonSelected={isTonSelected}
          onContinue={handleContinue}
        />
        <ReferralSection
          headline={t("referralHeadline")}
          buttonLabel={t("loginTelegram")}
          isDisabled={!isTelegramReady || isTelegramAuthLoading}
          onLogin={handleTelegramLogin}
        />
      </main>
    </div>
  );
}

function formatStars(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const clamped = digits.slice(0, 5);
  return clamped.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
