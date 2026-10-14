from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak,
                                Table, TableStyle, KeepTogether, HRFlowable)
from reportlab.lib.utils import ImageReader

ROOT = Path.cwd()
OUT = ROOT / 'output' / 'pdf' / 'GerneGruen-Anleitung-Sanity.pdf'
SCREEN = ROOT / 'docs' / 'screenshots' / 'sanity-guide'
LOGO = ROOT / 'public' / 'graphics' / 'gernegruen-logo-subline-dark-green.png'
FONT = Path('C:/Windows/Fonts/Nunito-Regular.ttf')
FONT_BOLD = Path('C:/Windows/Fonts/Nunito-SemiBold.ttf')

# Brand palette from app/globals.css
GREEN = colors.HexColor('#08522b')
CTA = colors.HexColor('#177142')
LIME = colors.HexColor('#97bf4b')
ORANGE = colors.HexColor('#f1820c')
CREAM = colors.HexColor('#fbf5eb')
BOTANICAL = colors.HexColor('#f3f1d7')
INK = colors.HexColor('#2e2e2e')
MUTED = colors.HexColor('#5e625d')
WHITE = colors.white

pdfmetrics.registerFont(TTFont('Nunito', str(FONT)))
pdfmetrics.registerFont(TTFont('Nunito-SemiBold', str(FONT_BOLD)))
pdfmetrics.registerFontFamily('Nunito', normal='Nunito', bold='Nunito-SemiBold', italic='Nunito', boldItalic='Nunito-SemiBold')
PAGE_W, PAGE_H = A4

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='CoverEyebrow', fontName='Nunito-SemiBold', fontSize=10, leading=14,
                          textColor=LIME, uppercase=True, spaceAfter=8, tracking=1.3))
styles.add(ParagraphStyle(name='CoverTitle', fontName='Nunito-SemiBold', fontSize=31, leading=36,
                          textColor=WHITE, spaceAfter=11))
styles.add(ParagraphStyle(name='CoverSub', fontName='Nunito', fontSize=14, leading=21,
                          textColor=WHITE, spaceAfter=0))
styles.add(ParagraphStyle(name='Chapter', fontName='Nunito-SemiBold', fontSize=22, leading=27,
                          textColor=GREEN, spaceAfter=6, keepWithNext=True))
styles.add(ParagraphStyle(name='Deck', fontName='Nunito', fontSize=11.5, leading=16,
                          textColor=MUTED, spaceAfter=12, keepWithNext=True))
styles.add(ParagraphStyle(name='BodyGG', fontName='Nunito', fontSize=10.5, leading=16,
                          textColor=INK, spaceAfter=8))
styles.add(ParagraphStyle(name='SmallGG', fontName='Nunito', fontSize=8.6, leading=12,
                          textColor=MUTED, spaceAfter=4))
styles.add(ParagraphStyle(name='BulletGG', fontName='Nunito', fontSize=10.5, leading=16,
                          textColor=INK, leftIndent=15, firstLineIndent=-15, spaceAfter=5))
styles.add(ParagraphStyle(name='StepNum', fontName='Nunito-SemiBold', fontSize=11, leading=15,
                          textColor=GREEN, alignment=TA_CENTER))
styles.add(ParagraphStyle(name='CaptionGG', fontName='Nunito', fontSize=8.5, leading=12,
                          textColor=MUTED, alignment=TA_CENTER, spaceBefore=4, spaceAfter=2))
styles.add(ParagraphStyle(name='CalloutGG', fontName='Nunito', fontSize=9.5, leading=14,
                          textColor=GREEN))
styles.add(ParagraphStyle(name='TOC', fontName='Nunito', fontSize=10, leading=16, textColor=GREEN,
                          leftIndent=3, spaceAfter=2))


def P(text, style='BodyGG'):
    return Paragraph(text, styles[style])

