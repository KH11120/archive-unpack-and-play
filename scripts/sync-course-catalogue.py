#!/usr/bin/env python3
"""Generate safe catalogue data from intended workbook courses.

The inclusion gate is separate from full offering approval: intended
Website Courses rows are represented unless explicitly excluded. Only fully
approved offerings receive approval-only data such as instructor, reviews,
price, certificate, and enrolment actions.
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parents[1]
WORKBOOK = ROOT / "docs" / "APTCODER_Website_Course_Catalogue_Spec.xlsx"
OUTPUT = ROOT / "src" / "site" / "data" / "courseCatalogue.generated.json"

MODEL_MAP = {
    "live": "Live",
    "assisted learning (al)": "Assisted Learning (AL)",
    "self learning (sl)": "Self Learning (SL)",
}
LEVELS = {"Very Easy", "Easy", "Moderate", "Hard", "All Levels"}
PROGRAM_TYPES = {"Course", "Camp", "Capstone"}
CTA_VALUES = {"Enrol Now", "Book a Free Class", "Contact Us", "Price TBD"}
MAX_OVERVIEW_WORDS = (80, 120)


def clean(value: Any) -> str | None:
    if value is None:
        return None
    value = str(value).strip()
    return value or None


def canonical(value: Any, values: dict[str, str] | set[str]) -> str | None:
    value = clean(value)
    if value is None:
        return None
    if isinstance(values, dict):
        return values.get(value.casefold())
    return next((item for item in values if item.casefold() == value.casefold()), None)


def split_lines(value: Any) -> list[str]:
    return [line.strip() for line in re.split(r"\r?\n", str(value or "")) if line.strip()]


def yes(value: Any) -> bool:
    return (clean(value) or "").casefold() == "yes"


def parse_faqs(value: Any) -> list[dict[str, str]]:
    rows = []
    for line in split_lines(value):
        question, separator, answer = line.partition("|")
        if separator and question.strip() and answer.strip():
            rows.append({"question": question.strip(), "answer": answer.strip()})
    return rows


def parse_projects(value: Any) -> list[dict[str, str]]:
    rows = []
    for line in split_lines(value):
        title, separator, description = line.partition(" - ")
        if title.strip():
            rows.append({"title": title.strip(), "description": description.strip() if separator else ""})
    return rows


def publication_errors(
    record: dict[str, Any], required: list[str], approved_lists: dict[str, set[str]]
) -> list[str]:
    errors: list[str] = []
    for field in required:
        value = record.get(field)
        if value is None or (isinstance(value, str) and not value.strip()):
            errors.append(field)

    title = record.get("Course Title")
    if title and len(title) > 60:
        errors.append("Course Title (max 60 characters)")
    slug = record.get("URL Slug (suggested)")
    if slug and not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        errors.append("URL Slug (lowercase hyphenated format)")
    if record.get("Program Type") and record["Program Type"] not in PROGRAM_TYPES:
        errors.append("Program Type (unresolved dropdown value)")
    if record.get("Learning Model") and record["Learning Model"] not in MODEL_MAP.values():
        errors.append("Learning Model (unresolved dropdown value)")
    if record.get("Level") and record["Level"] not in LEVELS:
        errors.append("Level (unresolved dropdown value)")
    for field in ("Category", "Subject", "Language"):
        if record.get(field) and record[field] not in approved_lists.get(field, set()):
            errors.append(f"{field} (unresolved dropdown value)")
    for field in ("Category", "Subject", "Language"):
        if (clean(record.get(field)) or "").casefold() == "not specified":
            errors.append(f"{field} (value is unresolved: Not specified)")
    if record.get("Enrol CTA") and record["Enrol CTA"] not in CTA_VALUES:
        errors.append("Enrol CTA (unresolved dropdown value)")
    for field in ("Grade From", "Grade To"):
        value = record.get(field)
        if value is not None and (not isinstance(value, int) or value < 1 or value > 12):
            errors.append(f"{field} (must be grade 1-12)")
    if isinstance(record.get("Grade From"), int) and isinstance(record.get("Grade To"), int):
        if record["Grade From"] > record["Grade To"]:
            errors.append("Grade range (From must not exceed To)")
    lessons = record.get("Lessons")
    if lessons is not None and (not isinstance(lessons, int) or lessons < 1):
        errors.append("Lessons (must be a positive whole number)")
    short_description = record.get("Short Description")
    if short_description and len(short_description) > 120:
        errors.append("Short Description (max 120 characters)")
    overview = record.get("Overview")
    if overview:
        word_count = len(overview.split())
        if not MAX_OVERVIEW_WORDS[0] <= word_count <= MAX_OVERVIEW_WORDS[1]:
            errors.append("Overview (80-120 words)")
    outcomes = record.get("What You'll Learn")
    if outcomes:
        parsed = split_lines(outcomes)
        if not 4 <= len(parsed) <= 6:
            errors.append("What You'll Learn (4-6 outcomes)")
    if clean(record.get("Thumbnail Ready")) and not yes(record["Thumbnail Ready"]):
        errors.append("Thumbnail Ready (must be Yes)")
    return list(dict.fromkeys(errors))


def record_to_catalogue(
    row: dict[str, Any],
    sheets: dict[str, list[dict[str, Any]]],
    offering_approved: bool,
) -> dict[str, Any]:
    def text(field: str) -> str | None:
        return clean(row.get(field))

    model_raw = text("Learning Model")
    model = canonical(model_raw, MODEL_MAP) or model_raw
    level_raw = text("Level")
    level = canonical(level_raw, LEVELS) or level_raw
    program_raw = text("Program Type")
    program = canonical(program_raw, PROGRAM_TYPES) or program_raw
    slug = text("URL Slug (suggested)") or ""
    thumbnail_candidates = [
        ROOT / "public" / "images" / "courses" / f"{slug}.{extension}"
        for extension in ("webp", "png", "jpg", "jpeg")
    ]
    thumbnail_path = next((path for path in thumbnail_candidates if path.is_file()), None)
    outcomes = split_lines(row.get("What You'll Learn"))

    public: dict[str, Any] = {
        "id": text("Web Course ID"),
        "title": text("Course Title"),
        "slug": slug,
        "routeSlug": slug,
        "catalogueInclusion": "intended",
        "offeringApproved": offering_approved,
        "category": text("Category"),
        "subject": text("Subject"),
        "programType": program,
        "learningModel": model,
        "level": level,
        "language": text("Language"),
        "lessons": row.get("Lessons") if isinstance(row.get("Lessons"), int) else None,
        "gradeFrom": row.get("Grade From") if isinstance(row.get("Grade From"), int) else None,
        "gradeTo": row.get("Grade To") if isinstance(row.get("Grade To"), int) else None,
        "duration": text("Duration"),
        "shortDescription": text("Short Description"),
        "overview": text("Overview"),
        "learningOutcomes": outcomes,
        "thumbnailReady": yes(row.get("Thumbnail Ready")),
        "thumbnailUrl": f"/images/courses/{thumbnail_path.name}" if thumbnail_path else None,
        "displayOrder": row.get("Display Order"),
        "projects": parse_projects(row.get("Projects You'll Build")),
        "prerequisites": text("Prerequisites / Who It's For"),
        "certificate": text("Certificate") if offering_approved else None,
        "enrolCta": text("Enrol CTA") if offering_approved else None,
        "priceDisplay": text("Price Display") if offering_approved else None,
        "faqs": parse_faqs(row.get("Course FAQs")),
        "relatedCourseIds": [item.strip() for item in (text("Related Course IDs") or "").split(",") if item.strip()],
        "seoTitle": text("SEO Title"),
        "seoDescription": text("SEO Meta Description"),
        "syllabus": [],
    }

    course_id = public["id"]
    public["syllabus"] = [
        {
            "moduleNumber": item.get("Module No."),
            "moduleTitle": clean(item.get("Module Title")),
            "lessonNumber": item.get("Lesson No."),
            "lessonTitle": clean(item.get("Lesson Title")),
            "outcome": clean(item.get("What the student does / learns")),
            "projectLesson": yes(item.get("Project lesson?")),
        }
        for item in sheets.get("Syllabus", [])
        if clean(item.get("Web Course ID")) == course_id
        and clean(item.get("Web Course ID")) != "EXAMPLE"
    ]

    instructors = {
        clean(item.get("Instructor ID")): item
        for item in sheets.get("Instructors", [])
        if clean(item.get("Instructor ID"))
    }
    instructor = instructors.get(clean(row.get("Instructor ID"))) if offering_approved else None
    if (
        instructor
        and yes(instructor.get("Consent to publish"))
        and clean(instructor.get("Name"))
        and clean(instructor.get("Short bio (max 60 words)"))
    ):
        public["instructor"] = {
            "name": clean(instructor.get("Name")),
            "role": clean(instructor.get("Role (Teacher / Mentor)")),
            "background": clean(instructor.get("Background / qualification")),
            "bio": clean(instructor.get("Short bio (max 60 words)")),
            "languages": split_lines(instructor.get("Languages taught in")),
            "photoUrl": None,
            "consentToPublish": True,
        }

    public["reviews"] = [
        {
            "reviewerName": clean(item.get("Reviewer name (as consented)")),
            "relationship": clean(item.get("Relationship")),
            "text": clean(item.get("Review text (verbatim)")),
            "rating": item.get("Rating (1-5, only if collected)"),
            "consentToPublish": True,
        }
        for item in sheets.get("Reviews", [])
        if offering_approved
        and clean(item.get("Web Course ID")) == course_id
        and yes(item.get("Consent to publish"))
        and clean(item.get("Reviewer name (as consented)"))
        and clean(item.get("Review text (verbatim)"))
    ]
    if public.get("certificate") != "Yes - verified":
        public["certificate"] = None
    return public


def unique_route_slugs(courses: list[dict[str, Any]]) -> None:
    """Preserve workbook slugs while assigning stable routes for collisions."""
    used: set[str] = set()
    for course in courses:
        slug = course["slug"]
        candidate = slug
        if candidate in used:
            candidate = f"{slug}-{str(course['id']).lower()}"
        suffix = 2
        while candidate in used:
            candidate = f"{slug}-{str(course['id']).lower()}-{suffix}"
            suffix += 1
        course["routeSlug"] = candidate
        used.add(candidate)


def is_explicitly_excluded(row: dict[str, Any], excluded_ids: set[str]) -> bool:
    ids = [part.strip() for part in re.split(r"[,;\n]+", str(row.get("LMS Record IDs") or "")) if part.strip()]
    return bool(ids and set(ids).issubset(excluded_ids))


def main() -> int:
    if not WORKBOOK.is_file():
        print(f"Workbook not found: {WORKBOOK}", file=sys.stderr)
        return 2

    wb = load_workbook(WORKBOOK, data_only=True, read_only=True)
    website_ws = wb["Website Courses"]
    headers = [clean(cell.value) for cell in website_ws[1]]
    headers = [header for header in headers if header is not None]
    guide = wb["Field Guide"]
    required = [
        str(row[0]).strip()
        for row in guide.iter_rows(min_row=5, values_only=True)
        if row[0] and str(row[3] or "").strip().casefold() == "yes"
    ]
    lists_ws = wb["Lists"]
    list_headers = [clean(cell.value) for cell in lists_ws[1]]
    approved_lists = {
        header: {
            str(value).strip()
            for value in lists_ws.iter_rows(min_row=2, values_only=True)
            for column, value in enumerate(value)
            if column < len(list_headers)
            and list_headers[column] == header
            and value is not None
        }
        for header in ("Category", "Subject", "Language")
    }
    list_rows = list(lists_ws.iter_rows(min_row=2, values_only=True))

    def dropdown_values(field: str) -> list[str]:
        column = list_headers.index(field)
        return list(dict.fromkeys(str(row[column]).strip() for row in list_rows if row[column]))

    filter_options = {
        "categories": dropdown_values("Category"),
        "learningModels": dropdown_values("Learning Model"),
        "levels": [value for value in dropdown_values("Level") if value != "All Levels"],
        "languages": dropdown_values("Language"),
        "programTypes": dropdown_values("Program Type"),
        "grades": [
            int(value)
            for value in dropdown_values("Grade Num")
            if str(value).strip().isdigit() and 1 <= int(value) <= 12
        ],
    }
    course_rows = []
    for values in website_ws.iter_rows(min_row=2, values_only=True):
        if not values or values[0] is None:
            continue
        course_rows.append({headers[index]: value for index, value in enumerate(values[: len(headers)])})

    # Excluded Records contains LMS source IDs, while Website Courses can merge
    # multiple LMS rows. Exclude a website row only when every source ID is
    # explicitly excluded; partial overlap does not discard intended content.
    excluded_ws = wb["Excluded Records"]
    excluded_ids = {
        clean(values[0])
        for values in excluded_ws.iter_rows(min_row=5, values_only=True)
        if values and clean(values[0])
    }

    excluded_rows = [
        row for row in course_rows if is_explicitly_excluded(row, excluded_ids)
    ]
    included_rows = [row for row in course_rows if row not in excluded_rows]
    sheets: dict[str, list[dict[str, Any]]] = {}
    for name in ("Syllabus", "Instructors", "Reviews"):
        ws = wb[name]
        sheet_headers = [clean(cell.value) for cell in ws[4 if name == "Syllabus" else 3]]
        sheet_headers = [header for header in sheet_headers if header is not None]
        start = 5
        rows = []
        for values in ws.iter_rows(min_row=start, values_only=True):
            if not any(value is not None for value in values):
                continue
            row = {sheet_headers[index]: value for index, value in enumerate(values[: len(sheet_headers)])}
            if any(value is not None for value in row.values()):
                rows.append(row)
        sheets[name] = rows

    status_counts = Counter((clean(row.get("Publish Status")) or "(blank)") for row in course_rows)
    slug_counts = Counter(clean(row.get("URL Slug (suggested)")) for row in included_rows)
    included: list[dict[str, Any]] = []
    for row in included_rows:
        if not clean(row.get("Web Course ID")) or not clean(row.get("Course Title")):
            raise ValueError("Every intended Website Courses row must retain a Web Course ID and Course Title")
        valid_offering = (
            (clean(row.get("Publish Status")) or "").casefold() == "published"
            and not publication_errors(row, required, approved_lists)
            and slug_counts[clean(row.get("URL Slug (suggested)"))] == 1
        )
        included.append(record_to_catalogue(row, sheets, valid_offering))

    unique_route_slugs(included)
    categories_with_courses = {course["category"] for course in included if course.get("category")}
    filter_options["categories"] = [
        value for value in filter_options["categories"] if value in categories_with_courses
    ]

    OUTPUT.write_text(
        json.dumps({"options": filter_options, "courses": included}, ensure_ascii=False, indent=2)
        + "\n",
        encoding="utf-8",
    )
    print(f"Intended Website Courses rows: {len(course_rows)}")
    print(f"Explicitly excluded Website Courses rows: {len(excluded_rows)}")
    print(f"Catalogue records included: {len(included)}")
    print(f"Publication workflow statuses (kept workbook-only): {dict(status_counts)}")
    print(f"Fully approved offerings: {sum(course['offeringApproved'] for course in included)}")
    print(f"Unresolved duplicate slug groups retained: {sum(count > 1 for count in slug_counts.values())}")
    print(f"Records in duplicate slug groups: {sum(count for count in slug_counts.values() if count > 1)}")
    print(f"Excluded Records sheet source rows: {len(excluded_ids)} (no internal rows exported)")
    print(f"Generated safe catalogue data: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
