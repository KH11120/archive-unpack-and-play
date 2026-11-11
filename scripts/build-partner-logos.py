#!/usr/bin/env python3
"""Make web-ready copies of the partner logos in public/images/organisations.

For every image in that folder (PNG, JPEG, TIFF ...) this writes
public/images/organisations/web/<name>.png:
  - converted to PNG with transparency kept (browsers cannot show TIFF),
  - empty transparent margins trimmed so every logo fills its space evenly,
  - scaled down to at most 160 px tall / 800 px wide (sharp on high-density screens).
It also records each output size in src/site/data/partnerLogoSizes.generated.json so pages
can reserve the right space before the image loads. The originals are never modified.

    python3 -m pip install -r requirements-catalogue.txt
    python3 scripts/build-partner-logos.py
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public" / "images" / "organisations"
OUTPUT_DIR = SOURCE_DIR / "web"
SIZES_FILE = ROOT / "src" / "site" / "data" / "partnerLogoSizes.generated.json"
MAX_HEIGHT, MAX_WIDTH, PADDING = 160, 800, 4


def main() -> int:
    OUTPUT_DIR.mkdir(exist_ok=True)
    sizes: dict[str, dict[str, int]] = {}
    for source in sorted(SOURCE_DIR.iterdir()):
        if not source.is_file() or source.name.startswith("."):
            continue
        with Image.open(source) as image:
            logo = image.convert("RGBA")
        box = logo.getchannel("A").point(lambda alpha: 255 if alpha > 8 else 0).getbbox()
        if box:
            left, top, right, bottom = box
            logo = logo.crop(
                (
                    max(left - PADDING, 0),
                    max(top - PADDING, 0),
                    min(right + PADDING, logo.width),
                    min(bottom + PADDING, logo.height),
                )
            )
        logo.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.LANCZOS)
        name = f"{source.stem}.png"
        logo.save(OUTPUT_DIR / name, "PNG", optimize=True)
        sizes[name] = {"width": logo.width, "height": logo.height}
        print(f"{source.name:28} -> web/{name:26} {logo.width}x{logo.height}")
    SIZES_FILE.write_text(json.dumps(sizes, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
