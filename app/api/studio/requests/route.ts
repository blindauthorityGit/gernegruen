import { NextRequest, NextResponse } from "next/server";
import { authorizeDashboard, dashboardCollections } from "@/lib/preorder/dashboard-auth";
import { getPreorderFirestore } from "@/lib/preorder/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serialize(snapshot: FirebaseFirestore.QueryDocumentSnapshot) {
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
    createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
  };
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

