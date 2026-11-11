from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle,
    PageBreak, HRFlowable, Flowable, KeepTogether
)
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "pdf" / "GerneGruen-Anleitung-Wocheninhalte-Sanity.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)
LOGO = ROOT / "public" / "graphics" / "gernegruen-logo-subline-dark-green.png"
FONT_FILE = ROOT / "public" / "fonts" / "Nunito-Variable.ttf"

# Use static weights derived from the supplied variable Nunito font.
FONT_REGULAR = ROOT / "tmp" / "pdfs" / "Nunito-Regular.ttf"
FONT_BOLD = ROOT / "tmp" / "pdfs" / "Nunito-Bold.ttf"
pdfmetrics.registerFont(TTFont("Nunito", str(FONT_REGULAR)))
pdfmetrics.registerFont(TTFont("Nunito-Bold", str(FONT_BOLD)))

GREEN = colors.HexColor("#08522B")
GREEN2 = colors.HexColor("#177142")
LIME = colors.HexColor("#9CC449")
GOLD = colors.HexColor("#D8C77D")
INK = colors.HexColor("#2E342F")
MUTED = colors.HexColor("#657064")
PAPER = colors.HexColor("#FCF7EE")
PALE = colors.HexColor("#F4F0E3")
SCREEN = colors.HexColor("#EFECE4")
LINE = colors.HexColor("#C9C9B9")

PAGE_W, PAGE_H = A4
LEFT = 45
RIGHT = 45
TOP = 49
BOTTOM = 45
BODY_W = PAGE_W - LEFT - RIGHT

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverKicker", fontName="Nunito-Bold", fontSize=9, leading=13, textColor=LIME, spaceAfter=10, tracking=1.3))
styles.add(ParagraphStyle(name="CoverTitle", fontName="Nunito-Bold", fontSize=29, leading=34, textColor=colors.white, spaceAfter=12))
styles.add(ParagraphStyle(name="CoverBody", fontName="Nunito", fontSize=12, leading=17, textColor=colors.white))
styles.add(ParagraphStyle(name="CoverSub", fontName="Nunito", fontSize=11, leading=16, textColor=INK, spaceAfter=8))
styles.add(ParagraphStyle(name="H1Guide", fontName="Nunito-Bold", fontSize=20, leading=25, textColor=GREEN, spaceAfter=5, keepWithNext=True))
styles.add(ParagraphStyle(name="Subhead", fontName="Nunito", fontSize=10, leading=14, textColor=MUTED, spaceAfter=9, keepWithNext=True))
styles.add(ParagraphStyle(name="BodyGuide", fontName="Nunito", fontSize=10.1, leading=14.4, textColor=INK, spaceAfter=6))
styles.add(ParagraphStyle(name="SmallGuide", fontName="Nunito", fontSize=8.5, leading=11, textColor=MUTED, spaceAfter=4))
styles.add(ParagraphStyle(name="StepText", fontName="Nunito", fontSize=10.1, leading=14.3, textColor=INK))
styles.add(ParagraphStyle(name="StepNum", fontName="Nunito-Bold", fontSize=10.5, leading=14, textColor=GREEN, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="TableHead", fontName="Nunito-Bold", fontSize=9, leading=11, textColor=colors.white))
styles.add(ParagraphStyle(name="TableCell", fontName="Nunito", fontSize=8.9, leading=12, textColor=INK))
styles.add(ParagraphStyle(name="Caption", fontName="Nunito", fontSize=8.2, leading=10.5, textColor=MUTED, alignment=TA_CENTER, spaceBefore=4))
styles.add(ParagraphStyle(name="CalloutText", fontName="Nunito", fontSize=9.5, leading=13.2, textColor=INK))
styles.add(ParagraphStyle(name="PlaceholderTitle", fontName="Nunito-Bold", fontSize=10, leading=14, textColor=GREEN, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="PlaceholderNote", fontName="Nunito", fontSize=8.7, leading=12, textColor=MUTED, alignment=TA_CENTER))

def P(text, style="BodyGuide"):
    return Paragraph(text, styles[style])

