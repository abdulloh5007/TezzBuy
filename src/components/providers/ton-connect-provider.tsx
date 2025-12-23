"use client";

import type { ReactNode } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

type TonConnectProviderProps = {
  children: ReactNode;
};

export function TonConnectProvider({ children }: TonConnectProviderProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const manifestUrl =
    process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ||
    (typeof window !== "undefined"
      ? new URL("/tonconnect-manifest.json", window.location.origin).toString()
      : baseUrl
        ? `${baseUrl}/tonconnect-manifest.json`
        : "");
        
  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      walletsRequiredFeatures={{ sendTransaction: { minMessages: 1 } }}
      actionsConfiguration={{
        modals: "all",
        notifications: "all",
        returnStrategy: "back",
      }}
    >
      {children}
    </TonConnectUIProvider>
  );
}
