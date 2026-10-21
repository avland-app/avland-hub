"""Make Instagram/Facebook carousel slides (1080x1350, 4:5) for a blog post.

Usage: python3 scripts/make-slides.py <slug> <slides.json>

slides.json:
{
  "slides": [
    {"kind": "cover", "title": "How to write an AV quote clients approve", "kicker": "For AV company owners"},
    {"kind": "tip", "heading": "Start with the client's needs", "body": "Date, venue, audience, program. Then the gear list."},
    ...
    {"kind": "cta", "title": "The full guide", "body": "Link in bio · gaffdesk.com/blog"}
  ]
}

Writes blog/social/<slug>/<n>.jpg and blog/social/<slug>/db/<n>.json
(the Blog Desk `slides` docs: {post, n, image: data-URL}). blog/social/ is
git-ignored: slides live in Blog Desk, not on the website. Requires Pillow.
Text only, brand colors, real logo: never AI-generated images.
"""
import sys, os, json, base64, io
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
INK, GAFF, PAPER, SOFT = (23, 25, 27), (254, 214, 0), (251, 251, 248), (185, 188, 182)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BOLD = os.path.join(HERE, 'fonts', 'Poppins-Bold.ttf')
MED = os.path.join(HERE, 'fonts', 'Poppins-Medium.ttf')
M = 84  # side margin
MAX_BYTES = 150_000  # keep each Blog Desk doc well under the 256 KiB limit


def wrap(draw, text, font, width):
    out = []
    for para in str(text).split('\n'):
        words, line = para.split(), ''
        for w in words:
            test = (line + ' ' + w).strip()
            if draw.textlength(test, font=font) <= width:
                line = test
            else:
                if line: out.append(line)
                line = w
        out.append(line)
    return out


def fit(draw, text, path, width, max_lines, sizes):
    for size in sizes:
        f = ImageFont.truetype(path, size)
        lines = wrap(draw, text, f, width)
        if len(lines) <= max_lines:
            return f, lines, size
    return f, lines[:max_lines], size


def draw_lines(d, lines, f, size, x, y, fill, lh=1.18):
    step = int(size * lh)
    for ln in lines:
        d.text((x, y), ln, font=f, fill=fill)
        y += step
    return y


def logo_img(width):
    logo = Image.open(os.path.join(ROOT, 'gaffdesk-logo.png')).convert('RGBA')
    h = round(logo.height * width / logo.width)
    return logo.resize((width, h), Image.LANCZOS)


def base(n, total):
    im = Image.new('RGB', (W, H), INK)
    d = ImageDraw.Draw(im)
    d.rectangle([0, H - 16, W, H], fill=GAFF)  # gaff tape strip
    if total > 1:
        f = ImageFont.truetype(MED, 30)
        t = f'{n}/{total}'
        d.text((W - M - d.textlength(t, font=f), H - 16 - 66), t, font=f, fill=SOFT)
    return im, d


def cover(s, n, total):
    im, d = base(n, total)
    lg = logo_img(260)
    im.paste(lg, (M, 96), lg)
    y = 96 + lg.height + 30
    d.rectangle([M, y, M + 110, y + 10], fill=GAFF)
    if s.get('kicker'):
        fk = ImageFont.truetype(MED, 36)
        d.text((M, y + 46), s['kicker'].upper(), font=fk, fill=GAFF)
    f, lines, size = fit(d, s['title'], BOLD, W - 2 * M, 6, range(104, 50, -4))
    block = int(size * 1.12) * len(lines)
    draw_lines(d, lines, f, size, M, H - 220 - block, PAPER, 1.12)
    fs = ImageFont.truetype(BOLD, 34)
    ty = H - 16 - 66
    d.text((M, ty), 'Swipe', font=fs, fill=GAFF)
    ax = M + d.textlength('Swipe', font=fs) + 18; ay = ty + 26  # drawn arrow (Poppins has no arrow glyph)
    d.line([ax, ay, ax + 40, ay], fill=GAFF, width=5)
    d.polygon([(ax + 40, ay - 11), (ax + 54, ay), (ax + 40, ay + 11)], fill=GAFF)
    return im


def tip(s, n, total):
    im, d = base(n, total)
    # big step number
    fn = ImageFont.truetype(BOLD, 150)
    d.text((M, 70), f'{n - 1:02d}', font=fn, fill=GAFF)
    top, bottom = 290, H - 150
    fh, lh, sh = fit(d, s['heading'], BOLD, W - 2 * M, 4, range(74, 40, -2))
    head_h = int(sh * 1.14) * len(lh)
    lines, size, body_h = [], 0, 0
    if s.get('body'):
        room = bottom - top - head_h - 88
        for size in range(48, 26, -2):
            fb = ImageFont.truetype(MED, size)
            lines = wrap(d, s['body'], fb, W - 2 * M)
            body_h = int(size * 1.42) * len(lines)
            if body_h <= room:
                break
    block = head_h + (88 + body_h if lines else 0)
    y = top + max(0, (bottom - top - block) // 3)  # a bit above center
    y = draw_lines(d, lh, fh, sh, M, y, PAPER, 1.14) + 36
    d.rectangle([M, y, M + 80, y + 8], fill=GAFF)
    if lines:
        draw_lines(d, lines, fb, size, M, y + 52, SOFT, 1.42)
    return im


def cta(s, n, total):
    im, d = base(n, total)
    f, lines, size = fit(d, s.get('title', 'The full guide'), BOLD, W - 2 * M, 4, range(92, 48, -4))
    y = draw_lines(d, lines, f, size, M, 300, PAPER, 1.12) + 40
    d.rectangle([M, y, M + 110, y + 10], fill=GAFF)
    y += 60
    fb = ImageFont.truetype(MED, 44)
    draw_lines(d, wrap(d, s.get('body', 'Link in bio · gaffdesk.com/blog'), fb, W - 2 * M), fb, 44, M, y, GAFF, 1.4)
    lg = logo_img(300)
    im.paste(lg, (M, H - 16 - 96 - lg.height), lg)
    return im


def jpeg_bytes(im):
    for q in (86, 80, 74, 68, 60):
        buf = io.BytesIO()
        im.save(buf, 'JPEG', quality=q, optimize=True, progressive=True)
        if buf.tell() <= MAX_BYTES:
            break
    return buf.getvalue()


def main(slug, spec_path):
    spec = json.load(open(spec_path))
    slides = spec['slides']
    if not (3 <= len(slides) <= 10):
        raise SystemExit('Use 3 to 10 slides.')
    if slides[0].get('kind') != 'cover' or slides[-1].get('kind') != 'cta':
        raise SystemExit('First slide must be "cover", last must be "cta".')
    out = os.path.join(ROOT, 'blog', 'social', slug)
    os.makedirs(os.path.join(out, 'db'), exist_ok=True)
    total = len(slides)
    for i, s in enumerate(slides, 1):
        im = {'cover': cover, 'tip': tip, 'cta': cta}[s.get('kind', 'tip')](s, i, total)
        data = jpeg_bytes(im)
        open(os.path.join(out, f'{i}.jpg'), 'wb').write(data)
        doc = {'post': slug, 'n': i, 'total': total,
               'image': 'data:image/jpeg;base64,' + base64.b64encode(data).decode()}
        json.dump(doc, open(os.path.join(out, 'db', f'{i}.json'), 'w'))
        print(f'{out}/{i}.jpg', len(data) // 1024, 'KB')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
