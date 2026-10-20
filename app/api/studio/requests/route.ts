import {Timestamp} from "firebase-admin/firestore";
import {NextRequest, NextResponse} from "next/server";
import {authorizeDashboard, dashboardCollections, hasSameOrigin} from "@/lib/preorder/dashboard-auth";
import { getPreorderFirestore } from "@/lib/preorder/firebase-admin";
import {orderExpiresAt, productWishExpiresAt, unconfirmedOrderExpiresAt, effectiveExpiry} from "@/lib/preorder/retention";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serialize(snapshot: FirebaseFirestore.QueryDocumentSnapshot, type: "order" | "wish") {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: typeof data.name === "string" ? data.name : "",
    email: typeof data.email === "string" ? data.email : "",
    phone: typeof data.phone === "string" ? data.phone : "",
    pickupDate: typeof data.pickupDate === "string" ? data.pickupDate : "",
    products: Array.isArray(data.products) ? data.products.map((item: Record<string, unknown>) => ({ name: item.name, quantity: item.quantity, unitPriceCents: item.unitPriceCents })) : [],
    totalCents: typeof data.totalCents === "number" ? data.totalCents : null,
    message: typeof data.message === "string" ? data.message : "",
    product: typeof data.product === "string" ? data.product : "",
    description: typeof data.description === "string" ? data.description : "",
    status: typeof data.status === "string" ? data.status : "pending",
    customerEmailStatus: typeof data.customerEmailStatus === "string" ? data.customerEmailStatus : "",
    createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
    expiresAt: effectiveExpiry(type, data)?.toISOString() ?? null,
    lastSubstantiveActivityAt: data.lastSubstantiveActivityAt?.toDate?.().toISOString() ?? null,
    contractConcludedAt: data.contractConcludedAt?.toDate?.().toISOString() ?? null,
    completedAt: data.completedAt?.toDate?.().toISOString() ?? null,
    archiveVerifiedAt: data.archiveVerifiedAt?.toDate?.().toISOString() ?? null,
  };
}

async function listActive(collectionName: string, type: "order" | "wish", now: Date) {
  const collection = getPreorderFirestore().collection(collectionName);
  const documents: FirebaseFirestore.QueryDocumentSnapshot[] = [];
  let cursor: FirebaseFirestore.QueryDocumentSnapshot | undefined;

  while (documents.length <= 100) {
    let query = collection.orderBy("createdAt", "desc").limit(100);
    if (cursor) query = query.startAfter(cursor);
    const page = await query.get();
    for (const document of page.docs) {
      const expiry = effectiveExpiry(type, document.data());
      if (!expiry || expiry.getTime() > now.getTime()) documents.push(document);
    }
    if (page.size < 100) break;
    cursor = page.docs[page.docs.length - 1];
  }

  return {documents: documents.slice(0, 100), hasMore: documents.length > 100};
}

export async function GET(request: NextRequest) {
  const auth = await authorizeDashboard(request);
  if (auth.response) return auth.response;
  const { orders, wishes } = dashboardCollections();
  const [orderResults, wishResults] = await Promise.all([
    listActive(orders, "order", new Date()),
    listActive(wishes, "wish", new Date()),
  ]);
  return NextResponse.json({
    orders: orderResults.documents.map((document) => serialize(document, "order")),
    wishes: wishResults.documents.map((document) => serialize(document, "wish")),
    hasMore: orderResults.hasMore || wishResults.hasMore,
  });
}

type UpdatePayload = {type?: unknown; id?: unknown; action?: unknown};
type UpdateAction = "record-activity" | "complete-wish" | "confirm-order" | "complete-order" | "archive-order" | "cancel-order";