def steps(items):
    rows=[]
    for i, text in enumerate(items,1):
        rows.append([P(str(i), 'StepNum'), P(text, 'BodyGG')])
    t=Table(rows, colWidths=[10*mm, 165*mm], hAlign='LEFT')
    t.setStyle(TableStyle([
        ('VALIGN',(0,0),(-1,-1),'TOP'), ('LEFTPADDING',(0,0),(-1,-1),0),
        ('RIGHTPADDING',(0,0),(-1,-1),4), ('TOPPADDING',(0,0),(-1,-1),2),
        ('BOTTOMPADDING',(0,0),(-1,-1),2),
    ]))
    return t

def bullets(items):
    return [P('-  '+t, 'BulletGG') for t in items]

def callout(text, bg=BOTANICAL, border=LIME):
    t=Table([[P(text,'CalloutGG')]], colWidths=[174*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1),bg),('BOX',(0,0),(-1,-1),0.6,border),
        ('LINEBEFORE',(0,0),(0,-1),3,ORANGE),('LEFTPADDING',(0,0),(-1,-1),11),
        ('RIGHTPADDING',(0,0),(-1,-1),11),('TOPPADDING',(0,0),(-1,-1),9),
        ('BOTTOMPADDING',(0,0),(-1,-1),9),('VALIGN',(0,0),(-1,-1),'MIDDLE')]))
    return t

def shot(name, caption, max_w=175*mm, max_h=145*mm):
    path=SCREEN/name
    im=Image(str(path))
    scale=min(max_w/im.imageWidth,max_h/im.imageHeight)
    im.drawWidth=im.imageWidth*scale
    im.drawHeight=im.imageHeight*scale
    im.hAlign='CENTER'
    return [Spacer(1,3*mm), im, P(caption,'CaptionGG')]

def chapter(title, deck=None):
    elems=[P(title,'Chapter')]
    if deck: elems.append(P(deck,'Deck'))
    elems.append(HRFlowable(width='100%', thickness=1.3, color=LIME, spaceBefore=0, spaceAfter=5*mm))
    return elems

def page_header(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setFillColor(CREAM); canvas.rect(0,0,PAGE_W,PAGE_H,fill=1,stroke=0)
        canvas.setFillColor(GREEN); canvas.rect(0,PAGE_H-13*mm,PAGE_W,13*mm,fill=1,stroke=0)
        canvas.setFont('Nunito-SemiBold',8.5); canvas.setFillColor(WHITE)
        canvas.drawString(18*mm,PAGE_H-8.5*mm,'GERNEGRÜN  /  ANLEITUNG SANITY')
        canvas.setStrokeColor(LIME); canvas.setLineWidth(1)
        canvas.line(18*mm,13*mm,PAGE_W-18*mm,13*mm)
        canvas.setFillColor(MUTED); canvas.setFont('Nunito',8)
        canvas.drawString(18*mm,8*mm,'Website-Inhalte bearbeiten')
        canvas.drawRightString(PAGE_W-18*mm,8*mm,f'{doc.page}')
    canvas.restoreState()

story=[]
# Cover
story.append(Spacer(1,18*mm))
logo=Image(str(LOGO),width=66*mm,height=22*mm,kind='proportional'); logo.hAlign='LEFT'
story.append(logo); story.append(Spacer(1,20*mm))
coverbox=Table([[ [P('EINFACH ERKLÄRT','CoverEyebrow'),
                  P('Deine Website<br/>selbst bearbeiten','CoverTitle'),
                  P('Eine Schritt-für-Schritt-Anleitung für GerneGrün. Texte, Bilder und wichtige Inhalte pflegst du direkt im Sanity Studio.','CoverSub')] ]], colWidths=[174*mm], rowHeights=[84*mm])
coverbox.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(-1,-1),GREEN),('BOX',(0,0),(-1,-1),0, GREEN),
    ('ROUNDEDCORNERS',[6*mm,6*mm,6*mm,6*mm]),
    ('LEFTPADDING',(0,0),(-1,-1),12*mm),('RIGHTPADDING',(0,0),(-1,-1),12*mm),
    ('TOPPADDING',(0,0),(-1,-1),12*mm),('BOTTOMPADDING',(0,0),(-1,-1),12*mm),
    ('VALIGN',(0,0),(-1,-1),'MIDDLE')]))