def heading(title, subtitle=None):
    result = [P(title, "H1Guide"), HRFlowable(width="100%", thickness=1, color=GOLD, spaceBefore=2, spaceAfter=8)]
    if subtitle:
        result.append(P(subtitle, "Subhead"))
    return result

def step(number, text):
    row = Table([[P(str(number), "StepNum"), P(text, "StepText")]], colWidths=[25, BODY_W - 25])
    row.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 2), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return row

def callout(text):
    t = Table([[P(text, "CalloutText")]], colWidths=[BODY_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD),
        ("LINEBEFORE", (0, 0), (0, -1), 3, colors.HexColor("#F1820C")),
        ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    return t

class ScreenshotPlaceholder(Flowable):
    def __init__(self, label, instruction, height=177):
        super().__init__()
        self.width = BODY_W
        self.height = height
        self.label = label
        self.instruction = instruction

    def draw(self):
        c = self.canv
        c.saveState()
        c.setFillColor(SCREEN)
        c.roundRect(0, 0, self.width, self.height, 6, fill=1, stroke=0)
        c.setStrokeColor(colors.HexColor("#A5AA9E"))
        c.setDash(4, 3)
        c.setLineWidth(0.8)
        c.roundRect(5, 5, self.width - 10, self.height - 10, 4, fill=0, stroke=1)
        c.setDash()
        title = P("SCREENSHOT HIER EINFÜGEN", "PlaceholderTitle")
        title.wrapOn(c, self.width - 36, 24)
        title.drawOn(c, 18, self.height / 2 + 15)
        note = P(f"<b>{self.label}</b><br/>{self.instruction}", "PlaceholderNote")
        note.wrapOn(c, self.width - 50, 70)
        note.drawOn(c, 25, self.height / 2 - 38)
        c.restoreState()

def table(headers, rows, widths):
    data = [[P(x, "TableHead") for x in headers]]
    data.extend([[P(str(x), "TableCell") for x in row] for row in rows])
    t = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        if i % 2 == 0:
            cmds.append(("BACKGROUND", (0, i), (-1, i), colors.HexColor("#F4F1E6")))
    t.setStyle(TableStyle(cmds))
    return t

def draw_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    if doc.page > 1:
        canvas.setFillColor(GREEN)
        canvas.rect(0, PAGE_H - 25, PAGE_W, 25, fill=1, stroke=0)
        canvas.setFillColor(colors.white)
        canvas.setFont("Nunito-Bold", 8)
        canvas.drawString(LEFT, PAGE_H - 16.5, "GERNEGRÜN / ANLEITUNG SANITY")
        canvas.setStrokeColor(GOLD)
        canvas.setLineWidth(0.75)
        canvas.line(LEFT, 31, PAGE_W - RIGHT, 31)
        canvas.setFillColor(MUTED)
        canvas.setFont("Nunito", 8)
        canvas.drawString(LEFT, 19, "Wocheninhalte bearbeiten")
        canvas.drawRightString(PAGE_W - RIGHT, 19, f"{doc.page}")
    canvas.restoreState()

doc = SimpleDocTemplate(
    str(OUT), pagesize=A4, leftMargin=LEFT, rightMargin=RIGHT,
    topMargin=TOP, bottomMargin=BOTTOM, title="GerneGrün - Wocheninhalte in Sanity bearbeiten",
    author="GerneGrün", subject="Anleitung für Obst und Gemüse, Brot, Kuchen und Aktionen in Sanity"
)

story = []
# Cover, following the reference guide's compact branded title page.
lw, lh = ImageReader(str(LOGO)).getSize()
logo = Image(str(LOGO), width=94, height=94 * lh / lw)
story += [Spacer(1, 29), logo, Spacer(1, 31), P("EINFACH ERKLÄRT", "CoverKicker")]
cover = Table([[[P("Wocheninhalte<br/>in Sanity bearbeiten", "CoverTitle"), P("Eine Schritt-für-Schritt-Anleitung für GerneGrün. Hier lernst du, Obst und Gemüse, Brot, Kuchen und Aktionen einzutragen - entweder in <b>Inhalte</b> oder direkt in der <b>Live-Bearbeitung</b>.", "CoverBody")]]], colWidths=[BODY_W])
cover.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), GREEN), ("LEFTPADDING",(0,0),(-1,-1),24), ("RIGHTPADDING",(0,0),(-1,-1),24),
    ("TOPPADDING",(0,0),(-1,-1),22), ("BOTTOMPADDING",(0,0),(-1,-1),24),
]))
story += [cover, Spacer(1, 17), P("Für alle, die GerneGrüns Wochenangebote pflegen möchten - ohne technische Vorkenntnisse.", "CoverSub"), Spacer(1, 5), callout("<b>Der einfache Einstieg:</b> Vorhandene Inhalte kannst du in der Live-Bearbeitung direkt auf der Website anklicken. Neue Wochenlisten, Ausgaben und Aktionsblätter legst du am übersichtlichsten zuerst unter <b>Inhalte</b> an. Änderungen sind erst online, wenn du sie veröffentlichst."), PageBreak()]

