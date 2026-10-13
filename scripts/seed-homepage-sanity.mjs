import {createClient} from "@sanity/client";
import {createReadStream, readFileSync} from "node:fs";
import {resolve} from "node:path";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*(SANITY_API_TOKEN|SANITY_API_READ_TOKEN)\s*=\s*(.*)\s*$/);
  if (match && !process.env.SANITY_API_TOKEN && !process.env.SANITY_API_READ_TOKEN) {
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

const token = process.env.SANITY_API_TOKEN || process.env.SANITY_API_READ_TOKEN;
if (!token) throw new Error("Set SANITY_API_TOKEN to a Sanity token with dataset write access.");

const client = createClient({projectId: "zqaggz4f", dataset: "production", apiVersion: "2026-09-17", token, useCdn: false});
const root = process.cwd();

async function imageAsset(file, folder) {
  const existing = await client.fetch('*[_type == "sanity.imageAsset" && originalFilename == $file][0]._id', {file});
  if (existing) return existing;
  const uploaded = await client.assets.upload("image", createReadStream(resolve(root, folder, file)), {filename: file});
  return uploaded._id;
}

async function saveBrand(brand) {
  const matches = await client.fetch('*[_type == "supplierBrand" && name == $name]{_id}', {name: brand.name});
  if (matches.length > 1) throw new Error(`Duplicate Sanity brand names found: ${brand.name}`);
  const logo = await imageAsset(brand.file, "public/logos");
  const fields = {
    _type: "supplierBrand", name: brand.name,
    logo: {_type: "image", asset: {_type: "reference", _ref: logo}},
    url: brand.url, sortOrder: brand.sortOrder, isVisible: true,
  };
  if (matches[0]) await client.patch(matches[0]._id).set(fields).commit();
  else await client.create(fields);
  console.log(`Saved brand: ${brand.name}`);
}

const brands = [
  {name: "SONNENTOR", file: "sonnentor.svg", url: "https://www.sonnentor.com/de-at", sortOrder: 1},
  {name: "Voelkel", file: "voelkel.png", url: "https://voelkel.bio/", sortOrder: 2},
  {name: "Byodo Naturkost", file: "byodo.svg", url: "https://www.byodo.de/", sortOrder: 3},
  {name: "Spielberger Mühle", file: "spielberger-muehle.png", url: "https://www.spielberger-muehle.de/", sortOrder: 4},
];
for (const brand of brands) await saveBrand(brand);

const heroImage = await imageAsset("home-hero-store.png", "public/images");
const hero = {
  headlineLine1: "Gut versorgt",
  headlineLine2: "direkt in Dreieich",
  description: "Bei uns findest du ausgewählte Lebensmittel, frische Produkte und Besonderes aus der Region – persönlich ausgesucht und immer wieder neu.",
  primaryCta: {_type: "object", label: "Was gibt es diese Woche?", href: "/diese-woche"},
  secondaryCta: {_type: "object", label: "Sortiment entdecken", href: "/sortiment"},
  image: {_type: "image", asset: {_type: "reference", _ref: heroImage}},
  imageAlt: "Blick in den GerneGrün Markt mit frischem Obst und Gemüse",
};

const viennaParts = new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Vienna", year: "numeric", month: "2-digit", day: "2-digit"}).formatToParts(new Date());
const part = (type) => Number(viennaParts.find((entry) => entry.type === type)?.value);
const localToday = new Date(Date.UTC(part("year"), part("month") - 1, part("day")));
const weekday = (localToday.getUTCDay() + 6) % 7;
const monday = new Date(Date.UTC(localToday.getUTCFullYear(), localToday.getUTCMonth(), localToday.getUTCDate() - weekday));
const nextMonday = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000);
function viennaMidnight(date) {
  const localNoon = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12));
  const offset = new Intl.DateTimeFormat("en-US", {timeZone: "Europe/Vienna", timeZoneName: "shortOffset"}).formatToParts(localNoon).find((entry) => entry.type === "timeZoneName")?.value ?? "GMT+0";
  const [, hours = "0", minutes = "0"] = offset.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/) ?? [];
  const sign = offset.includes("-") ? -1 : 1;
  const offsetMinutes = sign * (Math.abs(Number(hours)) * 60 + Number(minutes));
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - offsetMinutes * 60_000).toISOString();
}
const thursday = new Date(monday.getTime() + 3 * 24 * 60 * 60 * 1000);
const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
const weekNumber = Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const dateLabel = `${monday.getUTCDate()}. – ${new Date(nextMonday.getTime() - 86400000).getUTCDate()}. ${monthNames[monday.getUTCMonth()]}`;