story.append(coverbox); story.append(Spacer(1,10*mm))
story.append(P('Für alle, die Inhalte bearbeiten möchten - ohne technische Vorkenntnisse.','Deck'))
story.append(Spacer(1,8*mm))
story.append(callout('<b>Dein einfachster Einstieg:</b> In „Live-Bearbeitung“ siehst du die Website und kannst unterstützte Texte oder Bilder direkt auswählen. Änderungen bleiben Entwürfe, bis du sie veröffentlichst.'))
story.append(PageBreak())

# 1 Access
story += chapter('1. Zugang einrichten und anmelden','Erstelle dein Konto. Ich lade dich anschließend zum GerneGrün-Projekt ein.')
story.append(steps([
    'Erstelle dein persönliches Konto auf <link href="https://www.sanity.io/"><b>sanity.io</b></link>. Du kannst deine E-Mail-Adresse oder einen angebotenen Anmeldeanbieter wie Google verwenden.',
    '<b>Schicke mir die E-Mail-Adresse deines Kontos.</b> Ich lade dich als Admin zum GerneGrün-Projekt ein. Du musst selbst keine Einladung versenden oder ein Projekt einrichten.',
    'Öffne <link href="https://gernegruen.de/studio"><b>gernegruen.de/studio</b></link>, sobald du meine Einladung erhalten hast.',
    'Melde dich mit <b>demselben Sanity-Konto</b> an, dessen E-Mail-Adresse du mir geschickt hast.'
]))
story.append(Spacer(1,3*mm))
story.append(callout('Wenn GerneGrün nach dem Login nicht erscheint, sag mir Bescheid. <b>Ich prüfe dann deine Einladung und den Zugang.</b>'))
story.append(PageBreak())

# 2 navigation
story += chapter('2. Wo finde ich was?','Die wichtigsten Bereiche findest du in der oberen Studio-Navigation.')
rows=[[P('<b>Bereich</b>','BodyGG'),P('<b>Wofür?</b>','BodyGG')]]
for a,b in [
 ('Inhalte','Seiten und redaktionelle Inhalte öffnen.'),
 ('Live-Bearbeitung','Website ansehen und unterstützte Inhalte direkt anklicken.'),
 ('Veröffentlichungen','Geplante oder vorbereitete Veröffentlichungen prüfen.'),
 ('Produktlisten importieren','Obst- und Gemüselisten aus Excel vorbereiten.'),
 ('Bestellungen & Wünsche','Eingegangene Bestellungen und Produktwünsche ansehen.')]:
 rows.append([P(a,'BodyGG'),P(b,'BodyGG')])
t=Table(rows,colWidths=[55*mm,120*mm],repeatRows=1)
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),BOTANICAL),('TEXTCOLOR',(0,0),(-1,0),GREEN),
 ('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#d8dfc8')),('VALIGN',(0,0),(-1,-1),'TOP'),
 ('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),
 ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),2)]))
story.append(t); story.append(Spacer(1,3*mm))
story.append(P('Unter <b>Inhalte > Seiten</b> liegen Startseite, Diese Woche, Sortiment, Über uns und Kontakt &amp; Anfahrt. Unter <b>Einstellungen</b> findest du Geschäftsdaten und Footer. Unter <b>Inhalte</b> liegen auch Sortimentsausgaben, Kategorien, Marken und Aktionsblätter.'))
story += shot('02-seitenstruktur.jpg','Die Seiten sind im Bereich „Inhalte“ nach Gruppen sortiert.')
story.append(PageBreak())

