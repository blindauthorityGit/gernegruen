import {spawnSync} from "node:child_process";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";

const projectId = "zqaggz4f";
const dataset = "production";
const apiVersion = "v2026-09-17";
const env = Object.fromEntries(
  readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/))
    .filter(Boolean)
    .map(([, key, value]) => [key, value.trim().replace(/^['"]|['"]$/g, "")]),
);
const readToken = process.env.SANITY_API_READ_TOKEN || env.SANITY_API_READ_TOKEN;
const writeToken = process.env.SANITY_API_TOKEN || env.SANITY_API_TOKEN;
if (!readToken || !writeToken) throw new Error("Set both Sanity read and write tokens in .env.local.");

function request(path, token, {body, file, contentType = "application/json"} = {}) {
  const args = [
    "-sS", "--fail-with-body", "--max-time", "60",
    "-X", body || file ? "POST" : "GET",
    `https://${projectId}.api.sanity.io/${apiVersion}/${path}`,
    "-H", `Authorization: Bearer ${token}`,
    "-H", `Content-Type: ${contentType}`,
  ];
  if (body) args.push("--data-binary", JSON.stringify(body));
  if (file) args.push("--data-binary", `@${file}`);
  const result = spawnSync("curl.exe", args, {encoding: "utf8", windowsHide: true});
  if (result.error || result.status !== 0) throw new Error(`Sanity request failed: ${result.stdout.slice(0, 300) || "check the API token and dataset permissions"}`);
  return JSON.parse(result.stdout);
}

let assetId = request(`data/query/${dataset}`, readToken, {
  body: {query: '*[_type == "sanity.imageAsset" && originalFilename == "weekly-page-hero.svg"][0]._id'},
}).result;
if (!assetId) {
  const upload = request(`assets/images/${dataset}?filename=weekly-page-hero.svg`, writeToken, {
    file: resolve(process.cwd(), "public/graphics/weekly-page-hero.svg"),
    contentType: "image/svg+xml",
  });
  assetId = upload.document?._id;
  if (!assetId) throw new Error("Sanity did not return the weekly hero illustration asset.");
}

const mutation = request(`data/mutate/${dataset}?returnIds=true`, writeToken, {
  body: {mutations: [{patch: {id: "weeklyPageSettings", setIfMissing: {
    heroIllustration: {_type: "image", asset: {_type: "reference", _ref: assetId}},
    heroIllustrationAlt: "Illustration eines Einkaufskorbs mit frischem Obst und Gemüse",
  }}}]},
});
if (!mutation.transactionId) throw new Error("Sanity did not confirm the weekly hero update.");
const verification = request(`data/query/${dataset}`, readToken, {
  body: {query: '*[_id == "weeklyPageSettings"][0]{"heroImage":heroIllustration.asset->url,heroIllustrationAlt}'},
}).result;
if (!verification?.heroImage || !verification.heroIllustrationAlt) throw new Error("Weekly hero illustration could not be verified.");
console.log("Weekly hero illustration uploaded and linked to Seitentexte: Diese Woche.");

const weeklyPageDefaults = {
  seoTitle: "Diese Woche – Frische Angebote bei GerneGrün",
  seoDescription: "Frisches Obst und Gemüse, Brot und Kuchen der Woche, Backwarenpreise und aktuelle Aktionen bei GerneGrün in Dreieich.",
  seoKeywords: ["Wochenangebote", "frisches Obst", "frisches Gemüse", "Brot der Woche", "Aktionen"],
  heroTitle: "Diese Woche",
  heroDescription: "Frisch eingetroffen, frisch gebacken und aktuell im Angebot – entdecke, was es diese Woche bei GerneGrün gibt.",
  heroIllustrationAlt: "Illustration eines Einkaufskorbs mit frischem Obst und Gemüse",
  jumpLinkFresh: "Frisches",
  jumpLinkBakery: "Brot & Kuchen",
  jumpLinkPrices: "Preisliste",
  jumpLinkPromotions: "Aktionen",
  produceHeading: "Frisches Obst & Gemüse",
  produceDescription: "Unsere Auswahl wechselt mit Saison und Verfügbarkeit. Was du hier siehst, ist in dieser Woche frisch für dich da.",
  produceEmptyMessage: "Unsere aktuelle Obst- und Gemüseliste wird gerade vorbereitet. Schau bald wieder vorbei!",
  bakeryHeading: "Brot & Kuchen der Woche",
  bakeryDescription: "Unsere beiden Backstuben-Lieblinge wechseln regelmäßig – solange der Vorrat reicht.",
  priceListHeading: "Backwaren & Preise",
  priceListDescription: "Alle Preise inklusive Mehrwertsteuer. Das Angebot kann je nach Liefertag und Verfügbarkeit variieren.",
  preorderEyebrow: "Einfach für dich zurückgelegt",
  preorderHeading: "Deine Lieblingsbackwaren vorbestellen",
  preorderDescription: "Du möchtest sichergehen, dass dein Lieblingsbrot oder Kuchen für dich bereitliegt? Bestelle deine Backwaren ganz einfach vor und hole sie bei uns im Laden ab.",
  preorderButtonLabel: "Backwaren vorbestellen",
  promotionsHeading: "Aktuelle Aktionen",
  promotionsDescription: "Entdecke unsere aktuellen Angebote und besonderen Aktionen im Laden.",
  promotionsEmptyHeading: "Derzeit ist kein Aktionsblatt verfügbar.",
  promotionsEmptyDescription: "Schau bald wieder vorbei oder frag uns direkt im Laden nach aktuellen Angeboten.",
};
const existingSettings = request(`data/query/${dataset}?perspective=raw`, readToken, {
  body: {query: '*[_id in ["weeklyPageSettings", "drafts.weeklyPageSettings"]]{_id,_type}'},
}).result;
const settingIds = new Set(["weeklyPageSettings", ...existingSettings.map((document) => document._id)]);
const contentDefaults = {
  ...weeklyPageDefaults,
  heroIllustration: {_type: "image", asset: {_type: "reference", _ref: assetId}},
};
const settingsMutation = request(`data/mutate/${dataset}?returnIds=true`, writeToken, {
  body: {mutations: [...settingIds].map((id) => ({patch: {id, setIfMissing: contentDefaults}}))},
});
if (!settingsMutation.transactionId) throw new Error("Sanity did not confirm the weekly settings update.");
const settingsVerification = request(`data/query/${dataset}?perspective=raw`, readToken, {
  body: {query: '*[_id in ["weeklyPageSettings", "drafts.weeklyPageSettings"]]{_id,seoTitle,seoDescription,seoKeywords,heroTitle,heroDescription,heroIllustrationAlt,jumpLinkFresh,jumpLinkBakery,jumpLinkPrices,jumpLinkPromotions,produceHeading,produceDescription,produceEmptyMessage,bakeryHeading,bakeryDescription,priceListHeading,priceListDescription,preorderEyebrow,preorderHeading,preorderDescription,preorderButtonLabel,promotionsHeading,promotionsDescription,promotionsEmptyHeading,promotionsEmptyDescription}'},
}).result;
for (const document of settingsVerification) {
  const missing = Object.keys(weeklyPageDefaults).filter((key) => document[key] === undefined || document[key] === null || document[key] === "");
  if (missing.length) throw new Error("Weekly settings " + document._id + " are still missing: " + missing.join(", ") + ".");
}
console.log("Weekly Seitentexte und SEO in " + settingsVerification.length + " Sanity-Dokument(en) ergänzt; bestehende Werte bleiben erhalten.");
for (const document of settingsVerification) console.log("  " + document._id + ": " + document.heroTitle + " | SEO: " + document.seoTitle);

const weeklyDocuments = request(`data/query/${dataset}?perspective=raw`, readToken, {
  body: {query: '*[_type in ["weeklyOverview", "weeklyProduceList", "bakeryCatalog", "promotionSheet", "nextWeekPreview"]]{_id,_type,title,internalTitle,week,year,isEnabled,validFrom,validUntil}'},
}).result;
for (const type of ["weeklyProduceList", "weeklyOverview", "bakeryCatalog", "promotionSheet", "nextWeekPreview"]) {
  const documents = weeklyDocuments.filter((document) => document._type === type);
  console.log(`${type}: ${documents.length} Sanity document${documents.length === 1 ? "" : "s"} available.`);
}
