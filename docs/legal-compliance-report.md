# Datenschutz, Pflichtseiten und Barrierefreiheit – Auditbericht

**Geprüft am:** 13. Oktober 2026  
**Prüfumfang:** Quellcode und Projektdokumentation des Next.js-App-Routers, Sanity-Konfiguration und Queries, Formular-API-Routen, Firebase-Admin-/Firestore-Anbindung, Nodemailer, Kartenkomponente, globale Styles und Layouts. Dies ist ein technisches Audit und keine Rechtsberatung, kein vollständiger Netzwerkmitschnitt und keine unabhängige WCAG-Konformitätsprüfung.

## Nachtrag 2. November 2026 – Datenschutzabgleich

- Der Betreiber bestätigt, dass regelmäßig weniger als 20 Personen mit der automatisierten Verarbeitung personenbezogener Daten beschäftigt sind. Für die hier geprüfte Website ist kein offensichtlicher zusätzlicher Benennungstatbestand erkennbar. Andere unternehmensweite Verarbeitungsvorgänge und die Tatbestände aus Art. 37 DSGVO bleiben einzubeziehen, falls einschlägig.
- Der Betreiber will Firestore-Anfragen und E-Mail-Kopien manuell nach den festgelegten Fristen löschen. Für abgeschlossene Vorbestellungen gilt die Frist von 90 Tagen nach Abschluss; eine separate Archivbestätigung ist weder Teil der Praxis noch künftig Voraussetzung im Betreiberbereich. Gesetzlich aufbewahrungspflichtige einzelne Unterlagen sind davon unabhängig zu beurteilen.
- Die Anbieterprüfung wurde aktualisiert: Google/Firebase-Transferangaben und Terms, Vercel Pro mit Funktionsregion `fra1`, ein Tag Runtime-Logs und keine Projekt-Log-Drains, sowie Sanity-Dataset `production` (öffentlich) sind abgeglichen. Sanity nennt Belgien als primären Speicherort und verwendet eine weltweit verteilte CDN-Auslieferung. Der Betreiber bestätigt, dass STRATO für Domain und E-Mail geeignet ist.
- Ein produktiver Browser-/Netzwerkcheck konnte nicht abgeschlossen werden: `https://gernegruen.de/datenschutz` war beim TLS-Verbindungsaufbau nicht erreichbar. Die nachfolgenden Code-Angaben ersetzen keinen Live-Mitschnitt. Eine echte Formularbestellung wurde nicht abgesendet.
- Der Cookie-Hinweis verwendet keinen Browser-Speicher. Im öffentlichen Website-Code wurden keine Analyse- oder Marketingdienste gefunden; externe Karten öffnen sich erst nach Klick auf einen OpenStreetMap-Link.
- Der Betreiber bestätigt, dass eine über das Formular gesendete Vorbestellung unverbindlich bleibt und nicht zum Kauf verpflichtet. Ein Vertragsschluss im Geschäft ist davon getrennt.

## Historischer Nachtrag 29. Oktober 2026 – damaliger Stand zu Aufbewahrung und Löschung

Der nachfolgende Abschnitt dokumentiert den damaligen Prüfstand. Seine Aussagen zur geplanten TTL-Aktivierung, zu einer separaten Archivierung und zu offenen Dienstleisterprüfungen wurden durch den Nachtrag vom 2. November 2026 überholt. Für den aktuellen Stand gelten der Nachtrag vom 2. November und `docs/PRIVACY_RETENTION.md`.

Die DSGVO enthält keine pauschalen Löschfristen für Produktwünsche oder
Vorbestellungsanfragen. Die Website legt daher zweckbezogene Betriebsfristen
fest: Produktwünsche 180 Tage nach letzter inhaltlicher Bearbeitung, höchstens
12 Monate ab Eingang; unbestätigte oder stornierte Vorbestellungen 90 Tage nach
dem Abholtermin; abgeschlossene und separat archivierte Vorgänge 90 Tage nach
Abschluss; gewöhnliche Kontaktanfragen sechs Monate nach Bearbeitungsende.
Gesetzlich aufzubewahrende Geschäftsbriefe und Buchungs-/Rechnungsbelege werden
getrennt und nur im erforderlichen Umfang aufbewahrt (in der Regel sechs bzw.
acht Jahre ab Ende des Kalenderjahres).

