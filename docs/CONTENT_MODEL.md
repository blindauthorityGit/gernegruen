# Content model

## Wöchentliche Obst- und Gemüseliste

`weeklyProduceList` speichert eine Wochenliste mit einzelnen, redaktionell
bearbeitbaren Produktfeldern. Die Listen sind unter **SEITEN → Diese Woche →
Obst- & Gemüselisten** sowie als Verknüpfung unter **INHALTE → Obst- &
Gemüselisten** erreichbar; beide Einträge öffnen dieselben Dokumente.
Lege ein Dokument für die Woche an und pflege Kalenderwoche, Jahr sowie die
Produkte. Pro Produkt sind Name, Einheit, Preis, Marke, Herkunft,
Verbands-/Bio-Angabe, Reihenfolge und eine Kategorie-Referenz verfügbar.

Die Kategorien werden als `produceCategory`-Dokumente unter **INHALTE →
Obst- & Gemüsekategorien** gepflegt. Titel und `sortOrder` bestimmen Gruppierung,
Überschrift und Reihenfolge auf `/diese-woche`. `showInHomepageTeaser` steuert,
ob die Kategorie bei der Auswahl der vier Startseiten-Produkte berücksichtigt
wird. Weise jedes Produkt im Feld **Kategorie** einem Kategoriedokument zu.
Ältere Produkte ohne Referenz werden vorübergehend weiterhin anhand ihrer alten
Kategorie oder ihres Namens eingeordnet.

Die Produktlisten- und Backwaren-Importwerkzeuge sind vorübergehend aus dem
Studio-Menü ausgeblendet. Die Importimplementierung und vorhandene Daten bleiben
erhalten. Die aktuellen Inhalte werden direkt in den jeweiligen Sanity-Feldern
bearbeitet und wie gewohnt als Entwurf geprüft und veröffentlicht.

Die öffentliche Seite verwendet die zuletzt bearbeitete veröffentlichte Liste,
die aktiviert und nicht archiviert ist. Für einen manuellen Wechsel wird die
gewünschte Liste aktiviert und die bisherige deaktiviert; zum Abschalten werden
alle Listen deaktiviert. Die Sortimentsausgabe für Brot, Kuchen und Aktionen
wird unabhängig ausgewählt und ebenfalls über **Ausgabe freigeben** gesteuert.
Deshalb sollten Redakteure vor der Veröffentlichung prüfen, dass die
Kalenderwochen beider Inhalte zusammenpassen. Eine fehlende Liste zeigt einen
Vorbereitungs-Hinweis statt lokaler Beispieldaten. Sanity-Änderungen erscheinen
nach Ablauf des 60-Sekunden-Daten-Caches.

## Über uns

`aboutPage` is the fixed Sanity singleton for `/ueber-uns` and is exposed under
**SEITEN → Über uns**. Its hero, optional ordered timeline, optional gallery,
optional benefits, and contact close are queried server-side from Sanity. The
page renders no editorial fallback when the singleton is missing or hidden.

Timeline milestones, gallery images, and benefits carry visibility and sort
fields; gallery images also store optional title/caption and required alt text.
All page copy and images are editor-managed. The gallery reuses the assortment
gallery's keyboard-accessible lightbox and Sanity image delivery, with a
horizontal desktop rail and touch carousel on mobile. The four supplied benefit
illustrations are stored as image assets on the page's benefit items.

Run `npm run sanity:seed-about-page` to upload the supplied photos and
illustrations and create or update the `aboutPage` singleton. The command can be
run repeatedly and requires a Sanity dataset write token in `.env.local`. The
2022 milestone starts without a photo because no historical Ladenfoto was
provided; editors can add one in Studio.

## Startseite

`startPage` is the controlled homepage document. It contains the editable SEO
title and description, the required `hero`, and the `assortmentSection`
configuration. The separate `storeIntroSettings` singleton controls the
"Ein Laden mit Herz" section and is listed under **SEITEN**.
Later homepage sections should continue to be added explicitly rather than
through a universal page builder.

