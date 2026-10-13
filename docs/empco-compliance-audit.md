# EmpCo-Compliance-Audit – GerneGrün

**Prüfstand:** 13.10.2026  
**Gegenstand:** Repository-Snapshot und öffentlich abrufbare Sanity-Inhalte des Projekts, mit Schwerpunkt auf gegenüber Verbraucher:innen sichtbaren Umwelt-, Bio-, Herkunfts- und Nachhaltigkeitsaussagen.  
**Ergebnis:** Es wurde kein Verstoß abschließend nachgewiesen. Vier Fundstellen weisen jedoch ein hohes rechtliches Risiko auf, weil eine allgemeine Umwelt- oder Zertifizierungsaussage breit erscheint und die dafür erforderliche Grundlage im geprüften Material nicht belegt ist. Die Beurteilung ersetzt keine anwaltliche Prüfung.

> **Umsetzungsstand 13.10.2026:** Die folgenden ursprünglichen Fundstellen dokumentieren den Audit vor der Umsetzung. Die kritischen sichtbaren Aussagen wurden inzwischen angepasst; der ergänzende Status und offene Prüfpunkte stehen in Abschnitt H. Der maßgebliche Zielmarkt ist Deutschland, deshalb wurden die Rechtsquellen unten auf das deutsche UWG korrigiert.

## A. Management Summary

Der Website-Auftritt verbindet „GerneGrün“, grüne Gestaltung, die Bezeichnung „Bioladen“, „Bio“-Aussagen und Regionalitäts-Wording. Der Markenname allein ist keine festgestellte Umweltaussage. Im Gesamtauftritt verstärken sich jedoch die Aussagen **„Dein Bioladen“**, **„Bio · Regional · Persönlich“** und die Überschrift **„Saisonal & regional“**. Die derzeit abrufbare Obst- und Gemüseliste für KW 42/2026 enthält 58 Produkte aus zehn Ländern – darunter Deutschland, Spanien, Italien, Frankreich, Argentinien und Israel. Das belegt nicht, dass einzelne Herkunfts- oder Saisonangaben falsch sind; es macht aber eine pauschal über die ganze Auswahl gestellte Regionalitätsaussage erklärungsbedürftig.

| Risikostufe | Anzahl | Einordnung |
|---|---:|---|
| HOCH | 4 | Möglicherweise von UWG-Schwarze-Liste-Verboten erfasst oder in ihrer Reichweite missverständlich; Nachweise oder Eingrenzung fehlen. Kein Verstoß abschließend festgestellt. |
| MITTEL | 6 | Kontextabhängig oder im Kern konkret, aber Nachweis, Produktzuordnung oder Reichweite muss redaktionell bzw. anhand von Belegen geprüft werden. |
| NIEDRIG | 5 | Derzeit eher beschreibend, historisch oder nicht als Claim zu behandeln; Beibehalten mit üblicher Tatsachenprüfung. |

**Wichtigste Punkte:**

1. Das globale Open-Graph-Bild kombiniert „Dein Bioladen in Dreieich“ mit „Bio · Regional · Persönlich“ und wird als Standardbild auf sämtlichen Metadaten verwendet.
2. „Saisonal & regional“ steht als Eyebrow über der aktuellen Obst- und Gemüseauswahl, obwohl der aktuelle Import 58 Positionen aus zehn Ländern enthält. Die Reichweite der Aussage ist unklar.
3. Bei 20 von 58 abrufbaren Wochenprodukten ist das boolesche Feld `bioladenCertified` auf `true` gesetzt; das Frontend macht daraus den für Verbraucher:innen sichtbaren Claim „Bioladen-zertifiziert“. Ein Zertifizierungsstandard oder eine Zertifizierungsstelle ist in Schema und Website nicht erläutert.
4. „Bio“ wird mehrfach als allgemeine Beschreibung des Ladens bzw. Sortiments verwendet. Einzelne Produktzertifizierungen belegen nicht automatisch eine hervorragende Umweltleistung des gesamten Unternehmens oder Sortiments im Sinn der EmpCo.
5. Das CMS speichert Zertifizierungsname und Herkunft, verlangt aber keine Zertifizierungsstelle, Kontrollnummer, Gültigkeit oder prüfbare Unterlage. Freie Editorialfelder können außerdem Umweltclaims ohne redaktionelle Warnung veröffentlichen.

## B. Kritische Fundstellen

### H1 – Allgemeiner Bio-Claim über Geschäft und Sortiment

