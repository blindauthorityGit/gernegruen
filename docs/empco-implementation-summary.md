# EmpCo-Umsetzung – GerneGrün

**Stand:** 13.10.2026  
**Rechtsrahmen:** deutsches UWG in der EmpCo-Fassung; der Zielmarkt Deutschland wurde zugrunde gelegt. Dieses Dokument ist eine interne Umsetzungsnotiz, keine Rechtsberatung.

## Änderungen

### Öffentlicher Auftritt

- Allgemeine Bio-/Bioladen- und Regionalitätsaussagen aus globalen Metadaten, Startseiten-Fallbacks, Header-Claim und Open-Graph-Bild entfernt oder neutral formuliert.
- Die Wochenkarte trägt keine pauschale Überschrift „Saisonal & regional“ mehr.
- Produktdaten auf der Wochenliste bleiben einem konkreten Artikel zugeordnet: Herkunftsland und gegebenenfalls Herkunftsregion, Marke sowie Lieferantenangabe werden getrennt dargestellt.
- Im Frontend wird das Legacy-Flag `bioladenCertified` nicht ausgegeben.
- Veröffentlicht angepasst wurden die Sanity-Dokumente `startPage`, `aboutPage`, `contactPage`, `assortmentCategory.obst-gemuese` und `assortmentPage` (Bildunterschriften). Die Änderungen wurden per Sanity-API in `production` geschrieben.

### Marke und Import

- Die Kürzel `b*` in Produktnamen werden als bioladen*-Produktmarke erkannt. Das Präfix bleibt in der gespeicherten Originalbezeichnung bestehen; es wird nicht als Zertifikat oder Zertifizierungsstelle interpretiert.
- Der Excel-Import benötigt nur Produktname, Einheit und Preis. Die frühere Spalte „Bioladen Zertifikat Ja/Nein“ ist optional und wird – wenn vorhanden – ausschließlich aus Legacy-Kompatibilitätsgründen gespeichert.
- Ein Bio-/Verbandsname aus Excel bleibt eine Lieferantenangabe. Neue Importe setzen `bioStatus` auf `unknown`; ein bestätigter Status erfordert eine gesonderte redaktionelle Prüfung und interne Nachweisreferenz.
- Die bestehende Datenstruktur bleibt kompatibel; neue Felder sind `brand`, `originalBrandMarker`, `originRegion`, `bioStatus` und `bioEvidenceReference`.

### Redaktion und Audit

- Sanity-Feldhilfen für zentrale freie Text-, SEO-, Kategorien-, Vorschau- und Produktfelder verlangen konkreten Aussagebezug und Belegbarkeit, ohne automatische Wortfilter oder ein zusätzliches Compliance-Modul einzuführen.
- Der vorherige Audit [empco-compliance-audit.md](empco-compliance-audit.md) wurde um den Umsetzungsstand ergänzt und auf die deutsche Rechtsgrundlage umgestellt.
- Ein allgemeiner Abschnitt zu Siegeln/Kennzeichnungen wurde nicht ergänzt: Relevante Informationen und die Einschränkung „Lieferantenangabe, nicht unabhängig geprüft“ stehen unmittelbar am Produkt.

## Noch erforderliche Betreiberprüfung

- Belege, Gültigkeit und korrekte Zuordnung aller Lieferanten-/Verbandsangaben; gegenwärtig wird keine externe Zertifizierung bestätigt.
- Tatsächliche Produktverfügbarkeit und Herkunft für jede veröffentlichte Wochenliste.
- Noch nicht geprüfte Kategorien, News-/Aktionsinhalte sowie künftige Sanity-Entwürfe.
- Redaktionelle Prüfung der verbleibenden historischen Tatsachenangaben.
- Rechtliche Schlussprüfung durch deutsche Wettbewerbsrechtsberatung, falls eine verbindliche juristische Freigabe benötigt wird.

## Validierung

- Veröffentliche Sanity-Felder wurden nach den Mutationen per API gelesen und auf den neutralisierten Text geprüft.
- `npm run lint` lief mit 0 Fehlern und 1 bereits vorhandenen Warnung in `sanity/gernegruen/eslint.config.mjs`; `npx tsc --noEmit` lief fehlerfrei.
- Keine Tests und kein Produktionsbuild ausgeführt (entsprechend dem Auftrag).
- Vorhandene, nicht aufgabenbezogene Arbeitsbaumänderungen wurden nicht bereinigt.
