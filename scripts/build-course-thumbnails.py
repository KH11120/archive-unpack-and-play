#!/usr/bin/env python3
"""Create web-sized course thumbnails from the originals in public/Thumbnail Samples.

Reads src/site/data/courseThumbnails.json and writes public/course-thumbnails/<course-id>.jpg
(1280 x 720, 16:9). The originals (public/Thumbnail Samples, or a "/path" under public/) are
only read, never changed. Run after changing the mapping:

    python3 -m pip install -r requirements-catalogue.txt
    python3 scripts/build-course-thumbnails.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
MAPPING = ROOT / "src" / "site" / "data" / "courseThumbnails.json"
SOURCE_DIR = ROOT / "public" / "Thumbnail Samples"
OUTPUT_DIR = ROOT / "public" / "course-thumbnails"
SIZE = (1280, 720)


PUBLIC_DIR = ROOT / "public"


def source_path(source: str) -> Path:
    """A plain file name is in public/Thumbnail Samples; "/videos/x.jpg" is a path under public/."""
    return PUBLIC_DIR / source.lstrip("/") if source.startswith("/") else SOURCE_DIR / source


def output_name(course_id: str) -> str:
    return f"{course_id.lower()}.jpg"


def main() -> int:
    mapping = json.loads(MAPPING.read_text(encoding="utf-8"))["thumbnails"]
    missing = [entry["source"] for entry in mapping.values() if not source_path(entry["source"]).is_file()]
    if missing:
        print("Source images not found:", *missing, sep="\n  ", file=sys.stderr)
        return 1

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    expected = set()
    for course_id, entry in sorted(mapping.items()):
        target = OUTPUT_DIR / output_name(course_id)
        expected.add(target.name)
        with Image.open(source_path(entry["source"])) as image:
            # Centre-crop to exactly 16:9 so cards and detail pages never stretch the image.
            fitted = ImageOps.fit(ImageOps.exif_transpose(image).convert("RGB"), SIZE, Image.LANCZOS)
            fitted.save(target, "JPEG", quality=82, optimize=True, progressive=True)

    for stale in OUTPUT_DIR.glob("*.jpg"):
        if stale.name not in expected:
            stale.unlink()
    print(f"Wrote {len(expected)} thumbnails to {OUTPUT_DIR.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