1. **Seite/Route:** Startseite; außerdem globale bzw. SEO-Ausgaben für mehrere Routen.
2. **Fundstelle:** [app/(site)/page.tsx](C:/Users/Johannes/Desktop/Websites/gernegruen/app/(site)/page.tsx:15), [app/layout.tsx](C:/Users/Johannes/Desktop/Websites/gernegruen/app/layout.tsx:15), [lib/seo.ts](C:/Users/Johannes/Desktop/Websites/gernegruen/lib/seo.ts:35); ähnliche Standardtexte in `/sortiment`, `/ueber-uns` und `/kontakt`.
3. **Original:** „Dein Bioladen in Dreieich“, „ausgewählte Bio-Lebensmittel“, „Bio-Sortiment“, „Bio-Bäckerei“, „Bioladen Dreieich“.
4. **Risiko:** **HOCH – rechtliches Risiko, kein nachgewiesener Verstoß.**
5. **Begründung:** „Bio“ wird von der WKO als mögliches Beispiel einer allgemeinen Umweltaussage genannt. Die Bezeichnung des gesamten Geschäfts als Bioladen kann den Eindruck vermitteln, das Sortiment bzw. die Geschäftstätigkeit insgesamt sei ökologisch besonders. Die tatsächlich abgerufene Wochenliste enthält unterschiedliche Bio-Verbandsangaben; daraus lässt sich der Bio-Anteil am Gesamtsortiment nicht ableiten. Eine EU-Bio-Produktzertifizierung ist nicht ohne Weiteres gleichbedeutend mit dem Nachweis einer „anerkannten hervorragenden Umweltleistung“ für eine allgemeine Aussage über das ganze Unternehmen. Die genaue Verwendung als Branchenbeschreibung ist im Kontext juristisch zu prüfen.
6. **Rechtsgrundlage:** UWG Anhang Z 4a (allgemeine Umweltaussage ohne Nachweis anerkannter hervorragender Umweltleistung), Z 4b (Übertragung eines Teilaspekts auf das Gesamtprodukt/die gesamte Geschäftstätigkeit); ergänzend § 2 UWG für irreführende Angaben. Richtlinie (EU) 2024/825, Änderungen der Richtlinie 2005/29/EG.
7. **Fehlend:** Nachweise zur Reichweite des Begriffs „Bioladen“, Umfang und Kriterien des Bio-Sortiments, gültige Betreiber-/Betriebszertifizierung, falls damit geworben wird, sowie eine juristische Einschätzung der allgemeinen Bezeichnung.
8. **Maßnahme:** Unternehmensbeschreibung von konkreten Bio-Produkten trennen. „Bio“ dort produktbezogen verwenden, wo Produktstatus und Zertifizierung geprüft sind. Den allgemeinen SEO-Text nicht als pauschale Bio-Aussage über alle Produkte formulieren.
9. **Textvorschlag:** Titel: „GerneGrün – Lebensmittelgeschäft in Dreieich“. Beschreibung: „Entdecke Obst, Gemüse, Brot, Getränke und ausgewählte Bio-Produkte bei GerneGrün in Dreieich.“ Auf `/sortiment`: „… und ausgewählte Bio-Produkte“ statt „Bio-Sortiment“, sofern die Produktzuordnung belegt ist.

### H2 – „Bio · Regional · Persönlich“ im globalen Social-Share-Bild

1. **Seite/Route:** Alle Seiten, deren Metadaten das Standard-Open-Graph-Bild nutzen.
2. **Fundstelle:** [public/images/og-gernegruen.svg](C:/Users/Johannes/Desktop/Websites/gernegruen/public/images/og-gernegruen.svg:10) und [lib/seo.ts](C:/Users/Johannes/Desktop/Websites/gernegruen/lib/seo.ts:11).
3. **Original/Element:** Social-Karte zeigt „Dein Bioladen in Dreieich“ und „Bio · Regional · Persönlich“; `createPageMetadata` setzt dieses Bild standardmäßig für Open Graph und X/Twitter.
4. **Risiko:** **HOCH – rechtliches Risiko, kein nachgewiesener Verstoß.**
5. **Begründung:** Die drei kurzen Claims stehen ohne Erläuterung oder Produktbezug nebeneinander. Das Bild erscheint auch beim Teilen von Seiten, deren Inhalt nicht speziell Bio oder Regionalität betrifft. Die Kombination aus grünem Markennamen, Gestaltung und drei Claims kann einen Gesamteindruck ökologischer Ausrichtung des ganzen Geschäfts vermitteln. „Bio“ und „Regional“ brauchen einen passenden, belegbaren Bezugsrahmen; der Link auf eine andere Seite würde die erforderliche unmittelbare Konkretisierung nicht ersetzen.
6. **Rechtsgrundlage:** UWG Anhang Z 4a und 4b; § 2 UWG. WKO weist ausdrücklich darauf hin, dass auch implizite Aussagen aus Farben/Bildern sowie Logos und Unternehmenskennzeichen relevant sein können.
7. **Fehlend:** Belege für Umfang der Bio-Produkte und für die Reichweite/Messmethode von „Regional“; eine unmittelbar in der Grafik sichtbare Eingrenzung.
8. **Maßnahme:** Social-Karte auf überprüfbare, neutrale Unternehmensbeschreibung umstellen oder Claims jeweils in demselben Bild klar eingrenzen. Standardbild route-unabhängig verwenden, nur wenn es auch für alle Routen stimmt.
9. **Textvorschlag:** „GerneGrün – Lebensmittel in Dreieich“; wenn die Auswahl belegt ist: „Obst, Gemüse und ausgewählte Bio-Produkte“.

### H3 – Pauschales „Saisonal & regional“ über der Gemüse- und Obstauswahl

