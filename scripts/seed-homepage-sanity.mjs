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

const existingStart = await client.getDocument("startPage");
if (existingStart && existingStart._type !== "startPage") throw new Error("The fixed startPage ID is occupied by another document type.");
const startDocument = {
  _type: "startPage", hero,
  ...(existingStart?.assortmentSection ? {assortmentSection: existingStart.assortmentSection} : {}),
};
if (existingStart) await client.patch("startPage").set(startDocument).commit();
else await client.createIfNotExists({_id: "startPage", ...startDocument});
console.log("Saved the start page without changing weekly content links.");

const breadCategory = await client.fetch('*[_type == "assortmentCategory" && slug.current == "brot-gebaeck"][0]{_id}');
if (breadCategory?._id) await client.patch(breadCategory._id).set({badgeText: "Täglich frisch"}).commit();
console.log("Saved the bakery category badge.");
