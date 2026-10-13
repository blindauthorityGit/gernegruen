<!-- Placeholder: Architecture documentation will be added here. -->

# Architecture

## Rendering

- Next.js App Router
- Server Components by default
- smallest possible Client Component boundaries
- Public site shell (global header and footer) lives in `app/(site)/layout.tsx`; Studio stays outside it.
- The footer copies the opaque full-section background from the final child of `<main>` into its curved backdrop, so section backgrounds can flow through the transition without per-page footer settings.

## Content

- Sanity provides editorial content
- GROQ queries live in /sanity/queries
- Sanity configuration lives in /sanity/lib
- Weekly page data is loaded through `lib/weekly/data.ts`, with a typed local fallback and server-side import contracts.
- The current produce list is loaded separately by `lib/weekly/produce-data.ts` from the published Sanity `weeklyProduceList` matching the current ISO week in `Europe/Vienna`; this keeps the legacy weekly overview and bakery fallback flow independent.

## UI

- /components/ui = primitives
- /components/layout = global layout
- /components/sections = page sections
- /components/motion = animation primitives
- The public site shell owns a global dialog provider so preorder and product-wish dialogs can be opened from any page component.

## Styling

- global tokens in app/globals.css
- component-specific styling stays near the component
- Figma is visual source of truth

## Deployment

- GitHub repository
- Vercel preview deployments for development
- production deployment from main

## Backwaren-Vorbestellungen

- Das globale Vorbestellungsmodal und die sichtbare Preisliste verwenden beide das aktuell referenzierte Sanity-`bakeryCatalog`; die API lädt dieselbe Quelle erneut und vertraut weder Produktnamen noch Preisen aus dem Browser.
- `POST /api/bakery-preorders` validiert Kontaktdaten, Mengen sowie Abholtage in der Zeitzone `Europe/Berlin`. Sonntage und gesetzliche Feiertage in Hessen werden mit `date-holidays` ausgeschlossen.
- Firestore wird ausschließlich über das Firebase Admin SDK angesprochen. `BAKERY_PREORDER_DEV=true` speichert Dokumente unter `bakeryPreorders_dev/{requestId}`, `false` unter `bakeryPreorders/{requestId}`. Ohne gesetzten Schalter wählen lokale Development-Runs automatisch die Dev-Collection; Produktions-Runs die Live-Collection. Die clientseitig erzeugte UUID verhindert doppelte Dokumente bei Wiederholungen.
- Die Anfrage wird vor dem SMTP-Versand gespeichert. Der Versandstatus (`pending`, `sent` oder `failed`) verbleibt am Dokument, sodass ein E-Mail-Fehler die Anfrage nicht verliert.
- SMTP-Zugangsdaten sind nach Umgebung getrennt: Entwicklung nutzt `SMTP_DEV_*` und `ORDER_RECIPIENT_DEV`, Live nutzt `SMTP_*` und `ORDER_RECIPIENT`. Firebase-Admin-Zugangsdaten werden nur serverseitig aus den in `.env.example` dokumentierten Variablen gelesen. Firestore-Sicherheitsregeln müssen Client-Lese- und Schreibzugriffe auf beide Collections verweigern; Admin-Zugriffe umgehen diese Regeln.

## Produktwünsche

- `POST /api/product-wishes` nimmt unverbindliche Produktvorschläge an, prüft Eingaben serverseitig und schützt mit Honeypot sowie einfachem Rate-Limit.
- Firebase Admin speichert die Anfrage vor dem E-Mail-Versand in `productWishes_dev/{requestId}` oder `productWishes/{requestId}` entsprechend `BAKERY_PREORDER_DEV`. UUID-basierte Dokument-IDs verhindern doppelte Anfragen bei Wiederholungen; `emailStatus` dokumentiert den Versand.
- Betreiber-E-Mails nutzen dieselben getrennten SMTP- und Empfänger-Variablen wie Vorbestellungen (`SMTP_DEV_*`/`ORDER_RECIPIENT_DEV` beziehungsweise `SMTP_*`/`ORDER_RECIPIENT`). Firebase-Zugriff bleibt ausschließlich serverseitig; Client-Zugriffe auf beide Collections müssen per Firestore-Regeln verweigert werden.

## Bestellungen & Wünsche im Studio

Das Studio enthält das Custom Tool **Bestellungen & Wünsche**. Es liest die bis zu 100 neuesten Dokumente aus `bakeryPreorders[_dev]` und `productWishes[_dev]`; die Collections folgen derselben `BAKERY_PREORDER_DEV`-Umschaltung wie die Formulare. Historische Produktnamen, Einzelpreise und Summen kommen ausschließlich aus dem gespeicherten Bestelldokument. Statuswerte `pending` werden als **Neu** dargestellt; Status- und Notizänderungen schreiben rückwärtskompatible Felder (`status`, `statusUpdatedAt`, `internalNotes`, `updatedAt`) in Firestore.

Die Studio-API verwendet Firebase Admin und akzeptiert ausschließlich Firebase-Auth-ID-Tokens mit aktiv geprüfter Widerrufskontrolle. Zusätzlich muss die UID in `FIREBASE_ADMIN_UIDS` stehen. Das Projekt besitzt aktuell noch keinen Firebase-Client-Login oder Studio-zu-Firebase-Login-Ablauf. Deshalb sind Lesen und Speichern bis zur Einrichtung absichtlich gesperrt; eine Sanity-Studio-Anmeldung allein wird nicht als Firestore-Berechtigung missverstanden. Für Aktivierung Firebase Authentication mit einem passenden privaten Anmeldeanbieter einrichten, den signierten Firebase-ID-Token im Studio an die API übermitteln und nur die vorgesehenen Admin-UIDs kommasepariert in `FIREBASE_ADMIN_UIDS` setzen. Keine Service-Account-Schlüssel im Browser hinterlegen. Firestore-Admin-Zugriffe umgehen Security Rules; direkte Client-Zugriffe auf beide Collections müssen weiterhin verweigert bleiben.
