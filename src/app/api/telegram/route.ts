import { NextResponse } from "next/server";

const TELEGRAM_HOST = "https://t.me";

function isValidUsername(value: string) {
  return /^[a-zA-Z0-9_]{5,32}$/.test(value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = (searchParams.get("username") || "").replace(/^@+/, "");

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { found: false },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(`${TELEGRAM_HOST}/${username}`, {
      signal: controller.signal,
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const found = response.status === 200 || response.status === 302;
    const avatarUrl = found
      ? `${TELEGRAM_HOST}/i/userpic/320/${username}.jpg`
      : undefined;

    return NextResponse.json(
      { found, avatarUrl },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { found: false },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } finally {
    clearTimeout(timeout);
  }
}
