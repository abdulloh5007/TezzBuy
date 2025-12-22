"use client";

import { TonConnectButton } from "@tonconnect/ui-react";

export function SiteHeader() {
  return (
    <header className="z-30 border-b border-border/70 animate-fade-down animate-slower animate-delay-1000">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-10 py-5 max-md:px-6 max-md:py-4 max-sm:px-4 max-sm:py-3">
        <div className="flex items-center gap-4 max-sm:gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white shadow-md max-sm:h-9 max-sm:w-9">
            ✦
          </div>
          <p className="font-display text-lg text-ink max-sm:text-base">Tezz Buy</p>
        </div>
        <div className="flex items-center">
          <TonConnectButton className="ton-connect-button" />
        </div>
      </div>
    </header>
  );
}