The nested `startHero` object contains:

- two headline lines
- subline / description
- primary and secondary actions, with editable labels and destinations
- editable hero photo and alternative text (required for uploaded images). Editors
  can upload an ordinary photo and use Sanity's hotspot/crop controls to position
  it inside the fixed organic SVG mask. The former finished graphic field remains
  hidden and read-only so existing published content continues to render until a
  new photo is selected.

`storeIntroSettings.content` is a `storeIntroSection` object with the store
photo, intro copy, parking note, highlights, ordered assortment categories, and
Sortiment link. Its image uses Sanity hotspot and alt text. The homepage preview
links its weekly offers to the active `assortmentEdition`, produce rows to the
current `weeklyProduceList`, supplier marks to their `supplierBrand` documents,
and the store introduction to `storeIntroSettings`. Keep those
datasets fetched with Stega enabled in Presentation mode; URLs and values used
for comparisons are cleaned before rendering or logic.

Run `npm run sanity:seed-homepage-content` to add the current homepage store
copy and existing local store photo when those fields are missing. The script
also fills missing page SEO fields with the metadata defaults currently used by
the app, while preserving any existing values. It requires both `SANITY_API_READ_TOKEN`
and `SANITY_API_TOKEN` in `.env.local`.

SEO titles, descriptions, and page-specific keywords are editable for the
homepage, assortment, weekly, about, and contact pages in their respective page
documents. Open Graph and Twitter title/description reuse those values; the
canonical URL follows the fixed route. Legal-page titles and descriptions live
under `Geschäftsdaten → SEO für rechtliche Seiten` because the legal routes do
not have separate page documents.

The hero is static and has no rotating content or scroll animation. The frontend
loads its published content on the server, with a 60-second revalidation interval.
Until the singleton is published, or if individual fields are empty, it uses the
current Figma copy and supplied store photo as fallbacks.
The header, footer and contact page share opening hours and contact details from
the `businessSettings` singleton. The collapsed header strip and date-specific
exceptions use the `Europe/Berlin` timezone.

The global footer also reads its section headings and ordered legal links from
the `footerSettings` singleton (**EINSTELLUNGEN → Footer**). The hours, store
address, phone, e-mail and Instagram remain sourced from `businessSettings`, so
they stay consistent with the header and contact page. Footer presentation
fields are editable in Presentation mode and link destinations are cleaned
before navigation.
Homepage supplier logos are stored as `supplierBrand` documents. The homepage
and assortment page share the same ordered, visibility-filtered Sanity query.

`storeIntroSettings` is a fixed singleton document with ID `storeIntroSettings`
and appears as **SEITEN → Ein Laden mit Herz**. It controls the homepage section
with the store photo, intro copy, parking note, highlights, ordered assortment
categories, and Sortiment link. Category illustrations remain fixed design
assets in the frontend; editors choose from the matching category keys and can
change labels and ordering. The previous nested `startPage.storeIntroSection`
field has been migrated and is no longer used.

The background curve, colors, decorative marks, typography, spacing, and motion
remain implementation details and are intentionally not editable in Sanity.

## Geschäftsdaten und Kontakt

`businessSettings` is the global singleton for the store name, postal address,
legal company details, authorized representatives, register and tax identifiers,
organic certification, contact details, coordinates, weekly opening hours and
date-specific exceptions. Legal details also feed `/impressum`; the public
imprint omits optional register, tax, personally liable partner, and certification
entries when they are empty. For a GmbH & Co. KG, it identifies the personally
liable GmbH and its register entry alongside the KG's own register entry.
`npm run sanity:update-imprint` writes the confirmed legal company name,
representation, both register entries, VAT ID and organic certification to the
production singleton while preserving all other business settings. Day
exceptions override the matching regular weekday in the header and contact
schedule.

`contactPage` controls the `/kontakt` page. Its hero image references the same
Sanity asset as the About page. Card headings and directions copy are editable
there; the bike and parking illustrations and copy reuse the existing About-page
benefits. The OpenStreetMap embed is loaded only after the visitor activates it.

