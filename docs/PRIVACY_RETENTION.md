# Datenschutz und Löschkonzept

**Stand:** 2. November 2026
**Status:** Firestore-TTL ist nicht aktiviert. Anfragen in Firestore und im GerneGrün-Postfach werden manuell nach den festgelegten Fristen gelöscht. Anbieterangaben zu Google, Vercel, Sanity und STRATO wurden am 2.11.2026 mit dem Betreiber abgeglichen. Die produktive Website konnte an diesem Tag wegen eines fehlgeschlagenen TLS-Verbindungsaufbaus nicht im Browser geprüft werden.

Dieses Dokument beschreibt die im Projekt umgesetzten Fristen und die notwendigen Betreiberarbeiten. Es ist eine technische Arbeitsanweisung, keine Rechtsberatung. Historische Datensätze dürfen nicht allein aufgrund dieses Dokuments pauschal geändert oder gelöscht werden.

## Fristen

| Daten | Frist / Regel | Technische Umsetzung |
|---|---|---|
| Allgemeine E-Mail-/Telefonanfragen | Spätestens 6 Monate nach Abschluss; gesetzliche Pflichten oder konkrete Ansprüche können im Einzelfall entgegenstehen | Manuelle Prüfung und Löschung aus dem Postfach |
| Produktwünsche | 180 Tage nach letzter inhaltlicher Bearbeitung, maximal 12 Monate nach Eingang | `expiresAt` wird serverseitig berechnet; Betreiber löscht die Anfrage nach Erreichen des Ablaufdatums manuell |
| Unbestätigte Backwaren-Vorbestellungen | 90 Tage nach Abholtermin | `expiresAt` bei Eingang; Statusänderung „Storniert“ erhält dieselbe Frist; manuelle Löschung nach Ablauf |
| Bestätigte / abgeschlossene Backwaren-Vorbestellungen | 90 Tage nach Abschluss der Abholung; einzelne gesetzlich aufbewahrungspflichtige Unterlagen ausgenommen | Bei Abschluss wird `expiresAt` auf 90 Tage danach gesetzt; Betreiber löscht den operativen Firestore-Datensatz und die E-Mail manuell nach Ablauf |
| Gesetzlich aufbewahrungspflichtige Unterlagen | Nur soweit eine konkrete gesetzliche Pflicht für das jeweilige Dokument besteht; Frist richtet sich nach Dokumentart und Gesetz | Derzeit ist kein separates Archiv für diese Formulare vorgesehen. Falls ein konkretes Dokument gesetzlich aufbewahrt werden muss, ist dies für diesen Einzelfall gesondert zu beurteilen; der operative Firestore-Datensatz wird dadurch nicht pauschal zum Langzeitarchiv |
| Eigene Sicherheits-/Fehlerlogs | Höchstens 14 Tage, außer konkreter Vorfall erfordert befristete längere Aufbewahrung | Anwendung gibt nur generische Meldungen aus, ohne Anfrageinhalte oder Fehlerobjekte; Vercel-Logs sind Plattformlogs und kontoabhängig |
| Betreiber-Sitzung `gg_studio_session` | Höchstens 14 Tage | HttpOnly, Secure in Produktion, auf `/api/studio` begrenzt |
| Öffentliches Cookie `gg_cookie_notice` | Entfernt | Schließen des Informationshinweises wird nur im aktuellen Seitenzustand gehalten; keine Einwilligung wird eingeholt |

## Firestore: Status, Audit und manuelle Löschung

Die Firestore-Datenbank ist eine native Datenbank in `europe-west3` (Frankfurt). Der aktuelle lesende Audit vom 2.11.2026 ergab:

- `bakeryPreorders`: 8 Dokumente; alle mit `expiresAt`
- `bakeryPreorders_dev`: 3 Dokumente; alle mit `expiresAt`
- `productWishes` und `productWishes_dev`: keine Dokumente
- Alle elf Ablaufdaten lagen beim Audit in der Zukunft (11.–26.1.2027); zwei produktive Vorbestellungen enthalten noch ein altes Feld `emailError`.
- Keine Dokumente wurden durch den Audit geändert oder gelöscht. Alle vier TTL-Richtlinien sind `not-enabled`.

Entscheidung vom 2.11.2026: Es wird vorerst keine Firestore-TTL aktiviert, weil dafür die Abrechnung eingeschaltet werden müsste. Die bereits gespeicherten `expiresAt`-Werte bleiben die maßgeblichen Fristen; sie lösen ohne TTL jedoch keine automatische Löschung aus. Das Dashboard kann abgelaufene Anfragen ausblenden, löscht die Firestore-Dokumente aber nicht. Der Betreiber löscht abgelaufene Dokumente manuell aus Firestore. Das Feld `emailError` wird zusammen mit dem jeweiligen Dokument entfernt.

Zur Kontrolle der fälligen Dokumente kann der lesende Audit mit `npm run firestore:audit-retention` erneut ausgeführt werden. Vor dem Löschen ist sicherzustellen, dass `expiresAt` erreicht ist und keine Aufbewahrungspflicht für den Vorgang entgegensteht. Keine Zugangsdaten in Ausgaben oder Dokumentation kopieren.

Eine spätere Automatisierung ist optional. Firestore-TTL kann jederzeit mit `expiresAt` für die vier Collection Groups eingerichtet werden, setzt aber aktivierte Abrechnung voraus; TTL-Löschungen werden nach Dokumentlöschungen abgerechnet.

