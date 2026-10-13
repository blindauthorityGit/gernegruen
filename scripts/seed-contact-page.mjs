import {createClient} from "@sanity/client";
import {readFileSync} from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*SANITY_API_TOKEN\s*=\s*(.*)\s*$/);
  if (match && !process.env.SANITY_API_TOKEN) process.env.SANITY_API_TOKEN = match[1].replace(/^['"]|['"]$/g, "");
}

const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error("Set SANITY_API_TOKEN to a token with Sanity dataset write access.");
const client = createClient({projectId: "zqaggz4f", dataset: "production", apiVersion: "2026-09-17", token, useCdn: false});

const businessSettings = {
  businessName: "GerneGrün",
  street: "Waldstraße 4",
  postalCode: "63303",
  city: "Dreieich",
  phone: "06103-3867347",
  email: "info@gernegruen.com",
  instagramHandle: "gernegruen_bioladen",
  coordinates: {latitude: 49.99937, longitude: 8.71111},
  openingHours: [
    {dayOfWeek: 1, day: "Montag", shortDay: "Mo.", opens: "10:00", closes: "18:30", isClosed: false},
    {dayOfWeek: 2, day: "Dienstag", shortDay: "Di.", opens: "10:00", closes: "18:30", isClosed: false},
    {dayOfWeek: 3, day: "Mittwoch", shortDay: "Mi.", opens: "10:00", closes: "14:00", isClosed: false},
    {dayOfWeek: 4, day: "Donnerstag", shortDay: "Do.", opens: "10:00", closes: "18:30", isClosed: false},
    {dayOfWeek: 5, day: "Freitag", shortDay: "Fr.", opens: "10:00", closes: "18:30", isClosed: false},
    {dayOfWeek: 6, day: "Samstag", shortDay: "Sa.", opens: "10:00", closes: "13:00", isClosed: false},
    {dayOfWeek: 7, day: "Sonntag", shortDay: "So.", isClosed: true},
  ],
  exceptions: [],
};

try {
  const [aboutPage, existingBusiness, existingContact] = await Promise.all([
    client.getDocument("aboutPage"),
    client.getDocument("businessSettings"),
    client.getDocument("contactPage"),
  ]);
  if (!aboutPage || aboutPage._type !== "aboutPage") throw new Error("The about page with its existing storefront image is required before seeding the contact page.");
  if (existingBusiness && existingBusiness._type !== "businessSettings") throw new Error("The businessSettings singleton ID is used by another document type.");
  if (existingContact && existingContact._type !== "contactPage") throw new Error("The contactPage singleton ID is used by another document type.");
  const storefront = aboutPage.hero?.image;
  if (!storefront?.asset?._ref) throw new Error("The existing about-page storefront image is missing.");

  await client.createIfNotExists({_id: "businessSettings", _type: "businessSettings"});
  await client.patch("businessSettings").setIfMissing(businessSettings).commit();
  await client.createIfNotExists({_id: "contactPage", _type: "contactPage"});
  await client.patch("contactPage").setIfMissing({
    isVisible: true,
    seoTitle: "Kontakt & Anfahrt | GerneGrün – Der Bioladen in Dreieich",
    seoDescription: "Öffnungszeiten, Adresse und Kontakt zum GerneGrün Bioladen in Dreieich. Finde den Weg zu uns in die Waldstraße 4.",
    hero: {
      headline: "Kontakt",
      headlineAccent: "und Anfahrt.",
      description: "Du findest uns in der Waldstraße 4 in Dreieich. Ob zu Fuß, mit dem Fahrrad oder dem Auto – wir sind unkompliziert erreichbar.",
      image: storefront,
      imageAlt: "Außenansicht des GerneGrün Bioladens in Dreieich",
    },
    cards: {isVisible: true, openingHoursHeading: "Öffnungszeiten", contactHeading: "Adresse & Kontakt"},
    directions: {isVisible: true, heading: "So findest du uns", description: "Mit dem Fahrrad oder dem Auto bist du ganz unkompliziert bei uns.", mapZoom: 17, routeLabel: "Route planen"},
  }).commit();
  const parkingBenefit = aboutPage.benefits?.items?.find((item) => item.title === "Freie Parkplätze");
  if (parkingBenefit?.description === "Bei uns im Hof.") {
    const benefits = aboutPage.benefits.items.map((item) => item._key === parkingBenefit._key ? {...item, description: "Kostenlose Parkplätze bei uns im Hof."} : item);
    await client.patch("aboutPage").set({"benefits.items": benefits}).commit();
  }
  console.log("Seeded missing contact and business fields; existing values were preserved, with the unchanged parking copy clarified.");
} catch {
  console.error("Contact-page seed failed. Details were suppressed to protect credentials; check write access, TLS trust, and the existing Sanity content.");
  process.exitCode = 1;
}
