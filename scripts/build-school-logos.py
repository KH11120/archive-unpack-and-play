#!/usr/bin/env python3
"""Make web-sized school logos for the School page "Trusted by Schools" row.

The originals in public/images/school are large PNGs (up to 0.9 MB) with very different
amounts of empty transparent space around the artwork, which makes logos look unevenly
sized in identical boxes. For each logo this writes public/images/school/web/<name>.png:
  - transparent margins trimmed (the artwork itself is not cropped, recoloured or redrawn),
  - scaled to at most 240 px tall (sharp at the ~80 px display size on high-density screens).
Originals are never modified.

    python3 -m pip install -r requirements-catalogue.txt
    python3 scripts/build-school-logos.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public" / "images" / "school"
OUTPUT_DIR = SOURCE_DIR / "web"
MAX_HEIGHT = 240


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for source in sorted(SOURCE_DIR.glob("*.png")):
        with Image.open(source) as image:
            logo = image.convert("RGBA")
        # Ignore near-invisible anti-aliasing specks when finding the artwork's edges.
        box = logo.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
        logo = logo.crop(box)
        if logo.height > MAX_HEIGHT:
            width = round(logo.width * MAX_HEIGHT / logo.height)
            logo = logo.resize((width, MAX_HEIGHT), Image.Resampling.LANCZOS)
        out = OUTPUT_DIR / source.name
        logo.save(out, optimize=True)
        print(f"{out.relative_to(ROOT)}  {logo.width}x{logo.height}  {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
