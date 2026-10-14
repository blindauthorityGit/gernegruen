from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
for name,path in [('TestNunito','C:/Windows/Fonts/Nunito-Regular.ttf'),('TestArial','C:/Windows/Fonts/arial.ttf'),('TestSegoe','C:/Windows/Fonts/segoeui.ttf')]:
 pdfmetrics.registerFont(TTFont(name,path))
 c=canvas.Canvas('tmp/pdfs/font-test.pdf')
 c.setFont(name,12); c.drawString(40,750,'Öffnungszeiten Geschäftsdaten für GerneGrün')
 c.showPage(); c.save()
 # overwrites each
