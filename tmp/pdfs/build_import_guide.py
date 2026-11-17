from pathlib import Path
import hashlib

from PIL import Image as PILImage

# The bundled Python 3.8 runtime's OpenSSL md5 wrapper lacks this newer kwarg.
_md5 = hashlib.md5
hashlib.md5 = lambda data=b"", **kwargs: _md5(data)

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Image, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle, HRFlowable

ROOT = Path.cwd()
OUT = ROOT / "output" / "pdf" / "GerneGruen-Kurzanleitung-Excel-Import-Sanity.pdf"
ASSETS = ROOT / "tmp" / "pdfs" / "import-guide-assets"
ASSETS.mkdir(parents=True, exist_ok=True)

inputs = {
    "product_start": Path(r"C:\Users\Johannes\AppData\Local\Temp\codex-clipboard-1096f303-a4f4-418a-803b-1c9993535577.png"),
    "product_week": Path(r"C:\Users\Johannes\AppData\Local\Temp\codex-clipboard-dff184f5-16ac-451e-9ee6-213a25850f82.png"),
    "product_conflicts": Path(r"C:\Users\Johannes\AppData\Local\Temp\codex-clipboard-bf675047-067c-499c-8388-3aa92da98c0b.png"),
    "product_preview": Path(r"C:\Users\Johannes\AppData\Local\Temp\codex-clipboard-9d589a1d-aef3-461e-9ee6-213a25850f82.png"),
    "bakery_start": Path(r"C:\Users\Johannes\AppData\Local\Temp\codex-clipboard-1775103b-e6f1-4ef1-897a-7b85a6e4b7e3.png"),
}

# Focus the supplied screenshots on the relevant controls while retaining the original UI.
PILImage.open(inputs["product_start"]).crop((215, 0, 1770, 340)).save(ASSETS / "product-start.png")
PILImage.open(inputs["product_conflicts"]).crop((0, 250, 1556, 355)).save(ASSETS / "product-conflicts.png")
PILImage.open(inputs["product_preview"]).crop((1170, 320, 1570, 438)).save(ASSETS / "product-preview-button.png")

LOGO = ROOT / "public" / "graphics" / "gernegruen-logo-subline-dark-green.png"
FONT = ROOT / "tmp" / "pdfs" / "Nunito-Regular.ttf"
FONT_BOLD = ROOT / "tmp" / "pdfs" / "Nunito-Bold.ttf"

GREEN = colors.HexColor("#08522b")
LIME = colors.HexColor("#97bf4b")
ORANGE = colors.HexColor("#f1820c")
CREAM = colors.HexColor("#fbf5eb")
BOTANICAL = colors.HexColor("#f3f1d7")
INK = colors.HexColor("#2e2e2e")
MUTED = colors.HexColor("#5e625d")
WHITE = colors.white
PAGE_W, PAGE_H = A4

pdfmetrics.registerFont(TTFont("Nunito", str(FONT)))
pdfmetrics.registerFont(TTFont("Nunito-Bold", str(FONT_BOLD)))
pdfmetrics.registerFontFamily("Nunito", normal="Nunito", bold="Nunito-Bold", italic="Nunito", boldItalic="Nunito-Bold")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverEyebrow", fontName="Nunito-Bold", fontSize=9, leading=12, textColor=LIME, spaceAfter=7, tracking=1.2))
styles.add(ParagraphStyle(name="CoverTitle", fontName="Nunito-Bold", fontSize=28, leading=33, textColor=WHITE, spaceAfter=9))
styles.add(ParagraphStyle(name="CoverSub", fontName="Nunito", fontSize=13, leading=19, textColor=WHITE))
styles.add(ParagraphStyle(name="Chapter", fontName="Nunito-Bold", fontSize=21, leading=26, textColor=GREEN, spaceAfter=5, keepWithNext=True))
styles.add(ParagraphStyle(name="Deck", fontName="Nunito", fontSize=10.8, leading=15, textColor=MUTED, spaceAfter=9, keepWithNext=True))
styles.add(ParagraphStyle(name="BodyGG", fontName="Nunito", fontSize=9.5, leading=13, textColor=INK, spaceAfter=3))
styles.add(ParagraphStyle(name="StepNum", fontName="Nunito-Bold", fontSize=10, leading=13, textColor=GREEN, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="CaptionGG", fontName="Nunito", fontSize=7.8, leading=10, textColor=MUTED, alignment=TA_CENTER, spaceBefore=3))
styles.add(ParagraphStyle(name="CalloutGG", fontName="Nunito", fontSize=8.8, leading=12, textColor=GREEN))
styles.add(ParagraphStyle(name="ImageLabel", fontName="Nunito-Bold", fontSize=7.5, leading=9, textColor=GREEN, alignment=TA_CENTER))


