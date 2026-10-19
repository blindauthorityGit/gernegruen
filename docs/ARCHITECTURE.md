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
- The current produce list is loaded separately by `lib/weekly/produce-data.ts` from the published Sanity `weeklyProduceList` matching the current ISO week in `Europe/Vienna`. The persistent `bakeryCatalog-main` is queried independently in `lib/weekly/data.ts`, so bakery prices remain visible without a weekly overview and do not rotate with produce imports.

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

- Das globale Vorbestellungsmodal und die sichtbare Preisliste verwenden beide das feste Sanity-`bakeryCatalog-main`; die API lädt dieselbe Quelle erneut und vertraut weder Produktnamen noch Preisen aus dem Browser. Änderungen kommen gelegentlich über den Studio-Excel-Import und werden als Entwurf geprüft, bevor sie veröffentlicht werden.
- `POST /api/bakery-preorders` validiert Kontaktdaten, Mengen sowie Abholtage in der Zeitzone `Europe/Berlin`. Sonntage und gesetzliche Feiertage in Hessen werden mit `date-holidays` ausgeschlossen.
- Firestore wird ausschließlich über das Firebase Admin SDK angesprochen. `BAKERY_PREORDER_DEV=true` speichert Dokumente unter `bakeryPreorders_dev/{requestId}`, `false` unter `bakeryPreorders/{requestId}`. Ohne gesetzten Schalter wählen lokale Development-Runs automatisch die Dev-Collection; Produktions-Runs die Live-Collection. Die clientseitig erzeugte UUID verhindert doppelte Dokumente bei Wiederholungen.
- Die Anfrage wird vor dem SMTP-Versand gespeichert. Der Versandstatus (`pending`, `sent` oder `failed`) verbleibt am Dokument, sodass ein E-Mail-Fehler die Anfrage nicht verliert.
- SMTP-Zugangsdaten sind nach Umgebung getrennt: Entwicklung nutzt `SMTP_DEV_*` und `ORDER_RECIPIENT_DEV`, Live nutzt `SMTP_*` und `ORDER_RECIPIENT`. Firebase-Admin-Zugangsdaten werden nur serverseitig aus den in `.env.example` dokumentierten Variablen gelesen. Firestore-Sicherheitsregeln müssen Client-Lese- und Schreibzugriffe auf beide Collections verweigern; Admin-Zugriffe umgehen diese Regeln.

## Produktwünsche

- `POST /api/product-wishes` nimmt unverbindliche Produktvorschläge an, prüft Eingaben serverseitig und schützt mit Honeypot sowie einfachem Rate-Limit.
- Firebase Admin speichert die Anfrage vor dem E-Mail-Versand in `productWishes_dev/{requestId}` oder `productWishes/{requestId}` entsprechend `BAKERY_PREORDER_DEV`. UUID-basierte Dokument-IDs verhindern doppelte Anfragen bei Wiederholungen; `emailStatus` dokumentiert den Versand.
- Betreiber-E-Mails nutzen dieselben getrennten SMTP- und Empfänger-Variablen wie Vorbestellungen (`SMTP_DEV_*`/`ORDER_RECIPIENT_DEV` beziehungsweise `SMTP_*`/`ORDER_RECIPIENT`). Firebase-Zugriff bleibt ausschließlich serverseitig; Client-Zugriffe auf beide Collections müssen per Firestore-Regeln verweigert werden.

## Bestellungen & Wünsche im Studio

Das Studio enthält das Custom Tool **Bestellungen & Wünsche**. Es liest die bis zu 100 neuesten Dokumente aus `bakeryPreorders[_dev]` und `productWishes[_dev]`; die Collections folgen derselben `BAKERY_PREORDER_DEV`-Umschaltung wie die Formulare. Historische Produktnamen, Einzelpreise und Summen kommen ausschließlich aus dem gespeicherten Bestelldokument. Statuswerte `pending` werden als **Neu** dargestellt. Das Dashboard hat nur Lesezugriff und liefert nur die Felder, die Listen und Details benötigen.

Die Studio-API verwendet Firebase Admin und akzeptiert nur verifizierte, nicht widerrufene Firebase-Sitzungscookies. Zusätzlich muss die UID in `FIREBASE_ADMIN_UIDS` stehen. Das Studio nutzt E-Mail/Passwort-Anmeldung über Firebase Authentication; es gibt keine öffentliche Registrierung. Nach der Anmeldung setzt der Server ein `HttpOnly`, `SameSite=Lax` Cookie mit 14 Tagen Laufzeit. Für Aktivierung in der Firebase Console beim Projekt aus `FIREBASE_PROJECT_ID` Authentication starten, den Anbieter **E-Mail/Passwort** aktivieren und nur gewünschte Admin-Konten anlegen. Den Firebase-Web-API-Schlüssel unter `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env.local` eintragen und Next.js neu starten. Danach den jeweiligen Benutzer in Authentication → Users öffnen, seine UID kopieren und als kommaseparierte `FIREBASE_ADMIN_UIDS` setzen. Im Studio anmelden und über die Fehlermeldung prüfen, ob UID und Admin-Freigabe stimmen. Keine Service-Account-Schlüssel im Browser hinterlegen. Firebase-Admin-Zugriffe umgehen Security Rules; direkte Client-Zugriffe auf beide Collections müssen weiterhin verweigert bleiben. Der Leser kann Status und interne Notizen nicht ändern. Sitzungscookie widerrufen/abmelden, widerrufene Tokens oder die UID aus `FIREBASE_ADMIN_UIDS` entfernen, um Zugriff zu entziehen.

## Sanity Presentation und Live-Vorschau

Das Sanity Presentation Tool liegt als Studio-Tool im Navigationsbereich. Es öffnet die Next.js-Website in einem eingebetteten Preview, schaltet Draft Mode über `GET /api/draft-mode/enable` ein und zeigt unveröffentlichte Sanity-Änderungen. Textfelder, die aus `sanityFetch` mit Source Maps geladen werden, erhalten Visual-Editing-Overlays und lassen sich per Klick im passenden Dokument öffnen. `SanityLive` aktualisiert die Vorschau nach Änderungen.

Die Seitenzuordnungen liegen in `sanity/presentation/resolve.ts`: Startseite, Sortiment, Über uns, Kontakt und Wochenübersicht. Die zugehörigen Website-Abfragen verwenden `sanityFetch` aus `sanity/lib/live.ts`. Abfragen, deren Strings für URLs, Datenlogik oder strukturierte Daten genutzt werden, schalten Stega explizit aus.

Für Draft- und Live-Vorschau muss `SANITY_API_READ_TOKEN` ein Sanity-Viewer-Token mit Leserechten sein. Der Browser-Token wird ausschließlich während der Vorschau von `defineLive` verwendet. Ein vorhandenes `SANITY_API_TOKEN` bleibt serverseitiger Fallback für Draft-Abfragen. CORS muss die Website-Origin mit Credentials erlauben; für `http://localhost:3000` und `https://gernegruen.de` ist das im Sanity-Projekt eingerichtet. `NEXT_PUBLIC_SANITY_PREVIEW_URL` kann eine abweichende Frontend-URL vorgeben; lokal ist der Standard `http://localhost:3000`, produktiv greift `NEXT_PUBLIC_SITE_URL`.