Die produktive Firestore-Datenbank liegt in `europe-west3`. Bei der Prüfung am
29. Oktober 2026 lagen dort acht offene Vorbestellungen; drei Ablaufzeitpunkte
fehlten. Diese drei Zeitpunkte wurden nach Status und Abholtermin ergänzt; alle
elf produktiven und Entwicklungs-Vorbestellungen haben nun ein Ablaufdatum,
keines davon ist bereits fällig. Es wurden keine Anfrage-Dokumente gelöscht.
Die vier Firestore-TTL-Richtlinien sind weiterhin nicht aktiviert: Der
konfigurierte Dienstaccount darf `datastore.indexes.update` nicht ausführen.
Das Skript `npm run firestore:enable-retention -- --apply` erstellt zunächst
eine Vorschau, ergänzt klassifizierbare fehlende Ablaufzeitpunkte und aktiviert
danach die Richtlinien. Es stoppt vor Aktivierung, wenn Einträge bereits fällig
sind oder sich nicht sicher klassifizieren lassen. Nach Vergabe der
erforderlichen IAM-Berechtigung muss es erneut ausgeführt und der Status geprüft
werden.

Die Richtlinien aktivieren die automatische Löschung erst nach erfolgreicher
Konfiguration; bis dahin werden abgelaufene Anfragen nur im Dashboard
ausgeblendet. E-Mail-Postfächer und Anbieter-Backups werden von der Website nicht
gelöscht und brauchen weiterhin einen manuellen Lösch- und Prüfprozess.

Der Betreiber hat außerdem bestätigt, dass Vercel Pro verwendet wird; die
Runtime-Logs werden laut der bereitgestellten Tarifübersicht einen Tag
aufbewahrt. STRATO hostet die Domain und den Mailserver. Die Website selbst und
ihre serverseitigen Funktionen laufen bei Vercel; Firebase/Firestore und Sanity
bleiben separate Anbieter. Der Betreiber gibt zwei Personen und keinen
Datenschutzbeauftragten an. Die Schwelle aus § 38 BDSG wird damit nicht
erreicht; nach der hier bekannten Verarbeitung ist auch kein Tatbestand aus
Art. 37 DSGVO ersichtlich. Bei einer Änderung der Beschäftigtenzahl oder der
Verarbeitungsart ist das erneut zu beurteilen.

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
| Hosting und Auslieferung | Vercel Pro; im Konto Funktionsregion Frankfurt (`fra1`), Runtime-Log-Aufbewahrung ein Tag und keine Projekt-Log-Drains bestätigt | Vercel-DPA gilt für Pro. Die Vertragsbedingungen sehen für erforderliche EWR-Transfers Standardvertragsklauseln vor; Vercel kann Daten auch in den USA und weiteren Ländern verarbeiten. |
| Next.js / App Router | öffentliche Seiten und Server Components; keine eigene Analytics- oder Tracking-Integration gefunden | Im öffentlichen Frontend merkt `sessionStorage` nur das Schließen des Cookie-Hinweises bis zum Ende des Tabs. Keine Analyse- oder Marketing-Cookies im Anwendungscode. Produktiv-Netzwerkverkehr und plattformseitige Speichermechanismen wurden nicht per Browser-Mitschnitt verifiziert. |
| Sanity | serverseitiger Read-Client; öffentlich lesbares `production`-Dataset; Studio unter `/studio` | Sanity nennt Belgien als primären Content-Lake-Speicherort; API- und Medienauslieferung kann über globale CDNs erfolgen. Sanitys DPA ist in die Bedingungen einbezogen und sieht SCCs für relevante Transfers vor. |
| Produktwunsch | `POST /api/product-wishes`; serverseitige Eingabeprüfung, Honeypot und IP-basiertes In-Memory-Rate-Limit | Produkt, Beschreibung, optionaler Name und E-Mail; Firestore-Speicherung vor SMTP-Benachrichtigung. Keine persistente IP-Speicherung im Anwendungscode gefunden. |
| Backwaren-Vorbestellung | `POST /api/bakery-preorders`; serverseitige Produkt-, Mengen- und Datumsvalidierung; IP-basiertes In-Memory-Rate-Limit | Name, E-Mail, Telefon, Abholtag, Waren/Mengen und optionale Nachricht. Die Formularübermittlung ist laut Betreiber unverbindlich und verpflichtet nicht zum Kauf. |
| Firebase / Firestore | Firebase Admin SDK ausschließlich serverseitig; Dev-/Live-Collections für beide Formulare | Formularangaben, Zeitstempel und Mailstatus werden geschrieben. Ablaufzeiten werden berechnet, aber TTL ist nicht aktiviert; der Betreiber löscht manuell. |
| Nodemailer / SMTP | serverseitiger Mailversand über STRATO mit Umgebungsvariablen für Host, Konto, Absender und Empfänger | Der konfigurierte SMTP-Host ist `smtp.strato.de`. Kontakt- und Vorbestellungsinhalte gehen an diesen Anbieter und an das Betreiberpostfach. |
| Karten | Leaflet lud bisher OpenStreetMap-Kacheln direkt beim Seitenaufruf | Diese automatische Einbindung ist entfernt. Die Kontaktseite enthält nun eine textbasierte Adresse und einen externen OpenStreetMap-Link; erst der Klick ruft den Kartendienst auf und übermittelt dann insbesondere Verbindungsdaten. |
| Fonts | Nunito liegt als `public/fonts/Nunito-Variable.ttf` vor und wird mit `next/font/local` geladen | Kein Abruf von Google Fonts im geprüften Code gefunden. |
| Weitere Drittanbieter | Instagram- und Sanity-/Hersteller-Links sind normale Links; keine eingebetteten Social-Widgets, Drittanbieter-Skripte, Captchas, Analytics- oder Werbepixel gefunden | Externe Zielseiten werden grundsätzlich erst nach einem Klick geöffnet. |