# Page 2: map.
story += heading("Wo finde ich was?", "In Sanity gibt es zwei Wege. Für neue Einträge ist der Bereich Inhalte am übersichtlichsten.")
story += [table(["Bereich", "Dort pflegst du"], [
    ("SEITEN > Diese Woche", "Obst- und Gemüselisten sowie Seitentexte für die Seite Diese Woche."),
    ("INHALTE > Wochenangebote (Brot, Kuchen & Aktionen)", "Brot und Kuchen der Woche sowie die Aktionsvorschau auf der Startseite."),
    ("INHALTE > Obst- & Gemüsekategorien", "Kategorien, zum Beispiel Obst, Gemüse oder Pilze. Produkte werden einer Kategorie zugeordnet."),
    ("SEITEN > Startseite", "Die Sortimentsausgaben, die für die Startseiten-Vorschau freigegeben sind."),
    ("Live-Bearbeitung", "Website-Vorschau mit anklickbaren Texten, Produktzeilen und Karten."),
], [180, BODY_W - 180]), Spacer(1, 10), ScreenshotPlaceholder("Sanity-Navigation", "Zeige die Seitenleiste mit SEITEN, INHALTE, Obst- & Gemüselisten und Wochenangebote. Persönliche Kontodaten bitte ausblenden.", 165), Spacer(1, 9), callout("<b>Merke:</b> Die Obst- und Gemüselisten erscheinen an zwei Stellen in der Navigation. Beide öffnen dieselben Listen. Für diese Anleitung verwenden wir den Weg <b>SEITEN > Diese Woche</b>."), PageBreak()]

# Page 3: new list.
story += heading("1. Eine neue Obst- und Gemüseliste anlegen", "Lege für jede Woche eine eigene Liste an. So bleibt die vorherige Liste als Archiv erhalten.")
story += [step(1, "Öffne <b>SEITEN > Diese Woche > Obst- & Gemüselisten</b>."), step(2, "Klicke oben in der Listen-Spalte auf <b>+</b>, um eine neue Liste anzulegen."), step(3, "Trage eine gut erkennbare Bezeichnung ein, zum Beispiel <i>Obst & Gemüse - KW 46/2026</i>. Wähle außerdem die Kalenderwoche und das Jahr."), step(4, "Lasse <b>Auf der Website anzeigen</b> eingeschaltet. Eine archivierte Liste wird nicht angezeigt. Für eine neue Woche muss <b>Archiviert</b> ausgeschaltet sein."), step(5, "Speichere deine Änderungen als Entwurf. Prüfe erst die Vorschau, dann klicke auf <b>Veröffentlichen</b>."), Spacer(1, 5), ScreenshotPlaceholder("Listen und Wochenangaben", "Zeige die Sanity-Liste der Wochen mit der Plus-Schaltfläche sowie eine geöffnete Liste mit Kalenderwoche, Jahr und Aktiv-Schalter.", 210), Spacer(1, 8), callout("<b>Welche Woche erscheint online?</b> Angezeigt wird die zuletzt bearbeitete veröffentlichte Liste, wenn sie aktiviert und nicht archiviert ist. Beim Wechsel: gewünschte Liste aktivieren und die bisherige Liste deaktivieren. Die Sortimentsausgabe mit Brot und Kuchen wird getrennt ausgewählt."), PageBreak()]