1. **Seite/Route:** Startseite `/` und `/sortiment` in der Sektion „Diese Woche“.
2. **Fundstelle:** [components/sections/home/WeeklyOffersSection.tsx](C:/Users/Johannes/Desktop/Websites/gernegruen/components/sections/home/WeeklyOffersSection.tsx:71). Die Produkte kommen aus `weeklyProduceList` via [sanity/queries/weekly.ts](C:/Users/Johannes/Desktop/Websites/gernegruen/sanity/queries/weekly.ts:38).
3. **Original:** „Saisonal & regional“ als Überschrift der Karte „Frisches Obst & Gemüse“. Öffentlich abrufbarer Stand KW 42/2026: 58 Produkte, Herkunft aus zehn Ländern; Beispiele der dokumentierten Länder reichen von Deutschland bis Argentinien und Israel.
4. **Risiko:** **HOCH – rechtliches Risiko, Reichweite derzeit nicht nachvollziehbar.**
5. **Begründung:** Verbraucher:innen können die Überschrift auf die gesamte danebenstehende Auswahl beziehen. „Regional“ nennt weder Bezugsregion noch Anteil/Produkte; „saisonal“ ist ebenfalls nicht je Produkt zugeordnet. Die gezeigten Herkunftsländer belegen zwar eine gemischte Herkunft, aber nicht, welche der konkret hervorgehobenen Produkte regional oder saisonal sind. Die Daten können eine zutreffende Auswahl regionaler Produkte enthalten; die pauschale Überschrift lässt die Abgrenzung jedoch offen.
6. **Rechtsgrundlage:** § 2 UWG (irreführender Gesamteindruck bzw. fehlende wesentliche Konkretisierung); je nach Umweltverständnis der Aussage zusätzlich UWG Anhang Z 4a. Eine pauschale Regionalitätsangabe ist nicht allein durch das Wort automatisch verboten.
7. **Fehlend:** Definition von „Region“, Lieferanten-/Erzeugerort pro beworbenem Artikel, regionale Quote/Bezugsmenge, Saisonkriterium sowie Nachweis, welche der aktuellen Produkte unter die Überschrift fallen.
8. **Maßnahme:** Claims nur direkt bei zutreffenden Produkten anzeigen. „Saisonal“ und „regional“ getrennt belegen. Eine länderweite Herkunftsangabe im Produktdetail ersetzt keine Eingrenzung der regionalen Werbeaussage.
9. **Textvorschlag:** Ohne Prüfung: „Unsere Obst- und Gemüseauswahl“. Wenn nur konkrete Produkte regional sind: „Diese Woche aus der Region: [belegte Produktnamen]“; wenn nur saisonal: „Diese Woche passend zur Saison: [belegte Produktnamen]“.

### H4 – Produktclaim „Bioladen-zertifiziert“ aus undokumentiertem Bool-Feld

1. **Seite/Route:** `/diese-woche`; auf Produktkarten der importierten Obst- und Gemüseliste.
2. **Fundstelle:** [components/sections/weekly/FreshProduceSection.tsx](C:/Users/Johannes/Desktop/Websites/gernegruen/components/sections/weekly/FreshProduceSection.tsx:45), [sanity/schemaTypes/objects/weeklyProduceImportProduct.ts](C:/Users/Johannes/Desktop/Websites/gernegruen/sanity/schemaTypes/objects/weeklyProduceImportProduct.ts:15), [components/studio/ProduceImportTool.tsx](C:/Users/Johannes/Desktop/Websites/gernegruen/components/studio/ProduceImportTool.tsx:15).
3. **Original/Element:** Ein gesetzter boolescher Wert erzeugt den Textbadge „Bioladen-zertifiziert“. Im öffentlichen KW-42-Datensatz ist der Wert für 20 von 58 Produkten `true`; zusätzlich ist für Produkte ein freies Feld `certification` mit Einträgen wie Naturland, Bioland, Demeter oder „EU-Öko-VO“ vorhanden.
4. **Risiko:** **HOCH – rechtliches Risiko, Zertifizierungsstatus nicht prüfbar.**
5. **Begründung:** „Zertifiziert“ behauptet eine formale Prüfung/Zertifizierung, „Bioladen“ klingt nach benannter Zertifizierungsstelle oder Programm. Das Schema erklärt weder, was „Bioladen-Zertifizierung“ ist, noch wer sie ausstellt. Der UI-Text ist ein Claim und könnte bei siegelartiger Darstellung als Nachhaltigkeitssiegel verstanden werden; gegenwärtig ist im Code ein Textbadge, kein selbst gestaltetes Zertifizierungslogo belegt. Der boolesche Datenwert allein beweist keine Zertifizierung. Die separaten Verbandsnamen sind konkreter, aber weder Zertifikatsgültigkeit noch Produktzuordnung wurden extern kontrolliert.
6. **Rechtsgrundlage:** UWG Anhang Z 2 (Güte-/Qualitätskennzeichen ohne erforderliche Genehmigung), Z 2a (nicht regelkonformes Nachhaltigkeitssiegel, sofern der Badge als solches verstanden wird), Z 4 (falsche Bestätigung/Genehmigung); § 2 UWG. Produktbezogene Bio-Kennzeichnung ist zudem anhand der einschlägigen Bio-Kennzeichnungsregeln gesondert zu prüfen.
7. **Fehlend:** Bedeutung des Flags, Zertifikatsinhaber, Standard/Programm, Zertifizierungsstelle, Kontroll-/Lizenznummer, Gültigkeit und Belege je Produkt; Freigabe zur werblichen Verwendung.
8. **Maßnahme:** Vor weiterer Verwendung klären, was das Feld bedeutet. Bis dahin nicht in einen unqualifizierten Verbraucherclaim „zertifiziert“ umwandeln. Stattdessen nur belegte Zertifizierungsangaben zum konkreten Produkt zeigen. Bei Verwendung eines Siegels dessen Berechtigung und Zertifizierungssystem prüfen.
9. **Textvorschlag:** Wenn das Feld nur eine interne Sortimentskennzeichnung ist, keinen Umwelt-/Zertifizierungsclaim ausgeben. Bei belegtem Siegel: „Zertifiziert nach [konkretem Standard]“ am entsprechenden Produkt; fehlende Information nicht durch einen allgemeinen Text ersetzen.

