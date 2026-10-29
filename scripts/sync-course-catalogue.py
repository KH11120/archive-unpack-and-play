#!/usr/bin/env python3
"""Export the simplified Website Courses sheet to a safe, typed site dataset."""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parents[1]
WORKBOOK = ROOT / "docs" / "APTCODER_Website_Course_Catalogue_Spec.xlsx"
OUTPUT = ROOT / "src" / "site" / "data" / "courseCatalogue.generated.json"
REQUIRED_HEADERS = (
    "S.No.",
    "Course Title",
    "Category",
    "Subject",
    "Program Type",
    "Learning Model",
    "Level",
    "Language",
)
UNRESOLVED = {"", "not specified"}
UNRESOLVED_MODELS = UNRESOLVED | {"alts (meaning to confirm)"}


def clean(value: Any) -> str | None:
    if value is None:
        return None
    value = str(value).strip()
    return value or None


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")
    return slug or "course"


def unique_route_slugs(courses: list[dict[str, Any]]) -> None:
    """Give duplicate titles stable, distinct detail routes without changing titles."""
    used: set[str] = set()
    for course in courses:
        base_slug = course["slug"]
        candidate = base_slug
        if candidate in used:
            candidate = f"{base_slug}-{course['id'].lower()}"
        suffix = 2
        while candidate in used:
            candidate = f"{base_slug}-{course['id'].lower()}-{suffix}"
            suffix += 1
        course["routeSlug"] = candidate
        used.add(candidate)


def row_to_course(row: dict[str, Any], row_number: int) -> dict[str, Any]:
    serial = row.get("S.No.")
    if not isinstance(serial, int) or isinstance(serial, bool) or serial < 1:
        raise ValueError(f"Website Courses row {row_number} needs a positive integer S.No.")
    title = clean(row.get("Course Title"))
    if not title:
        raise ValueError(f"Website Courses row {row_number} is missing Course Title")

    return {
        # S.No. is the only stable identifier in the simplified source sheet.
        "id": f"COURSE-{serial:03d}",
        "title": title,
        "slug": slugify(title),
        "routeSlug": slugify(title),
        "catalogueInclusion": "intended",
        # The simplified workbook has no approval field; do not infer approval.
        "offeringApproved": False,
        "category": clean(row.get("Category")),
        "subject": clean(row.get("Subject")),
        "programType": clean(row.get("Program Type")),
        "learningModel": clean(row.get("Learning Model")),
        "level": clean(row.get("Level")),
        "language": clean(row.get("Language")),
        "lessons": None,
        "gradeFrom": None,
        "gradeTo": None,
        "duration": None,
        "shortDescription": None,
        "overview": None,
        "learningOutcomes": [],
        "thumbnailReady": False,
        "thumbnailUrl": None,
        "displayOrder": serial,
        "projects": [],
        "prerequisites": None,
        "certificate": None,
        "enrolCta": None,
        "priceDisplay": None,
        "faqs": [],
        "relatedCourseIds": [],
        "seoTitle": None,
        "seoDescription": None,
        "syllabus": [],
    }


def filter_values(
    courses: list[dict[str, Any]],
    field: str,
    unresolved: set[str] = UNRESOLVED,
    preferred_order: tuple[str, ...] = (),
) -> list[str]:
    values: list[str] = []
    for course in courses:
        value = clean(course.get(field))
        if value and value.casefold() not in unresolved and value not in values:
            values.append(value)
    positions = {value.casefold(): index for index, value in enumerate(preferred_order)}
    return sorted(values, key=lambda value: (positions.get(value.casefold(), len(positions)), values.index(value)))


def main() -> int:
    if not WORKBOOK.is_file():
        print(f"Workbook not found: {WORKBOOK}", file=sys.stderr)
        return 2

    workbook = load_workbook(WORKBOOK, data_only=True, read_only=True)
    if "Website Courses" not in workbook.sheetnames:
        raise ValueError("Workbook is missing the Website Courses sheet")
    sheet = workbook["Website Courses"]
    headers = [clean(cell.value) for cell in sheet[1]]
    missing = [header for header in REQUIRED_HEADERS if header not in headers]
    if missing:
        raise ValueError(f"Website Courses is missing required columns: {', '.join(missing)}")

    courses: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    for row_number, values in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
        if not any(value is not None for value in values):
            continue
        row = {headers[index]: values[index] for index in range(len(headers))}
        course = row_to_course(row, row_number)
        if course["id"] in seen_ids:
            raise ValueError(f"Duplicate S.No. {row['S.No.']} in Website Courses")
        seen_ids.add(course["id"])
        courses.append(course)

    unique_route_slugs(courses)
    options = {
        "categories": filter_values(courses, "category"),
        "learningModels": filter_values(
            courses,
            "learningModel",
            UNRESOLVED_MODELS,
            ("Live", "Assisted Learning (AL)", "Self Learning (SL)"),
        ),
        "levels": filter_values(courses, "level", preferred_order=("Very Easy", "Easy", "Moderate", "Hard")),
        "languages": filter_values(courses, "language", preferred_order=("English", "Hindi")),
        "programTypes": filter_values(
            courses, "programType", preferred_order=("Course", "Camp", "Capstone")
        ),
        # The latest sheet has no grade-range columns, so this stays empty and the UI hides it.
        "grades": [],
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps({"options": options, "courses": courses}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    duplicate_titles = len(courses) - len({course["title"] for course in courses})
    print(f"Website Courses records read: {len(courses)}")
    print("Explicit workbook exclusions: 0 (the simplified workbook has no exclusion sheet)")
    print(f"Distinct categories: {len(options['categories'])}")
    print(f"Duplicate titles retained with unique route slugs: {duplicate_titles}")
    print(f"Publication approval inferred: 0 (approval is not a field in this workbook)")
    print(f"Generated catalogue data: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
