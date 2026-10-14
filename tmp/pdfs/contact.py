from PIL import Image, ImageDraw
from pathlib import Path
fs=sorted(Path('tmp/pdfs').glob('page-*.jpg'))
ims=[]
for p in fs:
    im=Image.open(p).convert('RGB'); im.thumbnail((360,510))
    canvas=Image.new('RGB',(370,540),'white'); canvas.paste(im,((370-im.width)//2,10))
    ImageDraw.Draw(canvas).text((10,520),p.name,fill='black'); ims.append(canvas)
out=Image.new('RGB',(370*4,540*((len(ims)+3)//4)), '#cccccc')
for i,im in enumerate(ims): out.paste(im,((i%4)*370,(i//4)*540))
out.save('tmp/pdfs/contact.jpg')
