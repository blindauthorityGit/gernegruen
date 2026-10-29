import {GoogleAuth} from "google-auth-library";
import {getApps, initializeApp, cert} from "firebase-admin/app";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {readFileSync} from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "").replace(/\\n/g, "\n");
}

const required = (name) => {
  if (!process.env[name]) throw new Error(`Missing ${name} in environment.`);
  return process.env[name];
};
const asDate = (value) => value instanceof Timestamp ? value.toDate() : value instanceof Date ? value : null;
const addCalendarMonths = (date, months) => {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()));
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return result;
};
const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

function desiredExpiry(collection, data) {
  if (collection.startsWith("productWishes")) {
    const createdAt = asDate(data.createdAt);
    if (!createdAt) return {review: true};
    const lastActivity = asDate(data.lastSubstantiveActivityAt) ?? createdAt;
    const inactivity = addDays(lastActivity, 180);
    const hardLimit = addCalendarMonths(createdAt, 12);
    return {date: inactivity < hardLimit ? inactivity : hardLimit};
  }

  const status = typeof data.status === "string" ? data.status : "pending";
  if (["pending", "in_progress", "cancelled"].includes(status)) {
    if (typeof data.pickupDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data.pickupDate)) return {review: true};
    const pickup = new Date(`${data.pickupDate}T00:00:00.000Z`);
    if (!Number.isFinite(pickup.getTime()) || pickup.toISOString().slice(0, 10) !== data.pickupDate) return {review: true};
    return {date: addDays(pickup, 90)};
  }
  if (status === "completed" && data.archiveVerifiedAt && asDate(data.completedAt)) {
    return {date: addDays(asDate(data.completedAt), 90)};
  }
  if (["confirmed", "completed"].includes(status)) return {hold: true};
  return {review: true};
}

const projectId = required("FIREBASE_PROJECT_ID");
const clientEmail = required("FIREBASE_CLIENT_EMAIL");
const privateKey = required("FIREBASE_PRIVATE_KEY");
const firebaseApp = getApps()[0] ?? initializeApp({credential: cert({projectId, clientEmail, privateKey})});
const db = getFirestore(firebaseApp);
const auth = new GoogleAuth({credentials: {project_id: projectId, client_email: clientEmail, private_key: privateKey}, scopes: ["https://www.googleapis.com/auth/cloud-platform"]});
const api = await auth.getClient();
const collectionGroups = ["productWishes", "productWishes_dev", "bakeryPreorders", "bakeryPreorders_dev"];
const now = new Date();
const plans = [];
let reviewRequired = false;
let alreadyExpired = 0;

for (const collection of collectionGroups) {
  const snapshot = await db.collection(collection).get();
  const plan = {collection, documents: snapshot.size, alreadyExpired: 0, futureExpiries: 0, missingExpiryToBackfill: 0, heldWithoutExpiry: 0, needsReview: 0, updates: []};

  for (const document of snapshot.docs) {
    const data = document.data();
    const expected = desiredExpiry(collection, data);
    const stored = asDate(data.expiresAt);

    if (expected.review) {
      plan.needsReview += 1;
      reviewRequired = true;
      continue;
    }

    if (expected.hold) {
      if (stored) {
        plan.needsReview += 1;
        reviewRequired = true;
      } else {
        plan.heldWithoutExpiry += 1;
      }
      continue;
    }

    if (stored && stored.getTime() !== expected.date.getTime()) {
      plan.needsReview += 1;
      reviewRequired = true;
      continue;
    }

    if (!stored) {
      plan.missingExpiryToBackfill += 1;
      plan.updates.push({reference: document.ref, date: expected.date});
    }

    if (expected.date <= now) {
      plan.alreadyExpired += 1;
      alreadyExpired += 1;
    } else {
      plan.futureExpiries += 1;
    }
  }

  plans.push(plan);
}

if (reviewRequired || alreadyExpired > 0) {
  const summary = plans.map(({collection, documents, alreadyExpired: expired, missingExpiryToBackfill, heldWithoutExpiry, needsReview}) => ({collection, documents, alreadyExpired: expired, missingExpiryToBackfill, heldWithoutExpiry, needsReview}));
  console.log(JSON.stringify({status: "stopped-for-review", projectId, summary}, null, 2));
  process.exitCode = 1;
} else if (!process.argv.includes("--apply")) {
  const summary = plans.map(({collection, documents, alreadyExpired: expired, futureExpiries, missingExpiryToBackfill, heldWithoutExpiry, needsReview}) => ({collection, documents, alreadyExpired: expired, futureExpiries, missingExpiryToBackfill, heldWithoutExpiry, needsReview}));
  console.log(JSON.stringify({status: "dry-run", projectId, summary, nextStep: "Pass --apply to backfill missing expiry timestamps and enable TTL policies."}, null, 2));
} else {
  for (const plan of plans) {
    for (const update of plan.updates) {
      await update.reference.update({expiresAt: Timestamp.fromDate(update.date)});
    }
  }

  const policyResults = [];
  let permissionDeniedFor = null;
  for (const collection of collectionGroups) {
    const name = `projects/${projectId}/databases/(default)/collectionGroups/${collection}/fields/expiresAt`;
    const url = `https://firestore.googleapis.com/v1/${name}`;
    try {
      const current = await api.request({url, method: "GET"});
      if (current.data?.ttlConfig?.state === "ACTIVE" || current.data?.ttlConfig?.state === "CREATING") {
        policyResults.push({collection, state: current.data.ttlConfig.state});
        continue;
      }
    } catch (error) {
      if (error?.response?.status !== 404) throw error;
    }

    try {
      const result = await api.request({
        url,
        method: "PATCH",
        params: {updateMask: "ttlConfig"},
        data: {name, ttlConfig: {}},
      });
      policyResults.push({collection, state: result.data?.ttlConfig?.state ?? "CREATING"});
    } catch (error) {
      if (error?.response?.status !== 403) throw error;
      permissionDeniedFor = collection;
      break;
    }
  }

  const summary = plans.map(({collection, documents, alreadyExpired: expired, futureExpiries, missingExpiryToBackfill, heldWithoutExpiry, needsReview}) => ({collection, documents, alreadyExpired: expired, futureExpiries, missingExpiryToBackfill, heldWithoutExpiry, needsReview}));
  const datesBackfilled = plans.reduce((total, plan) => total + plan.missingExpiryToBackfill, 0);
  if (permissionDeniedFor) {
    console.log(JSON.stringify({
      status: "expiry-dates-prepared-ttl-not-enabled",
      projectId,
      summary,
      datesBackfilled,
      policyResults,
      requiredPermission: "datastore.indexes.update",
      message: `Expiry dates were prepared; no documents were deleted. Grant the required Firestore index-management permission, then rerun with --apply. First blocked collection: ${permissionDeniedFor}.`,
    }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({status: "applied", projectId, summary, datesBackfilled, policyResults}, null, 2));
  }
}
