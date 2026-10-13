# Datenschutz, Pflichtseiten und Barrierefreiheit – Auditbericht

**Geprüft am:** 13. Oktober 2026  
**Prüfumfang:** Quellcode und Projektdokumentation des Next.js-App-Routers, Sanity-Konfiguration und Queries, Formular-API-Routen, Firebase-Admin-/Firestore-Anbindung, Nodemailer, Kartenkomponente, globale Styles und Layouts. Dies ist ein technisches Audit und keine Rechtsberatung, kein vollständiger Netzwerkmitschnitt und keine unabhängige WCAG-Konformitätsprüfung.

## 1. Erstellte und angepasste Seiten

- `/impressum`: Anbieterkennzeichnung nach § 5 DDG als Entwurf mit ausdrücklich markierten fehlenden Betreiberangaben.
- `/datenschutz`: auf den gefundenen Verarbeitungen beruhender Entwurf mit offenen Dienstleister-, Vertrags-, Speicher- und Transferangaben.
- `/barrierefreiheit`: freiwillige, vorläufige Statusinformation ohne unbelegte Konformitätsbehauptung. Sie ist ausdrücklich keine abschließend ausgefüllte Erklärung nach BFSG.
- Footerlinks zu den drei Seiten sind bereits global und damit von öffentlichen Seiten erreichbar; die Bezeichnung lautet „Barrierefreiheit“.
- Alle drei Seiten haben Next.js-Metadaten und stehen in der Sitemap.
- Datenschutzverweise wurden in Produktwunsch- und Vorbestellungsdialog ergänzt.

## 2. Technische Datenschutz-Bestandsaufnahme

| Bereich | Im Code gefunden | Personenbezogene Daten / Hinweise |
| --- | --- | --- |
| Hosting und Auslieferung | Projekt dokumentiert Vercel als Hosting-/Deployment-Plattform | Verbindungsdaten können für Auslieferung und Sicherheit verarbeitet werden. Konkrete Logfelder, Standorte und Aufbewahrungsdauer der aktiven Konfiguration wurden im Repository nicht belegt. |
| Next.js / App Router | öffentliche Seiten und Server Components; keine eigene Analytics- oder Tracking-Integration gefunden | Keine vom Anwendungscode gesetzten Cookies oder browserseitigen Speicherzugriffe gefunden. Produktiv-Netzwerkverkehr und Hosting-Cookies wurden nicht per Browser-Mitschnitt verifiziert. |
| Sanity | serverseitiger Read-Client für redaktionelle Inhalte, Geschäftsdaten und Produkt-/Bildinformationen; Sanity Studio unter `/studio` | Öffentliche Seiten laden redaktionelle Inhalte serverseitig. Sanity-Mediendateien können über die Next.js-Bildpipeline vom Sanity-CDN bezogen werden. Konkrete Region, AVV und Transferbedingungen sind zu prüfen. |
| Produktwunsch | `POST /api/product-wishes`; serverseitige Eingabeprüfung, Honeypot und IP-basiertes In-Memory-Rate-Limit | Produkt, Beschreibung, optionaler Name und E-Mail; Firestore-Speicherung vor SMTP-Benachrichtigung. Keine persistente IP-Speicherung im Anwendungscode gefunden. |
| Backwaren-Vorbestellung | `POST /api/bakery-preorders`; serverseitige Produkt-, Mengen- und Datumsvalidierung; IP-basiertes In-Memory-Rate-Limit | Name, E-Mail, Telefon, Abholtag, Waren/Mengen und optionale Nachricht. Die Website bezeichnet die Übermittlung als unverbindliche Anfrage, die erst nach Bestätigung verbindlich wird. |
| Firebase / Firestore | Firebase Admin SDK ausschließlich serverseitig; Dev-/Live-Collections für beide Formulare | Formularangaben, Zeitstempel und Mailstatus werden geschrieben. Im Code ist keine automatische Löschung oder Ablaufzeit konfiguriert. Betreiber muss Löschfristen und Firestore-Regeln bestätigen. |
| Nodemailer / SMTP | serverseitiger Mailversand mit Umgebungsvariablen für Host, Konto, Absender und Empfänger | Mailserver und Rechts-/Vertragsbeziehung sind nicht bestimmbar, da die `.env.example` keine echten Werte enthält. Kontakt- und Vorbestellungsinhalte gehen an diesen Anbieter und an das Betreiberpostfach. |
| Karten | Leaflet lud bisher OpenStreetMap-Kacheln direkt beim Seitenaufruf | Diese automatische Einbindung ist entfernt. Die Kontaktseite enthält nun eine textbasierte Adresse und einen externen OpenStreetMap-Link; erst der Klick ruft den Kartendienst auf und übermittelt dann insbesondere Verbindungsdaten. |
| Fonts | Nunito liegt als `public/fonts/Nunito-Variable.ttf` vor und wird mit `next/font/local` geladen | Kein Abruf von Google Fonts im geprüften Code gefunden. |
| Weitere Drittanbieter | Instagram- und Sanity-/Hersteller-Links sind normale Links; keine eingebetteten Social-Widgets, Drittanbieter-Skripte, Captchas, Analytics- oder Werbepixel gefunden | Externe Zielseiten werden grundsätzlich erst nach einem Klick geöffnet. |

