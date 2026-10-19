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
const projectId = required("FIREBASE_PROJECT_ID");
const clientEmail = required("FIREBASE_CLIENT_EMAIL");
const privateKey = required("FIREBASE_PRIVATE_KEY");
const firebaseApp = getApps()[0] ?? initializeApp({credential: cert({projectId, clientEmail, privateKey})});
const db = getFirestore(firebaseApp);
const auth = new GoogleAuth({credentials: {project_id: projectId, client_email: clientEmail, private_key: privateKey}, scopes: ["https://www.googleapis.com/auth/cloud-platform"]});
const api = await auth.getClient();
const collectionGroups = ["productWishes", "productWishes_dev", "bakeryPreorders", "bakeryPreorders_dev"];

for (const collectionGroup of collectionGroups) {
  const snapshot = await db.collection(collectionGroup).get();
  const preexistingExpiry = snapshot.docs.filter((document) => document.get("expiresAt") instanceof Timestamp);
  if (preexistingExpiry.length) {
    throw new Error(`TTL activation stopped: ${collectionGroup} contains ${preexistingExpiry.length} timestamp expiresAt value(s). Review them before enabling TTL.`);
  }
}

const policyResults = [];
for (const collectionGroup of collectionGroups) {
  const name = `projects/${projectId}/databases/(default)/collectionGroups/${collectionGroup}/fields/expiresAt`;
  const url = `https://firestore.googleapis.com/v1/${name}`;
  try {
    const current = await api.request({url, method: "GET"});
    if (current.data?.ttlConfig && current.data?.ttlConfig?.state !== "NOT_FOUND") {
      policyResults.push({collectionGroup, state: current.data.ttlConfig.state ?? "ALREADY_ENABLED"});
      continue;
    }
  } catch (error) {
    if (error?.response?.status !== 404) throw error;
  }

  let result;
  try {
    result = await api.request({
      url,
      method: "PATCH",
      params: {updateMask: "ttlConfig"},
      data: {name, ttlConfig: {}},
    });
  } catch (error) {
    if (error?.response?.status === 403) {
      console.error(`TTL activation requires Firestore field configuration permission (datastore.indexes.update). No TTL policy was enabled for ${collectionGroup}. Ask a project administrator to enable it in Firestore > Time-to-live, or grant the required permission and rerun this command.`);
      process.exitCode = 1;
      break;
    }
    throw error;
  }
  policyResults.push({collectionGroup, state: result.data?.ttlConfig?.state ?? "CREATING"});
}

console.log(JSON.stringify({projectId, field: "expiresAt", policyResults}, null, 2));
