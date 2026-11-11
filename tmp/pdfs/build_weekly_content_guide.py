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
OUT = ROOT / "output" / "pdf" / "GerneGruen-Anleitung-Wocheninhalte-Sanity-aktualisiert.pdf"
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
styles.add(ParagraphStyle(name="ScreenshotCaption", fontName="Nunito", fontSize=8.1, leading=10.4, textColor=MUTED, alignment=TA_LEFT))

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

SCREEN_DIR = Path(r"C:\Users\Johannes\AppData\Local\Temp")
SCREENS = {
    "nav": SCREEN_DIR / "codex-clipboard-d7282333-05bf-40ae-9ce7-3fd2651d23cc.png",
    "new_list": SCREEN_DIR / "codex-clipboard-a6a91f8a-a58b-4809-a2c7-108b23eb04a7.png",
    "week": SCREEN_DIR / "codex-clipboard-d67d7734-c3c6-4fb9-afb1-ad49897bd119.png",
    "add_product": SCREEN_DIR / "codex-clipboard-97e8327e-4e16-4bbf-9d05-82d91caf0509.png",
    "product_form": SCREEN_DIR / "codex-clipboard-5ae4a0f8-9a04-4ef7-809d-34043a4aaa60.png",
    "category_dropdown": SCREEN_DIR / "codex-clipboard-3bbd6749-f7f8-456a-ac65-7f4b65689e4a.png",
    "category_list": SCREEN_DIR / "codex-clipboard-862bc8c5-35f1-49fa-a299-5069799f801e.png",
    "new_category": SCREEN_DIR / "codex-clipboard-da8b3e01-c8d7-472d-bb26-29d81cdfd355.png",
    "bread_cake": SCREEN_DIR / "codex-clipboard-88685764-5a60-4fd9-be3d-cbc2ba89214b.png",
    "live_edit": SCREEN_DIR / "codex-clipboard-15579b18-a23c-4754-95c8-c3bfebb16a10.png",
}

def screenshot(key, caption, max_width=BODY_W, max_height=230):
    path = SCREENS[key]
    if not path.exists():
        raise FileNotFoundError(f"Screenshot fehlt: {path}")
    img = Image(str(path), width=max_width, height=max_height, kind="proportional", hAlign="CENTER")
    frame = Table([[img], [P(caption, "ScreenshotCaption")]], colWidths=[max_width])
    frame.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (0, 0), 7), ("BOTTOMPADDING", (0, 0), (0, 0), 2),
        ("TOPPADDING", (0, 1), (0, 1), 4), ("BOTTOMPADDING", (0, 1), (0, 1), 7),
    ]))
    return frame

def screenshot_pair(left_key, left_caption, right_key, right_caption, width=BODY_W / 2 - 5, height=155):
    left = screenshot(left_key, left_caption, width, height)
    right = screenshot(right_key, right_caption, width, height)
    pair = Table([[left, right]], colWidths=[width + 2, width + 2], hAlign="LEFT")
    pair.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return pair

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
cover = Table([[[P("Produktlisten &amp;<br/>Gebäck aktualisieren", "CoverTitle"), P("Eine Schritt-für-Schritt-Anleitung für GerneGrün. Hier lernst du, Obst und Gemüse, Brot, Kuchen und Aktionen einzutragen - über <b>Inhalte</b> oder direkt in der <b>Live-Bearbeitung</b>.", "CoverBody")]]], colWidths=[BODY_W])
cover.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), GREEN), ("LEFTPADDING",(0,0),(-1,-1),24), ("RIGHTPADDING",(0,0),(-1,-1),24),
    ("TOPPADDING",(0,0),(-1,-1),22), ("BOTTOMPADDING",(0,0),(-1,-1),24),
]))
story += [cover, Spacer(1, 17), P("Für alle, die GerneGrüns Wochenangebote pflegen möchten - ohne technische Vorkenntnisse.", "CoverSub"), Spacer(1, 5), callout("<b>Empfohlene Methode:</b> Obst- und Gemüselisten pflegst du am übersichtlichsten unter <b>Inhalte</b>. Brot, Kuchen und Aktionsinhalte kannst du dort oder über die <b>Live-Bearbeitung</b> ändern. Änderungen sind erst online, wenn du sie veröffentlichst."), PageBreak()]