## Aktuelles Sortiment (homepage)

The homepage now uses `assortmentSection` instead of the former highlight slider.
The previous highlight slider schemas (`contentCardSection`, `highlightItem`,
and `contentCategory`) were removed after confirming there were no matching
documents in the production dataset and no active frontend usage. The old
`currentContentSection` field is no longer part of the Startseite schema.

In Studio, open **INHALTE → Wochenangebote (Brot, Kuchen & Aktionen)**. Each
`assortmentEdition` contains its own topline, headline and description, a
fixed fields for Brot and Kuchen, and an optional action preview. The produce card and its product
rows are not stored here: its heading/artwork are part of the frontend design,
and its product rows always come from the latest enabled weekly list. Bread and
cake use separate fixed fields, so the editor does not have to
preserve hidden array keys. The preview's vegetable, bread, and cake artwork
remains fixed frontend design. Sanity stores only the editable offer copy,
ingredients, optional price, and action preview text/link.

1. Create or duplicate an edition and set its internal name and display period.
2. Edit **Brot & Kuchen der Woche** and, when needed, the **Aktionsvorschau**.
3. Publish the edition and add its reference under **SEITEN → Startseite →
   Aktuelles Sortiment → Sortimentsausgaben**, then publish the homepage.
4. Keep **Ausgabe freigeben** enabled for the edition you want shown. The latest
   enabled edition and latest enabled produce list are selected independently.
   Disable the start-page section to switch the whole preview off.

The server fetches the latest enabled, published produce list and latest enabled
edition independently. When the start-page section is disabled or neither source
has content, the weekly preview is hidden. Background artwork, layout and motion
stay in code. The
section's organic background owns the visual transition below the hero. Motion
uses once-only scroll reveals and subtle image hover, with reduced-motion
support; all content renders as server HTML.

## Sortimentsseite

The public `/sortiment` page reads its hero, product-count badge, group headings,
visibility and category references from the singleton `assortmentPage` document.
Each referenced `assortmentCategory` owns its stable slug, navigation icon,
category photo and alt text, short description, example products, optional CTA,
card badge text, group key, ordering and visibility. The trailing “und vieles
mehr ...” is added in the card component and should not be entered in Sanity. Group order follows
the page document; category order follows `sortOrder`. The editor structure
exposes the page as a singleton and categories and manufacturers as document
lists.

`npm run sanity:seed-assortment` uploads the supplied seven photos and seven
icons, then creates or updates the fixed category IDs and page singleton. It
requires `SANITY_API_TOKEN` with dataset write access. Before updating an
existing category the script checks its document type and stable slug; unrelated
fields are preserved. If the page document ID belongs to another type, it stops.
The page intentionally has no local copy fallback: without the published Sanity
singleton, its hero and categories remain hidden until content is seeded.

The same `assortmentPage` singleton also controls the product-wish section and
the market photo gallery. Each can be hidden independently. The wish section
stores its eyebrow, heading, description, disclaimer, and button label. The
gallery stores its eyebrow, heading, introduction, and ordered image items;
each item has an image, required alternative text, and optional caption. The
gallery uses a consistent 4:3 frame and crops with the Sanity image hotspot.
Its layout, organic corner shapes, and wish illustration remain frontend design
details.

Run `npm run sanity:seed-assortment-gallery` to upload the nine supplied market
photos, set their editorial alternative text and captions, and publish the
gallery on the `assortmentPage` singleton. This requires a Sanity dataset write
token in `.env.local`.

## Diese Woche

