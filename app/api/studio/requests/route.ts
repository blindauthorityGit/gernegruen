import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { authorizeDashboard, dashboardCollections } from "@/lib/preorder/dashboard-auth";
import { getPreorderFirestore } from "@/lib/preorder/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serialize(snapshot: FirebaseFirestore.QueryDocumentSnapshot) {
  const data = snapshot.data();
  return { ...data, id: snapshot.id, createdAt: data.createdAt?.toDate?.().toISOString() ?? null, statusUpdatedAt: data.statusUpdatedAt?.toDate?.().toISOString() ?? null };
}

export async function GET(request: NextRequest) {
  const auth = await authorizeDashboard(request);
  if (auth.response) return auth.response;
  const db = getPreorderFirestore();
  const { orders, wishes } = dashboardCollections();
  const [orderSnapshot, wishSnapshot] = await Promise.all([
    db.collection(orders).orderBy("createdAt", "desc").limit(100).get(),
    db.collection(wishes).orderBy("createdAt", "desc").limit(100).get(),
  ]);
  return NextResponse.json({ orders: orderSnapshot.docs.map(serialize), wishes: wishSnapshot.docs.map(serialize), hasMore: orderSnapshot.size === 100 || wishSnapshot.size === 100 });
}

export async function PATCH(request: NextRequest) {
  const auth = await authorizeDashboard(request);
  if (auth.response) return auth.response;
  let body: { type?: unknown; id?: unknown; status?: unknown; internalNotes?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Ungültige Anfrage." }, { status: 400 }); }
  if (typeof body.id !== "string" || !/^[\w-]{1,128}$/.test(body.id) || (body.type !== "order" && body.type !== "wish")) return NextResponse.json({ message: "Ungültige Anfrage." }, { status: 400 });
  const statuses = body.type === "order" ? ["pending", "in_progress", "completed", "cancelled"] : ["pending", "read", "completed"];
  const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !statuses.includes(body.status)) return NextResponse.json({ message: "Ungültiger Status." }, { status: 400 });
    update.status = body.status;
    update.statusUpdatedAt = FieldValue.serverTimestamp();
  }
  if (body.internalNotes !== undefined) {
    if (typeof body.internalNotes !== "string" || body.internalNotes.length > 5000) return NextResponse.json({ message: "Notiz darf maximal 5000 Zeichen lang sein." }, { status: 400 });
    update.internalNotes = body.internalNotes.trim();
  }
  if (Object.keys(update).length === 1) return NextResponse.json({ message: "Keine Änderung angegeben." }, { status: 400 });
  const collection = dashboardCollections()[body.type === "order" ? "orders" : "wishes"];
  await getPreorderFirestore().collection(collection).doc(body.id).update(update);
  return NextResponse.json({ success: true });
}
