import {createClient} from "@sanity/client";
import {readFileSync} from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*SANITY_API_TOKEN\s*=\s*(.*)\s*$/);
  if (match && !process.env.SANITY_API_TOKEN) process.env.SANITY_API_TOKEN = match[1].replace(/^['"]|['"]$/g, "");
}

const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error("Set SANITY_API_TOKEN to a token with Sanity dataset write access.");

const client = createClient({
  projectId: "zqaggz4f",
  dataset: "production",
  apiVersion: "2026-09-17",
  token,
  useCdn: false,
});

const document = await client.getDocument("businessSettings");
if (!document || document._type !== "businessSettings") {
  throw new Error("The businessSettings singleton was not found in the production dataset.");
}

await client.patch("businessSettings").set({
  legalName: "Gernegrün GmbH & Co. KG",
  authorizedRepresentatives: [
    {fullName: "Andreas Fischer", role: "Geschäftsführer der persönlich haftenden Gesellschafterin"},
    {fullName: "Petra Messner", role: "Geschäftsführerin der persönlich haftenden Gesellschafterin"},
  ],
  representationNote: "jeweils einzelvertretungsberechtigt",
  registerCourt: "Offenbach am Main",
  registerNumber: "HRA 43047",
  personallyLiablePartner: "Gernegrün Verwaltungsgesellschaft mbH",
  partnerRegisterCourt: "Offenbach am Main",
  partnerRegisterNumber: "HRB 53563",
  vatId: "DE345866185",
  organicCertification: "Zertifiziert gemäß Artikel 35 Absatz 1 der Verordnung (EU) 2018/848 über die ökologische/biologische Produktion und die Kennzeichnung von ökologischen/biologischen Erzeugnissen.",
  organicControlBody: "DE-ÖKO-007",
}).commit();

const updatedDocument = await client.getDocument("businessSettings");
if (
  updatedDocument?.legalName !== "Gernegrün GmbH & Co. KG" ||
  updatedDocument?.registerCourt !== "Offenbach am Main" ||
  updatedDocument?.registerNumber !== "HRA 43047" ||
  updatedDocument?.vatId !== "DE345866185" ||
  updatedDocument?.organicControlBody !== "DE-ÖKO-007" ||
  updatedDocument?.representationNote !== "jeweils einzelvertretungsberechtigt" ||
  updatedDocument?.personallyLiablePartner !== "Gernegrün Verwaltungsgesellschaft mbH" ||
  updatedDocument?.partnerRegisterCourt !== "Offenbach am Main" ||
  updatedDocument?.partnerRegisterNumber !== "HRB 53563" ||
  updatedDocument?.authorizedRepresentatives?.map(({fullName, role}) => `${fullName}:${role}`).join("|") !== "Andreas Fischer:Geschäftsführer der persönlich haftenden Gesellschafterin|Petra Messner:Geschäftsführerin der persönlich haftenden Gesellschafterin"
) {
  throw new Error("The updated imprint data could not be verified in the production dataset.");
}

console.log("Impressum-Angaben einschließlich Vertretungsberechtigter im Sanity-Produktionsdatensatz aktualisiert und geprüft.");
