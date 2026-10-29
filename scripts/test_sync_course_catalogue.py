"""Tests for mapping the simplified workbook to website-safe course data."""

import importlib.util
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("sync-course-catalogue.py")
SPEC = importlib.util.spec_from_file_location("sync_course_catalogue", MODULE_PATH)
sync = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(sync)


class CatalogueExportTests(unittest.TestCase):
    def test_maps_only_the_available_workbook_fields(self):
        course = sync.row_to_course(
            {
                "S.No.": 7,
                "Course Title": "Python Practice",
                "Category": "Python",
                "Subject": "Python",
                "Program Type": "Camp",
                "Learning Model": "Live",
                "Level": "Moderate",
                "Language": "English",
            },
            8,
        )
        self.assertEqual(course["id"], "COURSE-007")
        self.assertEqual(course["slug"], "python-practice")
        self.assertEqual(course["category"], "Python")
        self.assertEqual(course["programType"], "Camp")
        self.assertEqual(course["offeringApproved"], False)
        self.assertIsNone(course["duration"])
        self.assertIsNone(course["gradeFrom"])
        self.assertIsNone(course["thumbnailUrl"])
        self.assertEqual(course["learningOutcomes"], [])

    def test_optional_fields_can_be_missing_without_dropping_a_course(self):
        course = sync.row_to_course(
            {
                "S.No.": 1,
                "Course Title": "Course with sparse details",
                "Category": "Other",
                "Subject": "General / Multi-subject",
                "Program Type": "Course",
                "Learning Model": "Not specified",
                "Level": "Not specified",
                "Language": "Not specified",
            },
            2,
        )
        self.assertEqual(course["catalogueInclusion"], "intended")
        self.assertEqual(course["learningModel"], "Not specified")
        self.assertEqual(course["level"], "Not specified")

    def test_unresolved_values_do_not_become_filter_options(self):
        courses = [
            {"learningModel": "Live"},
            {"learningModel": "Assisted Learning (AL)"},
            {"learningModel": "ALTS (meaning to confirm)"},
            {"learningModel": "Not specified"},
        ]
        self.assertEqual(
            sync.filter_values(
                courses,
                "learningModel",
                sync.UNRESOLVED_MODELS,
                ("Live", "Assisted Learning (AL)", "Self Learning (SL)"),
            ),
            ["Live", "Assisted Learning (AL)"],
        )

    def test_duplicate_titles_are_retained_with_unique_routes(self):
        courses = [
            {"id": "COURSE-001", "title": "Python Practice", "slug": "python-practice"},
            {"id": "COURSE-002", "title": "Python Practice", "slug": "python-practice"},
        ]
        sync.unique_route_slugs(courses)
        self.assertEqual(
            [course["routeSlug"] for course in courses],
            ["python-practice", "python-practice-course-002"],
        )

    def test_invalid_or_duplicate_serial_numbers_are_rejected_by_mapping(self):
        row = {
            "S.No.": "",
            "Course Title": "A title",
        }
        with self.assertRaisesRegex(ValueError, "positive integer S.No."):
            sync.row_to_course(row, 4)

    def test_required_headers_match_the_latest_simplified_workbook(self):
        self.assertEqual(
            sync.REQUIRED_HEADERS,
            (
                "S.No.",
                "Course Title",
                "Category",
                "Subject",
                "Program Type",
                "Learning Model",
                "Level",
                "Language",
            ),
        )


if __name__ == "__main__":
    unittest.main()