### Cookies und vergleichbare Speichertechnologien

Eine repositoryweite Suche fand keine Verwendung von `document.cookie`, `localStorage`, `sessionStorage`, IndexedDB oder vergleichbarer eigener Browserpersistenz. Vorbestellungs-/Produktwunsch-UI-Zustand bleibt im laufenden React-Speicher; die Anfrage-ID wird mit `crypto.randomUUID()` erzeugt und für die aktuelle Übermittlung gehalten, nicht in Browserpersistenz geschrieben. Der Anwendungscode bietet deshalb derzeit keine einwilligungspflichtige optionale Speichertechnologie an. Es gibt folglich bewusst kein künstliches Cookie-Banner und kein Consent-Management. Das ist vor dem Livegang gegen den tatsächlichen Netzwerkverkehr und plattformseitige Speichermechanismen zu verifizieren.

**Einwilligungspflichtige Dienste im geprüften Anwendungscode:** keine optionalen Analytics-, Marketing- oder eingebetteten Kartendienste gefunden. Das aktive Nachladen der OpenStreetMap-Karte wurde durch einen bewussten externen Link ersetzt. Keine neue Consent-Bibliothek erforderlich.

### Bereits vorhandene technische Schutzmaßnahmen

- Firebase Admin und SMTP laufen ausschließlich serverseitig; Konfigurationswerte sind als Serverumgebungsvariablen vorgesehen und nicht als öffentliche Client-Variablen benannt.
- Formularwerte werden serverseitig auf Typen, Formate und Längen geprüft. Produktwünsche und Vorbestellungen nutzen außerdem ein Honeypot-Feld, UUID-basierte Wiederholungsbegrenzung und ein pro Serverprozess geführtes IP-Rate-Limit (mehr als fünf Anfragen in 15 Minuten werden blockiert).
- Anfragen werden vor dem E-Mail-Versand in einer Servertransaktion gespeichert; der Mailstatus dokumentiert Versand oder Fehler. Dadurch kann ein Mailfehler die Anfrage nicht stillschweigend verlieren, zugleich müssen E-Mail-Fehlerdiagnosen und Speicherfristen begrenzt werden.
- Firebase Admin-Zugang umgeht Firestore-Regeln. Die Projektdoku verlangt, dass Client-Lese-/Schreibzugriffe auf Formular-Collections verweigert werden; die tatsächlich deployten Firestore-Regeln wurden in diesem Audit nicht eingesehen und müssen überprüft werden.
- Im Repository wurde keine eigene Content-Security-Policy oder weitere maßgeschneiderte HTTP-Sicherheitsheaderkonfiguration festgestellt. Aktive Vercel-/Deployment-Einstellungen sind zu prüfen.

## 3. Barrierefreiheits-Audit (WCAG 2.2 AA als Qualitätsziel)

Die Prüfung war eine Quellcode- und Stylesheet-Sichtung, keine vollständige manuelle Prüfung in Browsern mit Tastatur, Screenreader und Vergrößerung. Aussagen über vollständige Konformität wären daher unbelegt.

### Gefundene Probleme und Maßnahmen