# Page 4: products and categories.
story += heading("2. Produkte einzeln hinzufügen", "Die Produkte stehen direkt in der Wochenliste. Eine Excel-Datei wird dafür nicht benötigt.")
story += [step(1, "Öffne in der Wochenliste den Bereich <b>Produkte</b> und klicke bei der Produktliste auf <b>Element hinzufügen</b>."), step(2, "Fülle die Angaben zum Produkt aus. Name, Einheit, Preis und Sortierung sind wichtig."), step(3, "Wähle im Feld <b>Kategorie</b> eine passende Obst- und Gemüsekategorie. Sie wird später als Überschrift auf der Website verwendet."), step(4, "Füge weitere Produkte hinzu. Kleinere Sortiernummern erscheinen weiter oben. Speichere und veröffentliche die Liste, wenn sie geprüft ist."), Spacer(1, 5), table(["Feld", "Was trägst du ein?"], [
    ("Produktname", "Der Name, wie er auf der Website erscheinen soll."),
    ("Einheit und Preis", "Zum Beispiel kg und 2,49. Der Preis gilt pro angegebener Einheit."),
    ("Kategorie", "Obst, Gemüse, Salate & Kräuter, Pilze oder eine weitere Kategorie."),
    ("Marke / Herkunft", "Nur eintragen, wenn die Angabe für genau dieses Produkt stimmt."),
    ("Verbands-/Bio-Angabe", "Separat von der Marke eintragen, zum Beispiel Bioland oder Demeter."),
], [125, BODY_W - 125]), Spacer(1, 9), ScreenshotPlaceholder("Produktfelder und Kategorie", "Zeige ein geöffnetes Produktelement mit Name, Einheit, Preis und dem Auswahlfeld Kategorie.", 183), Spacer(1, 6), P("Wenn eine passende Kategorie fehlt, lege sie zuerst unter <b>INHALTE > Obst- & Gemüsekategorien</b> an. Sobald ein Produkt zugeordnet ist, wird die Kategorie auf der Seite Diese Woche als eigene Produktgruppe angezeigt. In der Kategorie kannst du außerdem die Reihenfolge und die Berücksichtigung im kleinen Startseiten-Teaser einstellen."), PageBreak()]

# Page 5: bread/cake.
story += heading("3. Brot und Kuchen der Woche pflegen", "Brot und Kuchen gehören zu einer Sortimentsausgabe. Beide Angebote werden dort gemeinsam bearbeitet.")
story += [step(1, "Öffne <b>INHALTE > Wochenangebote (Brot, Kuchen & Aktionen)</b>. Klicke auf <b>+</b>, um eine neue Sortimentsausgabe anzulegen, oder öffne eine vorhandene Ausgabe."), step(2, "Unter <b>Freigabe & Zeitraum</b> vergib einen internen Namen, zum Beispiel <i>Wochenangebote KW 46/2026</i>. Aktiviere <b>Ausgabe freigeben</b> und trage den Zeitraum ein."), step(3, "Öffne <b>Wochenangebote</b>. Unter <b>Brot der Woche</b> und <b>Kuchen der Woche</b> trägst du Produktname, Zutaten und bei Bedarf Preis ein."), step(4, "Prüfe die Angaben und veröffentliche die Ausgabe."), Spacer(1, 5), table(["Feld", "Verwendung"], [
    ("Produktname", "Name des Brots oder Kuchens."),
    ("Zutaten", "Kleiner Beschreibungstext auf den Angebotskarten und in der Vorbestellliste."),
    ("Preis in Euro", "Optional. Wenn vorhanden, wird der Preis auch für die Vorbestellung verwendet."),
    ("Datumsangabe beginnt / endet", "Redaktionelle Angabe. Sie schaltet die Ausgabe nicht automatisch um."),
], [155, BODY_W - 155]), Spacer(1, 8), ScreenshotPlaceholder("Brot und Kuchen bearbeiten", "Zeige in der Sortimentsausgabe die Gruppe Wochenangebote mit den Feldern für Brot der Woche und Kuchen der Woche.", 174), Spacer(1, 6), callout("<b>Damit die neue Ausgabe erscheint:</b> Öffne zusätzlich <b>SEITEN > Startseite > Aktuelles Sortiment > Sortimentsausgaben</b> und füge die neue Ausgabe hinzu. Deaktiviere die alte Ausgabe, wenn sie nicht mehr angezeigt werden soll. Prüfe, dass KW und Zeitraum zur Obst- und Gemüseliste passen."), PageBreak()]

