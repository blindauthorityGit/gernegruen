import { NextResponse, type NextRequest } from "next/server";
import {
  createUploadSession,
  isUploadPasswordConfigured,
  isValidUploadPassword,
  UPLOAD_SESSION_COOKIE,
  UPLOAD_SESSION_SECONDS,
} from "@/lib/uploads/auth";

const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.resetAt <= now) attempts.delete(key);
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return NextResponse.json({ message: "Zu viele Versuche. Bitte probiere es in 15 Minuten erneut." }, { status: 429 });
  if (!isUploadPasswordConfigured()) return NextResponse.json({ message: "Der Upload-Bereich ist noch nicht eingerichtet." }, { status: 503 });

  let password: unknown;
  try { password = (await request.json() as { password?: unknown }).password; }
  catch { return NextResponse.json({ message: "Bitte gib das Upload-Passwort ein." }, { status: 400 }); }
  if (typeof password !== "string" || !isValidUploadPassword(password)) {
    return NextResponse.json({ message: "Das Passwort stimmt nicht." }, { status: 401 });
  }

  attempts.delete(ip);
  const response = NextResponse.json({ message: "Anmeldung erfolgreich." });
  response.cookies.set(UPLOAD_SESSION_COOKIE, createUploadSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: UPLOAD_SESSION_SECONDS,
  });
  return response;
}