const cardDefinitions = [
  {
    key: "produce", title: "Obst & Gemüse", marker: "leaf", file: "assortment-fruit-vegetables.png", alt: "Frische Auswahl an Obst und Gemüse",
    entries: ["Strauchtomaten", "Karotten", "Erdbeeren", "Kopfsalat", "Himbeeren", "Äpfel", "Heidelbeeren", "Kürbis", "Brokkoli", "Radieschen", "Petersilie", "Zucchini"].map((title, i) => ({_key: `produce-${i + 1}`, _type: "assortmentEntry", title})),
    cta: {label: "Wochenauswahl ansehen", href: "/sortiment#obst-gemuese"},
  },
  {
    key: "bakery", title: "Brot & Kuchen", marker: "bread", file: "assortment-bakery.png", alt: "Auswahl an Brot, Brötchen und süßem Gebäck",
    entries: [
      {_key: "bread", _type: "assortmentEntry", title: "Brot der Woche", description: "Kürbiskern-Karotten-Brot"},
      {_key: "cake", _type: "assortmentEntry", title: "Kuchen der Woche", description: "Dinkel-Schoko-Heidelbeer-Kuchen"},
    ],
    note: "Eine Auswahl weiterer Backwaren findest du täglich bei uns im Laden.",
    cta: {label: "Zur Produktliste", href: "/sortiment#brot-gebaeck"},
  },
  {
    key: "promotions", title: "Aktionen", marker: "promotion", file: "assortment-promotions.png", alt: "Frische grüne Getränke mit Gurke und Kräutern",
    intro: "Aktuelle Aktionen auf diverse Produkte",
    entries: [
      {_key: "pesto", _type: "assortmentEntry", title: "20% auf ausgewählte Pestos", description: "Frisch, regional und voller Geschmack"},
      {_key: "new", _type: "assortmentEntry", title: "Neu im Sortiment", description: "Immer wieder Neues entdecken"},
    ],
    cta: {label: "Alle Aktionen ansehen", href: "/news-aktionen"},
  },
].map(async (card) => {
  const asset = await imageAsset(card.file, "public/graphics");
  return {
    _key: card.key, _type: "assortmentCard", title: card.title, marker: card.marker,
    image: {_type: "image", asset: {_type: "reference", _ref: asset}}, imageAlt: card.alt,
    ...(card.intro ? {intro: card.intro} : {}), entries: card.entries,
    ...(card.note ? {note: card.note} : {}),
    cta: {_type: "contentLink", ...card.cta},
  };
});

const cards = await Promise.all(cardDefinitions);
const internalTitle = "Homepage Teaser – aktuelle Woche";
const existingEditions = await client.fetch('*[_type == "assortmentEdition" && internalTitle == $title]{_id}', {title: internalTitle});
if (existingEditions.length > 1) throw new Error("Duplicate Sanity assortment editions found for homepage teaser.");
const editionFields = {
  _type: "assortmentEdition", internalTitle, isEnabled: true,
  startAt: viennaMidnight(monday), endAt: viennaMidnight(nextMonday),
  topline: `Diese Woche bei uns – ${dateLabel}`, heading: "Gerade frisch, gerade besonders",
  description: "Aktuelles, Aktionen und Highlights\naus unserem Laden", callout: `KW ${weekNumber}`,
  cta: {_type: "contentLink", label: "Alle Aktionen ansehen", href: "/news-aktionen"}, cards,
};
let editionId;
if (existingEditions[0]) {
  editionId = existingEditions[0]._id;
  await client.patch(editionId).set(editionFields).commit();
} else {
  const created = await client.create(editionFields);
  editionId = created._id;
}
console.log("Saved the weekly teaser edition.");

const existingStart = await client.getDocument("startPage");
if (existingStart && existingStart._type !== "startPage") throw new Error("The fixed startPage ID is occupied by another document type.");
const editionRef = {_key: editionId.replace(/[^a-zA-Z0-9]/g, "").slice(-12), _type: "reference", _ref: editionId};
const previousRefs = existingStart?.assortmentSection?.editions ?? [];
const editions = [...previousRefs.filter((ref) => ref._ref !== editionId), editionRef];
const startDocument = {
  _type: "startPage", hero,
  assortmentSection: {...existingStart?.assortmentSection, enabled: true, editions},
};
if (existingStart) await client.patch("startPage").set(startDocument).commit();
else await client.createIfNotExists({_id: "startPage", ...startDocument});
console.log("Saved the start page and linked the weekly teaser.");

const breadCategory = await client.fetch('*[_type == "assortmentCategory" && slug.current == "brot-gebaeck"][0]{_id}');
if (breadCategory?._id) await client.patch(breadCategory._id).set({badgeText: "Täglich frisch"}).commit();
console.log("Saved the bakery category badge.");
