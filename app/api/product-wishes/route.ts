import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextResponse, type NextRequest } from "next/server";

import { getPreorderFirestore } from "@/lib/preorder/firebase-admin";
import { sendProductWishMail } from "@/lib/preorder/mail";
import { productWishExpiresAt } from "@/lib/preorder/retention";

export const runtime = "nodejs";

type Payload = { requestId?: unknown; product?: unknown; description?: unknown; name?: unknown; email?: unknown; website?: unknown };
type RateEntry = { count: number; resetAt: number };
const globalRateStore = globalThis as typeof globalThis & { productWishRateStore?: Map<string, RateEntry> };
const rateStore = globalRateStore.productWishRateStore ??= new Map<string, RateEntry>();

function isRateLimited(ip: string) {
  const now = Date.now();
  for (const [key, entry] of rateStore) if (entry.resetAt <= now) rateStore.delete(key);
  const entry = rateStore.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateStore.set(ip, { count: 1, resetAt: now + 15 * 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 5;
}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength + 1) : "";
}

function error(message: string, status = 400) {
  return NextResponse.json({ status: "error", message }, { status });
}

export async function POST(request: NextRequest) {
  const devFlag = process.env.BAKERY_PREORDER_DEV;
  const isDev = devFlag === "true" || (devFlag !== "false" && process.env.NODE_ENV !== "production");
  const collectionName = isDev ? "productWishes_dev" : "productWishes";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) return error("Zu viele Anfragen. Bitte versuche es in einigen Minuten erneut.", 429);

  let body: Payload;
  try { body = await request.json() as Payload; }
  catch { return error("Die Anfrage konnte nicht gelesen werden."); }

  if (cleanString(body.website, 200)) return NextResponse.json({ status: "success" });

  const requestId = cleanString(body.requestId, 36);
  const product = cleanString(body.product, 160);
  const description = cleanString(body.description, 2000);
  const name = cleanString(body.name, 100);
  const email = cleanString(body.email, 254).toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) return error("Ungültige Anfrage-ID.");
  if (product.length < 2 || product.length > 160) return error("Bitte gib einen gültigen Produktwunsch an.");
  if (description.length > 2000 || name.length > 100) return error("Die Eingabe ist zu lang.");
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return error("Bitte gib eine gültige E-Mail-Adresse an.");

  const createdAt = new Date();
  try {
    const firestore = getPreorderFirestore();
    const reference = firestore.collection(collectionName).doc(requestId);
    const existing = await firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      if (snapshot.exists) return snapshot.data();
      transaction.create(reference, {
        requestId, product, description, name, email,
        status: "pending",
        environment: isDev ? "dev" : "live",
        emailStatus: "pending",
        createdAt: Timestamp.fromDate(createdAt),
        lastSubstantiveActivityAt: Timestamp.fromDate(createdAt),
        expiresAt: Timestamp.fromDate(productWishExpiresAt(createdAt)),
      });
      return null;
    });

    if (existing) {
      return NextResponse.json({ status: existing.emailStatus === "sent" ? "success" : "stored_email_failed", requestId }, { status: existing.emailStatus === "sent" ? 200 : 202 });
    }

    let mailWasSent = false;
    try {
      await sendProductWishMail({ requestId, product, description, name, email, createdAt, isDev });
      mailWasSent = true;
      await reference.update({ emailStatus: "sent", emailSentAt: Timestamp.now() });
      return NextResponse.json({ status: "success", requestId });
    } catch {
      console.error(mailWasSent ? "Produktwunsch-Mailstatus konnte nicht aktualisiert werden." : "Produktwunsch-E-Mail konnte nicht versendet werden.");
      if (mailWasSent) return NextResponse.json({ status: "success", requestId });
      try {
        await reference.update({
          emailStatus: "failed",
          emailErrorCode: "delivery_failed",
          emailError: FieldValue.delete(),
          emailLastAttemptAt: Timestamp.now(),
        });
      } catch {
        console.error("Fehlgeschlagener Produktwunsch-Versandstatus konnte nicht gespeichert werden.");
      }
      return NextResponse.json({ status: "stored_email_failed", requestId }, { status: 202 });
    }
  } catch {
    console.error("Produktwunsch konnte nicht in Firestore gespeichert werden.");
    return error("Dein Wunsch konnte gerade nicht gespeichert werden. Bitte versuche es später erneut.", 503);
  }
}