### Cookies und vergleichbare Speichertechnologien

Im öffentlichen Website-Code wird `sessionStorage` ausschließlich zum Merken des geschlossenen Cookie-Hinweises bis zum Ende der Tab-Sitzung verwendet. `document.cookie`, `localStorage` und IndexedDB werden dort nicht verwendet. Vorbestellungs-/Produktwunsch-UI-Zustand bleibt im laufenden React-Speicher; die Anfrage-ID wird mit `crypto.randomUUID()` erzeugt und nur für die aktuelle Übermittlung gehalten. Der Anwendungscode bietet derzeit keine Analyse-, Marketing- oder sonstige optionale Speichertechnologie an. Der tatsächliche Live-Netzwerkverkehr und plattformseitige Speichermechanismen wurden noch nicht im Browser geprüft.

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
- Datenschutzbeauftragte/r: weniger als 20 Personen regelmäßig mit automatisierter Verarbeitung laut Betreiber; weitere unternehmensweite Tatbestände aus Art. 37 DSGVO prüfen, falls andere relevante Verarbeitungsvorgänge bestehen.
- Vercel-Pro-Tarif, Funktionsregion Frankfurt, Runtime-Log-Aufbewahrung von einem Tag und keine Projekt-Log-Drains am 2.11.2026 bestätigt.
- Sanity-Standortangabe laut Anbieter, öffentliches Produktions-Dataset und CDN-Auslieferung abgeglichen; DPA und SCC-Regelungen veröffentlicht.
- Google/Firebase-Angaben zu Firestore-Region, Firebase-Authentication-USA, DPA/Transfermechanismen und Terms abgeglichen; Firestore-Sicherheitsregeln und direkter Zugriffskreis bleiben separat zu prüfen.
- Betreiber bestätigt, dass STRATO für Domain und E-Mail geeignet ist; konkrete Backup-Aufbewahrungsfristen sind hier nicht dokumentiert.
- Die Online-Vorbestellung bleibt laut Betreiber unverbindlich und verpflichtet nicht zum Kauf; die Website-Texte und Eingangs-E-Mail sind daran angepasst. Der Vertragsschluss eines späteren Kaufs im Geschäft ist davon getrennt.
- BFSG-Anwendbarkeit, Unternehmenskennzahlen und tatsächlicher Vertragsfluss der Vorbestellung.
- Tatsächlichen Live-Netzwerkverkehr, Cookie-/Headerverhalten und eingebundene Funktionen außerhalb des Repositorys kontrollieren.

## 6. Priorisierte Freigabe-Checkliste

### Vor Veröffentlichung – zwingend

1. Alle Platzhalter in Impressum und Datenschutzhinweisen anhand verifizierter Betreiberangaben ersetzen; nicht zutreffende optionale Angaben entfernen.
2. Zuständige Datenschutzaufsicht und ladungsfähige Anschrift bestätigen.
3. Anbieterangaben für Vercel, Sanity, Firebase/Google und STRATO sind am 2.11.2026 abgeglichen; bei Änderungen sind Konto- und Vertragsangaben erneut zu prüfen.
4. Manuelle Löschung in Firestore und E-Mail-Postfach nach den festgelegten Fristen durchführen; keine automatische Firestore-TTL behaupten.
5. Sicherstellen, dass Website, Eingangs-E-Mail und tatsächliche Praxis weiterhin übereinstimmen: Online-Vorbestellungen sind unverbindlich; Produktwunsch-Kontaktdaten werden nur zur Sortimentsplanung und Beantwortung des Wunsches genutzt.
6. BFSG-Anwendbarkeit einschließlich Kleinstunternehmensstatus beurteilen. Bei Anwendbarkeit erforderliche Verbraucherinformationen nach Anlage 3 erstellen und zugänglich machen.
7. Produktiv-Netzwerkverkehr und tatsächliche Cookies/Speicherzugriffe im Browser kontrollieren; am 2.11.2026 war die öffentliche Website für diesen Check nicht erreichbar. Bei späteren optionalen Technologien vor deren Aktivierung ein Consent-System einsetzen.

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
