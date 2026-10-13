import type {Metadata} from "next";
import {LegalPage, LegalSection} from "@/components/sections/LegalPage";
import {getBusinessSettings} from "@/sanity/lib/businessSettings";
import {createPageMetadata} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Datenschutz – GerneGrün",
  description: "Informationen zur Verarbeitung personenbezogener Daten auf der GerneGrün-Website.",
  path: "/datenschutz",
});

export default async function PrivacyPage() {
  const business = await getBusinessSettings();
  const mailLink = business?.email ? <a href={`mailto:${business.email}`}>{business.email}</a> : <span className="legal-placeholder">[E-Mail-Adresse ergänzen]</span>;
  return <LegalPage title="Datenschutzerklärung" intro="Hier erklären wir, welche personenbezogenen Daten diese Website verarbeitet, zu welchen Zwecken dies geschieht und welche Rechte du hast.">
    <LegalSection title="1. Verantwortliche Stelle">
      <p><strong>Gernegrün GmbH &amp; Co. KG</strong><br />
        Waldstraße 4<br />
        63303 Dreieich<br />
        E-Mail: {mailLink}<br />Telefon: {business?.phone ? <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`}>{business.phone}</a> : <span className="legal-placeholder">[Telefonnummer ergänzen]</span>}</p>
      <p>Die Gernegrün GmbH &amp; Co. KG ist im Handelsregister des Amtsgerichts Offenbach am Main unter HRA 43047 eingetragen. Eine Datenschutzbeauftragte oder ein Datenschutzbeauftragter ist im Projekt nicht benannt; ob eine Benennung gesetzlich erforderlich ist, muss der Betreiber anhand seiner Beschäftigtenzahl und Verarbeitungstätigkeit prüfen.</p>
    </LegalSection>

    <LegalSection title="2. Abruf der Website und Hosting">
      <p>Beim Aufruf der Website werden technisch notwendige Verbindungsdaten verarbeitet, damit die angeforderte Seite ausgeliefert und der sichere Betrieb gewährleistet werden kann. Dazu können insbesondere IP-Adresse, Zeitpunkt des Abrufs, angeforderte URL, Referrer, User-Agent sowie Status- und Fehlerdaten gehören. Diese Website wird laut Projektkonfiguration über Vercel bereitgestellt. Welche Daten Vercel im konkreten Deployment protokolliert, an welchen Standorten sie verarbeitet werden und wie lange sie gespeichert bleiben, ist anhand der Repository-Dateien nicht feststellbar und muss anhand der aktiven Vercel-Einstellungen und Vertragsunterlagen ergänzt werden.</p>
      <p><strong>Zweck und Rechtsgrundlage:</strong> Bereitstellung, Stabilität und Absicherung der Website; Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren und funktionsfähigen Betrieb). Bitte mit der tatsächlichen Hosting-Konfiguration abgleichen.</p>
      <p><strong>Speicherdauer:</strong> <span className="legal-placeholder">[Konkrete Speicherfristen für Hosting-, Sicherheits- und Fehlerprotokolle beim Anbieter feststellen und hier eintragen.]</span></p>
    </LegalSection>

    <LegalSection title="3. Kontakt per E-Mail oder Telefon">
      <p>Wenn du uns per E-Mail oder Telefon kontaktierst, verarbeiten wir die von dir übermittelten Kontakt- und Gesprächsinhalte zur Beantwortung deiner Anfrage und gegebenenfalls für notwendige Anschlusskommunikation. Bei einer Anfrage, die auf einen späteren Vertrag gerichtet ist, ist Rechtsgrundlage Art. 6 Abs. 1 lit. b DSGVO; bei sonstigen Anfragen Art. 6 Abs. 1 lit. f DSGVO (Bearbeitung der Kontaktanfrage). Beim Anklicken einer E-Mail- oder Telefonverknüpfung wird die jeweilige Anwendung auf deinem Gerät geöffnet; die Datenübermittlung erfolgt erst, wenn du die Nachricht sendest oder den Anruf tätigst.</p>
      <p>Eine allgemeine Kontaktformular-Route ist im geprüften Website-Code nicht vorhanden.</p>
      <p><strong>Speicherdauer:</strong> Anfrageinhalte werden gelöscht, sobald die Anfrage erledigt ist und keine gesetzlichen Aufbewahrungspflichten oder konkreten Ansprüche entgegenstehen. Eine konkrete interne Löschfrist ist im Projekt nicht dokumentiert und muss vom Betreiber festgelegt werden.</p>
    </LegalSection>

    <LegalSection title="4. Produktwünsche und Backwaren-Vorbestellungen">
      <p>Für einen Produktwunsch verarbeitet das Formular den Produktnamen, eine optionale Beschreibung und – wenn angegeben – deinen Namen und deine E-Mail-Adresse. Für eine Backwaren-Vorbestellungsanfrage werden Name, E-Mail-Adresse, Telefonnummer, gewünschter Abholtag, ausgewählte Produkte und Mengen sowie eine optionale Nachricht verarbeitet. Dazu kommen eine Anfrage-ID, Zeitstempel und Bearbeitungs-/E-Mail-Status; bei fehlgeschlagenem E-Mail-Versand wird ein technischer Fehlerhinweis gespeichert. Die Seite weist darauf hin, dass die Vorbestellung erst nach Bestätigung verbindlich wird.</p>
      <p>Die Formulare senden die Angaben an eigene Server-Routen. Dort werden sie serverseitig in Google Firebase/Cloud Firestore gespeichert und zur Benachrichtigung an den in der Serverkonfiguration hinterlegten E-Mail-Empfänger über Nodemailer und einen SMTP-Mailserver übermittelt. Der konkrete SMTP-Anbieter, die Datenregionen, Vertragsgrundlagen, mögliche Drittlandübermittlungen und Aufbewahrungsfristen sind aus dem Code nicht ersichtlich: <span className="legal-placeholder">[vor Veröffentlichung ergänzen]</span>. Die Formulare verwenden außerdem ein kurzlebiges, serverseitiges Rate-Limit anhand der Anfrage-IP; es wird im Anwendungscode nicht dauerhaft gespeichert.</p>
      <p><strong>Zwecke und Rechtsgrundlagen:</strong> Produktwünsche und Rückfragen bearbeiten (Art. 6 Abs. 1 lit. f DSGVO; berechtigtes Interesse an der Bearbeitung von Sortimentsvorschlägen und gewünschter Rückmeldung). Vorbestellungsanfragen bearbeiten und vorbereitende Schritte zu einem möglichen Vertrag durchführen (Art. 6 Abs. 1 lit. b DSGVO). Sicherheits- und Missbrauchsschutz erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Bitte rechtliche Grundlage für die konkrete Nutzung der freiwilligen Kontaktdaten beim Produktwunsch bestätigen.</p>
      <p><strong>Speicherung und Löschung:</strong> Anfragen werden in Firestore gespeichert; der Code enthält keine automatische Löschung oder feste Aufbewahrungsfrist. Bitte eine begrenzte Löschfrist festlegen und technisch umsetzen. E-Mails können zusätzlich in Postfächern und Backups der beteiligten Anbieter liegen; deren Fristen sind gesondert zu prüfen.</p>
      <p>Die Angabe der für das jeweilige Formular erforderlichen Daten ist notwendig, um die Anfrage zu bearbeiten. Ein Produktwunsch kann ohne Namen und E-Mail-Adresse abgesendet werden; eine Antwort ist dann nicht möglich.</p>
      <p>Eine ausschließlich automatisierte Entscheidungsfindung einschließlich Profiling ist in den geprüften Formularabläufen nicht erkennbar.</p>
      <p>Die Datenschutzhinweise sind auch direkt in beiden Formularen verlinkt. Eine gesonderte Einwilligung wird dort derzeit nicht eingeholt; die genannten Zwecke und Rechtsgrundlagen sind vor Veröffentlichung zu bestätigen.</p>
    </LegalSection>

    <LegalSection title="5. Sanity, Bilder und externe Inhalte">
      <p>Redaktionelle Seiteninhalte, Geschäftsdaten und Teile des Sortiments werden serverseitig aus Sanity abgerufen. Sanity ist damit technischer Dienstleister für das Redaktionssystem. Öffentliche Website-Besucher erhalten keinen Sanity-Schreibzugriff. Bei verwendeten Sanity-Bildern können Bilddateien über die Next.js-Bildoptimierung vom Sanity-CDN abgerufen werden. Projektdateien belegen weder die konkrete Sanity-Region noch die mit dem Anbieter vereinbarten Lösch- und Übermittlungsbedingungen. <span className="legal-placeholder">[Sanity-Auftragsverarbeitungsvertrag, Region und internationale Übermittlungen prüfen.]</span></p>
      <p>Die Schriftdatei Nunito wird lokal von dieser Website ausgeliefert; ein Abruf von Google Fonts ist im geprüften Code nicht eingerichtet. Eine Leaflet-Kartenbibliothek war eingebunden und lud beim Anzeigen der Kontaktseite OpenStreetMap-Kacheln von extern. Diese automatische Einbindung wurde entfernt. Die Kontaktseite enthält nun einen normalen OpenStreetMap-Link; erst nach einem bewussten Klick wird die externe Website aufgerufen. Dabei erhält OpenStreetMap insbesondere Verbindungsdaten wie die IP-Adresse. Es sind keine Analyse- oder Werbetracker im Repository gefunden worden.</p>
      <p>Externe Links (zum Beispiel Instagram-Profile oder OpenStreetMap) werden erst aufgerufen, wenn du sie anklickst. Für die Verarbeitung auf den Zielseiten ist deren jeweilige Datenschutzerklärung maßgeblich.</p>
    </LegalSection>

    <LegalSection title="6. Cookies und vergleichbare Technologien">
      <p>Im geprüften Anwendungscode werden keine eigenen Cookies, kein LocalStorage und kein SessionStorage gesetzt oder ausgelesen. Auch Analyse- oder Marketingtechnologien sind nicht eingerichtet. Die Vorbestellungs- und Produktwunschdialoge halten ihre Bedienzustände nur im laufenden Arbeitsspeicher; eine Consent-pflichtige Speicherung durch diese Website wurde nicht gefunden. Deshalb wird derzeit kein Cookie-Banner angezeigt und es gibt keine Cookie-Einstellungen. Falls künftig einwilligungspflichtige Technologien hinzukommen, müssen diese vor einer Einwilligung technisch blockiert und ein geeignetes Consent-Management eingerichtet werden. Technische Speicherung durch Hosting- oder Sicherheitsdienste sowie der tatsächliche Netzwerkverkehr im produktiven Deployment sind vor Veröffentlichung gesondert zu kontrollieren.</p>
    </LegalSection>

    <LegalSection title="7. Empfänger und Drittlandübermittlungen">
      <p>Je nach Nutzung erhalten Vercel (Hosting und Auslieferung), Sanity (CMS und Mediendateien), Google/Firebase (Firestore) sowie der über SMTP konfigurierte E-Mail-Dienst Zugriff auf für ihre jeweilige Aufgabe erforderliche Daten. Welche Gesellschaften, Unterauftragsverarbeiter und Länder im konkreten Betrieb eingesetzt werden und ob Daten außerhalb des Europäischen Wirtschaftsraums übermittelt werden, muss anhand der aktiven Verträge und Konfiguration festgestellt werden. <span className="legal-placeholder">[AV-Verträge, Unterauftragsverarbeiter, Speicherregionen und geeignete Garantien nach Art. 44 ff. DSGVO prüfen und ergänzen.]</span></p>
    </LegalSection>

    <LegalSection title="8. Deine Rechte und Beschwerderecht">
      <p>Du hast im gesetzlichen Rahmen das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21). Soweit eine Verarbeitung auf einer Einwilligung beruht, kannst du diese mit Wirkung für die Zukunft widerrufen. Du kannst dich zur Ausübung deiner Rechte unter {mailLink} melden.</p>
      <p>Du hast außerdem das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren. Für einen Verantwortlichen mit Niederlassung in Hessen ist grundsätzlich der <a href="https://datenschutz.hessen.de/" rel="noreferrer" target="_blank">Hessische Beauftragte für Datenschutz und Informationsfreiheit</a> zuständig. Postanschrift: Postfach 3163, 65021 Wiesbaden; E-Mail: <a href="mailto:poststelle@datenschutz.hessen.de">poststelle@datenschutz.hessen.de</a>. Bitte bestätigen, dass der Betreiber tatsächlich in Hessen niedergelassen ist.</p>
    </LegalSection>

    <LegalSection title="9. Stand und offene Angaben">
      <p>Die öffentlich ausgewiesene Betreiberfirma und Geschäftsanschrift sind oben eingetragen. Vor Veröffentlichung müssen die internen Betriebsangaben insbesondere zu Hosting-Protokollen und Fristen, Sanity-/Firebase-/SMTP-Verträgen, Regionen und Übermittlungen, Löschfristen in Firestore und E-Mail-Postfächern sowie die Rechtsgrundlagen für die konkrete Formularpraxis anhand der tatsächlich aktiven Konten und Abläufe geprüft und ergänzt werden.</p>
    </LegalSection>
  </LegalPage>;
}
