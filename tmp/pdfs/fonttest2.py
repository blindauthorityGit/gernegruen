from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont('TestArial','C:/Windows/Fonts/arial.ttf'))
c=canvas.Canvas('tmp/pdfs/font-test2.pdf'); c.setFont('TestArial',12); c.drawString(40,750,'Öffnungszeiten Geschäftsdaten für GerneGrün'); c.showPage(); c.save()
