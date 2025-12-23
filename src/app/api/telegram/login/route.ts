import crypto from "crypto";
import { NextResponse } from "next/server";

type TelegramAuthPayload = {
  id: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date?: number | string;
  hash?: string;
};

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const SESSION_COOKIE = "tg_session";

function buildCheckString(payload: TelegramAuthPayload) {
  return Object.entries(payload)
    .filter(([key, value]) => key !== "hash" && value !== undefined && value !== null)
    .map(([key, value]) => [key, String(value)] as const)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

export async function POST(request: Request) {
  if (!BOT_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "Missing TELEGRAM_BOT_TOKEN" },
      { status: 500 }
    );
  }

  let payload: TelegramAuthPayload;
  try {
    payload = (await request.json()) as TelegramAuthPayload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!payload?.hash || payload.id === undefined || payload.id === null) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const checkString = buildCheckString(payload);
  const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  if (computedHash !== payload.hash) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const username = typeof payload.username === "string" ? payload.username : "";
  const redirectTarget = username ? username : String(payload.id);
  const redirectUrl = `/u/${encodeURIComponent(redirectTarget)}`;

  const sessionPayload = {
    id: Number(payload.id),
    username: username || null,
    auth_date: Number(payload.auth_date) || Math.floor(Date.now() / 1000),
  };
  const sessionBase = Buffer.from(JSON.stringify(sessionPayload)).toString(
    "base64url"
  );
  const sessionSig = crypto
    .createHmac("sha256", BOT_TOKEN)
    .update(sessionBase)
    .digest("base64url");
  const sessionValue = `${sessionBase}.${sessionSig}`;

  const response = NextResponse.json(
    { ok: true, redirectUrl },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
  response.cookies.set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
