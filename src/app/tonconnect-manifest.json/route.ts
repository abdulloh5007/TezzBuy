import { NextResponse } from "next/server";

const APP_NAME = process.env.NEXT_PUBLIC_TONCONNECT_APP_NAME || "Tezz Buy";
const TERMS_URL = process.env.NEXT_PUBLIC_TONCONNECT_TERMS_URL;
const PRIVACY_URL = process.env.NEXT_PUBLIC_TONCONNECT_PRIVACY_URL;
const ICON_PATH =
  process.env.NEXT_PUBLIC_TONCONNECT_ICON_PATH || "/tonconnect-icon.svg";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const baseUrl = (APP_URL || requestUrl.origin).replace(/\/$/, "");
  const iconUrl = new URL(ICON_PATH, baseUrl).toString();
  const termsUrl = TERMS_URL ? new URL(TERMS_URL, baseUrl).toString() : null;
  const privacyUrl = PRIVACY_URL
    ? new URL(PRIVACY_URL, baseUrl).toString()
    : null;    

  const manifest = {
    url: baseUrl,
    name: APP_NAME,
    iconUrl,
    ...(termsUrl ? { termsOfUseUrl: termsUrl } : {}),
    ...(privacyUrl ? { privacyPolicyUrl: privacyUrl } : {}),
  };

  return NextResponse.json(manifest, {
    status: 200,
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
