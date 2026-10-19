import {cert, getApps, initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {GoogleAuth} from "google-auth-library";
import {mkdir, writeFile} from "node:fs/promises";
import {readFileSync} from "node:fs";
import {join} from "node:path";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "").replace(/\\n/g, "\n");
}

const required = (name) => {
  if (!process.env[name]) throw new Error(`Missing ${name} in environment.`);
  return process.env[name];
};

const app = getApps()[0] ?? initializeApp({
  credential: cert({
    projectId: required("FIREBASE_PROJECT_ID"),
    clientEmail: required("FIREBASE_CLIENT_EMAIL"),
    privateKey: required("FIREBASE_PRIVATE_KEY"),
  }),
});
const db = getFirestore(app);
const projectId = required("FIREBASE_PROJECT_ID");
const cloudAuth = new GoogleAuth({
  credentials: {
    project_id: projectId,
    client_email: required("FIREBASE_CLIENT_EMAIL"),
    private_key: required("FIREBASE_PRIVATE_KEY"),
  },
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});
const cloudApi = await cloudAuth.getClient();
const dayMs = 24 * 60 * 60 * 1000;
const iso = (value) => value instanceof Date && Number.isFinite(value.getTime()) ? value.toISOString() : null;
const dateOf = (value) => value?.toDate?.() ?? null;
const addCalendarMonths = (date, months) => {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
};

function evaluate(collection, snapshot) {
  const data = snapshot.data();
  const createdAt = dateOf(data.createdAt);
  const currentExpiresAt = dateOf(data.expiresAt);
  let proposedExpiresAt = null;
  let classification = "manual-review";
  let reason = "Missing or unrecognized retention state; keep pending operator review.";

  if (collection.startsWith("productWishes")) {
    if (createdAt) {
      const lastActivity = dateOf(data.lastSubstantiveActivityAt) ?? createdAt;
      const inactivityExpiry = new Date(lastActivity.getTime() + 180 * dayMs);
      const hardLimit = addCalendarMonths(createdAt, 12);
      proposedExpiresAt = inactivityExpiry < hardLimit ? inactivityExpiry : hardLimit;
      classification = "candidate-product-wish-180d-capped-12m";
      reason = data.lastSubstantiveActivityAt
        ? "180 days after recorded substantive activity, capped at 12 calendar months after receipt."
        : "No substantive-activity timestamp exists; receipt time is only a provisional basis and requires review.";
    } else {
      reason = "Missing createdAt; do not calculate or assign an expiry automatically.";
    }
  } else {
    const status = typeof data.status === "string" ? data.status : "pending";
    if (["pending", "in_progress", "cancelled"].includes(status) && typeof data.pickupDate === "string") {
      const pickup = new Date(`${data.pickupDate}T00:00:00.000Z`);
      if (Number.isFinite(pickup.getTime())) {
        proposedExpiresAt = new Date(pickup.getTime() + 90 * dayMs);
        classification = "candidate-unconfirmed-order-90d-after-pickup";
        reason = "90 days after the requested pickup date; verify the request was not confirmed or converted into a contract.";
      }
    } else if (status === "completed" && data.archiveVerifiedAt && dateOf(data.completedAt)) {
      proposedExpiresAt = new Date(dateOf(data.completedAt).getTime() + 90 * dayMs);
      classification = "candidate-completed-and-archived-order-90d";
      reason = "90 days after completion; a separate archive timestamp is recorded.";
    } else if (["confirmed", "completed"].includes(status)) {
      classification = "hold-confirmed-or-completed-not-archive-verified";
      reason = "A separate, verified record is not evidenced; do not set an automatic expiry.";
    } else {
      reason = "Missing or invalid pickup date/status; do not calculate an expiry automatically.";
    }
  }

  return {
    collection,
    documentId: snapshot.id,
    createdAt: iso(createdAt),
    pickupDate: typeof data.pickupDate === "string" ? data.pickupDate : null,
    status: typeof data.status === "string" ? data.status : "pending",
    lastSubstantiveActivityAt: iso(dateOf(data.lastSubstantiveActivityAt)),
    completedAt: iso(dateOf(data.completedAt)),
    archiveVerifiedAt: iso(dateOf(data.archiveVerifiedAt)),
    currentExpiresAt: iso(currentExpiresAt),
    proposedExpiresAt: iso(proposedExpiresAt),
    classification,
    containsLegacyRawEmailError: typeof data.emailError === "string" && data.emailError.length > 0,
    reason,
  };
}

const collections = ["productWishes", "productWishes_dev", "bakeryPreorders", "bakeryPreorders_dev"];
const rows = [];
for (const collection of collections) {
  const snapshot = await db.collection(collection).get();
  rows.push(...snapshot.docs.map((document) => evaluate(collection, document)));
}

const counts = Object.fromEntries(collections.map((collection) => {
  const collectionRows = rows.filter((row) => row.collection === collection);
  return [collection, {
    documents: collectionRows.length,
    withExpiry: collectionRows.filter((row) => row.currentExpiresAt).length,
    missingExpiry: collectionRows.filter((row) => !row.currentExpiresAt).length,
    proposedExpiry: collectionRows.filter((row) => row.proposedExpiresAt).length,
    manualReviewOrHold: collectionRows.filter((row) => !row.proposedExpiresAt).length,
    withLegacyRawEmailError: collectionRows.filter((row) => row.containsLegacyRawEmailError).length,
  }];
}));

async function getCloudResource(url) {
  try {
    const response = await cloudApi.request({url, method: "GET"});
    return {status: "available", data: response.data};
  } catch (error) {
    const status = error?.response?.status;
    return {status: status === 404 ? "not-configured" : status === 403 ? "permission-denied" : "unavailable"};
  }
}

const database = await getCloudResource(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)`);
const ttlPolicies = Object.fromEntries(await Promise.all(collections.map(async (collection) => {
  const field = await getCloudResource(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups/${collection}/fields/expiresAt`);
  return [collection, field.status === "available" ? field.data?.ttlConfig?.state ?? "not-enabled" : field.status];
})));
const cloudConfiguration = {
  firestoreDatabase: database.status === "available"
    ? {status: database.status, locationId: database.data?.locationId ?? null, type: database.data?.type ?? null}
    : {status: database.status},
  ttlPolicies,
};

const today = new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Vienna", year: "numeric", month: "2-digit", day: "2-digit"}).format(new Date());
const reportPath = join(process.cwd(), ".local", `firestore-retention-audit-${today}.json`);
await mkdir(join(process.cwd(), ".local"), {recursive: true});
await writeFile(reportPath, `${JSON.stringify({generatedAt: new Date().toISOString(), projectId, cloudConfiguration, counts, records: rows}, null, 2)}\n`, "utf8");

console.log(JSON.stringify({reportPath, cloudConfiguration, counts}, null, 2));
