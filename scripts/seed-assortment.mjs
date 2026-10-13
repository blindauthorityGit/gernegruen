import { createClient } from "@sanity/client";
import { createReadStream } from "node:fs";
import { resolve } from "node:path";

const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error("Set SANITY_API_TOKEN to a Sanity token with write access before running this seed.");

const client = createClient({projectId: "zqaggz4f", dataset: "production", apiVersion: "2026-09-17", token, useCdn: false});
const base = process.cwd();
async function main() {
const categories = [
  {id: "assortmentCategory.obst-gemuese", slug: "obst-gemuese", title: "Obst & Gemüse", group: "fresh", order: 1, description: "Saisonal, vielseitig und wann immer möglich regional.", examples: ["Obst", "Gemüse", "Salate", "Kräuter", "Kartoffeln", "Beeren"], photo: "sortiment-obst-gemuese.png", icon: "sortiment-icon-obst-gemuese.png", alt: "Frisches Gemüse und Obst im GerneGrün Markt", ctaLabel: "Diese Woche entdecken", ctaHref: "/diese-woche#frisches"},
  {id: "assortmentCategory.brot-gebaeck", slug: "brot-gebaeck", title: "Brot & Gebäck", group: "fresh", order: 2, description: "Frisch geliefert, knusprig und einfach lecker.", examples: ["Vollkornbrot", "Brötchen", "Gebäck", "Kuchen"], photo: "sortiment-brot-gebaeck.png", icon: "sortiment-icon-brot.png", alt: "Brote und Gebäck aus der GerneGrün Backwarenauswahl", ctaLabel: "Auswahl und Preise ansehen", ctaHref: "/diese-woche#backwaren"},
  {id: "assortmentCategory.molkerei-alternativen", slug: "molkerei-alternativen", title: "Molkereiprodukte & Alternativen", group: "fresh", order: 3, description: "Alles von klassisch bis pflanzlich – für jeden Geschmack.", examples: ["Milch", "Joghurt", "Käse", "Quark", "Haferdrinks"], photo: "sortiment-molkerei.png", icon: "sortiment-icon-molkerei.png", alt: "Käse und Milchprodukte in der Kühltheke"},
  {id: "assortmentCategory.getraenke", slug: "getraenke", title: "Getränke", group: "pantry", order: 4, description: "Erfrischend, belebend und bewusst genießen.", examples: ["Wasser", "Säfte", "Limonaden", "Kaffee", "Wein", "Bier"], photo: "sortiment-getraenke.png", icon: "sortiment-icon-getraenke.png", alt: "Flaschen mit Getränken aus dem Sortiment"},
  {id: "assortmentCategory.vorrat-kueche", slug: "vorrat-kueche", title: "Vorrat & Küche", group: "pantry", order: 5, description: "Die Basis für deine Lieblingsgerichte und neue Ideen.", examples: ["Nudeln", "Reis", "Mehl", "Hülsenfrüchte", "Gewürze", "Öle", "Konserven"], photo: "sortiment-vorrat-kueche.png", icon: "sortiment-icon-vorrat.png", alt: "Vorratsgläser mit Nudeln, Hülsenfrüchten und Küchenzutaten"},
  {id: "assortmentCategory.suesses-snacks", slug: "suesses-snacks", title: "Süßes & Snacks", group: "pantry", order: 6, description: "Für kleine Auszeiten und große Genießerinnen und Genießer.", examples: ["Schokolade", "Kekse", "Nüsse", "Trockenfrüchte", "Chips"], photo: "sortiment-suesses-snacks.png", icon: "sortiment-icon-snacks.png", alt: "Schokolade und weitere Snacks im Regal"},
  {id: "assortmentCategory.natur-koerperpflege", slug: "natur-koerperpflege", title: "Natur & Körperpflege", group: "home", order: 7, description: "Natürlich pflegen – von Kopf bis Fuß und für dein Zuhause.", examples: ["Shampoo", "Seifen", "Zahnpflege", "Körperpflege", "Wasch- und Reinigungsmittel"], photo: "sortiment-natur-koerperpflege.png", icon: "sortiment-icon-koerperpflege.png", alt: "Naturkosmetik und Körperpflegeprodukte im Regal"},
];

async function getOrUploadAsset(filename, folder) {
  const existing = await client.fetch(`*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`, {filename});
  if (existing?._id) return existing._id;
  const asset = await client.assets.upload("image", createReadStream(resolve(base, folder, filename)), {filename});
  return asset._id;
}

const groupDefinitions = [
  {key: "fresh", title: "Frisch bei uns", ids: categories.filter((item) => item.group === "fresh").map((item) => item.id)},
  {key: "pantry", title: "Alles für Küche & Vorrat", ids: categories.filter((item) => item.group === "pantry").map((item) => item.id)},
  {key: "home", title: "Für dich und Zuhause", ids: categories.filter((item) => item.group === "home").map((item) => item.id)},
];

for (const item of categories) {
  const existing = await client.getDocument(item.id);
  if (existing && (existing._type !== "assortmentCategory" || existing.slug?.current !== item.slug)) {
    throw new Error(`Refusing to update ${item.id}: its type or slug does not match the intended category.`);
  }
  const [photo, icon] = await Promise.all([
    getOrUploadAsset(item.photo, "public/images"),
    getOrUploadAsset(item.icon, "public/graphics"),
  ]);
  const document = {
    _type: "assortmentCategory", title: item.title, slug: {_type: "slug", current: item.slug},
    group: item.group, sortOrder: item.order, isVisible: true, description: item.description,
    examples: item.examples, image: {_type: "image", asset: {_type: "reference", _ref: photo}},
    icon: {_type: "image", asset: {_type: "reference", _ref: icon}}, imageAlt: item.alt,
    ...(item.ctaLabel ? {ctaLabel: item.ctaLabel, ctaHref: item.ctaHref} : {}),
  };
  if (existing) {
    const patch = client.patch(item.id).set(document);
    if (!item.ctaLabel) patch.unset(["ctaLabel", "ctaHref"]);
    await patch.commit();
  }
  else await client.createIfNotExists({_id: item.id, ...document});
  console.log(`${existing ? "Updated" : "Created"} category: ${item.id}`);
}

const groupRefs = await Promise.all(groupDefinitions.map(async (group) => ({
  _type: "object", _key: group.key, key: group.key, title: group.title, isVisible: true,
  categories: group.ids.map((_ref) => ({_key: _ref.split(".")[1], _type: "reference", _ref})),
})));
const pageDocument = {
  _type: "assortmentPage", isVisible: true,
  heroTitle: "Unser Sortiment",
  heroDescription: "Alles für deinen täglichen Einkauf – von frischem Obst und Brot bis zu Vorräten, Getränken und Naturkosmetik.",
  badgeVisible: true, badgeTitle: "Über 4.000 Produkte", badgeText: "für deinen täglichen Einkauf",
  brandsHeading: "Ausgewählte Marken und Hersteller", groups: groupRefs,
};
const existingPage = await client.getDocument("assortmentPage");
if (existingPage && existingPage._type !== "assortmentPage") throw new Error("Refusing to update assortmentPage: document ID is occupied by another type.");
if (existingPage) await client.patch("assortmentPage").set(pageDocument).commit();
else await client.createIfNotExists({_id: "assortmentPage", ...pageDocument});
console.log(`${existingPage ? "Updated" : "Created"} assortment page.`);
}

main().catch((error) => {
  console.error(`Sanity seed failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exitCode = 1;
});