## E-Mail-Postfächer

Formulare werden per Nodemailer über `smtp.strato.de` an das konfigurierte Betreiberpostfach gemeldet. Es sind keine automatischen Löschregeln eingerichtet. Der Betreiber löscht die Nachrichten manuell nach den oben genannten Fristen. Einzelne Nachrichten, die im konkreten Fall gesetzlich aufbewahrungspflichtig sind, müssen entsprechend aufbewahrt werden. Die Anwendung kann Nachrichten, Papierkörbe, Archivkopien oder Provider-Backups nicht selbst löschen. Der Betreiber bestätigt, dass der STRATO-Vertrag für die Nutzung geeignet ist.

## Eigene Logs und Vercel

Formularrouten verwenden IP-Adressen nur flüchtig in einem pro Prozess geführten Rate-Limit (15 Minuten); abgelaufene Rate-Limit-Einträge werden bei Folgeanfragen entfernt. Der Anwendungscode protokolliert keine IP-Adressen, Formulareingaben, Mail-Fehlerobjekte oder Firestore-Fehlerobjekte. Fehlerausgaben sind auf allgemeine Meldungen begrenzt.

Vercel-Runtime-Logs erfassen Plattform-/Request-Metadaten und Anwendungsausgaben. Am 2.11.2026 im Konto bestätigt: Pro-Tarif, Funktionsregion Frankfurt (`fra1`), Runtime-Logs ein Tag und keine Log Drains für das Projekt.

## Betreiber-Freigabepunkte

Vor einer rechtlichen Datenschutzfreigabe durch die verantwortliche Gesellschaft:

- Firestore-Dokumente nach Erreichen von `expiresAt` manuell löschen. Gesetzlich aufbewahrungspflichtige einzelne Unterlagen sind separat zu beurteilen; keine Archivbestätigung ist Voraussetzung für das Ablaufdatum eines operativen Bestelldatensatzes.
- Vercel-Konto: Pro-Tarif, Funktionsregion Frankfurt (`fra1`), Runtime-Log-Aufbewahrung von einem Tag und keine Log Drains für das Projekt am 2.11.2026 bestätigt.
- Google/Firebase: Firebase-Terms-Prüfung am 2.11.2026 ohne Annahmeaufforderung abgeschlossen; nach Googles Hinweis sind die Firebase-Terms für dieses Google-Konto bereits angenommen. Firestore und Firebase Authentication unterliegen den Google-Cloud-Bedingungen; das Google Cloud Data Processing Addendum ist in die anwendbaren Google-Cloud-Verträge einbezogen. Für US-Übermittlungen sieht Google das EU-US Data Privacy Framework vor; Google LLC ist dort aktiv zertifiziert. Für sonstige relevante Drittlandübermittlungen gelten nach den Google-Bedingungen die Standardvertragsklauseln, soweit anwendbar. Firebase Authentication wird ausschließlich in den USA betrieben. Aktuelle Google-Cloud-Unterauftragsverarbeiterliste bei Bedarf im Vertragsnachweis ablegen.
- Sanity: Projekt `zqaggz4f`, Dataset `production` öffentlich; primärer Speicherort laut Sanity Belgien, API-CDN weltweit. Sanitys veröffentlichtes DPA ist in die Bedingungen einbezogen und sieht SCCs für relevante Transfers vor.
- STRATO: Betreiber bestätigt, dass der Vertrag für Domain und E-Mail datenschutzseitig passt; konkrete Backup-Aufbewahrungsdauer ist hier nicht dokumentiert.
- Anfragen im Postfach manuell nach den festgelegten Fristen löschen; diese Löschungen sind von der Firestore-Bereinigung getrennt. Es gibt keine automatischen Löschregeln.
- Der Betreiber bestätigt, dass eine über das Formular gesendete Vorbestellung unverbindlich bleibt und nicht zum Kauf verpflichtet. Produktwünsche beruhen auf berechtigtem Interesse und können ohne Kontaktdaten abgegeben werden.
- Betreiber bestätigt, dass weniger als 20 Personen regelmäßig mit der automatisierten Verarbeitung personenbezogener Daten befasst sind. Unabhängige Benennungspflichten nach Art. 37 DSGVO und § 38 BDSG bleiben unternehmensweit zu prüfen, falls andere Verarbeitungen relevant sind.

## Verwendete Anbieter- und Rechtsinformationen

- [Firestore TTL: Aktivierung, Verzögerung und Verhalten bei bestehenden Dokumenten](https://firebase.google.com/docs/firestore/ttl)
- [Firebase Datenschutzinformationen: Datenstandorte und Firebase Authentication](https://firebase.google.com/support/privacy)
- [Vercel Runtime Logs: verfügbare Logdaten und tarifabhängige Fristen](https://vercel.com/docs/logs/runtime)
- [Vercel Funktionsregionen](https://vercel.com/docs/functions/configuring-functions/region)
- [Sanity Data Processing Addendum](https://www.sanity.io/legal/dpa)
- [§ 147 AO: Aufbewahrungsfristen und Fristbeginn](https://www.gesetze-im-internet.de/ao_1977/__147.html)
- [§ 257 HGB: Aufbewahrungspflichten](https://www.gesetze-im-internet.de/hgb/__257.html)