## C. Weitere Auffälligkeiten

### Mittleres Risiko

| ID | Seite / Fundstelle | Original / Kontext | Begründung, fehlender Nachweis und Maßnahme | Vorschlag |
|---|---|---|---|---|
| M1 | Startseite; [app/(site)/page.tsx](C:/Users/Johannes/Desktop/Websites/gernegruen/app/(site)/page.tsx:25) | „Besonderes aus der Region“; Sanity-Hero enthält denselben Satz. | Herkunfts-/Regionalitätsaussage ohne benannte Region; bezieht sich sprachlich auf eine Produktauswahl, nicht automatisch auf das gesamte Sortiment. Herkunft und Bezugsraum für die hervorgehobenen Produkte belegen. | „Besonderes aus [konkret benannter Region]“ nur wenn Lieferanten-/Erzeugerdaten das tragen; sonst „Besonderes aus unserem Sortiment“. |
| M2 | Startseite; [components/sections/home/StoreIntroSection.tsx](C:/Users/Johannes/Desktop/Websites/gernegruen/components/sections/home/StoreIntroSection.tsx:32) | Fallback: „… mit vielen Produkten aus der Region.“ Das aktuelle `storeIntroSection`-Feld in Sanity ist leer/null; daher greift der Code-Fallback. | Quantifizierung „viele“ ohne Zahl, Bezugsregion oder Bezugsbasis. Kein Beleg für den Anteil abgerufen. Produktstichprobe und Definition verlangen oder Satz konkretisieren. | „Wir führen auch Produkte aus der Region.“ Nur verwenden, wenn das nachgewiesen und die Region erläutert ist. |
| M3 | `/ueber-uns`; Sanity `aboutPage.timeline.milestones[0]` (öffentlich abgerufen) | „… mit Fokus auf biologisch, regional und nachhaltig.“ Historischer Claim zum Start des Unverpackt-Ladens 2022. | Der Vergangenheitsbezug ist klar, aber „nachhaltig“ und „biologisch“ bleiben allgemeine Claims; kann als Unternehmenswert weiterwirken. Unterlagen zur damaligen Sortiments-/Verpackungspraxis und zeitliche Einordnung sichern. | „… mit vielen losen Produkten und dem Anspruch, Einkauf in passenden Mengen zu ermöglichen.“ Nur wenn historisch belegt. |
| M4 | `/ueber-uns`; Sanity `aboutPage.hero.description` | „… mit mehr Auswahl, bewährten Werten und viel Nähe zur Region.“ | Nähe zur Region ist vage und könnte Regionalitäts-/Nachhaltigkeitsverständnis stützen. Nicht automatisch unzulässig; Werte/Beispiele konkretisieren oder rein geografisch formulieren. | „… mit mehr Auswahl und vielen Anlaufstellen für deinen Einkauf in Dreieich.“ |
| M5 | `/ueber-uns`; Sanity `aboutPage.gallery.images[7]` | Alt-Text: „Bio-Babynahrung und Snacks im Holzregal“; Bildunterschrift „Auch für die Kleinsten“. | Konkreter, auf sichtbare Produkte begrenzter Produkthinweis. Produktzertifizierung im Bild nicht anhand des Alt-Texts verifiziert; bei der Aussage keine Bio-Logos oder Zertifikate erfunden. Bild und Regalinhalt aktuell halten. | Beibehalten, falls sämtliche als „Bio“ bezeichneten Produkte im Bild entsprechend gekennzeichnet sind; sonst „Babynahrung und Snacks im Holzregal“. |
| M6 | Globaler Header; [components/layout/Header.tsx](C:/Users/Johannes/Desktop/Websites/gernegruen/components/layout/Header.tsx:186) | „Regional. Frisch. GerneGrün.“; Name und grüne Gestaltung. | Der Markenname „GerneGrün“ und die Farbe Grün sind für sich kein festgestellter Rechtsverstoß. In Kombination mit dem Bio-/Regional-Claim des Open-Graph-Bilds kann der Gesamteindruck aber stärker werden. Kein Grund, den Namen allein zu ändern; prüfen, dass Logos nicht siegelartig als unabhängiges Gütezeichen gestaltet werden. | Claim-Zeile bei Bedarf eingrenzen: „Frische Auswahl. Persönlich für dich da.“ |

### Niedriges Risiko / derzeit unproblematisch