# Page 2: navigation and start.
story += heading("Empfohlener Weg: Inhalte", "Für eine neue Obst- und Gemüseliste gehst du direkt über den Bereich Inhalte.")
story += [step(1, "Melde dich im Sanity Studio an."), step(2, "Wähle links <b>INHALTE</b> und danach <b>Obst- &amp; Gemüselisten</b>."), step(3, "Die vorhandenen Listen erscheinen rechts. Klicke oben in dieser Spalte auf <b>+</b>, um eine neue Liste anzulegen."), Spacer(1, 7), screenshot("nav", "INHALTE → Obst- &amp; Gemüselisten. Das Plus oben rechts legt eine neue Wochenliste an.", BODY_W, 235), Spacer(1, 8), callout("<b>Hinweis:</b> Die Obst- &amp; Gemüseliste ist ein eigenes Dokument mit Produkten. Sie wird getrennt von der Sortimentsausgabe für Brot, Kuchen und die Startseiten-Aktionsvorschau gepflegt."), PageBreak()]

# Page 3: new list.
story += heading("1. Wochenliste benennen und freigeben", "Lege für jede Woche eine eigene Liste an. Die vorherigen Listen bleiben so als Archiv erhalten.")
story += [step(1, "Trage bei <b>Bezeichnung</b> einen klaren Namen ein, zum Beispiel <i>Obst &amp; Gemüse – KW 46/2026</i>."), step(2, "Fülle <b>Kalenderwoche</b> und <b>Jahr</b> passend aus."), step(3, "Lasse <b>Auf der Website anzeigen</b> eingeschaltet. Für eine neue Woche muss <b>Archiviert</b> ausgeschaltet sein."), step(4, "Öffne danach den Bereich <b>Produkte</b>, um die Produkte einzutragen."), Spacer(1, 6), screenshot("new_list", "Neue Liste: Name, Kalenderwoche, Jahr und Schalter für die Website-Anzeige.", BODY_W, 205), Spacer(1, 6), callout("Die zuletzt bearbeitete, veröffentlichte und aktivierte Liste wird auf der Website angezeigt. Beim Wochenwechsel die neue Liste einschalten und die bisherige deaktivieren. Prüfe vor dem Veröffentlichen, dass KW und Jahr stimmen."), PageBreak()]

# Page 4: products and categories.
story += heading("2. Produkte hinzufügen und ausfüllen", "Jedes Produkt wird als eigener Eintrag in der Wochenliste gespeichert.")
story += [step(1, "Klicke im Abschnitt <b>Produkte</b> auf <b>Element hinzufügen</b>."), step(2, "Trage den Produktnamen ein. Ergänze Einheit, Einheitart und Preis, wenn vorhanden."), step(3, "Wähle bei <b>Kategorie</b> die passende Gruppe, zum Beispiel Obst oder Gemüse."), step(4, "Trage die Sortierposition ein: <b>1 steht ganz oben</b>; je höher die Zahl, desto weiter unten erscheint das Produkt."), step(5, "Marke, Herkunftsland, Herkunftsregion und Bio-/Verbandsangabe nur ergänzen, wenn sie für dieses Produkt stimmen."), Spacer(1, 5), screenshot("add_product", "In der Produkte-Ansicht über Element hinzufügen einen einzelnen Produkteintrag ergänzen.", BODY_W, 140), Spacer(1, 7), screenshot_pair("product_form", "Produktdaten: Name, Einheit und Preis.", "category_dropdown", "Kategorieauswahl für das Produkt.", BODY_W / 2 - 5, 205), Spacer(1, 7), callout("Bei Stückware wähle <b>Stk.</b> und die Einheitart <b>Stück</b>. Bei gewichtsabhängigen Produkten wähle <b>kg</b> und <b>Kilogramm</b>. Danach Liste prüfen und veröffentlichen."), PageBreak()]

