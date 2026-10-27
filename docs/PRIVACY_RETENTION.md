# Datenschutz und Löschkonzept

**Stand:** 19. Oktober 2026  
**Status:** Anwendung vorbereitet; automatische Firestore-TTL-Löschung noch nicht aktiviert. Kontobezogene Datenschutzfreigaben bleiben offen.

Dieses Dokument beschreibt die im Projekt umgesetzten Fristen und die notwendigen Betreiberarbeiten. Es ist eine technische Arbeitsanweisung, keine Rechtsberatung. Historische Datensätze dürfen nicht allein aufgrund dieses Dokuments pauschal geändert oder gelöscht werden.

## Fristen

| Daten | Frist / Regel | Technische Umsetzung |
|---|---|---|
| Allgemeine E-Mail-/Telefonanfragen | Spätestens 6 Monate nach Abschluss; gesetzlich aufbewahrungspflichtige Unterlagen und konkrete Ansprüche ausgenommen | Manuelle Prüfung und Löschung aus Postfach/Archiv, sofern keine Aufbewahrungspflicht besteht |
| Produktwünsche | 180 Tage nach letzter inhaltlicher Bearbeitung, maximal 12 Monate nach Eingang | `expiresAt` wird beim Eingang und nach dokumentierter Bearbeitung serverseitig berechnet; Firestore-TTL nach Aktivierung |
| Unbestätigte Backwaren-Vorbestellungen | 90 Tage nach Abholtermin | `expiresAt` bei Eingang; Statusänderung „Storniert“ erhält dieselbe Frist |
| Bestätigte / abgeschlossene Backwaren-Vorbestellungen | Erst nach Abschluss und separat bestätigter Archivierung notwendiger Belege; operative Anfrage 90 Tage nach Abschluss | Bestätigung setzt `expiresAt: null`; Abschluss bleibt gesperrt; Betreiber bestätigt die separate Archivierung und setzt dann 90 Tage ab Abschluss |
| Geschäftsbriefe und Rechnungs-/Buchungsbelege | Nur die jeweils gesetzlich erfassten Unterlagen: grundsätzlich 6 bzw. 8 Jahre ab Jahresende; andere Fristen/Ansprüche bleiben vorbehalten | Aus operativen Anfragen selektiv in ein geeignetes, zugriffsbeschränktes Archiv übernehmen; Firestore-Datensatz nicht jahrelang als operative Anfrage behalten |
| Eigene Sicherheits-/Fehlerlogs | Höchstens 14 Tage, außer konkreter Vorfall erfordert befristete längere Aufbewahrung | Anwendung gibt nur generische Meldungen aus, ohne Anfrageinhalte oder Fehlerobjekte; Vercel-Logs sind Plattformlogs und kontoabhängig |
| Betreiber-Sitzung `gg_studio_session` | Höchstens 14 Tage | HttpOnly, Secure in Produktion, auf `/api/studio` begrenzt |
| Öffentliches Cookie `gg_cookie_notice` | Entfernt | Schließen des Informationshinweises wird nur im aktuellen Seitenzustand gehalten; keine Einwilligung wird eingeholt |

## Firestore: Status und Audit

Die Firestore-Datenbank ist eine native Datenbank in `europe-west3` (Frankfurt). Am 19.10.2026 waren alle vier TTL-Richtlinien `not-enabled`:

- `productWishes`
- `productWishes_dev`
- `bakeryPreorders`
- `bakeryPreorders_dev`

Der einmalige lesende Audit zählte 3 Datensätze in `bakeryPreorders` und 0 in den drei übrigen Collections. Keiner der drei historischen Datensätze hat `expiresAt`; alle drei waren im Audit als `pending` markiert. Zwei enthalten noch ein altes Freitextfeld `emailError`. Der Bericht mit IDs und Zeitwerten, aber ohne Namen, E-Mail, Telefonnummer oder Nachricht, liegt lokal unter `.local/firestore-retention-audit-2026-10-19.json` und ist von Git ausgeschlossen. Es wurde kein historischer Datensatz verändert oder gelöscht.

Die alten Datensätze erhalten im Dashboard nur ein berechnetes voraussichtliches Ablaufdatum. Sie werden beim Ablauf dort ausgeblendet. **Vor einer Migration müssen die drei Bestellungen anhand des tatsächlichen Geschäftsvorgangs geprüft werden.** Insbesondere darf eine bestehende bestätigte Bestellung keine TTL bekommen, solange ein Vertrags-/Aufbewahrungsbedarf nicht geklärt und ein erforderlicher Beleg nicht separat archiviert ist. Die zwei alten `emailError`-Werte ebenfalls erst nach fachlicher Prüfung löschen oder bereinigen.

### TTL nach Prüfung aktivieren

1. Zunächst den lokalen Audit-Bericht und den Status der drei alten Bestellungen durch eine berechtigte Person prüfen lassen. Keine historischen `expiresAt`-Werte allein aus dem geschätzten Report in Firestore zurückschreiben.
2. In der Google Cloud Console das richtige Projekt `gernegruen-33101` und die Firestore-Datenbank `(default)` öffnen.
3. **Firestore → Time-to-live (TTL) → Create policy** wählen.
4. Für jede der vier obigen Collection Groups eine Richtlinie mit Feld `expiresAt` anlegen. Das Feld ist ein Zeitstempel; kein Offset ist erforderlich.
5. Auf den Abschlussstatus der Richtlinien warten und alle vier als aktiv kontrollieren. Der ausführbare Versuch mit dem konfigurierten Firebase-Servicekonto scheiterte am fehlenden IAM-Recht `datastore.indexes.update`; er hat keine Richtlinie aktiviert. Alternativ muss ein Admin genau diese notwendige Berechtigung erteilen oder die Richtlinien in der Konsole einrichten.
6. Nach Aktivierung die TTL-Metrik/Anzahl gelöschter Dokumente kontrollieren. Firestore löscht nicht sekundengenau; abgelaufene Dokumente werden typischerweise innerhalb von 24 Stunden gelöscht. Das Setzen einer TTL auf eine Collection Group kann auch bereits abgelaufene Dokumente löschen. Daher erst aktivieren, nachdem Altdaten geprüft wurden.