def P(text, style="BodyGG"):
    return Paragraph(text, styles[style])


def chapter(title, deck):
    return [P(title, "Chapter"), P(deck, "Deck"), HRFlowable(width="100%", thickness=1.2, color=LIME, spaceAfter=3 * mm)]


def steps(items):
    rows = [[P(str(index), "StepNum"), P(text)] for index, text in enumerate(items, 1)]
    table = Table(rows, colWidths=[9 * mm, 165 * mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    return table


def image_fit(path, max_w, max_h):
    image = Image(str(path))
    scale = min(max_w / image.imageWidth, max_h / image.imageHeight)
    image.drawWidth = image.imageWidth * scale
    image.drawHeight = image.imageHeight * scale
    image.hAlign = "CENTER"
    return image


def image_card(path, caption, max_w=158 * mm, max_h=58 * mm):
    image = image_fit(path, max_w - 10 * mm, max_h)
    card = Table([[image], [P(caption, "CaptionGG")]], colWidths=[174 * mm], hAlign="LEFT")
    card.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#d8dfc8")),
        ("LEFTPADDING", (0, 0), (-1, -1), 5 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2 * mm),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return card


def callout(text):
    table = Table([[P(text, "CalloutGG")]], colWidths=[174 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BOTANICAL),
        ("BOX", (0, 0), (-1, -1), 0.6, LIME),
        ("LINEBEFORE", (0, 0), (0, -1), 3, ORANGE),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return table


def page_header(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setFillColor(CREAM)
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        canvas.setFillColor(GREEN)
        canvas.rect(0, PAGE_H - 13 * mm, PAGE_W, 13 * mm, fill=1, stroke=0)
        canvas.setFont("Nunito-Bold", 8)
        canvas.setFillColor(WHITE)
        canvas.drawString(18 * mm, PAGE_H - 8.5 * mm, "GERNEGRÜN  /  EXCEL-IMPORT IM SANITY STUDIO")
        canvas.setStrokeColor(LIME)
        canvas.setLineWidth(1)
        canvas.line(18 * mm, 13 * mm, PAGE_W - 18 * mm, 13 * mm)
        canvas.setFillColor(MUTED)
        canvas.setFont("Nunito", 7.5)
        canvas.drawString(18 * mm, 8 * mm, "Produktlisten und Backwaren importieren")
        canvas.drawRightString(PAGE_W - 18 * mm, 8 * mm, str(doc.page))
    canvas.restoreState()


story = []
# Cover
story.append(Spacer(1, 18 * mm))
logo = Image(str(LOGO), width=66 * mm, height=22 * mm, kind="proportional")
logo.hAlign = "LEFT"
story.extend([logo, Spacer(1, 20 * mm)])
cover = Table([[ [P("KURZ ERKLÄRT", "CoverEyebrow"), P("Excel-Listen<br/>im Studio importieren", "CoverTitle"), P("Produktlisten und Backwaren in wenigen Schritten im Sanity Studio aktualisieren.", "CoverSub")] ]], colWidths=[174 * mm], rowHeights=[78 * mm])
cover.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), GREEN),
    ("ROUNDEDCORNERS", [6 * mm, 6 * mm, 6 * mm, 6 * mm]),
    ("LEFTPADDING", (0, 0), (-1, -1), 12 * mm),
    ("RIGHTPADDING", (0, 0), (-1, -1), 12 * mm),
    ("TOPPADDING", (0, 0), (-1, -1), 10 * mm),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 9 * mm),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
]))
story.extend([cover, Spacer(1, 10 * mm), P("Für Produktlisten und Backwaren - direkt im GerneGrün Studio.", "Deck"), Spacer(1, 5 * mm), callout("Beide Importe werden zuerst als Entwurf gespeichert. Die bestehende veröffentlichte Website ändert sich dadurch nicht."), PageBreak()])

