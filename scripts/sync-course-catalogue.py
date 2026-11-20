#!/usr/bin/env python3
"""Build the website course catalogue from docs/Course_Catalogue_Website.xlsx.

Source: the "Course Master (2)" sheet (one row per course), checked against the dropdown values
on the "Lists (2)" sheet. The older "Course Master" sheet is no longer used.

Rules (all from the workbook):
  - Only rows whose Type is Course, Camp or Capstone and whose LMS Status is Active are used.
    Every such row becomes exactly one website course, so the website count always equals the
    workbook count. Record IDs must be unique.
  - Title: the "Display Name (cleaned from "New Lesson Name")" column; the LMS name only if a
    row has no display name (listed in the report). Nothing is reworded.
  - Subject, Type (= Program Type), Learning Model and Language are copied as written and must be
    values listed on Lists (2). "Not specified" is kept as data; the site never shows it as a
    filter option or badge (see src/site/data/courseCatalogue.ts).
  - Grades: the "Grades Covered" column ("5" or "10, 11, 12") is the full list of grades a course
    covers. The Grade column ("Grade 5" or "Multi-Grade") must agree with it.
  - Age Group and Course Duration are copied as written.
  - Category (the website's category strip): from the Subject, using SUBJECT_TO_CATEGORY below.
    An unmapped subject stops the build.
  - Difficulty and Live Level are kept for reference only; the site has no Level filter.
  - Display order = row order on the sheet.
  - Fields the workbook does not contain (description, lessons, overview, outcomes, syllabus,
    price...) are left empty; the site hides them.
  - Thumbnails are handled separately (src/site/data/courseThumbnails.json).

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
SHEET = "Course Master (2)"
LISTS_SHEET = "Lists (2)"
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
COL_LIVE_LEVEL = "Live Level"
COL_LANGUAGE = "Language"
COL_STATUS = "LMS Status"
COL_GRADES_COVERED = "Grades Covered"
COL_AGE = "Age Group"
COL_DURATION = "Course Duration"
COL_FLAGS = "Data Flags"
REQUIRED_COLUMNS = (
    COL_ID, COL_SNO, COL_LMS_NAME, COL_DISPLAY, COL_TYPE, COL_SUBJECT, COL_MODEL,
    COL_DIFFICULTY, COL_GRADE, COL_LIVE_LEVEL, COL_LANGUAGE, COL_STATUS, COL_GRADES_COVERED,
    COL_AGE, COL_DURATION,
)

# Columns on Lists (2) whose values a Course Master (2) cell must use.
LIST_COLUMNS = (COL_TYPE, COL_SUBJECT, COL_MODEL, COL_LANGUAGE, COL_GRADE)

# Website category (the category strip and homepage links) for each Subject on Lists (2).
SUBJECT_TO_CATEGORY = {
    "Coding": "Coding Foundations",
    "Block Coding": "Coding Foundations",
    "Programming Fundamentals (Codely)": "Coding Foundations",
    "Computer Fundamentals": "Coding Foundations",
    "Python": "Python",
    "Web Development": "Web Development",
    "JavaScript": "JavaScript",
    "App Development": "App Development",
    "Game Development": "Games & Creative Coding",
    "Creative Coding (p5.js)": "Games & Creative Coding",
    "Art & Music with Coding": "Games & Creative Coding",
    "AI & ML": "AI & Data Science",
    "Data Science": "AI & Data Science",
    "Vernatics (Robotics)": "Vernatics",
    "Blockchain": "Blockchain & Cryptography",
    "Cryptography": "Blockchain & Cryptography",
    "Blockchain & Cryptography": "Blockchain & Cryptography",
    "Cloud Computing": "Cloud Computing",
    "General / Multi-subject": "Other",
    "Intellectual Property": "Other",
    "Teacher / Moderator Training": "Other",
}

# Category strip order: AI first (visible without scrolling), Vernatics next, then the
# Wireframes sheet order, with "Other" last.
CATEGORY_ORDER = (
    "AI & Data Science",
    "Vernatics",
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


def parse_grades(record_id: str, grade: str | None, covered: Any) -> list[int]:
    """All grades a course covers, from Grades Covered, checked against the Grade column."""
    text = clean(covered)
    grades: list[int] = []
    if text:
        for part in re.split(r"[,;]", text):
            part = part.strip()
            if not part:
                continue
            if not re.fullmatch(r"\d{1,2}", part) or not 1 <= int(part) <= 12:
                raise ValueError(f"{record_id}: unreadable Grades Covered {text!r}")
            if int(part) not in grades:
                grades.append(int(part))
    single = re.fullmatch(r"Grade (\d{1,2})", grade or "")
    if not grades and single:
        grades = [int(single.group(1))]
    grades.sort()
    if single and grades != [int(single.group(1))]:
        raise ValueError(f"{record_id}: Grade {grade!r} disagrees with Grades Covered {text!r}")
    if grade == "Multi-Grade" and len(grades) < 2:
        raise ValueError(f"{record_id}: Multi-Grade but Grades Covered is {text!r}")
    return grades


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
    record_id = clean(row[COL_ID])
    display = clean(row[COL_DISPLAY])
    lms_name = clean(row[COL_LMS_NAME])
    title = display or lms_name
    if not record_id or not title:
        raise ValueError(f"Row {row.get(COL_SNO)!r} has no Record ID or name")
    subject = clean(row[COL_SUBJECT])
    if subject not in SUBJECT_TO_CATEGORY:
        raise ValueError(f"{record_id}: subject {subject!r} has no website category")
    grades = parse_grades(record_id, clean(row[COL_GRADE]), row[COL_GRADES_COVERED])
    live_level = clean(row[COL_LIVE_LEVEL])

    return {
        "id": record_id,
        "title": title,
        "slug": slugify(title),
        "routeSlug": "",
        "catalogueInclusion": "intended",
        # The workbook has no publish/approval field; approval is never inferred.
        "offeringApproved": False,
        "category": SUBJECT_TO_CATEGORY[subject],
        "subject": subject,
        "programType": clean(row[COL_TYPE]),
        "learningModel": clean(row[COL_MODEL]) or "Not specified",
        # Difficulty / Live Level: reference only (no Level filter on the site).
        "level": clean(row[COL_DIFFICULTY]) or "Not specified",
        "liveLevel": None if live_level in (None, "N/A") else live_level,
        "language": clean(row[COL_LANGUAGE]) or "Not specified",
        "lessons": None,
        "grades": grades,
        "gradeFrom": grades[0] if grades else None,
        "gradeTo": grades[-1] if grades else None,
        "ageGroup": clean(row[COL_AGE]),
        "duration": clean(row[COL_DURATION]),
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
            "revisionLessons": None,
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


def read_lists(workbook) -> dict[str, list[str]]:
    """Dropdown values per column on Lists (2), in sheet order."""
    if LISTS_SHEET not in workbook.sheetnames:
        raise ValueError(f"Workbook is missing the {LISTS_SHEET} sheet")
    rows = workbook[LISTS_SHEET].iter_rows(values_only=True)
    headers = [clean(value) for value in next(rows)]
    lists: dict[str, list[str]] = {header: [] for header in headers if header}
    for values in rows:
        for header, value in zip(headers, values):
            if header and clean(value):
                lists[header].append(clean(value))
    return lists


def main() -> int:
    if not WORKBOOK.is_file():
        print(f"Workbook not found: {WORKBOOK}", file=sys.stderr)
        return 2
    workbook = load_workbook(WORKBOOK, data_only=True, read_only=True)
    if SHEET not in workbook.sheetnames:
        raise ValueError(f"Workbook is missing the {SHEET} sheet")
    lists = read_lists(workbook)
    rows = workbook[SHEET].iter_rows(values_only=True)
    headers = [clean(value) for value in next(rows)]
    missing = [column for column in REQUIRED_COLUMNS if column not in headers]
    if missing:
        raise ValueError(f"{SHEET} is missing columns: {', '.join(missing)}")

    records = [dict(zip(headers, values)) for values in rows if any(v is not None for v in values)]
    for record in records:
        for column in LIST_COLUMNS:
            value = clean(record[column])
            if value and value not in lists.get(column, []):
                raise ValueError(f"{record[COL_ID]}: {column} {value!r} is not on {LISTS_SHEET}")
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
        "subjects": ordered_values(courses, "subject", order=lists[COL_SUBJECT]),
        "learningModels": ordered_values(
            courses, "learningModel", UNRESOLVED_MODELS, lists[COL_MODEL]
        ),
        "languages": ordered_values(courses, "language", order=lists[COL_LANGUAGE]),
        "programTypes": ordered_values(courses, "programType", order=INCLUDED_TYPES),
        "grades": sorted({grade for c in courses for grade in c["grades"]}),
    }

    OUTPUT.write_text(
        json.dumps({"source": f"docs/{WORKBOOK.name} > {SHEET}", "options": options,
                    "courses": courses}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    # ---- Report -------------------------------------------------------------------------
    by_type = Counter((clean(r[COL_TYPE]), clean(r[COL_STATUS])) for r in records)
    print(f"{SHEET} records: {len(records)}")
    for kind in INCLUDED_TYPES:
        inactive = sum(n for (t, s), n in by_type.items() if t == kind and s != ACTIVE)
        print(f"  {kind}: {by_type[(kind, ACTIVE)]} active, {inactive} not active")
    print(f"Courses written to the website catalogue: {len(courses)}")
    for key in ("category", "subject", "learningModel", "language", "duration"):
        print(f"By {key}: {dict(Counter(c[key] for c in courses))}")
    print(f"Options: {json.dumps(options, ensure_ascii=False)}")
    for c in courses:
        if c["source"]["titleFrom"] != "Display Name":
            print(f"  NO DISPLAY NAME - using LMS name for now: {c['id']} {c['title']!r}")
        if not c["grades"]:
            print(f"  NO GRADES: {c['id']} {c['title']!r}")
    flagged = [r for r in selected if clean(r.get(COL_FLAGS))]
    print(f"Rows with Data Flags (shown as written; please confirm in the sheet): {len(flagged)}")
    for r in flagged:
        print(f"  {r[COL_ID]}: {clean(r[COL_FLAGS])}")
    print(f"Generated: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
