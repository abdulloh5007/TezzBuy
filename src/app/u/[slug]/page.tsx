import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileContent } from "@/components/profile/profile-content";
import { ProfileUnauthorized } from "@/components/profile/profile-unauthorized";

type UserPageProps = {
  params: { slug: string };
};

export default async function UserPage({ params }: UserPageProps) {
  const session = await readSession();
  if (!session) {
    return <ProfileUnauthorized />;
  }

  const target = session.username ? session.username : String(session.id);
  if (params.slug !== target) {
    redirect(`/u/${encodeURIComponent(target)}`);
  }

  return <ProfileContent slug={target} />;
}

type SessionPayload = {
  id: number;
  username?: string | null;
  auth_date?: number;
};

const SESSION_COOKIE = "tg_session";

async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;

  const secret = process.env.TELEGRAM_BOT_TOKEN || "";
  if (!secret) return null;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  if (expected.length !== signature.length) return null;
  const matches = crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
  if (!matches) return null;

  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const data = JSON.parse(decoded) as SessionPayload;
    if (!data?.id) return null;
    return data;
  } catch {
    return null;
  }
}