Zur Wiederholung des lesenden Berichts: `npm run firestore:audit-retention`. Das Aktivierungsskript `npm run firestore:enable-retention` prüft vor einer Änderung, ob `expiresAt` bereits in Dokumenten gesetzt ist; es kann nur mit ausreichenden Google-Cloud-IAM-Rechten Richtlinien erstellen. Keine Zugangsdaten in Ausgaben oder Dokumentation kopieren.

## E-Mail-Postfächer

Formulare werden per Nodemailer über `smtp.strato.de` an das konfigurierte Betreiberpostfach gemeldet. Die Anwendung kann keine Nachrichten, Papierkörbe, Archivkopien oder Provider-Backups löschen. Der Betreiber muss mindestens monatlich Postfachregeln/Erinnerungen kontrollieren, Anfragen nach den obigen Fristen löschen und dabei Fälle ausnehmen, die nachvollziehbar archivierungspflichtig sind. Die Vertragsgesellschaft, AVV, Verarbeitungsländer, Unterauftragnehmer und Backup-Fristen sind aus dem SMTP-Hostnamen allein nicht belegt und müssen im aktiven STRATO-Konto geprüft werden.

## Eigene Logs und Vercel

Formularrouten verwenden IP-Adressen nur flüchtig in einem pro Prozess geführten Rate-Limit (15 Minuten); abgelaufene Rate-Limit-Einträge werden bei Folgeanfragen entfernt. Der Anwendungscode protokolliert keine IP-Adressen, Formulareingaben, Mail-Fehlerobjekte oder Firestore-Fehlerobjekte. Fehlerausgaben sind auf allgemeine Meldungen begrenzt.

Vercel-Runtime-Logs erfassen Plattform-/Request-Metadaten und Anwendungsausgaben. Der tatsächlich aktive Tarif, Projekt-Region, konkrete Aufbewahrung, Log Drains und weitere Monitoring-Integration konnten aus diesem Repository nicht verifiziert werden. Diese Werte müssen im aktiven Vercel-Team-/Projektkonto nachgesehen werden. Die Dokumentation des Anbieters weist je nach Tarif unterschiedliche Runtime-Log-Fristen aus; keine dieser Fristen darf ohne Kontoprüfung als die Frist dieses Projekts veröffentlicht werden. Build-Logs können separat aufbewahrt werden und dürfen keine Secrets oder unnötigen personenbezogenen Daten enthalten.

## Betreiber-Freigabepunkte

Vor einer rechtlichen Datenschutzfreigabe durch die verantwortliche Gesellschaft:

- Drei historische Bestellungen und beide alten `emailError`-Freitextwerte prüfen; erforderliche Archivunterlagen separat sichern; nur danach entscheiden, ob und welche historischen Ablaufzeiten gesetzt werden.
- TTL-Richtlinien erst nach dieser Prüfung in allen vier Collection Groups aktivieren und Aktivierung dokumentieren.
- Vercel-Konto: tatsächliche Projekt-/Funktionsregion, Tarif, Runtime-Log-Aufbewahrung, Log Drains und zusätzliche Monitoringdienste verifizieren.
- Google/Firebase: anwendbare Vertrags-/DPA-Einbeziehung, Unterauftragnehmer und Transfergarantien bestätigen. Firebase Authentication wird laut Google ausschließlich in den USA betrieben; den Betreiber-Login und seine Notwendigkeit separat bewerten.
- Sanity: konkretes Projekt, anwendbare DPA/Vertragsbedingungen, CDN-Auslieferung, Unterauftragnehmer und Drittlandgarantien im Betreiberkonto prüfen.
- STRATO: Vertragsgesellschaft, AVV, Länder/Unterauftragnehmer und Postfach-/Backup-Löschfristen klären.
- Postfachlöschroutine für normale und nicht bestätigte Anfragen einrichten und Verantwortlichkeit zuweisen.
- Rechtsgrundlagen für freiwillige Kontaktdaten bei Produktwünschen und tatsächliche Verbindlichkeit des Vorbestellungsablaufs durch den Betreiber prüfen.
- Prüfen, ob gesetzlich ein Datenschutzbeauftragter zu bestellen ist.

## Verwendete Anbieter- und Rechtsinformationen

- [Firestore TTL: Aktivierung, Verzögerung und Verhalten bei bestehenden Dokumenten](https://firebase.google.com/docs/firestore/ttl)
- [Firebase Datenschutzinformationen: Datenstandorte und Firebase Authentication](https://firebase.google.com/support/privacy)
- [Vercel Runtime Logs: verfügbare Logdaten und tarifabhängige Fristen](https://vercel.com/docs/logs/runtime)
- [Vercel Funktionsregionen](https://vercel.com/docs/functions/configuring-functions/region)
- [Sanity Data Processing Addendum](https://www.sanity.io/legal/dpa)
- [§ 147 AO: Aufbewahrungsfristen und Fristbeginn](https://www.gesetze-im-internet.de/ao_1977/__147.html)
- [§ 257 HGB: Aufbewahrungspflichten](https://www.gesetze-im-internet.de/hgb/__257.html)