export async function PATCH(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({message: "Ungültige Anfragequelle."}, {status: 403});
  const auth = await authorizeDashboard(request);
  if (auth.response) return auth.response;

  let body: UpdatePayload;
  try { body = await request.json() as UpdatePayload; }
  catch { return NextResponse.json({message: "Die Anfrage konnte nicht verarbeitet werden."}, {status: 400}); }

  if ((body.type !== "order" && body.type !== "wish") || typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id)) {
    return NextResponse.json({message: "Die Anfrage ist ungültig."}, {status: 400});
  }
  const actions: UpdateAction[] = ["record-activity", "complete-wish", "confirm-order", "complete-order", "archive-order", "cancel-order"];
  if (typeof body.action !== "string" || !actions.includes(body.action as UpdateAction)) {
    return NextResponse.json({message: "Die gewünschte Statusänderung ist ungültig."}, {status: 400});
  }
  const action = body.action as UpdateAction;
  if (body.type === "wish" && !["record-activity", "complete-wish"].includes(action)) return NextResponse.json({message: "Diese Aktion passt nicht zu einem Produktwunsch."}, {status: 400});
  if (body.type === "order" && ["record-activity", "complete-wish"].includes(action)) return NextResponse.json({message: "Diese Aktion passt nicht zu einer Vorbestellung."}, {status: 400});

  const {orders, wishes} = dashboardCollections();
  const collectionName = body.type === "order" ? orders : wishes;
  const reference = getPreorderFirestore().collection(collectionName).doc(body.id);
  const now = Timestamp.now();

  try {
    await getPreorderFirestore().runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists) throw new Error("NOT_FOUND");
      const data = snapshot.data() ?? {};

      if (body.type === "wish") {
        const createdAt = data.createdAt?.toDate?.();
        if (!(createdAt instanceof Date)) throw new Error("INVALID_CREATED_AT");
        if (action === "record-activity") {
          const nextStatus = data.status === "completed" ? "completed" : "in_progress";
          transaction.update(reference, {
            status: nextStatus,
            lastSubstantiveActivityAt: now,
            expiresAt: Timestamp.fromDate(productWishExpiresAt(createdAt, now.toDate())),
          });
        } else {
          transaction.update(reference, {
            status: "completed",
            lastSubstantiveActivityAt: now,
            expiresAt: Timestamp.fromDate(productWishExpiresAt(createdAt, now.toDate())),
          });
        }
        return;
      }

      const status = typeof data.status === "string" ? data.status : "pending";
      if (action === "confirm-order") {
        if (!["pending", "in_progress"].includes(status)) throw new Error("INVALID_TRANSITION");
        transaction.update(reference, {status: "confirmed", contractConcludedAt: now, expiresAt: null});
      } else if (action === "complete-order") {
        if (status !== "confirmed") throw new Error("INVALID_TRANSITION");
        transaction.update(reference, {status: "completed", completedAt: now, archiveVerifiedAt: null, expiresAt: null});
      } else if (action === "archive-order") {
        if (status !== "completed" || !data.completedAt?.toDate?.()) throw new Error("INVALID_TRANSITION");
        const archiveVerifiedAt = now;
        const expiresAt = orderExpiresAt({...data, status, archiveVerifiedAt, completedAt: data.completedAt});
        if (!expiresAt) throw new Error("INVALID_RETENTION_DATE");
        transaction.update(reference, {archiveVerifiedAt, expiresAt: Timestamp.fromDate(expiresAt)});
      } else if (action === "cancel-order") {
        if (!["pending", "in_progress"].includes(status)) throw new Error("INVALID_TRANSITION");
        const expiresAt = typeof data.pickupDate === "string" ? unconfirmedOrderExpiresAt(data.pickupDate) : null;
        transaction.update(reference, {status: "cancelled", expiresAt: expiresAt ? Timestamp.fromDate(expiresAt) : null});
      }
    });
    return NextResponse.json({status: "updated"});
  } catch (updateError) {
    const code = updateError instanceof Error ? updateError.message : "";
    if (code === "NOT_FOUND") return NextResponse.json({message: "Die Anfrage wurde nicht gefunden."}, {status: 404});
    if (code === "INVALID_TRANSITION") return NextResponse.json({message: "Der Status hat sich geändert. Lade die Anfrage neu und prüfe den aktuellen Stand."}, {status: 409});
    if (code === "INVALID_CREATED_AT" || code === "INVALID_RETENTION_DATE") return NextResponse.json({message: "Für diese Anfrage fehlen Angaben zur sicheren Berechnung der Aufbewahrungsfrist."}, {status: 409});
    console.error("Statusänderung im Betreiber-Dashboard konnte nicht gespeichert werden.");
    return NextResponse.json({message: "Die Änderung konnte gerade nicht gespeichert werden."}, {status: 503});
  }
}