# Product list import: upload and date
story += chapter("1. Produktlisten importieren", "Schritt 1: Excel-Datei auswählen und Woche kontrollieren.")
story.append(steps([
    "Öffne oben <b>Produktlisten importieren</b> und wähle die aktuelle XLS- oder XLSX-Datei aus.",
    "Prüfe die erkannte Kalenderwoche und trage das <b>zur Liste passende Jahr</b> ein. Das Jahr im Screenshot ist nur ein Beispiel.",
]))
story.append(Spacer(1, 3 * mm))
story.append(image_card(ASSETS / "product-start.png", "1. Reiter öffnen und Excel-Datei auswählen", max_h=48 * mm))
story.append(Spacer(1, 5 * mm))
story.append(image_card(ASSETS / "product-week.png", "2. Kalenderwoche prüfen und korrektes Jahr eintragen", max_h=55 * mm))
story.append(Spacer(1, 4 * mm))
story.append(callout("Die angezeigte Jahreszahl ist ein Beispiel. Trage immer das Jahr ein, zu dem die gelieferte Liste gehört."))
story.append(PageBreak())

# Product list import: resolve and save
story += chapter("Produktlisten: prüfen und übernehmen", "Schritt 2: Hinweise korrigieren und den Entwurf speichern.")
story.append(steps([
    "Kontrolliere die Datenzeilen. Korrigiere rote Hinweise; passe doppelte Produktnamen an oder entferne die überzählige Zeile.",
    "Klicke auf <b>Vorschau erneut prüfen</b>. Wenn alle Zeilen gültig sind, erscheint die Bestätigung.",
    "Bei einer neuen Wochenliste klicke auf <b>Import bestätigen</b>. Gibt es schon einen Entwurf, prüfe die Unterschiede und klicke auf <b>Entwurf vollständig ersetzen</b>.",
]))
story.append(Spacer(1, 3 * mm))
story.append(image_card(ASSETS / "product-conflicts.png", "Beispiel: doppelte Produktnamen. Anpassen oder die überzählige Zeile entfernen.", max_h=25 * mm))
story.append(Spacer(1, 5 * mm))
story.append(image_card(ASSETS / "product-preview-button.png", "Nach der Korrektur die Vorschau erneut prüfen.", max_w=132 * mm, max_h=37 * mm))
story.append(Spacer(1, 5 * mm))
story.append(callout("Sanity speichert den Import als Entwurf. Eine bereits veröffentlichte Wochenliste bleibt unverändert, bis du den neuen Entwurf veröffentlichst."))
story.append(PageBreak())

# Bakery import
story += chapter("2. Backwaren importieren", "Das dauerhaft gepflegte Sortiment ist unabhängig von Kalenderwochen.")
story.append(steps([
    "Öffne oben <b>Backwaren importieren</b> und wähle die XLS- oder XLSX-Datei aus.",
    "Kontrolliere Bereich, Kategorie, Artikelbezeichnung und Preis. Die Zusatzinformation ist optional.",
    "Korrigiere fehlerhafte Zeilen direkt in der Tabelle oder entferne nicht benötigte Zeilen.",
    "Klicke auf <b>Änderungen prüfen</b>. Bestätige unten mit <b>Import bestätigen</b> oder - bei vorhandenem Entwurf - mit <b>Entwurf ersetzen</b>.",
]))
story.append(Spacer(1, 5 * mm))
story.append(image_card(ASSETS / "bakery-start.png", "Im Reiter „Backwaren importieren“ die passende Excel-Datei auswählen.", max_h=67 * mm))
story.append(Spacer(1, 6 * mm))
story.append(callout("Auch der Backwaren-Import wird zunächst als Sanity-Entwurf gespeichert. Die veröffentlichte Fassung bleibt bis zur separaten Veröffentlichung unverändert."))

OUT.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm, topMargin=19 * mm, bottomMargin=18 * mm, title="GerneGrün - Kurzanleitung Excel-Import", author="GerneGrün", subject="Produktlisten und Backwaren in Sanity importieren")
doc.build(story, onFirstPage=page_header, onLaterPages=page_header)
print(OUT)
