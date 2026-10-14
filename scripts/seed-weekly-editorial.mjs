import {createClient} from "@sanity/client";
import {createReadStream, readFileSync} from "node:fs";
import {resolve} from "node:path";

const root = process.cwd();
const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/))
    .filter(Boolean)
    .map(([, key, value]) => [key, value.trim().replace(/^['"]|['"]$/g, "")]),
);
const token = process.env.SANITY_API_TOKEN || env.SANITY_API_TOKEN;
if (!token) throw new Error("Set SANITY_API_TOKEN in .env.local to upload the existing PDF and image.");

const client = createClient({
  projectId: "zqaggz4f",
  dataset: "production",
  apiVersion: "2026-09-17",
  token,
  useCdn: false,
});

async function imageAsset(filename) {
  const existing = await client.fetch(
    '*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id',
    {filename},
  );
  if (existing) return existing;
  const uploaded = await client.assets.upload("image", createReadStream(resolve(root, "public/graphics", filename)), {filename});
  return uploaded._id;
}

async function fileAsset(filename) {
  const existing = await client.fetch(
    '*[_type == "sanity.fileAsset" && originalFilename == $filename][0]._id',
    {filename},
  );
  if (existing) return existing;
  const uploaded = await client.assets.upload(
    "file",
    createReadStream(resolve(root, "public/documents", filename)),
    {filename, contentType: "application/pdf"},
  );
  return uploaded._id;
}

try {
  const wishImageId = await imageAsset("product-wish-box.png");
  const rawClient = client.withConfig({perspective: "raw"});
  const wishDocuments = await rawClient.fetch('*[_id in ["assortmentPage", "drafts.assortmentPage"]]{_id}');
  if (!wishDocuments.some((document) => document._id === "assortmentPage")) {
    throw new Error("The assortmentPage Sanity document is missing.");
  }

  const wishDefaults = {
    "productWish.isVisible": true,
    "productWish.eyebrow": "Deine Idee für unser Regal",
    "productWish.heading": "Du vermisst etwas in unserem Sortiment?",
    "productWish.description": "Gibt es ein Produkt, das du gerne bei uns finden würdest? Teile uns deinen Wunsch mit! Wir freuen uns über deine Anregungen und prüfen gerne, ob wir es künftig in unser Sortiment aufnehmen können.",
    "productWish.disclaimer": "Ein Produktwunsch ist eine unverbindliche Anregung – keine Bestellung oder Reservierung.",
    "productWish.buttonLabel": "Produktwunsch mitteilen",
    "productWish.image": {_type: "image", asset: {_type: "reference", _ref: wishImageId}},
    "productWish.imageAlt": "Fragezeichen über einem Einkaufskarton",
  };
  for (const document of wishDocuments) {
    await client.patch(document._id).setIfMissing(wishDefaults).commit();
  }

  const pdfFilename = "aktionsblatt-august-2026.pdf";
  const pdfAssetId = await fileAsset(pdfFilename);
  let promotionId = await client.fetch(
    '*[_type == "promotionSheet" && pdf.asset._ref == $assetId][0]._id',
    {assetId: pdfAssetId},
  );
  if (!promotionId) {
    const created = await client.create({
      _type: "promotionSheet",
      isEnabled: false,
      title: "Aktionsblatt – August 2026 (Beispiel)",
      description: "Das beigefügte Blatt ist das bisherige Beispiel-Aktionsblatt. Es ist als Asset hinterlegt, aber deaktiviert, da der Angebotszeitraum vorbei ist.",
      pdf: {_type: "file", asset: {_type: "reference", _ref: pdfAssetId}},
      validFrom: "2026-08-01",
      validUntil: "2026-08-31",
      dateRange: "Beispiel-Aktionsblatt · August 2026",
    });
    promotionId = created._id;
  }

  const weeklyDocuments = await rawClient.fetch('*[_id in ["weeklyPageSettings", "drafts.weeklyPageSettings"]]{_id, promotionSheets}');
  if (!weeklyDocuments.some((document) => document._id === "weeklyPageSettings")) {
    throw new Error("The weeklyPageSettings Sanity document is missing.");
  }
  const weeklyPromotion = {
    _key: "august-example-2026",
    _type: "weeklyPromotion",
    isEnabled: false,
    title: "Aktionsblatt – August 2026 (Beispiel)",
    description: "Das beigefügte Blatt ist das bisherige Beispiel-Aktionsblatt. Es ist als Asset hinterlegt, aber deaktiviert, da der Angebotszeitraum vorbei ist.",
    pdf: {_type: "file", asset: {_type: "reference", _ref: pdfAssetId}},
    validFrom: "2026-08-01",
    validUntil: "2026-08-31",
    dateRange: "Beispiel-Aktionsblatt · August 2026",
  };
  for (const document of weeklyDocuments) {
    const alreadyLinked = (document.promotionSheets ?? []).some((sheet) => sheet.pdf?.asset?._ref === pdfAssetId);
    if (!alreadyLinked) {
      await client.patch(document._id).set({promotionSheets: [...(document.promotionSheets ?? []), weeklyPromotion]}).commit();
    }
  }

  const [wishVerification, promotionVerification] = await Promise.all([
    client.fetch('*[_id == "assortmentPage"][0]{productWish {isVisible, eyebrow, heading, description, disclaimer, buttonLabel, imageAlt, "imageUrl":image.asset->url}}'),
    client.fetch('*[_id == $id][0]{_id, isEnabled, title, dateRange, "pdfUrl":pdf.asset->url}', {id: promotionId}),
  ]);
  const weeklyVerification = await client.fetch('*[_id == "weeklyPageSettings"][0]{"promotionSheets": promotionSheets[]{_key, isEnabled, title, dateRange, "pdfUrl": pdf.asset->url}}');
  if (!wishVerification?.productWish?.imageUrl || !wishVerification.productWish.heading) {
    throw new Error("The product wish content could not be verified.");
  }
  if (!promotionVerification?.pdfUrl || promotionVerification.isEnabled !== false) {
    throw new Error("The existing PDF was not linked as an inactive promotion document.");
  }
  if (!weeklyVerification?.promotionSheets?.some((sheet) => sheet.pdfUrl && sheet.isEnabled === false)) {
    throw new Error("The existing PDF was not linked to weeklyPageSettings.");
  }
  const activePromotionSheets = await client.fetch(`
    *[
      _type == "promotionSheet" &&
      isEnabled != false &&
      validFrom <= string::split(now(), "T")[0] &&
      validUntil >= string::split(now(), "T")[0] &&
      defined(pdf.asset->url)
    ]{_id}
  `);
  if (activePromotionSheets.some(({_id}) => _id === promotionId)) {
    throw new Error("The expired example PDF unexpectedly appears as a current promotion.");
  }
  await client.fetch(`
    *[_type == "weeklyOverview"][0]{
      "promotionSheets": select(
        count(promotionSheets[_ref]) > 0 => (promotionSheets[]->)[
          isEnabled != false &&
          validFrom <= string::split(now(), "T")[0] &&
          validUntil >= string::split(now(), "T")[0]
        ]{_id, title, description, "validLabel": dateRange, "pdfUrl": pdf.asset->url},
        defined(promotionSheet) &&
        promotionSheet->isEnabled != false &&
        promotionSheet->validFrom <= string::split(now(), "T")[0] &&
        promotionSheet->validUntil >= string::split(now(), "T")[0] => [promotionSheet->{_id}],
        []
      )
    }
  `);
  console.log("Product wish section is now editable in Sanity, including its illustration.");
  console.log("Existing PDF uploaded and linked to " + promotionVerification._id + " (kept inactive because its August 2026 example period has passed).");
  console.log("The same PDF is linked in the Aktionen tab of weeklyPageSettings.");
} catch (error) {
  console.error("Weekly editorial asset setup failed. Details were suppressed to protect credentials.");
  if (error instanceof Error) console.error(error.message);
  process.exitCode = 1;
}
