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
const assetDirectory = resolve("public");
const assets = new Map();

async function imageAsset(filename) {
  if (assets.has(filename)) return assets.get(filename);
  const originalFilename = filename.split(/[\\/]/).at(-1);
  let id = await client.fetch('*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id', {filename: originalFilename});
  if (!id) {
    const uploaded = await client.assets.upload("image", createReadStream(resolve(assetDirectory, filename)), {filename: originalFilename});
    id = uploaded._id;
  }
  assets.set(filename, id);
  return id;
}

function imageRef(id) {
  return {_type: "image", asset: {_type: "reference", _ref: id}};
}

const galleryFiles = [
  ["20260602-170603.webp", "Schokoladen und Süßigkeiten im GerneGrün-Regal", "Süßes für jeden Geschmack"],
  ["20260602-170957.webp", "Auswahl an Käse in der Frischetheke", "Unsere Käsetheke"],
  ["20260602-171713-1.webp", "Alkoholfreie Weine auf einem Holzfass", "Genuss ohne Alkohol"],
  ["20260608-093406.webp", "Verschiedene Brote in geflochtenen Körben", "Täglich frisches Brot"],
  ["20260602-174031.webp", "Regale mit Nudeln, Getreide und weiteren Vorräten", "Alles für Küche und Vorrat"],
  ["20260615-125120.webp", "Frisches Obst und Gemüse in der gekühlten Auslage", "Frisch und saisonal"],
  ["20260623-142000.webp", "Geschenkkorb mit ausgewählten Lebensmitteln", "Besonderes entdecken"],
  ["20260911-105721.webp", "Bio-Babynahrung und Snacks im Holzregal", "Auch für die Kleinsten"],
  ["img-20260528-wa0002.webp", "Blick in den GerneGrün Markt mit frischem Obst und Gemüse", "Willkommen bei GerneGrün"],
];

try {
  const existing = await client.getDocument("aboutPage");
  if (existing && existing._type !== "aboutPage") throw new Error("The about page singleton ID is already used by another document type.");

  const storefront = imageRef(await imageAsset("images/about/gernegruen-storefront.png"));
  const welcome = imageRef(await imageAsset("images/about/wir-sind-da.png"));
  const historicStorefront = imageRef(await imageAsset("images/about/natuerlich-frei-storefront.png"));
  const logo = imageRef(await imageAsset("images/about/gernegruen-logo.png"));
  const gallery = await Promise.all(galleryFiles.map(async ([filename, altText, caption], index) => ({
    _key: `about-gallery-${index + 1}`,
    _type: "object",
    image: imageRef(await imageAsset(`images/about/${filename}`)),
    title: caption,
    caption,
    altText,
    isVisible: true,
    sortOrder: index + 1,
  })));

  const benefits = await Promise.all([
    {title: "Großes Sortiment", description: "Über 4.000 Produkte für deinen täglichen Einkauf.", icon: "icons/about/basket.png", iconAlt: "Einkaufskorb mit ausgewählten Lebensmitteln"},
    {title: "Fahrradstellplätze", description: "Direkt vor dem Laden.", icon: "icons/about/bicycle.png", iconAlt: "Fahrräder an einem Fahrradständer"},
    {title: "Freie Parkplätze", description: "Bei uns im Hof.", icon: "icons/about/car.png", iconAlt: "Auto mit Parkplatzschild"},
    {title: "Mitten in Dreieich", description: "Persönlich, nah und immer für dich da.", icon: "icons/about/store.png", iconAlt: "Kleines Ladengeschäft"},
  ].map(async (benefit, index) => ({
    _key: `about-benefit-${index + 1}`,
    _type: "object",
    ...benefit,
    icon: imageRef(await imageAsset(benefit.icon)),
    isVisible: true,
    sortOrder: index + 1,
  })));

  const content = {
    isVisible: true,
    seoTitle: "Über uns | GerneGrün – Der Bioladen in Dreieich",
    seoDescription: "Lerne GerneGrün kennen: die Geschichte unseres Ladens, unsere Werte und das vielfältige Sortiment in Dreieich.",
    hero: {
      headline: "Gut versorgt",
      headlineAccent: "in Dreieich.",
      description: "Aus einem Unverpackt-Laden ist ein Nahversorger für den Alltag geworden – mit mehr Auswahl, bewährten Werten und viel Nähe zur Region.",
      image: storefront,
      imageAlt: "Außenansicht des GerneGrün Bioladens in Dreieich",
    },
    timeline: {
      isVisible: true,
      heading: "Unsere Geschichte",
      milestones: [
        {_key: "about-2022", _type: "object", year: "2022", title: "Der Anfang: natürlich frei", description: "Als Unverpackt-Laden gestartet – mit Fokus auf biologisch, regional und nachhaltig. Viele Produkte gab es lose, unverpackt und in bedarfsgerechten Mengen.", image: historicStorefront, imageAlt: "Außenansicht des früheren Natürlich Frei Ladens", sortOrder: 1},
        {_key: "about-2026", _type: "object", year: "2026", title: "Neuer Name, neues Kapitel", description: "Aus natürlich frei wird GerneGrün. Mehr Platz, mehr Auswahl und ein breites Sortiment für den täglichen Einkauf – mit den Werten, die uns wichtig sind.", image: logo, imageAlt: "GerneGrün – Der Bioladen in Dreieich", sortOrder: 2},
      ],
    },
    gallery: {
      isVisible: true,
      eyebrow: "Komm herein",
      heading: "Einblicke in unseren Laden",
      description: "Entdecke Frisches, Feines und Lieblingsprodukte aus unserem Laden in Dreieich.",
      images: gallery,
    },
    benefits: {isVisible: true, heading: "Was uns ausmacht", items: benefits},
    contact: {
      heading: "Wir sind für dich da",
      description: "Unser Team liebt gute Lebensmittel und nimmt sich gerne Zeit für dich.\n\nEgal ob du eine Frage hast, eine Empfehlung suchst oder einfach neugierig bist – wir freuen uns auf den Austausch mit dir!",
      image: welcome,
      imageAlt: "Auswahl guter Lebensmittel, Brot, Obst und Wein auf einem Tisch",
      ctaLabel: "Kontakt aufnehmen",
      ctaHref: "/kontakt",
    },
  };

  await client.createIfNotExists({_id: "aboutPage", _type: "aboutPage"});
  await client.patch("aboutPage").set(content).unset(["hero.ctaLabel", "hero.ctaHref"]).commit();
  console.log(`Updated the published about page with ${gallery.length} gallery images and ${benefits.length} benefit items.`);
} catch {
  console.error("Sanity about-page seed failed. Details were suppressed to protect credentials; check the token, certificate trust, and Sanity access.");
  process.exitCode = 1;
}
