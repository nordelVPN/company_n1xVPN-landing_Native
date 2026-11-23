from PIL import Image, ImageOps, ImageFilter, ImageEnhance
import numpy as np
from pathlib import Path

out = Path('_tmp_crops')
out.mkdir(exist_ok=True)

def save_crop(im, box, name, scale=3):
    c = im.crop(box)
    if scale != 1:
        c = c.resize((c.width*scale, c.height*scale), Image.Resampling.LANCZOS)
    # boost contrast for OCR
    c = ImageOps.autocontrast(c)
    path = out / name
    c.save(path)
    print(name, box, '->', c.size)

im = Image.open('docs/assets/images/concept/04-plans.png').convert('RGB')
arr = np.asarray(im).astype(int)
# border-ish: pixels much lighter than bg
lum = 0.2126*arr[:,:,0] + 0.7152*arr[:,:,1] + 0.0722*arr[:,:,2]
print('plans lum min/mean/max', lum.min(), lum.mean(), lum.max())
# find rows with many mid-light pixels (card borders)
row_counts = ((lum > 40) & (lum < 120)).sum(axis=1)
col_counts = ((lum > 40) & (lum < 120)).sum(axis=0)
# print bands of row activity
print('ROW ACTIVITY')
for y in range(0, im.height, 20):
    print(f'{y:4d} {int(row_counts[y:y+20].mean()):4d}')

# crop likely card band y 520-900
save_crop(im, (40, 500, 1630, 920), 'plans-cards.png', 2)
save_crop(im, (60, 80, 1100, 480), 'plans-title.png', 2)
save_crop(im, (1000, 40, 1650, 520), 'plans-x.png', 1)

# individual cards guess thirds
for i, x0 in enumerate((70, 600, 1120)):
    save_crop(im, (x0, 540, x0+480, 900), f'plan-{i}.png', 2)

home = Image.open('docs/assets/images/concept/01-home.png').convert('RGB')
save_crop(home, (40, 620, 1600, 930), 'home-strip.png', 2)
save_crop(home, (40, 80, 1000, 620), 'home-title.png', 2)

app = Image.open('docs/assets/images/concept/02-the-app.png').convert('RGB')
save_crop(app, (40, 620, 1620, 930), 'app-strip.png', 2)
save_crop(app, (40, 80, 900, 620), 'app-title.png', 2)

why = Image.open('docs/assets/images/concept/03-why-n1x.png').convert('RGB')
save_crop(why, (40, 70, 1100, 480), 'why-title.png', 2)
save_crop(why, (40, 500, 1630, 930), 'why-grid.png', 2)

sup = Image.open('docs/assets/images/concept/07-support.png').convert('RGB')
save_crop(sup, (40, 500, 1630, 900), 'support-grid.png', 2)

chk = Image.open('docs/assets/images/concept/05-checkout.png').convert('RGB')
save_crop(chk, (40, 40, 1630, 920), 'checkout.png', 1)

acc = Image.open('docs/assets/images/concept/account-page/06-account.png').convert('RGB')
save_crop(acc, (40, 40, 1630, 920), 'account.png', 1)
print('done')
