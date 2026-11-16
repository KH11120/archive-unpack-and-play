"""Tests for building the website catalogue from the Course Master sheet."""

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
        "Record ID": "CRS-130",
        "Source Sno.": "132",
        "LMS Course Name (original)": "Python Level-1 - Live",
        'Display Name (cleaned from "New Lesson Name")': "Python",
        "Type": "Course",
        "Subject": "Python",
        "Learning Model": "Live",
        "Difficulty": "Not specified",
        "Grade": "Not specified",
        "Live Level": "Level 1",
        "Language": "Not specified",
        "LMS Status": "Active",
        "Lessons": 20,
        "Revision Lessons": None,
    }
    base.update(overrides)
    return base


class CourseMasterExportTests(unittest.TestCase):
    def test_maps_course_master_fields(self):
        course = sync.row_to_course(row())
        self.assertEqual(course["id"], "CRS-130")
        self.assertEqual(course["title"], "Python")
        self.assertEqual(course["category"], "Python")
        self.assertEqual(course["programType"], "Course")
        self.assertEqual(course["liveLevel"], "Level 1")
        self.assertEqual(course["lessons"], 20)
        self.assertIsNone(course["gradeFrom"])
        self.assertFalse(course["offeringApproved"])

    def test_title_comes_from_display_name_and_falls_back_only_when_empty(self):
        self.assertEqual(sync.row_to_course(row())["source"]["titleFrom"], "Display Name")
        fallback = sync.row_to_course(row(**{'Display Name (cleaned from "New Lesson Name")': None}))
        self.assertEqual(fallback["title"], "Python Level-1 - Live")
        self.assertEqual(fallback["source"]["titleFrom"], "LMS Course Name")

    def test_grade_and_live_level(self):
        course = sync.row_to_course(row(Grade="Grade 6", **{"Live Level": "N/A"}))
        self.assertEqual((course["gradeFrom"], course["gradeTo"]), (6, 6))
        self.assertIsNone(course["liveLevel"])

    def test_unmapped_subject_stops_the_build(self):
        with self.assertRaises(ValueError):
            sync.row_to_course(row(Subject="Robotics"))

    def test_route_slugs_are_unique_for_shared_titles(self):
        courses = [sync.row_to_course(row(**{"Record ID": i})) for i in ("CRS-130", "CRS-150")]
        sync.assign_route_slugs(courses)
        self.assertEqual([c["routeSlug"] for c in courses], ["python-crs-130", "python-crs-150"])


if __name__ == "__main__":
    unittest.main()