| ID | Seite / Fundstelle | Beispiel | Bewertung und Maßnahme |
|---|---|---|---|
| N1 | `/diese-woche`; [components/sections/weekly/FreshProduceSection.tsx](C:/Users/Johannes/Desktop/Websites/gernegruen/components/sections/weekly/FreshProduceSection.tsx:26) | „Frisches Obst & Gemüse“; „Unsere Auswahl wechselt mit Saison und Verfügbarkeit.“ | Überwiegend beschreibende Frische-/Verfügbarkeitsaussage, kein pauschales Umweltversprechen. „Saison“ allein wird hier als Auswahlwechsel erläutert. Beibehalten, wenn Angebots- und Frischeaussagen tatsächlich stimmen. |
| N2 | `/sortiment`; [app/(site)/sortiment/page.tsx](C:/Users/Johannes/Desktop/Websites/gernegruen/app/(site)/sortiment/page.tsx:40) | „… frisches Obst und Gemüse, Brot, Getränke und mehr“; über 4.000 Produkte. | Sachliche Sortiments-/Mengenaussage ohne Umweltvorteil. „Über 4.000“ sollte wie üblich auf aktueller Zählung beruhen. |
| N3 | Aktuelle Wochenliste, Sanity `weeklyProduceList-2026-42` | Produktbezogene Felder `origin` und `certification`, z. B. Herkunft „Spanien“/„Deutschland“ und benannter Verband. | Positiv: 58 Einträge enthielten im abrufbaren Snapshot jeweils Herkunft und eine Zertifizierungsangabe. Die präzise Herkunft ermöglicht konkretere Kommunikation. Das belegt nicht Echtheit, Gültigkeit oder passende Zuordnung des Zertifikats. |
| N4 | Globale Komponenten und Formulare | CTA, Vorbestell-/Produktwunschdialoge, Kontakt- und Öffnungshinweise. | In den geprüften Texten keine zusätzlichen Umwelt- oder Nachhaltigkeitsclaims gefunden. Standardformulierungen zu Frische, Angebot, Wunsch/Vorbestellung sind keine Umweltvorteilsbehauptungen. |
| N5 | Bild-/Grafikassets | `public/graphics/home-hero-bio-von-hier.png` enthält „So bunt ist Bio von hier!“ | Die Grafikdatei selbst enthält eine Bio- und Herkunftsaussage. Sie wird im aktuellen Home-Hero nicht eingebunden; das Hero verwendet `/images/home-hero-store.png`. Daher aktuell kein sichtbarer Website-Claim. Vor späterer Reaktivierung Herkunftsbezug („hier“), abgebildete Produkte und Bio-Status prüfen. |

**Weitere beobachtete, derzeit nicht als Verstöße eingestufte Begriffe:** „natürlich frei“ als historischer Name des früheren Ladens; „Naturkosmetik“ als Sortimentskategorie; „frisch“, „persönlich ausgesucht“, „gute Lebensmittel“ und „saisonal“ in Bildunterschriften. Im geprüften Kontext sind dies keine automatisch verbotenen Claims. Wo damit ein konkreter Umweltvorteil behauptet wird, muss dieser dennoch stimmen und belegbar sein.

## D. Textoptimierungen

| Original | Vorschlag | Warum |
|---|---|---|
| „Dein Bioladen in Dreieich“ (globales Share-Bild und SEO) | „GerneGrün – Lebensmittelgeschäft in Dreieich“ | Vermeidet, dass der gesamte Betrieb pauschal als ökologisch besonders erscheint, bis Reichweite und Nachweis geklärt sind. |
| „Bio · Regional · Persönlich“ | „Obst, Gemüse und ausgewählte Bio-Produkte“ | Konkretere Sortimentsbeschreibung; „ausgewählte“ muss tatsächlich eine Auswahl bezeichnen. |
| „Saisonal & regional“ | „Unsere Obst- und Gemüseauswahl“ | Entfernt die pauschale Klammer über eine international zusammengesetzte Liste. Einzelne geprüfte Produkte können direkt als regional/saisonal gekennzeichnet werden. |
| „Bioladen-zertifiziert“ | Kein Badge, bis Bedeutung und Zertifikat belegt sind; danach „Zertifiziert nach [Standard]“ | Verhindert eine unklare Aussage über Aussteller und Prüfverfahren. |
| „Besonderes aus der Region“ | „Besonderes aus [konkret benanntem Gebiet]“ | Machen, wenn Produkt-/Lieferantennachweise die Herkunft für genau diese Produkte tragen. |
| „… mit vielen Produkten aus der Region“ | „Wir führen auch Produkte aus [konkret benanntem Gebiet].“ | „Viele“ ohne Quote und „Region“ ohne Definition sind schwer nachprüfbar. |
| „… Fokus auf biologisch, regional und nachhaltig“ (historische Station 2022) | „… mit vielen losen Produkten und Einkauf in bedarfsgerechten Mengen.“ | Behält die belegbare Geschichte des Unverpackt-Konzepts, ohne pauschale Umweltwertung. Nur einsetzen, wenn historisch zutreffend. |

Die Alternativen sind Vorschläge, keine Tatsachenbestätigung. Platzhalter dürfen nur mit belegten Angaben ersetzt werden; die vorgeschlagenen Texte sollten redaktionell freigegeben werden.

## E. Fehlende Nachweise und Betreiberfragen

