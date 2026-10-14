import {spawnSync} from "node:child_process";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";

const projectId = "zqaggz4f";
const dataset = "production";
const apiVersion = "v2026-09-17";
const root = process.cwd();
const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
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
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error("Sanity returned an invalid response.");
  }
}

let imageAssetId = request(`data/query/${dataset}`, readToken, {body: {query: '*[_type == "sanity.imageAsset" && originalFilename == "store-interior.png"][0]._id'}}).result;
if (!imageAssetId) {
  const imagePath = resolve(root, "public/images/store-interior.png");
  const upload = request(`assets/images/${dataset}?filename=store-interior.png`, writeToken, {file: imagePath, contentType: "image/png"});
  imageAssetId = upload.document?._id;
  if (!imageAssetId) throw new Error("Sanity did not return the uploaded store image.");
}

let heroAssetId = request(`data/query/${dataset}`, readToken, {body: {query: '*[_type == "sanity.imageAsset" && originalFilename == "home-hero-store.png"][0]._id'}}).result;
if (!heroAssetId) {
  const imagePath = resolve(root, "public/images/home-hero-store.png");
  const upload = request(`assets/images/${dataset}?filename=home-hero-store.png`, writeToken, {file: imagePath, contentType: "image/png"});
  heroAssetId = upload.document?._id;
  if (!heroAssetId) throw new Error("Sanity did not return the uploaded homepage hero image.");
}

const storeIntroSection = {
  _type: "storeIntroSection",
  headingLine1: "Ein Laden",
  headingLine2: "mit Herz.",
  description: "Bei GerneGrün findest du vieles für deinen täglichen Einkauf – sorgfältig ausgewählt und persönlich.",
  imageAlt: "Blick in den GerneGrün Laden mit Brot und frischen Produkten an der Verkaufstheke",
  image: {_type: "image", asset: {_type: "reference", _ref: imageAssetId}},
  parkingText: "Freie Parkplätze\nim Hof",
  highlights: [
    {_key: "products", _type: "storeIntroHighlight", title: "Über 4.000 Produkte", description: "für deinen täglichen Einkauf"},
    {_key: "assortment", _type: "storeIntroHighlight", title: "Frisches, Brot, Käse, Getränke, Naturkosmetik", description: "und vieles mehr."},
  ],
  categories: [
    {_key: "produce", _type: "storeCategory", title: "Obst &\nGemüse", icon: "produce"},
    {_key: "bakery", _type: "storeCategory", title: "Brot &\nGebäck", icon: "bakery"},
    {_key: "dairy", _type: "storeCategory", title: "Molkereiprodukte\n& Alternativen", icon: "dairy"},
    {_key: "drinks", _type: "storeCategory", title: "Getränke", icon: "drinks"},
    {_key: "pantry", _type: "storeCategory", title: "Vorrat &\nKüche", icon: "pantry"},
    {_key: "snacks", _type: "storeCategory", title: "Süßes &\nSnacks", icon: "snacks"},
    {_key: "personal-care", _type: "storeCategory", title: "Natur &\nKörperpflege", icon: "personalCare"},
  ],
  cta: {_type: "contentLink", label: "Zum gesamten Sortiment", href: "/sortiment"},
};

