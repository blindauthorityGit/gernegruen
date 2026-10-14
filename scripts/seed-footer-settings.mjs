import {readFileSync} from "node:fs";
import {createClient} from "@sanity/client";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*SANITY_API_TOKEN\s*=\s*(.*)\s*$/);
  if (match && !process.env.SANITY_API_TOKEN) process.env.SANITY_API_TOKEN = match[1].replace(/^['"]|['"]$/g, "");
}

const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error("Set SANITY_API_TOKEN to a token with Sanity dataset write access.");
const client = createClient({projectId: "zqaggz4f", dataset: "production", apiVersion: "2026-09-17", token, useCdn: false});
const content = {
  openingHoursHeading: "Öffnungszeiten",
  addressHeading: "Besuche uns",
  linksHeading: "Links",
  legalLinks: [
    {_key: "impressum", label: "Impressum", href: "/impressum"},
    {_key: "datenschutz", label: "Datenschutzerklärung", href: "/datenschutz"},
    {_key: "barrierefreiheit", label: "Barrierefreiheit", href: "/barrierefreiheit"},
  ],
};

try {
  await client.createIfNotExists({_id: "footerSettings", _type: "footerSettings"});
  await client.patch("footerSettings").setIfMissing(content).commit();
  const result = await client.getDocument("footerSettings");
  if (!result || result._type !== "footerSettings") throw new Error("Footer settings document verification failed.");
  console.log("Footer settings document is available; existing editor values were preserved.");
} catch (error) {
  console.error("Footer settings could not be seeded:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
}