# 3 visual editing
story += chapter('3. Seiten in „Live-Bearbeitung“ ändern','Für die meisten Änderungen ist das die einfachste und anschaulichste Methode.')
story.append(steps([
 'Klicke oben auf <b>Live-Bearbeitung</b> und öffne in der Vorschau die gewünschte Seite.',
 'Klicke auf den hervorgehobenen Text oder das Bild. Rechts erscheint das passende Sanity-Dokument oder Feld.',
 'Ändere den Inhalt und prüfe direkt die Vorschau.',
 'Klicke auf <b>Veröffentlichen</b>, wenn die Änderung auf der Website erscheinen soll.'
]))
story.append(Spacer(1,2*mm))
story.append(callout('Du kannst erst prüfen und später veröffentlichen. Besucher sehen Änderungen erst, wenn du das Dokument veröffentlichst. Manche Bereiche stammen aus einem gemeinsamen Datensatz. Wenn ein Klick nichts öffnet, suche den Eintrag unter „Inhalte“ oder „Einstellungen“.'))
story += shot('03-live-bearbeitung.jpg','Ein Klick auf die Überschrift öffnet das zugehörige Textfeld rechts.')
story.append(PageBreak())

# 4 text
story += chapter('4. Texte ändern','Überschriften und Beschreibungen können getrennte Felder haben.')
story.append(steps([
 'Klicke in der Vorschau auf den Text, den du ändern möchtest.',
 'Bearbeite nur das passende Feld rechts. Ändere möglichst keine technischen Felder.',
 'Prüfe Zeilenumbrüche und lies den Text noch einmal durch.',
 'Veröffentliche das Dokument, wenn alles stimmt.'
]))
story.append(Spacer(1,4*mm))
story.append(callout('Wenn du nur einen Teil einer Überschrift oder Beschreibung ändern möchtest, bearbeite nur das dafür vorgesehene Feld. So bleiben Gestaltung und übriger Text erhalten.'))
story.append(PageBreak())

# 5 images
story += chapter('5. Bilder austauschen','Das Bildfeld öffnest du durch einen Klick auf das Bild in der Vorschau.')
story.append(steps([
 'Klicke das Bild in der Vorschau an. Wenn sich nur eine große Ansicht öffnet, schließe sie und wähle den Bildbereich im <b>Edit</b>-Modus.',
 'Prüfe im rechten Bearbeitungsbereich die Bildvorschau und den Alternativtext.',
 'Öffne das Bildmenü und wähle <b>Upload</b>, um eine neue Datei hochzuladen, oder <b>Select</b>, um ein vorhandenes Bild auszuwählen.',
 'Kontrolliere Bildausschnitt und Alternativtext. Veröffentliche erst, wenn das Motiv gut aussieht.'
]))
story += shot('04-bildfeld.jpg','Das ausgewählte Bild und sein Alternativtext erscheinen im Sanity-Feld.')
story.append(PageBreak())
story += chapter('Bild hochladen oder auswählen','Wähle ein scharfes, passendes Bild. Logos und Illustrationen bitte nicht durch beliebige Fotos ersetzen.')
story += shot('05-bild-hochladen.jpg','Über das Bildmenü erreichst du Upload und Select.')
story.append(callout('Der Alternativtext beschreibt kurz, was auf dem Bild zu sehen ist. Er hilft Menschen, die das Bild nicht sehen können.'))
story.append(PageBreak())

# 6 global info
story += chapter('6. Öffnungszeiten und Kontaktdaten','Diese Werte werden zentral gepflegt und an mehreren Stellen der Website verwendet.')
story.append(P('Öffne <b>Inhalte > Einstellungen > Geschäftsdaten</b>. Dort änderst du Öffnungszeiten, Adresse, Telefonnummer, E-Mail und Instagram. Die Öffnungszeiten und Kontaktdaten erscheinen im Menü, im Footer und auf der Kontaktseite.'))
story.append(Spacer(1,3*mm))
story.append(callout('Ändere die Öffnungszeiten nicht auf einzelnen Seiten. Passe sie ausschließlich in „Geschäftsdaten“ an, damit alle Stellen dieselbe Quelle verwenden.'))
story += shot('06-geschaeftsdaten.jpg','Ein Wochentag lässt sich öffnen, um Zeiten wie „Öffnet um“ und „Schließt um“ anzupassen.')
story.append(PageBreak())