1. **Bio-Status des Betriebs/Sortiments:** Ist GerneGrün als Unternehmen/Betrieb zertifiziert oder bezieht sich „Bioladen“ allein auf die Sortimentsspezialisierung? Welche Bio-Anteile gelten für Gesamtangebot, Warengruppen und Wochenaktionen? Bitte Zertifikate, Kontrollstellen-/Kontrollnummern, Laufzeiten und Nutzungsrechte bereitstellen.
2. **Produktzertifizierungen:** Für jede öffentlich beworbene Position: Beleg, dass das Zertifikat dem konkreten Produkt und der aktuellen Charge/Verkaufsperiode zugeordnet ist; Zertifizierungsstelle, Standard und Gültigkeit. Ein im Datenfeld gespeicherter Name ist kein unabhängiger Nachweis.
3. **„Bioladen-zertifiziert“:** Exakte Bedeutung, ausstellende Stelle, Regelwerk, Prüfverfahren, Gültigkeit, Kennzeichenrechte und Erklärung des Felds `bioladenCertified`. Ist es ein externes Zertifikat, eine interne Lieferantenkategorie oder eine Handelsmarke?
4. **Regionalität:** Verbindliche Definition von „Region“ (z. B. Gemeinde, Bundesland, Radius), Erzeuger-/Lieferantenadresse und Belege je Produkt; Anteil und Bezugsgröße bei „viele“ bzw. „regional“ als allgemeine Sortimentsaussage.
5. **Saisonalität:** Welche Kriterien gelten für Saison-Zuordnung (Erntezeit, Lagerware, Gewächshaus/Import)? Welche Produktliste ist im konkreten Zeitraum gemeint?
6. **Bilder und Siegel:** Freigabe/Rechte für EU-Bio-Logo, Verbandszeichen und Lieferantenlogos; Zuordnung im jeweiligen Bild. Kein selbst gestaltetes Zeichen als unabhängiges Siegel verwenden, falls kein zulässiges Zertifizierungssystem dahintersteht.
7. **Historische Aussage 2022:** Unterlagen zur damaligen Unverpackt-Praxis, loser Ware und behauptetem „Fokus auf biologisch, regional und nachhaltig“.
8. **Zielmarkt:** Die Website-Inhalte nennen Dreieich und führen Deutschland als `addressCountry` im strukturierten LocalBusiness-Datensatz. Bitte klären, ob die Website ausschließlich den deutschen Ladenstandort anspricht oder ob auch Verbraucher:innen in Österreich gezielt beworben werden. Für einen deutschen Zielmarkt sind zusätzlich die einschlägige deutsche Umsetzung und zuständige Rechtsberatung zu prüfen.
9. **Zukunftsclaims:** Im geprüften Content wurde kein konkretes Klima-/Umweltziel bis zu einem künftigen Datum gefunden. Falls solche Ziele außerhalb des Repositorys oder künftig hinzukommen: detaillierter und realistischer öffentlicher Umsetzungsplan, messbare Zwischenziele, notwendige Mittel und regelmäßige unabhängige Prüfung dokumentieren.

## F. Sanity und zukünftige Inhalte

### Was das aktuelle CMS gut vorbereitet

- `weeklyProduceImportProduct` trennt Herkunft, Zertifizierungsangabe und boolesches `bioladenCertified` voneinander.
- Die öffentliche Obst-/Gemüseliste ordnet Herkunft und Zertifizierung konkreten Produkten zu und gibt in den beobachteten Daten unterschiedliche Zertifizierungswerte nicht pauschal als Website-weite Bio-Quote aus.
- `assortmentCategory`, `assortmentEdition`, `startHero`, `aboutPage`, `contactPage` und Produktkarten begrenzen an vielen Stellen Textlängen und Alt-Texte.
- Import- und Veröffentlichungsablauf sind getrennt: Daten werden als Entwurf importiert und regulär veröffentlicht.

### Erkannte CMS-Lücken

- `certification` ist freier Text ohne Zertifizierungsstelle, Standard-ID, Kontrollnummer, Ablaufdatum oder Beleg-/Dokumentreferenz; die Website kann daher nicht zwischen tatsächlicher Zertifizierung und bloßer Lieferantenangabe unterscheiden.
- Das boolesche Feld `bioladenCertified` erzwingt Ja/Nein, aber keine Definition oder Nachweisverknüpfung. Das Frontend mappt `true` direkt auf „Bioladen-zertifiziert“.
- `origin` ist freier Text und erlaubt weder strukturierte Erzeugeradresse noch eine definierte Region oder einen Plausibilitätscheck gegen eine Regionalitätskennzeichnung.
- Freie Felder wie `note`, `label` (nächste Woche), `description`, `badgeText`, SEO-Texte und Wochenkarten können „bio“, „regional“, „nachhaltig“ oder ähnliche Aussagen aufnehmen; eine redaktionelle Hilfe oder Freigabe-Checkliste weist nicht auf Belegpflicht, Produktreichweite oder unmittelbare Erläuterung hin. Das Feld `nextWeekProduct.label` nennt „regional“ und „saisonal“ ausdrücklich als Beispiele.
- Für allgemeine Textclaims gibt es kein Pflichtfeld für Bezugsobjekt (Produkt/Teilaspekt/Unternehmen), Claim-Kategorie, Nachweis, Zeitraum oder Freigabestatus.

### Sinnvolle Verbesserungen für den späteren Betrieb

