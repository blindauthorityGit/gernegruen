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
const imageDirectory = resolve("public/images/sortiment-galerie");
const images = [
  {file: "20260622-133515.webp", altText: "Frische Salate und Lauch im gekühlten Gemüsebereich", caption: "Knackig und saisonal"},
  {file: "20260622-133746.webp", altText: "Schalen mit frischen Beeren in der Obstabteilung", caption: "Fruchtige Vielfalt"},
  {file: "20230912-121855.webp", altText: "Violetter Kohlrabi mit Blättern in einem Weidenkorb", caption: "Gemüse mit Charakter"},
  {file: "20260910-091731.webp", altText: "Verschiedene Brote in Körben vor einer grünen Wand", caption: "Täglich frisches Brot"},
  {file: "20260619-135929.webp", altText: "Auswahl an Käsespezialitäten in der Frischetheke", caption: "Käse für jeden Geschmack"},
  {file: "20260619-135925.webp", altText: "Blick auf die Käsetheke mit vielen verschiedenen Sorten", caption: "Unsere Frischetheke"},
  {file: "20260623-141924.webp", altText: "Korb mit ausgewählten Produkten und frischer Wassermelone", caption: "Besonderes entdecken"},
  {file: "20260911-105939.webp", altText: "Naturkosmetik und Nahrungsergänzung im Regal", caption: "Natürlich gut versorgt"},
  {file: "20260911-105905.webp", altText: "Grußkarten mit Illustrationen aus der Natur", caption: "Kleine Dinge, die Freude machen"},
];

try {
  const page = await client.getDocument("assortmentPage");
  if (!page || page._type !== "assortmentPage") throw new Error("The assortment page singleton is missing or has the wrong type.");

  const items = [];
  for (let index = 0; index < images.length; index += 1) {
    const item = images[index];
    let assetId = await client.fetch('*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id', {filename: item.file});
    if (!assetId) {
      const asset = await client.assets.upload("image", createReadStream(resolve(imageDirectory, item.file)), {filename: item.file});
      assetId = asset._id;
    }
    items.push({
      _key: `market-${index + 1}`,
      _type: "object",
      image: {_type: "image", asset: {_type: "reference", _ref: assetId}},
      altText: item.altText,
      caption: item.caption,
    });
  }

  await client.patch("assortmentPage").set({gallery: {
    isVisible: true,
    eyebrow: "Komm herein",
    heading: "Einblicke in unseren Markt",
    description: "Entdecke Frisches, Feines und Lieblingsprodukte aus unserem Laden in Dreieich.",
    images: items,
  }}).commit();
  console.log(`Published ${items.length} gallery images to the assortment page.`);
} catch {
  console.error("Sanity gallery update failed. Details were suppressed to protect credentials; verify the token, certificate trust, and Sanity access.");
  process.exitCode = 1;
}
