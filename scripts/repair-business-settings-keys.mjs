import {randomUUID} from "node:crypto";
import {readFileSync} from "node:fs";
import {createClient} from "@sanity/client";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*SANITY_API_TOKEN\s*=\s*(.*)\s*$/);
  if (match && !process.env.SANITY_API_TOKEN) {
    process.env.SANITY_API_TOKEN = match[1].replace(/^['"]|['"]$/g, "");
  }
}

const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error("Set SANITY_API_TOKEN to a token with Sanity dataset write access.");

const client = createClient({
  projectId: "zqaggz4f",
  dataset: "production",
  apiVersion: "2026-09-17",
  token,
  useCdn: false,
});

const document = await client.getDocument("businessSettings");
if (!document || document._type !== "businessSettings") {
  throw new Error("The businessSettings singleton was not found in the production dataset.");
}

const addMissingKeys = (items = []) => {
  const seen = new Set();
  let changed = false;
  const result = items.map((item) => {
    let key = item._key;
    if (!key || seen.has(key)) {
      key = randomUUID().replaceAll("-", "");
      changed = true;
    }
    seen.add(key);
    return key === item._key ? item : {...item, _key: key};
  });
  return {changed, result};
};

const openingHours = addMissingKeys(document.openingHours);
const exceptions = addMissingKeys(document.exceptions);
const patch = client.patch(document._id);
if (openingHours.changed) patch.set({openingHours: openingHours.result});
if (exceptions.changed) patch.set({exceptions: exceptions.result});

if (openingHours.changed || exceptions.changed) {
  await patch.commit();
  console.log(`Repaired Sanity array keys: ${openingHours.changed ? "opening hours" : ""}${openingHours.changed && exceptions.changed ? " and " : ""}${exceptions.changed ? "special hours" : ""}.`);
} else {
  console.log("All business settings array items already have unique keys.");
}
