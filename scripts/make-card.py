"""Make a 1600x900 title card for a blog post.
Usage: python3 scripts/make-card.py <slug> "<title>"
Writes blog/img/<slug>.jpg. Requires Pillow.
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1600, 900
INK, GAFF, PAPER, CASE = (23, 25, 27), (254, 214, 0), (251, 251, 248), (227, 228, 224)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FONT = os.path.join(HERE, 'fonts', 'Poppins-Bold.ttf')

def wrap(draw, text, font, width):
    words, lines, line = text.split(), [], ''
    for w in words:
        test = (line + ' ' + w).strip()
        if draw.textlength(test, font=font) <= width: line = test
        else: lines.append(line); line = w
    if line: lines.append(line)
    return lines

def main(slug, title):
    S = 2
    im = Image.new('RGB', (W * S, H * S), INK)
    d = ImageDraw.Draw(im)
    # yellow band at bottom
    d.rectangle([0, (H - 18) * S, W * S, H * S], fill=GAFF)
    # logo
    logo = Image.open(os.path.join(ROOT, 'gaffdesk-logo.png')).convert('RGBA')
    lw = 300 * S; lh = round(logo.height * lw / logo.width)
    im.paste(logo.resize((lw, lh), Image.LANCZOS), (96 * S, 84 * S), logo.resize((lw, lh), Image.LANCZOS))
    # title, largest size that fits in 4 lines
    box_w = (W - 192) * S
    for size in range(118, 54, -4):
        f = ImageFont.truetype(FONT, size * S)
        lines = wrap(d, title, f, box_w)
        if len(lines) <= 4: break
    lh_px = int(size * 1.12 * S)
    total = lh_px * len(lines)
    y = (H - 96) * S - total
    for ln in lines:
        d.text((96 * S, y), ln, font=f, fill=PAPER)
        y += lh_px
    # gaff tape accent under logo
    tape_y = 84 * S + lh + 34 * S
    d.rectangle([96 * S, tape_y, (96 + 120) * S, tape_y + 10 * S], fill=GAFF)
    out = im.resize((W, H), Image.LANCZOS)
    os.makedirs(os.path.join(ROOT, 'blog', 'img'), exist_ok=True)
    path = os.path.join(ROOT, 'blog', 'img', slug + '.jpg')
    out.save(path, 'JPEG', quality=84, optimize=True, progressive=True)
    print(path, os.path.getsize(path) // 1024, 'KB')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