- **SEITEN → Diese Woche → Seitentexte & SEO** is the fixed `weeklyPageSettings` singleton. It stores page copy, the hero illustration, SEO fields, jump-link labels and empty-state messages. It does not store the changing weekly product list.
- **SEITEN → Diese Woche → Vorschau nächste Woche** is an optional list of `nextWeekPreview` documents. Each document describes one upcoming offer week and appears on `/diese-woche` only during its preview window and when it has valid products. An empty list means no preview is scheduled; it is safe to leave empty when this feature is not being used.
- **SEITEN → Diese Woche → Obst- & Gemüselisten** is the one place to manage weekly produce lists. The most recently updated published, enabled, non-archived list is shown, regardless of its week number. Set **Auf der Website anzeigen** to off to exclude a list; if no enabled list remains, the section is hidden.
- The former **Wochenübersichten (Altbestand)** model was an unused, bundled weekly format. The production dataset contains no documents of this type, so the Sanity model, navigation entry, and runtime fallback have been removed.
- Bread, cake, and the optional homepage action preview come from the latest enabled `assortmentEdition`; the bakery price list comes independently from `bakeryCatalog-main`.
- The KW badge, date range, and fresh produce come from the most recently updated published, enabled, non-archived `weeklyProduceList`. The produce list and assortment edition are selected independently.
- In **INHALTE → Wochenangebote (Brot, Kuchen & Aktionen)**, edit the separate **Brot der Woche** and **Kuchen der Woche** fields. `title` is the product name, `ingredients` supplies the small text on offer previews and the preorder list, and `price` remains available for preorder totals. The frontend supplies the headings “Brot der Woche” / “Kuchen der Woche” and the illustrations.
- The KW badges on the homepage/assortment teaser and `/diese-woche` come from the latest enabled, non-archived published `weeklyProduceList`. Editors can switch the active list by changing **Auf der Website anzeigen** on the list documents; disabling all lists hides the weekly produce section.
- `bakeryCatalog` stores the slower-changing bakery assortment independently of the weekly produce list. The fixed `bakeryCatalog-main` document has separate `breadCategories` (Brot & Gebäck) and `sweetCategories` (Süßgebäck) arrays. Both appear in distinct areas on `/diese-woche` and together supply the preorder dialog. Edit each category and its product name, price and optional note directly in Sanity.
- `/diese-woche` action PDFs are maintained inline in `weeklyPageSettings.promotionSheets`; active entries remain visible until removed or disabled. Their date range is an editorial label, not an automatic visibility rule. The homepage action preview comes from the latest enabled edition.

The fixed `weeklyPageSettings` document controls the editorial copy, the
replaceable hero illustration, SEO fields and manually exchanged promotion PDFs
for `/diese-woche`. Bakery highlights come from the edition active in its display
period; the current produce list and bakery price catalog remain
separate. In Presentation mode, hero, section copy and promotion PDFs map to
this singleton, while bakery cards, product rows and catalog entries map to
their source documents.
Presentation uses the current `weeklyProduceList` as the route's primary document.
The page does not fall back to sample bakery prices, products or action sheets
when weekly Sanity content is missing. Missing content stays empty until an editor
publishes it.

The product-wish callout is shared by the assortment and weekly pages. Its copy,
visibility, illustration and alt text are stored in `assortmentPage.productWish`
and mapped to that document in Presentation.

## Vorschau nächste Woche

`nextWeekPreview` represents one upcoming offer week, identified by its Monday
date in `offerWeek`. Editors can enable or disable the document and maintain an
ordered list of embedded `nextWeekProduct` objects with name, image, optional
label and optional supporting text.

The public preview window uses `Europe/Vienna`: it opens at 00:00 on the
preceding Thursday, or at the optional later `publicationDate`, and closes at
00:00 on the offer Monday. The frontend calculates these boundaries on every
request and bypasses the route/data cache so a preview cannot remain visible
after the weekly boundary. Invalid Mondays, inactive documents and previews
without valid products are not rendered. If several eligible documents target
the same Monday, the one with the latest effective publication start wins;
`_updatedAt` and `_id` provide deterministic tie-breakers.

The dataset currently contains no `nextWeekPreview` document. The frontend
renders this section only when an eligible Sanity document contains real
products; it does not insert sample content in development or production.
Creating a document does not prefill its title, description, or products.
Presentation hotspots map the preview title, text, images and products to the
selected `nextWeekPreview`.
