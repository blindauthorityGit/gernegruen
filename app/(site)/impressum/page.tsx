import type {Metadata} from "next";
import {LegalPage, LegalSection} from "@/components/sections/LegalPage";
import {getBusinessSettings} from "@/sanity/lib/businessSettings";
import {createPageMetadata} from "@/lib/seo";
import {stegaClean} from "next-sanity";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBusinessSettings();
  return createPageMetadata({
    title: settings?.legalSeo?.imprintTitle || "Impressum – GerneGrün",
    description: settings?.legalSeo?.imprintDescription || "Anbieterkennzeichnung und Kontakt zum GerneGrün Lebensmittelgeschäft in Dreieich.",
    path: "/impressum",
  });
}

export default async function ImprintPage() {
  const business = await getBusinessSettings();
  const representatives = business?.authorizedRepresentatives?.filter((person) => person.fullName.trim());
  return <LegalPage title="Impressum" intro="Anbieterkennzeichnung und Kontaktinformationen.">
    <LegalSection title="Angaben gemäß § 5 DDG">
      <p><strong>Anbieter:</strong><br />
        {business?.legalName || <span className="legal-placeholder">[Vollständige Firma einschließlich Rechtsform ergänzen]</span>}<br />
        {business ? <>{business.street}<br />{business.postalCode} {business.city}</> : <span className="legal-placeholder">[Straße, Hausnummer, Postleitzahl, Ort und Staat]</span>}
      </p>
      <p>E-Mail: {business?.email ? <a href={`mailto:${stegaClean(business.email)}`}>{business.email}</a> : <span className="legal-placeholder">[E-Mail-Adresse]</span>}<br />
        Telefon: {business?.phone ? <a href={`tel:${stegaClean(business.phone).replace(/[^\d+]/g, "")}`}>{business.phone}</a> : <span className="legal-placeholder">[Telefonnummer]</span>}</p>
    </LegalSection>
    <LegalSection>
      <ul>
        <li><strong>Vertretungsberechtigt:</strong> {representatives?.length ? <>{representatives.map((person) => person.role ? `${person.fullName} (${person.role})` : person.fullName).join(", ")}{business?.representationNote && ` (${business.representationNote})`}</> : <span className="legal-placeholder">[Vollständige Namen der vertretungsberechtigten Personen ergänzen]</span>}</li>
        {business?.registerCourt && business?.registerNumber && <li><strong>Handelsregister:</strong> Amtsgericht {business.registerCourt}, {business.registerNumber}</li>}
        {business?.vatId && <li><strong>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:</strong> {business.vatId}</li>}
        {(business?.organicCertification || business?.organicControlBody) && <li><strong>Bio-Zertifizierung:</strong> {business.organicCertification}{business.organicCertification && business.organicControlBody && <br />}{business.organicControlBody && <>Kontrollstelle: {business.organicControlBody}</>}</li>}
      </ul>
    </LegalSection>
  </LegalPage>;
}