# Page 5: bread/cake.
story += heading("3. Kategorien verwalten", "Produkte erscheinen im Frontend unter der Kategorie, die du ihnen hier zuweist.")
story += [step(1, "Öffne <b>INHALTE > Obst- &amp; Gemüsekategorien</b>."), step(2, "Klicke oben in der Kategorienliste auf <b>+</b>."), step(3, "Trage den Kategorienamen ein, zum Beispiel Pilze oder Salate &amp; Kräuter, und wähle die Reihenfolge auf der Website."), step(4, "Aktiviere <b>Im Startseiten-Teaser berücksichtigen</b>, wenn die Kategorie auch in der kleinen Startseiten-Vorschau mitgedacht werden soll."), step(5, "Veröffentliche die Kategorie. Gehe danach zurück zur Wochenliste und ordne die passenden Produkte dieser Kategorie zu."), Spacer(1, 7), screenshot_pair("category_list", "Bestehende Kategorien unter Inhalte.", "new_category", "Neue Kategorie: Name, Reihenfolge und Startseiten-Teaser.", BODY_W / 2 - 5, 205), Spacer(1, 8), callout("Neue Kategorien können dynamisch als Produktgruppen auf der Website erscheinen, sobald Produkte ihnen zugeordnet sind. Die Reihenfolge der Produktgruppen stellst du über die Reihenfolge der Kategorien ein."), PageBreak()]

# Page 6: bread/cake.
story += heading("4. Brot und Kuchen der Woche", "Die Wochenangebote werden in einer Sortimentsausgabe gepflegt.")
story += [step(1, "Öffne <b>INHALTE > Wochenangebote (Brot, Kuchen &amp; Aktionen)</b>. Öffne die passende Ausgabe oder lege mit <b>+</b> eine neue an."), step(2, "Unter <b>Wochenangebote</b> findest du die Felder für Brot der Woche und Kuchen der Woche."), step(3, "Passe Produktname, Zutaten und optional den Preis an. Zutaten erscheinen klein auf den Angebotskarten und in der Vorbestellliste."), step(4, "Veröffentliche die Ausgabe. Bei einer neuen Ausgabe zusätzlich auf der <b>Startseite > Aktuelles Sortiment > Sortimentsausgaben</b> auswählen/freigeben."), Spacer(1, 8), screenshot("bread_cake", "In der Sortimentsausgabe unter Wochenangebote die Angaben für Brot und Kuchen ändern.", BODY_W, 285), Spacer(1, 8), callout("Die Datumsangaben der Ausgabe sind redaktionelle Angaben und wählen die angezeigte Ausgabe nicht automatisch aus. Prüfe daher zusätzlich, dass die gewünschte Ausgabe auf der Startseite verknüpft und freigegeben ist."), PageBreak()]

# Page 6: homepage action preview.
# Page 7: homepage action preview and action PDF.
story += heading("5. Aktionen aktuell halten", "Es gibt zwei verschiedene Aktionsbereiche: die Vorschau auf der Startseite und Aktionsblätter als PDF.")
story += [P("<b>Aktionsvorschau auf der Startseite</b>", "BodyGuide"), step(1, "Öffne die Sortimentsausgabe unter <b>INHALTE > Wochenangebote (Brot, Kuchen &amp; Aktionen)</b>."), step(2, "Passe dort die Aktionsvorschau mit Überschrift, Einleitung und Highlights an."), step(3, "Prüfe den Link auf die Aktionssektion. Das Ziel lautet <b>/diese-woche#aktionen</b>. Veröffentliche die Ausgabe und kontrolliere, dass sie auf der Startseite ausgewählt ist."), Spacer(1, 12), P("<b>Ein Aktionsblatt als PDF</b>", "BodyGuide"), step(1, "Öffne <b>SEITEN > Diese Woche > Seitentexte &amp; SEO</b> und dort die Gruppe <b>Aktionen</b>."), step(2, "Füge unter <b>Aktionsblätter</b> einen Eintrag hinzu. Trage Titel und Beschreibung ein, lade das PDF hoch und ergänze den Gültigkeitszeitraum."), step(3, "Schalte <b>Aktionsblatt aktiv</b> ein und veröffentliche die Seitentexte."), Spacer(1, 9), callout("Der Aktionszeitraum schaltet ein PDF nicht automatisch aus. Deaktiviere das alte Aktionsblatt nach Ablauf manuell. Die Aktionsvorschau der Startseite und das PDF werden an unterschiedlichen Stellen gepflegt."), PageBreak()]

