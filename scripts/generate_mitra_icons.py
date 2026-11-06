from pathlib import Path
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1] / "public"
BASE = 1024
SCALE = BASE / 256


def point(x, y):
    return round(x * SCALE), round(y * SCALE)


def cubic(p0, p1, p2, p3, steps=48):
    points = []
    for n in range(steps + 1):
        t = n / steps
        u = 1 - t
        x = u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0]
        y = u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1]
        points.append((round(x), round(y)))
    return points


def build_icon(size):
    mask = Image.new("L", (BASE, BASE), 0)
    ImageDraw.Draw(mask).rounded_rectangle((16, 16, BASE-16, BASE-16), radius=232, fill=255)

    gradient = Image.new("RGBA", (BASE, BASE))
    pixels = gradient.load()
    for y in range(BASE):
        fy = y / (BASE - 1)
        for x in range(BASE):
            fx = x / (BASE - 1)
            t = min(1, max(0, fy * .66 + fx * .22))
            top = (112, 19, 211)
            bottom = (39, 0, 94)
            glow = max(0, 1 - (((fx-.35)**2 + (fy-.1)**2) ** .5) * 1.8)
            pixels[x, y] = tuple(round(top[i]*(1-t) + bottom[i]*t + [15, 3, 23][i]*glow) for i in range(3)) + (255,)
    gradient.putalpha(mask)
    draw = ImageDraw.Draw(gradient)

    def poly(coords, fill):
        draw.polygon([point(x, y) for x, y in coords], fill=fill)

    def line(coords, fill, width):
        draw.line([point(x, y) for x, y in coords], fill=fill, width=round(width*SCALE), joint="curve")

    # Green card behind the wallet.
    poly([(75, 72), (138, 44), (168, 36), (182, 43), (189, 65), (117, 93)], (39, 226, 112, 255))
    # Wallet body and the expressive M mark.
    line(cubic((72, 82), (106, 79), (135, 82), (169, 82)) + cubic((169, 82), (178, 82), (181, 88), (181, 99)), (255, 255, 255, 255), 8)
    line(cubic((52, 174), (62, 145), (63, 111), (75, 112)) + cubic((75, 112), (88, 112), (99, 155), (111, 146)) + cubic((111, 146), (126, 132), (136, 107), (149, 110)) + cubic((149, 110), (163, 112), (168, 147), (181, 174)), (255, 255, 255, 255), 21)
    # Ledger bars and the golden progress curve.
    draw.rounded_rectangle((*point(91, 161), *point(103, 184)), radius=round(3*SCALE), fill=(221, 204, 255, 255))
    draw.rounded_rectangle((*point(111, 153), *point(123, 184)), radius=round(3*SCALE), fill=(221, 204, 255, 255))
    draw.rounded_rectangle((*point(131, 144), *point(143, 184)), radius=round(3*SCALE), fill=(221, 204, 255, 255))
    line(cubic((75, 198), (108, 221), (157, 218), (187, 190)), (255, 202, 24, 255), 10)
    # Wallet clasp.
    draw.rounded_rectangle((*point(164, 117), *point(193, 143)), radius=round(7*SCALE), fill=(101, 20, 191, 255), outline=(255, 255, 255, 255), width=round(4*SCALE))
    draw.ellipse((*point(172, 125), *point(182, 135)), fill=(255, 202, 24, 255))

    result = gradient.resize((size, size), Image.Resampling.LANCZOS)
    return result


for size in (192, 512):
    build_icon(size).save(ROOT / f"icon-{size}.png", optimize=True)
