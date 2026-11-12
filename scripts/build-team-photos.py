#!/usr/bin/env python3
"""Make web-sized square portraits for the About page "Meet Our Team" section.

The originals in public/images/team are large PNGs (0.6-0.9 MB each) and differently framed:
  - gaurav-agrawal.png is a rectangular photo,
  - ashish_bhatt.png is already cut into a circle on a white background.
The section shows both as identical circles, so this writes public/images/team/web/<id>.jpg:
a square crop (head and shoulders) at 560 x 560, JPEG quality 85. Originals are never modified.

    python3 -m pip install -r requirements-catalogue.txt
    python3 scripts/build-team-photos.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public" / "images" / "team"
OUTPUT_DIR = SOURCE_DIR / "web"
SIZE = 560

# id -> (source file, square crop box (left, top, right, bottom) in source pixels)
SOURCES = {
    # Head and shoulders, centred on the face, at a similar scale to the other portrait.
    "gaurav-agrawal": ("gaurav-agrawal.png", (150, 90, 630, 570)),
    # Inside the supplied circle (centre ~633,627, diameter ~1234), trimmed slightly so its
    # thin outer ring and the white corners never show once the page clips it to a circle.
    "ashish-bhatt": ("ashish_bhatt.png", (53, 47, 1213, 1207)),
}


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for card_id, (name, box) in SOURCES.items():
        with Image.open(SOURCE_DIR / name) as image:
            portrait = image.convert("RGB").crop(box).resize((SIZE, SIZE), Image.Resampling.LANCZOS)
            out = OUTPUT_DIR / f"{card_id}.jpg"
            portrait.save(out, "JPEG", quality=85, optimize=True, progressive=True)
            print(f"{out.relative_to(ROOT)}  {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