1. `bioladenCertified` fachlich klären und mit einem klar benannten Status bzw. Programm samt Nachweis-ID und Gültigkeitszeitraum modellieren. Nur bei extern bestätigter, nutzungsberechtigter Zertifizierung „zertifiziert“ ausgeben.
2. Pro Produkt strukturierte Daten vorsehen: Status (zertifiziert/nicht zertifiziert/unbekannt), Standard bzw. Zertifizierungsstelle, Kontroll-/Lizenznummer, Gültigkeitsende, Herkunftsland/Erzeugerregion und Beleg-Referenz. Herkunft nicht mit Bio-Status vermischen.
3. Für redaktionelle Umweltclaims im Studio einen Hilfetext anzeigen: Aussage muss wahr, konkret, unmittelbar beim Claim erläutert und intern belegbar sein; allgemeine Umweltbegriffe und Siegel vor Veröffentlichung zur Prüfung kennzeichnen.
4. Für „regional“ definierte Einzugsgebiete und überprüfbare Kriterien pflegen. Ein „regional“-Label nur anbieten, wenn das Produkt die konfigurierte Region erfüllt; keine globale Überschrift aus einzelnen Treffern ableiten.
5. Für Badge- und SEO-Felder kein automatisches rechtliches Urteil vortäuschen. Eine redaktionelle Freigabe oder ein dokumentierter Claim-Nachweis ist sinnvoller als rein lexikalische Sperrlisten.
6. Vor Veröffentlichung Bildtexte, Logos und Open-Graph-Grafiken mitprüfen; redaktionelle Nachweise müssen nicht zwingend öffentlich verlinkt sein, erforderliche Erläuterungen müssen aber am Claim selbst klar sichtbar sein.

## G. Priorisierte To-do-Liste

| Priorität | Maßnahme | Risiko / Aufwand |
|---:|---|---|
| 1 | Bedeutung und Beleg des Felds `bioladenCertified` klären; Badge-Text nur mit belastbarer Zertifizierungsgrundlage zeigen. | Hoch / niedrig bis mittel |
| 2 | Open-Graph-Standardbild und globales „Bioladen“-Wording überprüfen; neutrales Share-Bild bis zum Nachweis verwenden. | Hoch / niedrig |
| 3 | „Saisonal & regional“ für Wochenkarte eingrenzen und jedes hervorgehobene Produkt anhand Herkunft und Saison prüfen. | Hoch / mittel |
| 4 | „Bio-Sortiment“, Bio-Bäckerei und „Bioladen“ auf Unternehmens-/Warengruppenreichweite untersuchen; Produktclaims direkt zuordnen. | Hoch / mittel |
| 5 | Nachweisordner für Produktzertifikate, Lieferanten, Herkunft und historische Unverpackt-Aussagen anlegen. | Hoch / mittel |
| 6 | Sanity-Felder um strukturierte Zertifizierungs-, Herkunfts- und Gültigkeitsdaten ergänzen; Studio-Hinweise ergänzen. | Mittel / mittel bis hoch |
| 7 | „Besonderes aus der Region“, „viele Produkte aus der Region“ und „Nähe zur Region“ mit definierter Region/Quote prüfen und präzisieren. | Mittel / niedrig |
| 8 | `home-hero-bio-von-hier.png` vor möglicher späterer Nutzung anhand der dargestellten Artikel und tatsächlichen Herkunft erneut freigeben. | Niedrig aktuell / niedrig |
| 9 | Zielmarkt Deutschland/Österreich festhalten und bei tatsächlicher grenzüberschreitender Werbung die passende nationale Umsetzung prüfen. | Mittel / niedrig |

## Auditumfang, Grenzen und nicht geprüfte Inhalte

- Geprüft wurden Projektdateien für Startseite, Wochenübersicht, Sortiment, Über uns, Kontakt, globale Navigation/Footer, Dialoge/Formulartexte, Metadaten, Structured Data, Textinhalte in öffentlichen Sanity-Dokumenten, Sanity-Schemas und die dazu relevanten Assets/Alt-Texte.
- Die öffentliche Sanity-API war read-only erreichbar. Es wurden 11 veröffentlichte, nicht als Asset gespeicherte Dokumente abgefragt; geprüft wurden Startseite, aktuelle Sortimentsausgabe, Wochenliste KW 42/2026, About- und Contact-Dokumente, Sortimentstexte sowie Herstellerdaten. Die aktuelle Liste enthielt 58 Produkte; alle Datensätze hatten eine Herkunft und eine Zertifizierungsangabe. 20 hatten `bioladenCertified=true`. Die Echtheit der Lieferantenbelege oder Zertifikate wurde nicht extern verifiziert.
- Die Referenzen der sieben Sortimentskategorien ließen sich in der öffentlichen Sanity-Abfrage nicht als veröffentlichte Dokumente auflösen. Kategorieüberschriften, Beispielprodukte, Badges und Bilder sind deshalb insoweit **nicht geprüft**; sie sind redaktionell nachzuprüfen.
- `/news-aktionen` und Artikelseiten sind in `docs/ROUTES.md` vorgesehen und werden verlinkt, im aktuellen Projektstand liegt dort jedoch nur eine `.gitkeep`-Datei. Aktuelle News-/Aktionsinhalte, Aktionsblätter und deren dynamische Claims sind daher **nicht geprüft**. Auch später veröffentlichte Sanity-Highlights sind nicht Teil der abgerufenen öffentlichen Query gewesen.
- Keine künftigen Sanity-Entwürfe, private Studio-Inhalte, Verpackungen, Social-Media-Posts außerhalb des Projekts oder externen Lieferantenseiten wurden geprüft. Der Wochenimport zeigt die veröffentlichte Liste; die redaktionelle Übereinstimmung mit dem tatsächlichen Warenbestand bleibt Betreiberprüfung.
- Rasterbilder wurden nicht vollständig einzeln visuell geprüft. Die benannte „Bio von hier“-Grafik wurde eingesehen und ihre Nichtverwendung im aktuellen Hero per Codeabgleich festgestellt; SVG-Text und relevante im Code referenzierte Bildbeschreibungen wurden durchsucht. Zertifikats-/Logonutzungsrechte müssen separat geprüft werden.
- Im Anschluss an den Audit wurden gezielte Code- und Schemaänderungen vorgenommen und die beschriebenen Korrekturen an veröffentlichten Sanity-Dokumenten geschrieben. Es wurden keine Tests oder Builds ausgeführt. Das Repository enthielt bereits vor diesen Änderungen zahlreiche uncommittete Änderungen; sie wurden nicht bereinigt.

