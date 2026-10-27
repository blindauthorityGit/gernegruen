import { getAuth } from "firebase-admin/auth";
import { getApps } from "firebase-admin/app";
import { NextRequest, NextResponse } from "next/server";
import { authorizeDashboard, hasSameOrigin } from "@/lib/preorder/dashboard-auth";
import { getPreorderFirestore } from "@/lib/preorder/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cookieName = "gg_studio_session";
const sessionDuration = 14 * 24 * 60 * 60 * 1000;
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/api/studio", maxAge: sessionDuration / 1000 };

function allowedUids() {
  return (process.env.FIREBASE_ADMIN_UIDS ?? "").split(",").map((uid) => uid.trim()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  const auth = await authorizeDashboard(request);
  if (auth.response) return auth.response;
  return NextResponse.json({ authenticated: true });
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ message: "Ungültige Anfragequelle." }, { status: 403 });
  if (!allowedUids().length) return NextResponse.json({ message: "Admin-Zugriff ist noch nicht konfiguriert. Firebase-UID in FIREBASE_ADMIN_UIDS eintragen." }, { status: 503 });
  let body: { idToken?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Anmeldung konnte nicht verarbeitet werden." }, { status: 400 }); }
  if (typeof body.idToken !== "string" || !body.idToken) return NextResponse.json({ message: "Firebase hat kein gültiges Anmeldetoken geliefert." }, { status: 400 });

  const requestId = crypto.randomUUID();
  let stage = "firebase_admin_initialization";
  try {
    getPreorderFirestore();
    const auth = getAuth(getApps()[0]);
    stage = "verify_firebase_token";
    const identity = await auth.verifyIdToken(body.idToken, true);
    if (!allowedUids().includes(identity.uid)) return NextResponse.json({ message: "Dieses Konto ist nicht für das Dashboard freigeschaltet. Firebase-UID zu FIREBASE_ADMIN_UIDS hinzufügen." }, { status: 403 });
    stage = "create_session_cookie";
    const cookie = await auth.createSessionCookie(body.idToken, { expiresIn: sessionDuration });
    const response = NextResponse.json({ authenticated: true });
    stage = "set_session_cookie";
    response.cookies.set(cookieName, cookie, { ...cookieOptions, expires: new Date(Date.now() + sessionDuration) });
    return response;
  } catch (error) {
    const details = error && typeof error === "object" ? error as { name?: unknown; message?: unknown; code?: unknown } : {};
    const errorMessage = typeof details.message === "string" ? details.message.replace(/[\r\n]+/g, " ").slice(0, 300) : "Unknown error";
    console.error("Studio session creation failed", {
      event: "studio_session_creation_failed",
      requestId,
      stage,
      projectId: process.env.FIREBASE_PROJECT_ID || "missing",
      adminConfig: {
        clientEmailConfigured: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
        privateKeyConfigured: Boolean(process.env.FIREBASE_PRIVATE_KEY),
        allowedUidCount: allowedUids().length,
      },
      error: {
        name: typeof details.name === "string" ? details.name : "Error",
        code: typeof details.code === "string" ? details.code : undefined,
        message: errorMessage,
      },
    });
    const status = stage === "verify_firebase_token" ? 401 : 500;
    const message = stage === "verify_firebase_token"
      ? "Firebase konnte das Anmeldetoken nicht prüfen. Kontrolliere, ob Web- und Admin-Konfiguration zum selben Firebase-Projekt gehören."
      : "Die sichere Dashboard-Sitzung konnte nicht erstellt werden. Bitte den Fehler in den Vercel Runtime Logs prüfen.";
    return NextResponse.json({ message, requestId }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ message: "Ungültige Anfragequelle." }, { status: 403 });
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(cookieName, "", { ...cookieOptions, maxAge: 0, expires: new Date(0) });
  return response;
}