# 7 footer
story += chapter('7. Footer bearbeiten','Im Footer pflegst du Überschriften und Links der Fußzeile.')
story.append(steps([
 'Öffne <b>Inhalte > Einstellungen > Footer</b>.',
 'Passe die Überschriften der Spalten oder die Footer-Links an.',
 'Geschäftsadresse und Öffnungszeiten bearbeitest du weiterhin nur unter <b>Geschäftsdaten</b>.',
 'Veröffentliche den Footer, wenn deine Änderungen bereit sind.'
]))
story += shot('07-footer.jpg','Hier findest du die bearbeitbaren Überschriften und Links des Footers.')
story.append(PageBreak())

# 8 dashboard
story += chapter('8. Bestellungen & Wünsche ansehen','Das Dashboard hat eine eigene Anmeldung, getrennt von deinem Sanity-Konto.')
story.append(steps([
 'Klicke oben auf <b>Bestellungen &amp; Wünsche</b>.',
 '<b>Melde dich mit dem freigeschalteten Dashboard-Konto</b> an. Verwende dafür die mitgeteilte E-Mail-Adresse und das Passwort. Eine Registrierung im Dashboard ist nicht möglich.',
 'Die Kacheln zeigen neue und offene Bestellungen, neue Kundenwünsche sowie erledigte Einträge der letzten 30 Tage.',
 'Suche bei Bedarf nach Name, Bestellnummer oder Produkt und klicke auf <b>Details ansehen</b>.'
]))
story.append(Spacer(1,3*mm))
story.append(callout('Das Dashboard ist nur zum Lesen eingerichtet. Kundendaten sind vertraulich. Melde dich auf gemeinsam genutzten Geräten ab und teile keine Namen, E-Mail-Adressen oder Bestelldetails in Screenshots.'))
story += shot('09-dashboard.png','Der Screenshot zeigt ein Beispiel ohne Kundendaten. In deinem Dashboard können Kennzahlen und Einträge anders aussehen.')
story.append(P('Klicke auf <b>Details ansehen</b>, um eine Anfrage zu lesen. Das Dashboard ist <b>nur zum Lesen</b>; Einträge und Status kannst du dort nicht ändern.','SmallGG'))
story.append(PageBreak())

# 9 publish
story += chapter('9. Vor dem Veröffentlichen','Eine kurze Schlusskontrolle schützt vor versehentlichen Änderungen.')
story += bullets([
 'Lies den geänderten Text noch einmal durch.',
 'Prüfe, ob das richtige Bild und der passende Ausschnitt angezeigt werden.',
 'Kontrolliere die Vorschau auf Desktop und Smartphone.',
 'Veröffentliche erst, wenn alles bereit ist.'
])
story.append(Spacer(1,4*mm))
story.append(callout('Wenn eine Änderung nicht erscheint: Lade die Vorschau neu und prüfe, ob das Dokument veröffentlicht wurde. Bei Öffnungszeiten und Kontaktdaten kontrolliere „Einstellungen > Geschäftsdaten“.'))
story.append(Spacer(1,20*mm))
story.append(P('GerneGrün | Der Bioladen in Dreieich','Chapter'))
story.append(P('Diese Anleitung ist für die redaktionelle Pflege der GerneGrün-Website erstellt. Bei fehlendem Zugang oder Fragen zu Einladungen hilft die zuständige Projektperson.','Deck'))

doc=SimpleDocTemplate(str(OUT),pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=20*mm,bottomMargin=18*mm,
                      title='GerneGrün - Anleitung für das Sanity Studio',author='GerneGrün',subject='Website-Inhalte selbst bearbeiten')
doc.build(story,onFirstPage=page_header,onLaterPages=page_header)
print(OUT)


