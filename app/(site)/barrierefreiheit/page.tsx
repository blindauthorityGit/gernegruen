import type {Metadata} from "next";
import {LegalPage, LegalSection} from "@/components/sections/LegalPage";
import {getBusinessSettings} from "@/sanity/lib/businessSettings";
import {createPageMetadata} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Barrierefreiheit – GerneGrün",
  description: "Vorläufige Informationen zum Stand der Barrierefreiheit und zum Feedback bei GerneGrün.",
  path: "/barrierefreiheit",
});

export default async function AccessibilityPage() {
  const business = await getBusinessSettings();
  return <LegalPage title="Barrierefreiheit" intro="Wir möchten, dass möglichst viele Menschen die Informationen und Angebote auf dieser Website gut nutzen können.">
    <LegalSection title="Freiwillige Information zum aktuellen Stand">
      <div className="legal-notice"><p>Dies ist eine freiwillige Statusinformation und noch keine formelle Barrierefreiheitserklärung nach dem BFSG. Die Website wurde bislang keiner vollständigen Prüfung mit assistiven Technologien und manuellen Tests unterzogen. Wir behaupten daher nicht, dass sie vollständig barrierefrei ist oder WCAG 2.2 AA erfüllt.</p></div>
      <p>Eine erste Quellcodeprüfung wurde im Oktober 2026 vorgenommen. Sie ist eine technische Bestandsaufnahme und keine unabhängige Konformitätsbewertung.</p>
    </LegalSection>
    <LegalSection title="Was bereits berücksichtigt wird">
      <ul>
        <li>Die Website verwendet semantische HTML-Elemente, erkennbare Überschriften, native Links und Schaltflächen sowie beschriftete Formularfelder.</li>
        <li>Dialoge verwenden das native HTML-Dialogelement mit modaler Tastaturbedienung. Formulare geben Status- und Fehlermeldungen für assistive Technik aus.</li>
        <li>Es gibt globale sichtbare Fokusrahmen und Regeln für reduzierte Bewegung.</li>
        <li>Die automatisch eingebundene externe Karte wurde durch einen zugänglichen Link zu OpenStreetMap ersetzt. Die externe Karte wird erst nach dem Klick geöffnet; die Adresse steht als Text bereit.</li>
        <li>Die Formulare für Produktwünsche und Backwaren-Vorbestellungen verlinken direkt auf die Datenschutzhinweise.</li>
      </ul>
    </LegalSection>
    <LegalSection title="Bekannte offene Prüfungen">
      <ul>
        <li>Der helle Limettenton des Designsystems auf cremefarbenem Hintergrund erreicht voraussichtlich nicht den erforderlichen Textkontrast. Eine visuelle Anpassung muss mit dem Designverantwortlichen abgestimmt werden.</li>
        <li>Kontrastwerte aller Text-, Schaltflächen- und Fokusfarbkombinationen müssen systematisch gemessen werden, einschließlich responsiver und interaktiver Zustände.</li>
        <li>Zoom bis 200 Prozent und Reflow bei schmalen Ansichtsfenstern wurden nicht praktisch geprüft.</li>
        <li>Tastaturbedienung, Screenreader-Ausgabe, Dialog-Fokusverhalten und Fehlermeldungen müssen auf den veröffentlichten Seiten manuell mit gängigen Browsern und Hilfstechnologien geprüft werden.</li>
        <li>Alt-Texte redaktioneller Sanity-Bilder sowie Überschriftenhierarchie und Linktexte aller dynamischen Inhalte müssen im veröffentlichten Datenbestand geprüft werden.</li>
        <li>Abstände und Zielgrößen interaktiver Elemente sowie die mobile Navigation benötigen eine Prüfung auf realen Geräten.</li>
      </ul>
    </LegalSection>
    <LegalSection title="Geltung des Barrierefreiheitsstärkungsgesetzes">
      <p>Die Website präsentiert in erster Linie ein stationäres Lebensmittelgeschäft. Eine reine Informationswebsite ohne Online-Abschluss eines Verbrauchervertrags fällt nicht allein deshalb unter die BFSG-Anforderungen für Dienstleistungen im elektronischen Geschäftsverkehr. Die Website bietet aber eine Online-Anfrage für Backwaren an. Ob dieser Ablauf im konkreten Fall bereits eine Dienstleistung im elektronischen Geschäftsverkehr „im Hinblick auf den Abschluss eines Verbrauchervertrags“ darstellt, hängt von der tatsächlichen Vertrags- und Bestellpraxis ab und muss rechtlich geprüft werden.</p>
      <p>Auch die Ausnahme für Kleinstunternehmen, die Dienstleistungen erbringen, kann einschlägig sein, wenn die gesetzlichen Beschäftigten- und Umsatz-/Bilanzgrenzen erfüllt sind. Unternehmensgröße und Kennzahlen sind nicht bekannt. Deshalb lässt sich aus dem Repository keine abschließende Aussage zur BFSG-Pflicht oder zur Pflicht für die nach BFSG erforderlichen Verbraucherinformationen treffen. Die Seite wird bis zur Klärung als freiwillige Statusinformation veröffentlicht, ohne Konformität zu behaupten.</p>
    </LegalSection>
    <LegalSection title="Feedback und Kontakt">
      <p>Wenn du auf ein konkretes Barriereproblem stößt oder Inhalte in einem anderen Format benötigst, schreib uns bitte an {business?.email ? <a href={`mailto:${business.email}`}>{business.email}</a> : <span className="legal-placeholder">[E-Mail-Adresse ergänzen]</span>} oder ruf uns an: {business?.phone ? <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`}>{business.phone}</a> : <span className="legal-placeholder">[Telefonnummer ergänzen]</span>}.</p>
      <p>Bitte ergänze vor Veröffentlichung die zuständige Stelle für Rückmeldungen, einen verbindlichen Prüf- und Aktualisierungsstand und – falls das BFSG anwendbar ist – alle Pflichtinformationen nach Anlage 3 BFSG sowie die zuständige Marktüberwachungsbehörde.</p>
    </LegalSection>
  </LegalPage>;
}
