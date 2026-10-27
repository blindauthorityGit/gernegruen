import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextResponse, type NextRequest } from "next/server";

import { getPreorderFirestore } from "@/lib/preorder/firebase-admin";
import { isValidPickupDate } from "@/lib/preorder/availability";
import { sendCustomerPreorderConfirmationMail, sendPreorderMail } from "@/lib/preorder/mail";
import { toOrderableBakeryCategories } from "@/lib/preorder/products";
import { getCurrentBakeryGroups } from "@/lib/weekly/data";
import { unconfirmedOrderExpiresAt } from "@/lib/preorder/retention";

export const runtime = "nodejs";

type Payload = {
  requestId?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  pickupDate?: unknown;
  message?: unknown;
  website?: unknown;
  items?: unknown;
};

type RateEntry = { count: number; resetAt: number };
const globalRateStore = globalThis as typeof globalThis & { preorderRateStore?: Map<string, RateEntry> };
const rateStore = globalRateStore.preorderRateStore ??= new Map<string, RateEntry>();

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
  const collectionName = isDev ? "bakeryPreorders_dev" : "bakeryPreorders";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) return error("Zu viele Anfragen. Bitte versuche es in einigen Minuten erneut.", 429);

  let body: Payload;
  try {
    body = await request.json() as Payload;
  } catch {
    return error("Die Anfrage konnte nicht gelesen werden.");
  }

  if (cleanString(body.website, 200)) return NextResponse.json({ status: "success" });

  const requestId = cleanString(body.requestId, 36);
  const name = cleanString(body.name, 100);
  const email = cleanString(body.email, 254).toLowerCase();
  const phone = cleanString(body.phone, 50);
  const pickupDate = cleanString(body.pickupDate, 10);
  const message = cleanString(body.message, 2000);

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) return error("Ungültige Anfrage-ID.");
  if (name.length < 2 || name.length > 100) return error("Bitte gib einen gültigen Namen an.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return error("Bitte gib eine gültige E-Mail-Adresse an.");
  if (phone.length < 5 || phone.length > 50) return error("Bitte gib eine gültige Telefonnummer an.");
  if (message.length > 2000) return error("Die zusätzliche Nachricht ist zu lang.");
  if (!isValidPickupDate(pickupDate)) return error("Der gewählte Abholtag ist nicht verfügbar oder die Vorbestellfrist ist abgelaufen. Bitte wähle einen späteren Termin.");
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) return error("Bitte wähle mindestens ein Produkt aus.");

  const requestedItems = body.items as Array<{ productId?: unknown; quantity?: unknown }>;
  const uniqueIds = new Set<string>();
  for (const item of requestedItems) {
    if (typeof item.productId !== "string" || uniqueIds.has(item.productId)) return error("Die Produktauswahl ist ungültig.");
    if (!Number.isInteger(item.quantity) || Number(item.quantity) < 1 || Number(item.quantity) > 99) return error("Eine Produktmenge ist ungültig.");
    uniqueIds.add(item.productId);
  }

  const categories = toOrderableBakeryCategories(await getCurrentBakeryGroups());
  const currentProducts = new Map(categories.flatMap((category) => category.products.map((product) => [product.id, product])));
  const items = requestedItems.map((requested) => {
    const product = currentProducts.get(requested.productId as string);
    const quantity = requested.quantity as number;
    return product ? {
      productId: product.id,
      name: product.name,
      quantity,
      unitPriceCents: product.priceCents,
      lineTotalCents: product.priceCents * quantity,
    } : null;
  });
  if (items.some((item) => !item)) return error("Mindestens ein Produkt ist nicht mehr verfügbar. Bitte aktualisiere die Auswahl.", 409);

  const orderItems = items.filter((item): item is NonNullable<typeof item> => item !== null);
  const totalCents = orderItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
  const createdAt = new Date();
  const expiresAt = unconfirmedOrderExpiresAt(pickupDate);

  try {
    const firestore = getPreorderFirestore();
    const reference = firestore.collection(collectionName).doc(requestId);
    const existing = await firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      if (snapshot.exists) return snapshot.data();
      transaction.create(reference, {
        requestId,
        name,
        email,
        phone,
        pickupDate,
        products: orderItems,
        totalCents,
        message,
        status: "pending",
        environment: isDev ? "dev" : "live",
        emailStatus: "pending",
        customerEmailStatus: "pending",
        createdAt: Timestamp.fromDate(createdAt),
        expiresAt: expiresAt ? Timestamp.fromDate(expiresAt) : null,
      });
      return null;
    });

    if (existing) {
      const customerEmailStatus = existing.customerEmailStatus === "sent" ? "success" : "stored_email_failed";
      return NextResponse.json({ status: customerEmailStatus, requestId }, { status: customerEmailStatus === "success" ? 200 : 202 });
    }

    const mailOrder = { requestId, name, email, phone, pickupDate, message, items: orderItems, totalCents, createdAt, isDev };
    let customerMailWasSent = false;
    try {
      await sendPreorderMail(mailOrder);
      await reference.update({ emailStatus: "sent", emailSentAt: Timestamp.now() });
    } catch {
      try {
        await reference.update({
          emailStatus: "failed",
          emailErrorCode: "delivery_failed",
          emailError: FieldValue.delete(),
          emailLastAttemptAt: Timestamp.now(),
        });
      } catch {
        console.error("Fehlgeschlagener Status der Betreiber-Benachrichtigung konnte nicht gespeichert werden.");
      }
    }

    try {
      await sendCustomerPreorderConfirmationMail(mailOrder);
      customerMailWasSent = true;
    } catch {
      try {
        await reference.update({ customerEmailStatus: "failed", customerEmailLastAttemptAt: Timestamp.now() });
      } catch {
        console.error("Status der Kundenbestätigung konnte nicht gespeichert werden.");
      }
    }

    if (customerMailWasSent) {
      try {
        await reference.update({ customerEmailStatus: "sent", customerEmailSentAt: Timestamp.now() });
      } catch {
        console.error("Versendete Kundenbestätigung konnte nicht als versendet markiert werden.");
      }
    }

    return NextResponse.json(
      { status: customerMailWasSent ? "success" : "stored_email_failed", requestId },
      { status: customerMailWasSent ? 200 : 202 },
    );
  } catch {
    console.error("Vorbestellung konnte nicht in Firestore gespeichert werden.");
    return error("Die Anfrage konnte gerade nicht gespeichert werden. Bitte versuche es später erneut oder rufe uns an.", 503);
  }
}
