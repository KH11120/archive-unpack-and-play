#!/usr/bin/env python3
"""Make light card thumbnails for the homepage "APTCODER in the Spotlight" strip.

The files in public/News are full-resolution (the two online screenshots are 1.4 MB and
4.5 MB). Cards only need a small preview, so this writes public/News/thumbs/<id>.jpg:
  - scaled to at most 720 px wide (sharp on high-density screens at card size),
  - flattened onto white and saved as JPEG (quality 82).
The newspaper viewer keeps using the original, full-size files. Originals are never modified.

    python3 -m pip install -r requirements-catalogue.txt
    python3 scripts/build-news-thumbnails.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public" / "News"
OUTPUT_DIR = SOURCE_DIR / "thumbs"
MAX_WIDTH = 720

# Card id -> source file, matched by inspecting each image (see src/site/data/news.ts).
SOURCES = {
    "aptcoder-al-imtehaan": "middle east.jpeg",
    "panchkula-sanskriti-school": "panchkula school.jpg",
    "varanasi-csr-mou": "VNS.jpg",
    "theprint-unnati-ai": "theprint unnati.png",
    "ailoitte-case-study": "ailoitte.png",
    "miracle-foundation-education": "miracle.jpg",
}


def main() -> int:
    OUTPUT_DIR.mkdir(exist_ok=True)
    for card_id, filename in SOURCES.items():
        with Image.open(SOURCE_DIR / filename) as image:
            rgba = image.convert("RGBA")
        flat = Image.new("RGB", rgba.size, "white")
        flat.paste(rgba, mask=rgba.getchannel("A"))
        if flat.width > MAX_WIDTH:
            flat = flat.resize(
                (MAX_WIDTH, round(flat.height * MAX_WIDTH / flat.width)), Image.LANCZOS
            )
        target = OUTPUT_DIR / f"{card_id}.jpg"
        flat.save(target, "JPEG", quality=82, optimize=True, progressive=True)
        print(f"{filename} -> {target.relative_to(ROOT)} {flat.size} {target.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