## Rechtsquellen

- [Richtlinie (EU) 2024/825 – EUR-Lex](https://eur-lex.europa.eu/eli/dir/2024/825/oj) – EmpCo-Änderungen; Anwendung ab 27.09.2026.
- [Gesetz gegen den unlauteren Wettbewerb – UWG, konsolidierte Fassung](https://www.gesetze-im-internet.de/uwg_2004/BJNR141400004.html) – insbesondere § 5 und Anhang Nr. 2a, 4a, 4b und 4c.
- [UWG-Anhang – Gesetze im Internet](https://www.gesetze-im-internet.de/uwg_2004/anhang.html) – deutsche Schwarze Liste zu Nachhaltigkeitssiegeln, allgemeinen Umweltaussagen, Übertragung auf das Gesamtprodukt/-unternehmen und Klimaneutralitätsaussagen.
- Rechtsakt: Drittes Gesetz zur Änderung des UWG vom 12.02.2026, BGBl. 2026 I Nr. 43; die aktuelle UWG-Fassung oben enthält die Änderungen mit Geltung ab 27.09.2026.

**Rechtsanwendungshinweis:** Maßgeblich für die Umsetzung sind das deutsche UWG und die unionsrechtlichen Vorgaben. Die Einordnung einzelner Aussagen bleibt kontextabhängig und ersetzt keine anwaltliche Prüfung. Der Produktname „bioladen*“ wird hier als Markenname erkannt und ausgewiesen, nicht als Zertifizierungsstelle oder Gütesiegel.

## H. Umsetzungsstand, verbleibende Nachweise und Grenzen

### Umgesetzt

- Globale Metadaten, Startseiten-SEO, Header-Claim, Startseiten-Fallbacks und Open-Graph-Grafik verwenden neutrale Sortiments- und Ortsangaben. Der öffentliche Startseiten-Hero nennt keine Produkte „aus der Region“.
- „Saisonal & regional“ wurde aus der Wochenkarte entfernt; die publizierte Sortimentskategorie Obst & Gemüse erhielt eine neutrale Beschreibung. Unbelegte Saison-/Herkunftsbeispiele in Vorschaudaten und Sanity-Hilfetexten wurden entfernt.
- Der Import erkennt ausschließlich ein eindeutiges `b*`-Präfix aus dem Originalnamen als Marke `bioladen*`. Der Name bleibt erhalten. Die Marke wird ohne Siegelgestaltung als Produktmarke gezeigt. `bioladenCertified` bleibt nur als Legacy-Feld bestehen und erzeugt keinen öffentlichen Claim.
- Herkunft und Zertifizierungs-/Verbandsangabe werden getrennt und produktspezifisch ausgegeben. Zertifizierungsangaben erscheinen als nicht unabhängig geprüfte Lieferantenangabe; der Import setzt den Bio-Status auf „unbekannt“ und kann keinen bestätigten Status erzeugen.
- In Sanity wurden die veröffentlichten Texte `startPage`, `aboutPage` und `contactPage` einschließlich SEO angepasst; außerdem wurden die öffentlich sichtbare Kategorie-/Bildtexte für Obst & Gemüse neutralisiert. Einzelne produktbezogene Bildtexte wurden ebenfalls entschärft.
- Schemahilfen für Hero, Sortimentskarten/-ausgaben, Wochenprodukte/-gruppen, Vorschauprodukte, About-/Contact-SEO und Kategorien weisen nun auf konkreten Aussagebezug und Belegbarkeit hin. Es wurden keine automatischen lexikalischen Sperren eingeführt.

### Noch offen / nicht verifiziert

- Die Echtheit und Gültigkeit der im Wochenimport übermittelten Verbands-/Bio-Angaben, die konkrete Produktzuordnung und die Berechtigung zur Siegelführung wurden nicht unabhängig geprüft. Sie werden deshalb nur als Lieferantenangabe dargestellt.
- Der deutsche Zielmarkt und Geltungsbeginn wurden für diesen Bericht zugrunde gelegt; die rechtliche Bewertung einzelner Aussagen sollte bei Bedarf eine deutsche Wettbewerbsrechtsberatung abschließen.
- Die Website-Kategorien, zukünftige Aktions-/News-Inhalte und noch nicht veröffentlichte Sanity-Entwürfe sind nicht vollständig geprüft. Redaktionelle Warnhinweise verringern das Risiko, sind aber kein Claim-Freigabesystem.
- Die historische Unverpackt-Darstellung wurde auf eine sachliche Beschreibung reduziert; die tatsächliche Richtigkeit der verbleibenden historischen Angaben ist nicht unabhängig verifiziert.
- Eine zusätzliche allgemeine Erklärung zu „Was unsere Kennzeichnungen bedeuten“ wurde nicht ergänzt: Die derzeitige Darstellung zeigt Herkunft, Marke und Lieferantenangabe direkt am Produkt und erläutert die fehlende unabhängige Prüfung unmittelbar dort.

Der vollständige technische Überblick mit Dateibezug steht in [empco-implementation-summary.md](empco-implementation-summary.md).