# Page 6: homepage action preview.
story += heading("4. Die Aktionsvorschau auf der Startseite ändern", "Die Aktionskarte auf der Startseite ist eine kurze Vorschau. Sie ist kein Aktions-PDF.")
story += [step(1, "Öffne die passende Sortimentsausgabe unter <b>INHALTE > Wochenangebote (Brot, Kuchen & Aktionen)</b>."), step(2, "Öffne den Bereich <b>Wochenangebote > Aktionsvorschau</b>. Trage Überschrift und Einleitung ein."), step(3, "Füge bis zu zwei Highlights hinzu. Der Titel und die kurze Beschreibung erscheinen auf der Aktionskarte."), step(4, "Prüfe den Aktionslink. Er soll zur Aktionssektion führen. Das voreingestellte Ziel lautet <b>/diese-woche#aktionen</b>."), step(5, "Veröffentliche die Sortimentsausgabe. Stelle auch sicher, dass sie auf der Startseite unter <b>Aktuelles Sortiment > Sortimentsausgaben</b> verknüpft und freigegeben ist."), Spacer(1, 6), ScreenshotPlaceholder("Aktionsvorschau in der Sortimentsausgabe", "Zeige die Felder Überschrift, Einleitung, Highlights und Aktionslink in der Gruppe Aktionsvorschau.", 210), Spacer(1, 8), P("Die drei festen Bereiche für Obst und Gemüse, Brot, Kuchen und Aktionen gehören zur Website-Gestaltung. Du änderst hier die Inhalte und den Aktionslink, nicht die Illustrationen oder das Seitenlayout."), PageBreak()]

# Page 7: promo PDF.
story += heading("5. Ein Aktionsblatt als PDF hinzufügen", "PDF-Aktionsblätter erscheinen weiter unten auf der Seite Diese Woche.")
story += [step(1, "Öffne <b>SEITEN > Diese Woche > Seitentexte & SEO</b> und dort die Gruppe <b>Aktionen</b>."), step(2, "Scrolle zu <b>Aktionsblätter (mehrere PDFs)</b> und klicke auf <b>Element hinzufügen</b>."), step(3, "Trage Titel und Beschreibung ein. Lade bei <b>PDF-Datei</b> das neue Aktionsblatt hoch."), step(4, "Fülle <b>Gültig ab</b>, <b>Gültig bis</b> und <b>Angezeigter Zeitraum</b> aus. Schalte <b>Aktionsblatt aktiv</b> ein."), step(5, "Veröffentliche die Seitentexte. Ein aktives Blatt wird angezeigt, bis du es deaktivierst. Die Gültigkeitsdaten und der angezeigte Zeitraum sind redaktionelle Angaben und schalten es nicht automatisch aus."), Spacer(1, 6), ScreenshotPlaceholder("Aktionsblatt und PDF-Felder", "Zeige im Dokument Seitentexte & SEO die Gruppe Aktionen und ein ausgeklapptes Aktionsblatt mit Titel, PDF, Gültigkeit und Aktiv-Schalter.", 221), Spacer(1, 8), callout("<b>Unterschied:</b> Die Aktionsvorschau auf der Startseite wird in der Sortimentsausgabe gepflegt. Das herunterladbare Aktionsblatt wird unter Seitentexte & SEO auf der Seite Diese Woche gepflegt."), PageBreak()]

