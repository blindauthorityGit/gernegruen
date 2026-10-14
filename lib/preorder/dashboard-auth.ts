import "server-only";

import { getAuth } from "firebase-admin/auth";
import { getApps } from "firebase-admin/app";
import type { NextRequest } from "next/server";
import { getPreorderFirestore } from "@/lib/preorder/firebase-admin";

export async function authorizeDashboard(request: NextRequest) {
  const token = request.cookies.get("gg_studio_session")?.value ?? "";
  if (!token) return { response: Response.json({ message: "Bitte melde dich für den geschützten Admin-Zugriff an." }, { status: 401 }) };
  const allowed = (process.env.FIREBASE_ADMIN_UIDS ?? "").split(",").map((uid) => uid.trim()).filter(Boolean);
  if (!allowed.length) return { response: Response.json({ message: "Der Admin-Zugriff ist noch nicht konfiguriert." }, { status: 503 }) };
  try {
    getPreorderFirestore();
    const identity = await getAuth(getApps()[0]).verifySessionCookie(token, true);
    if (!allowed.includes(identity.uid)) return { response: Response.json({ message: "Keine Berechtigung für dieses Dashboard." }, { status: 403 }) };
    return { identity };
  } catch {
    return { response: Response.json({ message: "Die Anmeldung ist ungültig oder abgelaufen." }, { status: 401 }) };
  }
}

export function hasSameOrigin(request: NextRequest) {
  return request.headers.get("origin") === request.nextUrl.origin;
}

export function dashboardCollections() {
  const dev = process.env.BAKERY_PREORDER_DEV === "true" || (process.env.BAKERY_PREORDER_DEV !== "false" && process.env.NODE_ENV !== "production");
  return { orders: dev ? "bakeryPreorders_dev" : "bakeryPreorders", wishes: dev ? "productWishes_dev" : "productWishes" };
}
