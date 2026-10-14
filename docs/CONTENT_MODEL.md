# Content model

## Wöchentlicher Obst- und Gemüseimport

Das Studio-Tool **Produktlisten importieren** liest `.xlsx`- und `.xls`-Dateien
lokal im Browser ein. Die Vorschau verändert keine Sanity-Daten. Erforderliche
Spalten werden anhand ihrer Kopfzeilen erkannt; Originalwerte bleiben erhalten,
und Produktnamen werden zusätzlich normalisiert gespeichert. Preise werden als
Zahlen gespeichert. Leere Herkunfts- und Zertifizierungsfelder bleiben leer.
Fehler und doppelte Produktnamen müssen vor dem Import behoben werden.

`weeklyProduceList` ist bewusst getrennt von `weeklyOverview`, das die bestehende
Website-Wochenübersicht samt weiteren Pflichtfeldern steuert. Ein stabiler
Dokumentname je Jahr/KW verhindert doppelte Wochenlisten. Die Produkte liegen
geordnet und als zusammenhängendes Array in diesem Dokument, damit ein erneuter
Import als einzelnes atomisches Dokument-Replace erfolgt. Die Vorschau zeigt
Änderungen einer vorhandenen Liste; erst nach ausdrücklicher Bestätigung wird
deren Sanity-Entwurf ersetzt. Eine veröffentlichte Fassung wird dabei nicht
überschrieben. Importierte Listen bleiben Entwürfe und werden über die reguläre
Sanity-Veröffentlichung freigegeben. Das Jahr wird nicht aus der aktuellen Zeit
abgeleitet; wenn es im Dateinamen fehlt, muss es im Tool eingegeben werden.

Die öffentliche Seite fragt separat nur die veröffentlichte, nicht archivierte
Liste der aktuellen ISO-Kalenderwoche in `Europe/Vienna` ab. Eine fehlende oder
nicht erreichbare Liste zeigt einen Vorbereitungs-Hinweis statt alter oder
lokaler Produktdaten. Produktkategorien werden aus einer zentralen Namensliste
zugeordnet; `categoryOverride` am Produkt überschreibt diese Zuordnung. Beim
erneuten Excel-Import bleiben vorhandene manuelle Kategorien für passende
Produktnamen erhalten. Sanity-Änderungen erscheinen nach Ablauf des 60-Sekunden-
Daten-Caches.

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
- editable hero image and alternative text (required for uploaded images)

`storeIntroSettings.content` is a `storeIntroSection` object with the store
photo, intro copy, parking note, highlights, ordered assortment categories, and
Sortiment link. Its image uses Sanity hotspot and alt text. The homepage preview
links its weekly offer cards to the active `assortmentEdition`, produce rows to
the current `weeklyProduceList`, supplier marks to their `supplierBrand`
documents, and the store introduction to `storeIntroSettings`. Keep those
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
contact details, coordinates, weekly opening hours and date-specific exceptions.
Day exceptions override the matching regular weekday in the header and contact
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

In Studio, open **INHALTE → Sortimentsausgaben / Wochenplanung**. Each
`assortmentEdition` contains its own topline, headline, description, optional
callout, optional section link and ordered `assortmentCard` objects. Cards have
an image with hotspot/crop and alt text, heading, optional introduction, list
symbol, ordered entries (text plus optional secondary line), optional note and
button. These are dedicated reusable schema objects, embedded in each edition
so duplicating an edition produces an independent set of editable cards.

1. Create or duplicate an edition and set its internal name and start/end times.
2. Edit the **Texte & Störer** and **Karten** tabs; reorder cards and list entries
   by dragging. Three cards form the desktop row; more cards form further rows.
3. Publish the edition and add its reference under **SEITEN → Startseite →
   Aktuelles Sortiment → Sortimentsausgaben**, then publish the homepage.
4. Prepare future editions in advance. Published, enabled editions become
   eligible at `startAt` and cease to be eligible at `endAt` (exclusive).
   Overlaps resolve to the latest start time, then document ID for ties.

The server fetches the current edition and revalidates on requests every 60
seconds; this is not a background publishing job. Sanity stores timestamps in
UTC; choose the intended local times in Studio. When a configured section has no
current edition, or is disabled, it is hidden. Before the section is configured,
the original Figma copy/assets serve as a preview fallback. Background artwork,
layout and motion stay in code. The section's organic background owns the visual
transition below the hero. Motion uses once-only scroll reveals and subtle image
hover, with reduced-motion support; all content renders as server HTML.

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

## Weekly overview

- `weeklyOverview` schedules one calendar week and contains the produce list plus two bakery highlights.
- `bakeryCatalog` stores the slower-changing categorized bakery assortment independently.
- `promotionSheet` stores one PDF, its active state and its validity period. A week can reference multiple sheets; active sheets in their validity period are also listed without requiring a weekly overview.
- Future Excel ingestion normalizes files server-side into the contracts in `lib/weekly/import-contract.ts`; spreadsheet parsing does not happen in React components.

The fixed `weeklyPageSettings` document controls the editorial copy, the
replaceable hero illustration and SEO fields for `/diese-woche`; weekly product,
bakery and promotion records remain separate. In Presentation mode, hero and
section copy map to this singleton, while product rows, bakery highlights,
catalog entries and the promotion PDF map to their source documents.
Presentation uses the current `weeklyProduceList` as the route's primary document,
because the page can be populated before a `weeklyOverview` is created. The page
does not fall back to sample bakery prices, products or action sheets when weekly
Sanity content is missing. Missing content stays empty until an editor publishes it.

## Content coverage audit (2026-10-14)

The production dataset was checked through the read-only API token. Published
documents exist for the homepage, assortment page/categories, about page, contact
page, business settings, supplier brands, one assortment edition and the KW 42
produce list. No published `weeklyOverview`, `bakeryCatalog` or
`nextWeekPreview` exists yet. One inactive example `promotionSheet` now contains
the existing August 2026 PDF asset. Editors can create and schedule current sheets in Studio; the website will
not show the old hard-coded sample offers as if they were current.

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
