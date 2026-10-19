# EmpCo-Umsetzung – GerneGrün

**Stand:** 13.10.2026  
**Rechtsrahmen:** deutsches UWG in der EmpCo-Fassung; der Zielmarkt Deutschland wurde zugrunde gelegt. Dieses Dokument ist eine interne Umsetzungsnotiz, keine Rechtsberatung.

## Änderungen

### Öffentlicher Auftritt

- Allgemeine Bio-/Bioladen- und Regionalitätsaussagen aus globalen Metadaten, Startseiten-Fallbacks, Header-Claim und Open-Graph-Bild entfernt oder neutral formuliert.
- Die Wochenkarte trägt keine pauschale Überschrift „Saisonal & regional“ mehr.
- Produktdaten auf der Wochenliste bleiben einem konkreten Artikel zugeordnet: Herkunftsland und gegebenenfalls Herkunftsregion, Marke sowie Lieferantenangabe werden getrennt dargestellt.
- Das ehemalige Legacy-Feld `bioladenCertified` wird nicht mehr importiert oder abgefragt; gespeicherte Altwerte werden nicht öffentlich ausgegeben.
- Veröffentlicht angepasst wurden die Sanity-Dokumente `startPage`, `aboutPage`, `contactPage`, `assortmentCategory.obst-gemuese` und `assortmentPage` (Bildunterschriften). Die Änderungen wurden per Sanity-API in `production` geschrieben.

### Marke und Import

- Die Kürzel `b*` in Produktnamen werden als bioladen*-Produktmarke erkannt. Das Präfix bleibt in der gespeicherten Originalbezeichnung bestehen; es wird nicht als Zertifikat oder Zertifizierungsstelle interpretiert.
- Der Excel-Import benötigt nur Produktname, Einheit und Preis. Die frühere Spalte „Bioladen Zertifikat Ja/Nein“ wird ignoriert; die Marke wird separat aus dem eindeutigen `b*`-Präfix erkannt.
- Bio-/Verbandsangaben werden direkt aus der entsprechenden Excel-Spalte übernommen. Das separate Statusfeld und die interne Nachweisreferenz gehören nicht mehr zum Produktimport.
- Herkunft, Marke und Verbands-/Bio-Angabe bleiben getrennte Produktfelder.
- Produktkarten zeigen die gespeicherte Verbands-/Bio-Angabe direkt und ohne zusätzlichen Prüfhinweis. Für diese Angabe gibt es keine Sondervalidierung im Import.

### Redaktion und Audit

- Sanity-Feldhilfen für zentrale freie Text-, SEO-, Kategorien-, Vorschau- und Produktfelder verlangen konkreten Aussagebezug und Belegbarkeit, ohne automatische Wortfilter oder ein zusätzliches Compliance-Modul einzuführen.
- Der vorherige Audit [empco-compliance-audit.md](empco-compliance-audit.md) wurde um den Umsetzungsstand ergänzt und auf die deutsche Rechtsgrundlage umgestellt.
- Ein allgemeiner Abschnitt zu Siegeln/Kennzeichnungen wurde nicht ergänzt. Produktkarten zeigen Herkunft, Marke und Verbands-/Bio-Angabe direkt am Produkt.

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
