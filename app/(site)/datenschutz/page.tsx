import type {Metadata} from "next";
import {LegalPage, LegalSection} from "@/components/sections/LegalPage";
import {getBusinessSettings} from "@/sanity/lib/businessSettings";
import {createPageMetadata} from "@/lib/seo";
import {stegaClean} from "next-sanity";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBusinessSettings();
  return createPageMetadata({
    title: settings?.legalSeo?.privacyTitle || "Datenschutz – GerneGrün",
    description: settings?.legalSeo?.privacyDescription || "Informationen zur Verarbeitung personenbezogener Daten auf der GerneGrün-Website.",
    path: "/datenschutz",
  });
}

export default async function PrivacyPage() {
  const business = await getBusinessSettings();
  const mailLink = business?.email ? <a href={`mailto:${stegaClean(business.email)}`}>{business.email}</a> : null;
  const phoneLink = business?.phone ? <a href={`tel:${stegaClean(business.phone).replace(/[^\d+]/g, "")}`}>{business.phone}</a> : null;

  return <LegalPage title="Datenschutzerklärung" intro="Hier erfährst du, welche personenbezogenen Daten wir auf dieser Website verarbeiten, warum wir das tun und welche Rechte du hast.">
    <LegalSection title="1. Verantwortliche Stelle">
      <p><strong>Gernegrün GmbH &amp; Co. KG</strong><br />
        Waldstraße 4<br />
        63303 Dreieich<br />
        {mailLink && <>E-Mail: {mailLink}<br /></>}{phoneLink && <>Telefon: {phoneLink}</>}</p>
      <p>Wir sind für die Verarbeitung deiner personenbezogenen Daten auf dieser Website verantwortlich. Die Gesellschaft ist im Handelsregister des Amtsgerichts Offenbach am Main unter HRA 43047 eingetragen.</p>
    </LegalSection>

    <LegalSection title="2. Besuch unserer Website">
      <p>Wenn du unsere Website aufrufst, verarbeitet unser Hosting-Anbieter Vercel technische Verbindungsdaten, damit die Website ausgeliefert und vor Störungen und Missbrauch geschützt werden kann. Dazu gehören insbesondere deine IP-Adresse, Zeitpunkt und Ziel des Abrufs sowie Angaben zu Browser und Betriebssystem.</p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse ist der sichere und zuverlässige Betrieb der Website. Wir nutzen die Verbindungsdaten nicht für Werbung oder Besucherprofile.</p>
      <p>Die serverseitigen Funktionen der Website laufen in Frankfurt am Main. Vercel speichert technische Laufzeitprotokolle im von uns genutzten Pro-Tarif für einen Tag. Für dieses Projekt sind keine zusätzlichen Protokoll-Weiterleitungen an andere Anbieter eingerichtet. Statische Inhalte kann Vercel über sein weltweit verteiltes Netzwerk ausliefern.</p>
    </LegalSection>

    <LegalSection title="3. Kontakt">
      <p>Wenn du uns per E-Mail oder Telefon kontaktierst, verarbeiten wir deine Kontaktdaten und den Inhalt deiner Nachricht, um dein Anliegen zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit deine Anfrage einen Vertrag betrifft oder dessen Vorbereitung dient. In anderen Fällen beruht die Verarbeitung auf Art. 6 Abs. 1 lit. f DSGVO; unser Interesse liegt darin, Anfragen zu bearbeiten.</p>
      <p>Wir löschen Anfragen grundsätzlich spätestens sechs Monate nach Abschluss der Bearbeitung. Eine längere Aufbewahrung kommt nur in Betracht, wenn eine konkrete gesetzliche Pflicht für das betreffende Dokument gilt oder die Daten zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen benötigt werden. Beim Anklicken eines E-Mail- oder Telefonlinks wird zunächst nur die entsprechende Anwendung auf deinem Gerät geöffnet. Daten werden erst übermittelt, wenn du die Nachricht sendest oder den Anruf tätigst.</p>
    </LegalSection>

    <LegalSection title="4. Produktwünsche und Backwaren-Vorbestellungen">
      <p>Bei einem Produktwunsch verarbeiten wir den Produktnamen, eine optionale Beschreibung und – wenn du sie angibst – deinen Namen und deine E-Mail-Adresse. Für eine Backwaren-Vorbestellung verarbeiten wir deinen Namen, deine E-Mail-Adresse und Telefonnummer, den gewünschten Abholtag, die ausgewählten Produkte und Mengen sowie eine optionale Nachricht. Die Angaben werden in einer Datenbank von Google Cloud Firestore gespeichert und zur Bearbeitung deiner Vorbestellung an unser GerneGrün-Postfach übermittelt. Eine über das Formular gesendete Vorbestellung ist unverbindlich und verpflichtet dich nicht zum Kauf.</p>
      <p><strong>Rechtsgrundlage:</strong> Angaben zu Vorbestellungen verarbeiten wir zur Durchführung vorvertraglicher Maßnahmen auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Produktwünsche bearbeiten wir auf Grundlage unseres berechtigten Interesses an der Sortimentsplanung und an der Beantwortung deines Wunsches (Art. 6 Abs. 1 lit. f DSGVO). Erforderliche Angaben sind im jeweiligen Formular gekennzeichnet. Einen Produktwunsch kannst du auch ohne Namen und E-Mail-Adresse senden; dann können wir dir nicht persönlich antworten. Optionale Beschreibungen und Nachrichten musst du nicht angeben.</p>
      <p><strong>Speicherdauer:</strong> Produktwünsche löschen wir grundsätzlich 180 Tage nach der letzten inhaltlichen Bearbeitung, spätestens zwölf Monate nach Eingang. Nicht bestätigte oder stornierte Vorbestellungen löschen wir grundsätzlich 90 Tage nach dem gewünschten Abholtermin. Bestätigte Vorbestellungen löschen wir grundsätzlich 90 Tage nach Abschluss der Abholung. Wir löschen die Anfragen manuell. Nur wenn für ein einzelnes Dokument eine konkrete gesetzliche Aufbewahrungspflicht gilt, bewahren wir dieses Dokument für die vorgeschriebene Dauer auf.</p>
    </LegalSection>

    <LegalSection title="5. E-Mail und technische Dienstleister">
      <p>Zur Bearbeitung von Produktwünschen und Vorbestellungen senden wir die dafür erforderlichen Angaben an unser GerneGrün-Postfach. Bei einer Vorbestellung schicken wir dir außerdem eine Eingangsbestätigung mit deiner Auswahl und dem gewünschten Abholtag. Die E-Mail-Verarbeitung dient denselben Zwecken und beruht auf denselben Rechtsgrundlagen wie die jeweilige Anfrage.</p>
      <p>Wir nutzen Vercel für Hosting und technische Bereitstellung, Google für Firestore und den geschützten Zugang zum Betreiberbereich, Sanity für redaktionelle Inhalte und Bilder sowie STRATO für Domain und E-Mail. Diese Anbieter verarbeiten Daten, soweit dies für ihre jeweilige Aufgabe erforderlich ist. Die zu Anfragen gespeicherten E-Mails in unserem GerneGrün-Postfach löschen wir manuell nach den oben genannten Fristen. Sollte für ein einzelnes Dokument eine konkrete gesetzliche Aufbewahrungspflicht gelten, bewahren wir nur dieses Dokument und nur so lange auf, wie es erforderlich ist. Technische Sicherungskopien des Mailanbieters können nach dessen vertraglichen Löschfristen weiterbestehen.</p>
      <p>Unsere redaktionellen Inhalte werden mit Sanity verwaltet. Sanity nennt Belgien als primären Speicherort der Inhalte. Zur Auslieferung nutzt unsere Website Sanitys weltweit verteiltes API-CDN. Die veröffentlichten Inhalte sind öffentlich abrufbar; ändern können sie nur berechtigte Personen. <a href="https://www.sanity.io/legal/dpa" rel="noreferrer" target="_blank">Sanitys Datenschutzvereinbarung</a> enthält Standardvertragsklauseln für Übermittlungen, für die diese erforderlich sind.</p>
      <p>Die Datenbank mit Formularanfragen befindet sich in Frankfurt am Main. Firebase Authentication, das ausschließlich für den geschützten Betreiberzugang verwendet wird, verarbeitet Daten in den USA. Für Übermittlungen personenbezogener Daten aus dem EWR in die USA sieht Google das EU-US Data Privacy Framework als Transfergrundlage vor; Google LLC ist dort aktiv zertifiziert. Für Übermittlungen in andere Drittländer, die nicht durch einen Angemessenheitsbeschluss abgedeckt sind, sehen die anwendbaren Google-Datenschutzbedingungen Standardvertragsklauseln vor. <a href="https://cloud.google.com/terms/alternative-transfer-solution" rel="noreferrer" target="_blank">Googles Informationen zu internationalen Datenübermittlungen</a>.</p>
      <p>Vercel ist ein Anbieter mit Sitz in den USA. Nach den Vercel-Vertragsbedingungen können Daten zur Bereitstellung des Dienstes auch in den USA und in weiteren Ländern verarbeitet werden. Für Übermittlungen aus dem EWR, für die dies erforderlich ist, sehen die Vertragsbedingungen Standardvertragsklauseln vor. <a href="https://vercel.com/legal/dpa" rel="noreferrer" target="_blank">Vercels Datenschutzvereinbarung</a>.</p>
    </LegalSection>

    <LegalSection title="6. Cookies und externe Inhalte">
      <p>Die öffentliche Website verwendet keine Analyse- oder Werbe-Cookies und lädt keine externen Karten oder Social-Media-Inhalte automatisch. Nur für die Anmeldung im geschützten Betreiberbereich ist ein notwendiges Cookie im Einsatz. Besucherinnen und Besuchern der öffentlichen Website wird es nicht gesetzt; es läuft nach spätestens 14 Tagen ab.</p>
      <p>Unsere Schriftdatei wird von dieser Website ausgeliefert. Die Kontaktseite enthält einen Link zu OpenStreetMap. Erst wenn du diesen Link anklickst, wird OpenStreetMap aufgerufen und erhält dabei technische Verbindungsdaten, insbesondere deine IP-Adresse. Weitere externe Links werden ebenfalls erst durch deinen Klick aufgerufen.</p>
    </LegalSection>

    <LegalSection title="7. Deine Rechte">
      <p>Du hast nach Maßgabe der gesetzlichen Voraussetzungen das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit. Verarbeitungen auf Grundlage berechtigter Interessen kannst du aus Gründen, die sich aus deiner besonderen Situation ergeben, widersprechen. Soweit eine Verarbeitung auf deiner Einwilligung beruht, kannst du diese jederzeit mit Wirkung für die Zukunft widerrufen. Gesetzliche Aufbewahrungspflichten oder notwendige Nachweise können einer sofortigen Löschung entgegenstehen.</p>
      <p>Zur Ausübung deiner Rechte kannst du dich an die oben genannte verantwortliche Stelle wenden{mailLink && <> oder per E-Mail an {mailLink}</>}. Außerdem kannst du dich bei einer Datenschutzaufsichtsbehörde beschweren. Für Hessen ist dies der <a href="https://datenschutz.hessen.de/" rel="noreferrer" target="_blank">Hessische Beauftragte für Datenschutz und Informationsfreiheit</a>. Postanschrift: Postfach 3163, 65021 Wiesbaden; E-Mail: <a href="mailto:poststelle@datenschutz.hessen.de">poststelle@datenschutz.hessen.de</a>.</p>
    </LegalSection>
  </LegalPage>;
}
