import type {Metadata} from "next";
import {LegalPage, LegalSection} from "@/components/sections/LegalPage";
import {getBusinessSettings} from "@/sanity/lib/businessSettings";
import {createPageMetadata} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Impressum – GerneGrün",
  description: "Anbieterkennzeichnung und Kontakt zum GerneGrün Lebensmittelgeschäft in Dreieich.",
  path: "/impressum",
});

export default async function ImprintPage() {
  const business = await getBusinessSettings();
  return <LegalPage title="Impressum" intro="Anbieterkennzeichnung und Kontaktinformationen.">
    <LegalSection title="Angaben gemäß § 5 DDG">
      <div className="legal-notice">
        <p><strong>Entwurf – vor Veröffentlichung vervollständigen:</strong> Die Website enthält derzeit keine verifizierte Rechtsform, keinen vollständigen Namen der Betreiberin oder des Betreibers und keine Register- oder Steuerangaben. Bitte die markierten Stellen anhand der tatsächlichen Unternehmensdaten prüfen.</p>
      </div>
      <p><strong>Anbieter und verantwortlich für den Inhalt:</strong><br />
        <span className="legal-placeholder">[Vollständiger Vor- und Nachname oder vollständige Firma einschließlich Rechtsform]</span><br />
        {business ? <>{business.street}<br />{business.postalCode} {business.city}</> : <span className="legal-placeholder">[Straße, Hausnummer, Postleitzahl, Ort und Staat]</span>}
      </p>
      {business && <p><strong>Ladenanschrift laut Website:</strong><br />{business.businessName}<br />{business.street}<br />{business.postalCode} {business.city}<br /><span className="legal-placeholder">[Bitte bestätigen, ob dies zugleich die Niederlassungs-/ladungsfähige Anschrift des Anbieters ist.]</span></p>}
      <p>E-Mail: {business?.email ? <a href={`mailto:${business.email}`}>{business.email}</a> : <span className="legal-placeholder">[E-Mail-Adresse]</span>}<br />
        Telefon: {business?.phone ? <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`}>{business.phone}</a> : <span className="legal-placeholder">[Telefonnummer]</span>}</p>
    </LegalSection>
    <LegalSection title="Weitere Angaben, sofern zutreffend">
      <ul>
        <li><strong>Vertretungsberechtigte Person bei einer juristischen Person:</strong> <span className="legal-placeholder">[Name und Funktion; Rechtsform und Vertretung prüfen]</span>.</li>
        <li><strong>Register:</strong> <span className="legal-placeholder">[Registergericht, Registerart und Registernummer – nur falls eingetragen]</span>.</li>
        <li><strong>Umsatzsteuer-Identifikationsnummer oder Wirtschafts-Identifikationsnummer:</strong> <span className="legal-placeholder">[Nummer – sofern erteilt; andernfalls Angabe entfernen]</span>.</li>
        <li><strong>Zuständige Aufsichtsbehörde:</strong> <span className="legal-placeholder">[Nur falls die konkrete Tätigkeit einer behördlichen Zulassung bedarf: Behörde und Anschrift]</span>.</li>
        <li><strong>Berufsrechtliche Angaben:</strong> <span className="legal-placeholder">[Nur bei reglementiertem Beruf: Kammer, Berufsbezeichnung, Verleihungsstaat und berufsrechtliche Regeln samt Fundstelle]</span>.</li>
      </ul>
    </LegalSection>
  </LegalPage>;
}