# Page 8: live editing.
story += heading("6. Vorhandene Inhalte live bearbeiten", "In der Live-Bearbeitung siehst du die Website und klickst den Inhalt an, den du ändern möchtest.")
story += [step(1, "Klicke oben im Studio auf <b>Live-Bearbeitung</b> und öffne in der Vorschau die passende Seite."), step(2, "Klicke in der Vorschau auf eine Produktzeile, die Brot- oder Kuchenkarte oder die Aktionskarte. Rechts öffnet sich das dazugehörige Sanity-Dokument."), step(3, "Ändere rechts die Felder. Bei Obst und Gemüse kannst du in der Produktliste über <b>Element hinzufügen</b> ein weiteres Produkt ergänzen."), step(4, "Prüfe die Vorschau. Mit <b>Veröffentlichen</b> wird die Änderung online gestellt; bis dahin bleibt sie ein Entwurf."), Spacer(1, 5), ScreenshotPlaceholder("Live-Bearbeitung mit geöffnetem Feld", "Zeige die Website-Vorschau links und rechts das geöffnete Sanity-Formular für ein Produkt oder eine Angebotskarte. Persönliche Kontodaten ausblenden.", 235), Spacer(1, 8), callout("<b>Wenn ein Inhalt noch gar nicht vorhanden ist:</b> Lege zuerst die neue Wochenliste, Sortimentsausgabe oder das Aktionsblatt unter <b>Inhalte</b> an. In der Live-Bearbeitung kann man nur etwas anklicken, das bereits in der Vorschau erscheint."), PageBreak()]

# Page 9: live examples and final checks.
story += heading("7. Was lässt sich live bearbeiten?", "Die Live-Bearbeitung eignet sich besonders, wenn du schon siehst, welchen Inhalt du ändern möchtest.")
story += [table(["Du möchtest ändern", "In der Vorschau anklicken"], [
    ("Obst oder Gemüse", "Produktzeile in der Frischeliste; rechts die Produktfelder öffnen."),
    ("Produktgruppe", "Überschrift der Gruppe, zum Beispiel Gemüse oder Pilze."),
    ("Brot oder Kuchen", "Die jeweilige Wochenkarte; rechts Produktname und Zutaten ändern."),
    ("Aktionsvorschau", "Aktionskarte auf der Startseite; rechts Überschrift, Text oder Highlights ändern."),
    ("Aktions-PDF", "Aktionsblatt auf der Seite Diese Woche; rechts Titel, Datei oder Zeitraum ändern."),
], [125, BODY_W - 125]), Spacer(1, 13), P("<b>Bevor du auf Veröffentlichen klickst</b>", "BodyGuide"), step("✓", "Stimmen Kalenderwoche und Jahr? Prüfe Obst- und Gemüseliste sowie Sortimentsausgabe getrennt."), step("✓", "Sind Produktname, Einheit, Preis und Kategorie richtig? Herkunfts- und Bio-Angaben müssen zum Produkt passen."), step("✓", "Ist die gewünschte Liste oder Ausgabe aktiviert? Alte Inhalte bei einem Wechsel deaktivieren."), step("✓", "Ist das Aktions-PDF korrekt und der Zeitraum aktuell?"), step("✓", "Sieht die Vorschau am Desktop und auf dem Smartphone gut aus?"), Spacer(1, 13), callout("<b>Änderung erscheint nicht?</b> Prüfe zuerst, ob du das richtige Dokument veröffentlicht hast und ob die Liste oder Sortimentsausgabe aktiviert ist. Lade die Website danach neu. Für neue Dokumente nutze den normalen Weg unter Inhalte."), Spacer(1, 16), P("GerneGrün | Der Bioladen in Dreieich", "H1Guide"), P("Diese Anleitung zeigt die redaktionelle Pflege von Wocheninhalten im Sanity Studio. Für Fragen zum Zugang oder zu einer fehlenden Funktion wende dich an die zuständige Projektperson.", "SmallGuide")]

doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)
print(OUT)
