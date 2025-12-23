import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const interBody = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const interDisplay = Inter({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Telegram Stars",
  description: "Быстрая покупка Telegram Stars с выбором способа оплаты.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const languageCookie = cookieStore.get("language")?.value;
  const initialTheme = themeCookie === "dark" ? "dark" : "light";
  const initialLanguage = languageCookie === "uz" ? "uz" : "ru";

  return (
    <html lang={initialLanguage} data-theme={initialTheme}>
      <body
        className={`${interBody.variable} ${interDisplay.variable} antialiased`}
        suppressHydrationWarning
      >
        <AppShell
          initialLanguage={initialLanguage}
          initialTheme={initialTheme}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
