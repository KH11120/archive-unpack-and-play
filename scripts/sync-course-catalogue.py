#!/usr/bin/env python3
"""Build the website course catalogue from docs/Course_Catalogue_Website.xlsx (Course Master).

Rules (all from the workbook):
  - Only rows whose Type is Course, Camp or Capstone and whose LMS Status is Active are used.
    Every such row becomes exactly one website course (duplicate names are kept as separate
    courses, because each is its own LMS record), so the website count always equals the
    workbook count.
  - Title: the "Display Name (cleaned from "New Lesson Name")" column. Only if a row has no
    display name is the original LMS name used, and every such row is listed in the report
    so the Display Name can be filled in. Nothing is reworded.
  - Category: the website categories named on the Catalogue Page / Wireframes sheets, assigned
    from the Subject column using SUBJECT_TO_CATEGORY below (the same subject-to-category
    placement as APTCODER's previous Website Courses sheet). An unmapped subject stops the build.
  - Program Type = Type; Learning Model, Level (= Difficulty), Live Level and Language are copied
    as written. The card shows Live Level for Live courses and Difficulty for all others.
    "Not specified", "ALTS (meaning to confirm)" etc. are kept as data; the site never shows
    them as filter options or badges (see src/site/data/courseCatalogue.ts).
  - Grade "Grade N" gives Grade From = Grade To = N; "Not specified" gives no grade.
  - Lessons = the Lessons column (revision lessons are reported separately, not added).
  - Display order = Course Master row order (the workbook has no Display Order column).
  - Fields the workbook does not contain (short description, duration, overview, outcomes,
    syllabus, price, enrol CTA, publish status...) are left empty; the site hides them.
  - Thumbnails are handled separately and are not read here.

    python3 -m pip install -r requirements-catalogue.txt
    python3 scripts/sync-course-catalogue.py
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
WORKBOOK = ROOT / "docs" / "Course_Catalogue_Website.xlsx"
SHEET = "Course Master"
OUTPUT = ROOT / "src" / "site" / "data" / "courseCatalogue.generated.json"

INCLUDED_TYPES = ("Course", "Camp", "Capstone")
ACTIVE = "Active"

COL_ID = "Record ID"
COL_SNO = "Source Sno."
COL_LMS_NAME = "LMS Course Name (original)"
COL_DISPLAY = 'Display Name (cleaned from "New Lesson Name")'
COL_TYPE = "Type"
COL_SUBJECT = "Subject"
COL_MODEL = "Learning Model"
COL_DIFFICULTY = "Difficulty"
COL_GRADE = "Grade"
COL_LANGUAGE = "Language"
COL_LIVE_LEVEL = "Live Level"
COL_STATUS = "LMS Status"
COL_LESSONS = "Lessons"
COL_REVISION = "Revision Lessons"
REQUIRED_COLUMNS = (
    COL_ID, COL_SNO, COL_LMS_NAME, COL_DISPLAY, COL_TYPE, COL_SUBJECT, COL_MODEL,
    COL_DIFFICULTY, COL_GRADE, COL_LANGUAGE, COL_STATUS, COL_LESSONS, COL_REVISION,
    COL_LIVE_LEVEL,
)

# Website category for each Course Master Subject. Category names are those on the workbook's
# Catalogue Page and Wireframes sheets; the placement matches the previous Website Courses sheet.
SUBJECT_TO_CATEGORY = {
    "Block Coding": "Coding Foundations",
    "Programming Fundamentals (Codely)": "Coding Foundations",
    "Python": "Python",
    "Web Development": "Web Development",
    "JavaScript": "JavaScript",
    "App Development": "App Development",
    "Game Development": "Games & Creative Coding",
    "Creative Coding (p5.js)": "Games & Creative Coding",
    "Art & Music with Coding": "Games & Creative Coding",
    "AI & ML": "AI & Data Science",
    "Data Science": "AI & Data Science",
    "Blockchain": "Blockchain & Cryptography",
    "Cryptography": "Blockchain & Cryptography",
    "Blockchain & Cryptography": "Blockchain & Cryptography",
    "Cloud Computing": "Cloud Computing",
    "General / Multi-subject": "Other",
    "Intellectual Property": "Other",
}

# Category bar order: AI first (so it is visible without scrolling), then the Wireframes
# sheet order, with "Other" last.
CATEGORY_ORDER = (
    "AI & Data Science",
    "Coding Foundations",
    "Python",
    "Web Development",
    "JavaScript",
    "App Development",
    "Games & Creative Coding",
    "Blockchain & Cryptography",
    "Cloud Computing",
    "Other",
)

UNRESOLVED = {"", "not specified"}
UNRESOLVED_MODELS = UNRESOLVED | {"alts (meaning to confirm)", "recorded", "n/a (assessment)"}


def clean(value: Any) -> str | None:
    if value is None:
        return None
    text = re.sub(r"\s+", " ", str(value)).strip()
    return text or None


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")


def whole_number(value: Any) -> int | None:
    if isinstance(value, bool) or value in (None, ""):
        return None
    if isinstance(value, (int, float)) and float(value).is_integer():
        return int(value)
    raise ValueError(f"Expected a whole number, got {value!r}")


def grade_number(value: str | None) -> int | None:
    match = re.fullmatch(r"Grade (\d{1,2})", value or "")
    return int(match.group(1)) if match else None


def assign_route_slugs(courses: list[dict[str, Any]]) -> None:
    """Every course gets a distinct, stable URL. Titles that are not ASCII (e.g. Hindi) or are
    shared by several records get the record ID added; titles themselves never change."""
    title_counts = Counter(course["slug"] for course in courses)
    used: set[str] = set()
    for course in courses:
        base = course["slug"]
        record = course["id"].lower()
        candidate = base if base and title_counts[base] == 1 else f"{base}-{record}".strip("-")
        if candidate in used:
            raise ValueError(f"Route slug collision: {candidate}")
        course["routeSlug"] = candidate
        used.add(candidate)


def row_to_course(row: dict[str, Any]) -> dict[str, Any]:
    display = clean(row[COL_DISPLAY])
    lms_name = clean(row[COL_LMS_NAME])
    title = display or lms_name
    if not title:
        raise ValueError(f"{row[COL_ID]} has no name")
    subject = clean(row[COL_SUBJECT])
    if subject not in SUBJECT_TO_CATEGORY:
        raise ValueError(f"{row[COL_ID]}: subject {subject!r} has no website category")
    grade = grade_number(clean(row[COL_GRADE]))

    return {
        "id": clean(row[COL_ID]),
        "title": title,
        "slug": slugify(title),
        "routeSlug": "",
        "catalogueInclusion": "intended",
        # The workbook has no publish/approval field; approval is never inferred.
        "offeringApproved": False,
        "category": SUBJECT_TO_CATEGORY[subject],
        "subject": subject,
        "programType": clean(row[COL_TYPE]),
        "learningModel": clean(row[COL_MODEL]),
        "level": clean(row[COL_DIFFICULTY]),
        # "Level 1".."Level 3" from the Live Level column; "N/A" means none.
        "liveLevel": None if clean(row[COL_LIVE_LEVEL]) in (None, "N/A") else clean(row[COL_LIVE_LEVEL]),
        "language": clean(row[COL_LANGUAGE]),
        "lessons": whole_number(row[COL_LESSONS]),
        "gradeFrom": grade,
        "gradeTo": grade,
        "duration": None,
        "shortDescription": None,
        "overview": None,
        "learningOutcomes": [],
        "thumbnailReady": False,
        "thumbnailUrl": None,
        "displayOrder": None,
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
        # Source traceability (not shown on the site).
        "source": {
            "sourceSno": clean(row[COL_SNO]),
            "lmsName": lms_name,
            "titleFrom": "Display Name" if display else "LMS Course Name",
            "revisionLessons": whole_number(row[COL_REVISION]),
        },
    }


def ordered_values(courses, field, unresolved=UNRESOLVED, order=()) -> list[str]:
    values: list[str] = []
    for course in courses:
        value = course.get(field)
        if value and value.casefold() not in unresolved and value not in values:
            values.append(value)
    rank = {value.casefold(): index for index, value in enumerate(order)}
    return sorted(values, key=lambda v: (rank.get(v.casefold(), len(rank)), values.index(v)))


def main() -> int:
    if not WORKBOOK.is_file():
        print(f"Workbook not found: {WORKBOOK}", file=sys.stderr)
        return 2
    workbook = load_workbook(WORKBOOK, data_only=True, read_only=True)
    if SHEET not in workbook.sheetnames:
        raise ValueError(f"Workbook is missing the {SHEET} sheet")
    rows = workbook[SHEET].iter_rows(values_only=True)
    headers = [clean(value) for value in next(rows)]
    missing = [column for column in REQUIRED_COLUMNS if column not in headers]
    if missing:
        raise ValueError(f"{SHEET} is missing columns: {', '.join(missing)}")

    records = [dict(zip(headers, values)) for values in rows if any(v is not None for v in values)]
    selected = [
        r for r in records
        if clean(r[COL_TYPE]) in INCLUDED_TYPES and clean(r[COL_STATUS]) == ACTIVE
    ]
    courses = [row_to_course(record) for record in selected]
    for order, course in enumerate(courses, start=1):
        course["displayOrder"] = order
    if len({course["id"] for course in courses}) != len(courses):
        raise ValueError("Duplicate Record IDs among selected courses")
    assign_route_slugs(courses)

    options = {
        "categories": ordered_values(courses, "category", order=CATEGORY_ORDER),
        "learningModels": ordered_values(
            courses, "learningModel", UNRESOLVED_MODELS,
            ("Live", "Assisted Learning (AL)", "Self Learning (SL)"),
        ),
        "levels": ordered_values(
            courses, "level", order=("Very Easy", "Easy", "Moderate", "Hard", "All Levels")
        ),
        "languages": ordered_values(courses, "language", order=("English", "Hindi")),
        "programTypes": ordered_values(courses, "programType", order=INCLUDED_TYPES),
        "grades": sorted({c["gradeFrom"] for c in courses if c["gradeFrom"] is not None}),
    }

    OUTPUT.write_text(
        json.dumps({"source": f"docs/{WORKBOOK.name} > {SHEET}", "options": options,
                    "courses": courses}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    # ---- Report -------------------------------------------------------------------------
    by_type = Counter((clean(r[COL_TYPE]), clean(r[COL_STATUS])) for r in records)
    print(f"Course Master records: {len(records)}")
    for kind in INCLUDED_TYPES:
        inactive = sum(n for (t, s), n in by_type.items() if t == kind and s != ACTIVE)
        print(f"  {kind}: {by_type[(kind, ACTIVE)]} active, {inactive} not active")
    print(f"Active Course + Camp + Capstone in workbook: {len(selected)}")
    print(f"Courses written to the website catalogue: {len(courses)}")
    print(f"By category: {dict(Counter(c['category'] for c in courses))}")
    from_display = sum(c["source"]["titleFrom"] == "Display Name" for c in courses)
    print(f"Titles from Display Name: {from_display} of {len(courses)}")
    for c in courses:
        if c["source"]["titleFrom"] != "Display Name":
            print(f"  NO DISPLAY NAME - using LMS name for now: {c['id']} {c['title']!r}")
    shared = Counter(c["title"] for c in courses)
    print(f"Titles shared by more than one course: {sum(n > 1 for n in shared.values())} titles, "
          f"{sum(n for n in shared.values() if n > 1)} courses")
    print(f"Generated: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