# Page 7: promo PDF.

# Page 8: live editing.
story += heading("6. Alternative: Live-Bearbeitung", "In der Live-Bearbeitung siehst du die Website und kannst vorhandene Inhalte direkt anklicken.")
story += [step(1, "Klicke oben im Studio auf <b>Live-Bearbeitung</b> und öffne die passende Seite in der Vorschau."), step(2, "Klicke auf den Text, die Produktzeile oder die Brot-, Kuchen- oder Aktionskarte, die du ändern möchtest. Das zugehörige Sanity-Dokument öffnet sich daneben."), step(3, "Bearbeite die Felder im Dokument und prüfe die Vorschau. Klicke auf <b>Veröffentlichen</b>, wenn die Änderungen stimmen."), Spacer(1, 8), screenshot("live_edit", "Beispiel: In der Vorschau einen Inhalt auswählen; rechts erscheinen die zugehörigen Felder zum Bearbeiten.", BODY_W, 248), Spacer(1, 8), callout("<b>Unsere Empfehlung:</b> Neue Obst- und Gemüselisten am besten über <b>Inhalte</b> anlegen und Produkte dort eintragen. Für vorhandene Inhalte sowie Brot, Kuchen und Aktionsvorschau ist Live-Bearbeitung eine praktische Alternative. Neue Dokumente zuerst unter Inhalte erstellen."), PageBreak()]

# Page 9: final checklist.
story += heading("Zum Schluss: kurz prüfen", "Mit dieser Checkliste kontrollierst du deine Einträge vor der Veröffentlichung.")
story += [step("✓", "Stimmen Name, Kalenderwoche und Jahr der Obst- und Gemüseliste?"), step("✓", "Sind Produktname, Einheit, Preis und Kategorie korrekt? Sind Herkunfts- und Bio-Angaben belegt?"), step("✓", "Ist die Reihenfolge richtig? Kleinere Zahlen stehen weiter oben."), step("✓", "Sind Brot, Kuchen und Aktionsvorschau in der richtigen Sortimentsausgabe gepflegt?"), step("✓", "Ist die gewünschte Liste bzw. Ausgabe aktiviert und veröffentlicht? Alte Ausgabe bei einem Wechsel deaktivieren."), step("✓", "Sind PDF-Aktionsblätter noch gültig und aktiv? Abgelaufene Blätter manuell deaktivieren."), step("✓", "Sieht die Vorschau am Desktop und Smartphone gut aus?"), Spacer(1, 12), callout("<b>Änderung erscheint nicht?</b> Prüfe, ob das richtige Dokument veröffentlicht wurde und die Liste oder Sortimentsausgabe auf der Website aktiviert ist. Neue Inhalte legst du über <b>Inhalte</b> an; die Live-Bearbeitung eignet sich für vorhandene Einträge."), Spacer(1, 16), P("GerneGrün | Der Bioladen in Dreieich", "H1Guide"), P("Diese Anleitung beschreibt die redaktionelle Pflege von Wocheninhalten im Sanity Studio. Für Fragen zum Zugang oder zu einer fehlenden Funktion wende dich an die zuständige Projektperson.", "SmallGuide")]

doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)
print(OUT)