const mutations = [
  {createIfNotExists: {
    _id: "storeIntroSettings",
    _type: "storeIntroSettings",
    content: storeIntroSection,
  }},
  {patch: {id: "startPage", setIfMissing: {
    seoTitle: "GerneGrün – Lebensmittel in Dreieich",
    seoDescription: "Entdecke Obst, Gemüse, Brot und mehr bei GerneGrün in Dreieich.",
    seoKeywords: ["Obst", "Gemüse", "Brot", "Lebensmittel"],
    "hero.image": {_type: "image", asset: {_type: "reference", _ref: heroAssetId}},
    "hero.imageAlt": "Blick in den GerneGrün Markt mit frischem Obst und Gemüse",
  }, unset: ["storeIntroSection"]}},
  {patch: {id: "drafts.startPage", setIfMissing: {
    seoTitle: "GerneGrün – Lebensmittel in Dreieich",
    seoDescription: "Entdecke Obst, Gemüse, Brot und mehr bei GerneGrün in Dreieich.",
    seoKeywords: ["Obst", "Gemüse", "Brot", "Lebensmittel"],
    "hero.image": {_type: "image", asset: {_type: "reference", _ref: heroAssetId}},
    "hero.imageAlt": "Blick in den GerneGrün Markt mit frischem Obst und Gemüse",
  }, unset: ["storeIntroSection"]}},
  {patch: {id: "assortmentPage", setIfMissing: {
    seoTitle: "Unser Sortiment in Dreieich",
    seoDescription: "Entdecke frisches Obst und Gemüse, Brot, Getränke und mehr im Sortiment von GerneGrün in Dreieich.",
    seoKeywords: ["Obst und Gemüse", "Brot", "Getränke", "Naturkosmetik"],
  }}},
  {patch: {id: "aboutPage", setIfMissing: {
    seoKeywords: ["Team", "Geschichte", "Lebensmittelgeschäft Dreieich"],
  }}},
  {patch: {id: "contactPage", setIfMissing: {
    seoKeywords: ["Öffnungszeiten", "Adresse", "Anfahrt", "Kontakt"],
  }}},
  {createIfNotExists: {
    _id: "weeklyPageSettings",
    _type: "weeklyPageSettings",
    seoTitle: "Diese Woche – Frische Angebote bei GerneGrün",
    seoDescription: "Frisches Obst und Gemüse, Brot und Kuchen der Woche, Backwarenpreise und aktuelle Aktionen bei GerneGrün in Dreieich.",
    seoKeywords: ["Wochenangebote", "frisches Obst", "frisches Gemüse", "Brot der Woche", "Aktionen"],
  }},
  {patch: {id: "businessSettings", setIfMissing: {legalSeo: {
    imprintTitle: "Impressum – GerneGrün",
    imprintDescription: "Anbieterkennzeichnung und Kontakt zum GerneGrün Lebensmittelgeschäft in Dreieich.",
    privacyTitle: "Datenschutz – GerneGrün",
    privacyDescription: "Informationen zur Verarbeitung personenbezogener Daten auf der GerneGrün-Website.",
    accessibilityTitle: "Barrierefreiheit – GerneGrün",
    accessibilityDescription: "Vorläufige Informationen zum Stand der Barrierefreiheit und zum Feedback bei GerneGrün.",
  }}}},
];

const result = request(`data/mutate/${dataset}?returnIds=true`, writeToken, {body: {mutations}});
if (!result.transactionId) throw new Error("Sanity did not confirm the content update.");
const verification = request(`data/query/${dataset}`, readToken, {body: {query: '*[_id in ["startPage","storeIntroSettings","assortmentPage","weeklyPageSettings","aboutPage","contactPage","businessSettings"]]{_id,seoTitle,seoDescription,seoKeywords,legalSeo,content{headingLine1,categories,"imageUrl":image.asset->url},"heroImageUrl":hero.image.asset->url}'}}).result;
const homepage = verification.find(({_id}) => _id === "storeIntroSettings");
const startPage = verification.find(({_id}) => _id === "startPage");
if (!homepage?.content?.imageUrl || homepage.content.categories?.length !== 7 || !startPage?.heroImageUrl) {
  throw new Error("Sanity update could not be verified for the store introduction.");
}
console.log(`Homepage content and missing SEO defaults saved and verified (${result.results?.length ?? 0} document operations).`);
console.log(`Store section: ${homepage.content.headingLine1}, ${homepage.content.categories.length} categories, image linked.`);
console.log("Homepage hero image linked and editable in Sanity.");
for (const document of verification) {
  if (document.seoTitle || document.seoDescription || document.legalSeo) {
    console.log(`${document._id}: SEO fields available.`);
  }
}
const rawDocuments = request(`data/query/${dataset}?perspective=raw`, readToken, {body: {query: '*[_id in ["startPage","drafts.startPage","storeIntroSettings","drafts.storeIntroSettings","assortmentPage","drafts.assortmentPage","weeklyPageSettings","drafts.weeklyPageSettings"]]{_id,seoTitle,seoDescription,content{headingLine1}}'}}).result;
for (const document of rawDocuments) {
  console.log(`${document._id}: ${document.seoTitle ? "SEO set" : "SEO empty"}; ${document.content ? "store section set" : "store section empty"}.`);
}
