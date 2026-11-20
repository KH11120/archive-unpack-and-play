"""Tests for building the website catalogue from the Course Master (2) sheet."""

import importlib.util
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("sync-course-catalogue.py")
SPEC = importlib.util.spec_from_file_location("sync_course_catalogue", MODULE_PATH)
sync = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(sync)


def row(**overrides):
    base = {
        "Record ID": "CRS-028",
        "Source Sno.": 28,
        "LMS Course Name (original)": "Block-Based Coding Applications (English)",
        'Display Name (cleaned from "New Lesson Name")': "Block-Based Coding Applications",
        "Type": "Course",
        "Subject": "Block Coding",
        "Learning Model": "Not specified",
        "Difficulty": "Not specified",
        "Grade": "Multi-Grade",
        "Live Level": "N/A",
        "Language": "English",
        "LMS Status": "Active",
        "Grades Covered": "10, 11, 12",
        "Age Group": "15-18 years",
        "Course Duration": "3 Months",
    }
    base.update(overrides)
    return base


class CourseMasterExportTests(unittest.TestCase):
    def test_maps_course_master_fields(self):
        course = sync.row_to_course(row())
        self.assertEqual(course["id"], "CRS-028")
        self.assertEqual(course["title"], "Block-Based Coding Applications")
        self.assertEqual(course["subject"], "Block Coding")
        self.assertEqual(course["category"], "Coding Foundations")
        self.assertEqual(course["programType"], "Course")
        self.assertEqual(course["language"], "English")
        self.assertEqual(course["ageGroup"], "15-18 years")
        self.assertEqual(course["duration"], "3 Months")
        self.assertIsNone(course["liveLevel"])
        self.assertIsNone(course["lessons"])
        self.assertFalse(course["offeringApproved"])

    def test_multi_grade_courses_keep_every_grade(self):
        course = sync.row_to_course(row())
        self.assertEqual(course["grades"], [10, 11, 12])
        self.assertEqual((course["gradeFrom"], course["gradeTo"]), (10, 12))

    def test_single_grade_course(self):
        course = sync.row_to_course(row(Grade="Grade 5", **{"Grades Covered": "5"}))
        self.assertEqual(course["grades"], [5])
        self.assertEqual((course["gradeFrom"], course["gradeTo"]), (5, 5))

    def test_grade_column_must_agree_with_grades_covered(self):
        with self.assertRaises(ValueError):
            sync.row_to_course(row(Grade="Grade 5", **{"Grades Covered": "5, 6"}))
        with self.assertRaises(ValueError):
            sync.row_to_course(row(Grade="Multi-Grade", **{"Grades Covered": "5"}))
        with self.assertRaises(ValueError):
            sync.row_to_course(row(**{"Grades Covered": "10, 13"}))

    def test_missing_values_become_not_specified_or_empty(self):
        course = sync.row_to_course(
            row(Language=None, **{"Learning Model": None, "Course Duration": None,
                                  "Age Group": None, "Grades Covered": None,
                                  "Grade": "Not specified"})
        )
        self.assertEqual(course["language"], "Not specified")
        self.assertEqual(course["learningModel"], "Not specified")
        self.assertIsNone(course["duration"])
        self.assertIsNone(course["ageGroup"])
        self.assertEqual(course["grades"], [])

    def test_title_comes_from_display_name_and_falls_back_only_when_empty(self):
        self.assertEqual(sync.row_to_course(row())["source"]["titleFrom"], "Display Name")
        fallback = sync.row_to_course(row(**{'Display Name (cleaned from "New Lesson Name")': None}))
        self.assertEqual(fallback["title"], "Block-Based Coding Applications (English)")
        self.assertEqual(fallback["source"]["titleFrom"], "LMS Course Name")

    def test_every_subject_on_lists_2_has_a_category(self):
        for subject in ("Coding", "Vernatics (Robotics)", "Computer Fundamentals"):
            self.assertIn(subject, sync.SUBJECT_TO_CATEGORY)
        self.assertEqual(sync.SUBJECT_TO_CATEGORY["Vernatics (Robotics)"], "Vernatics")

    def test_unmapped_subject_stops_the_build(self):
        with self.assertRaises(ValueError):
            sync.row_to_course(row(Subject="Robotics"))

    def test_route_slugs_are_unique_for_shared_titles(self):
        courses = [sync.row_to_course(row(**{"Record ID": i})) for i in ("CRS-001", "CRS-009")]
        sync.assign_route_slugs(courses)
        self.assertEqual(
            [c["routeSlug"] for c in courses],
            ["block-based-coding-applications-crs-001", "block-based-coding-applications-crs-009"],
        )


if __name__ == "__main__":
    unittest.main()