| Schweregrad | Befund | Maßnahme / Empfehlung |
| --- | --- | --- |
| Hoch | Limettengrün `#97BF4B` auf Creme `#FBF5EB` wird als H1-Akzent und handschriftliche Hero-Zeile eingesetzt. Das Verhältnis ist 1,96:1; für großen Text werden 3:1 benötigt (WCAG 1.4.3). | Nicht stillschweigend gegen das Figma-Design ändern. Farbvariante mit Designverantwortlichen abstimmen und Kontrast messen; bis dahin offene Barriere. |
| Mittel | Weiß auf Orange `#F1820C` erreicht nur 2,65:1; auch Weiß auf Lime-Flächen hat zu wenig Kontrast für Badge-/Hero-Text. | Dunkle Schrift auf den orangefarbenen CTA-/Badgeflächen, dem Parkhinweis und dem Wochen-Badge gesetzt; in Kartenbadges orange Variante auf dunkle Schrift geändert. Dunkle Schrift auf Lime hat 6,38:1, Orange mit dunkler Schrift 5,13:1. Vollständige Farbmatrix noch messen. |
| Mittel | Fokusindikatoren verwendeten an mehreren Komponenten das helle Lime auf hellem Hintergrund. | Globale sowie gezielt definierte Fokusrahmen auf tiefes Grün umgestellt; Kartenlink besitzt ebenfalls einen sichtbaren Fokusrahmen. Im Browser noch praktisch prüfen. |
| Mittel | Die automatisch eingebettete Karte lud Drittanbieterressourcen, war für Screenreader nur als Region benannt und erforderte eine dynamische Kartenkomponente. | Auf Server-renderte Adresse und explizit benannten OpenStreetMap-Link umgestellt. Keine Kartenkacheln beim Seitenaufruf mehr. |
| Niedrig | In Formular-Dialogen war vor dem Absenden kein direkter Link zur Information über die Verarbeitung sichtbar. | Datenschutzlinks im Produktwunsch- und Vorbestellungsdialog ergänzt. |

### Noch manuell zu prüfen

- Kontrast aller Zustände und Seiteninhalte, insbesondere dynamischer Sanity-Inhalte, Produktdaten, Badgefarben und Fokus auf farbigen Hintergründen.
- Tastaturnavigation durch Desktop-/Mobile-Navigation, Galerien, Dialoge, Kalender und alle Dialogzustände; sichtbarer und sinnvoll zurückkehrender Fokus.
- Screenreader-Ausgabe, Überschriftenhierarchie, Live-Regionen und Formularfehler.
- Reflow bei 320 CSS-Pixeln und Zoom bis 200 %, Überlagerungen und horizontales Scrollen.
- Alternativtexte im veröffentlichten Sanity-Datenbestand, Linkzwecke, Touch-Zielgrößen und reale Mobilgeräte.
- Karten-Link, externe Links und tatsächliches Verhalten bei eingeschränkter Bewegung.

## 4. BFSG-Einschätzung

Die Website beschreibt in erster Linie ein stationäres Lebensmittelgeschäft. Eine reine Informationswebsite ohne elektronischen Bestell-/Vertragsabschluss ist nicht automatisch eine vom BFSG erfasste Dienstleistung im elektronischen Geschäftsverkehr. Es gibt allerdings eine Online-Anfrage für Backwaren, die im Hinblick auf einen möglichen Verbrauchervertrag erfolgt. Ob der konkrete Ablauf trotz nachgelagerter Bestätigung unter die gesetzliche Definition fällt, muss anhand der tatsächlichen Bestell- und Vertragspraxis bewertet werden.

Eine Ausnahme kann für Kleinstunternehmen gelten, die Dienstleistungen erbringen und weniger als zehn Personen beschäftigen und die gesetzlichen Umsatz-/Bilanzgrenzen einhalten. Beschäftigtenzahl, Umsatz und Bilanzsumme sind unbekannt. Daher ist die BFSG-Pflicht derzeit **offen** und kann nicht abschließend verneint werden. Sollte das BFSG gelten, müssen zusätzlich die Verbraucherinformationen nach Anlage 3 BFSG erstellt und barrierefrei zugänglich sein; die hier veröffentlichte freiwillige Statusinformation genügt dafür nicht automatisch.

## 5. Offene Betreiber- und Dienstleisterangaben

- Vollständiger rechtlicher Name/Firma, Rechtsform, vertretungsberechtigte Person und ladungsfähige Anbieteranschrift.
- Bestätigung, ob Ladenanschrift und Sitz/Niederlassungsanschrift des rechtlichen Betreibers identisch sind.
- Registergericht/-art/-nummer, USt-IdNr. oder Wirtschafts-IdNr., Aufsichtsbehörde und Berufsangaben jeweils nur, sofern tatsächlich einschlägig/erteilt.
- Datenschutzbeauftragte/r: prüfen, ob bestellt werden muss.
- Vercel-Vertrag, tatsächliche Hosting-/Logeinstellungen, Datenregionen und konkrete Log-Löschfristen.
- Sanity-AVV, Unterauftragsverarbeiter, Regionen und Drittlandgarantien.
- Firebase/Google-Cloud-Projektregion, AVV, Unterauftragsverarbeiter, Firestore-Regeln und Zugriffskreis.
- Aktiver SMTP-Anbieter, AVV, Speicher-/Backupfristen und mögliche Drittlandübermittlungen.
- Verbindliche Löschfristen und Löschprozess für Firestore-Anfragen, Mailpostfächer und Backups.
- tatsächliche rechtliche Einordnung der Vorbestellungsanfrage und Rechtsgrundlage/Verwendung optionaler Kontaktdaten beim Produktwunsch.
- BFSG-Anwendbarkeit, Unternehmenskennzahlen und tatsächlicher Vertragsfluss der Vorbestellung.
- Tatsächlichen Live-Netzwerkverkehr, Cookie-/Headerverhalten und eingebundene Funktionen außerhalb des Repositorys kontrollieren.

## 6. Priorisierte Freigabe-Checkliste

### Vor Veröffentlichung – zwingend

1. Alle Platzhalter in Impressum und Datenschutzhinweisen anhand verifizierter Betreiberangaben ersetzen; nicht zutreffende optionale Angaben entfernen.
2. Zuständige Datenschutzaufsicht und ladungsfähige Anschrift bestätigen.
3. AV-Verträge, Regionen, Übermittlungsmechanismen und Aufbewahrungsfristen für Vercel, Sanity, Firebase/Google und den SMTP-Anbieter prüfen und Texte vervollständigen.
4. Löschfristen für Firestore, E-Mail-Postfächer und Backups festlegen und durchsetzen.
5. Tatsächliche Formular-/Bestellpraxis datenschutzrechtlich prüfen; insbesondere ob Vorbestellungen einen Online-Vertragsabschluss anbahnen und wie freiwillige Angaben genutzt werden.
6. BFSG-Anwendbarkeit einschließlich Kleinstunternehmensstatus beurteilen. Bei Anwendbarkeit erforderliche Verbraucherinformationen nach Anlage 3 erstellen und zugänglich machen.
7. Produktiv-Netzwerkverkehr und tatsächliche Cookies/Speicherzugriffe im Browser kontrollieren; bei späteren optionalen Technologien vor deren Aktivierung ein Consent-System einsetzen.

### Vor Freigabe – Barrierefreiheit

1. Lime-auf-Creme-Titel-/Hero-Kontrast mit Designverantwortlichen lösen.
2. Kontrastmatrix messen und ausstehende Farbkombinationen gegebenenfalls korrigieren.
3. Tastatur-, Screenreader-, 200-%-Zoom-/Reflow- und Mobilprüfung der öffentlichen Seiten und Dialoge durchführen.
4. Sanity-Alttexte, Überschriften und dynamische Linktexte redaktionell kontrollieren.
5. Datum und Umfang einer späteren tatsächlichen Prüfung dokumentieren; niemals eine Konformität behaupten, die nicht geprüft wurde.

## 7. Rechtsquellen

- [§ 5 DDG – Allgemeine Informationspflichten](https://www.gesetze-im-internet.de/ddg/__5.html)
- [§ 25 TDDDG – Speicherung und Zugriff auf Endeinrichtungen](https://www.gesetze-im-internet.de/ttdsg/__25.html)
- [§ 1 BFSG – Anwendungsbereich](https://www.gesetze-im-internet.de/bfsg/__1.html)
- [§ 2 BFSG – Begriffsbestimmungen, darunter Kleinstunternehmen und elektronischer Geschäftsverkehr](https://www.gesetze-im-internet.de/bfsg/__2.html)
- [§ 3 Absatz 3 BFSG – Ausnahme für Kleinstunternehmen, die Dienstleistungen erbringen](https://www.gesetze-im-internet.de/bfsg/__3.html)
- [§ 14 BFSG – Pflichten des Dienstleistungserbringers](https://www.gesetze-im-internet.de/bfsg/__14.html)
- [Anlage 3 BFSG – Informationen über Dienstleistungen](https://www.gesetze-im-internet.de/bfsg/anlage_3.html)
- [BFSGV, Stand 10. Juli 2026](https://www.gesetze-im-internet.de/bfsgv/BFSGV.pdf)
- [Hessischer Beauftragter für Datenschutz und Informationsfreiheit](https://datenschutz.hessen.de/)
- [Datenschutz-Grundverordnung (EU) 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/)
