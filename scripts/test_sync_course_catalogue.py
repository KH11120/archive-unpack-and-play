"""Focused unit tests for the workbook-to-public-data mapper."""

import importlib.util
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("sync-course-catalogue.py")
SPEC = importlib.util.spec_from_file_location("sync_course_catalogue", MODULE_PATH)
sync = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(sync)


class CatalogueExportTests(unittest.TestCase):
    def setUp(self):
        self.row = {
            "Web Course ID": "WC-TEST",
            "Course Title": "Approved Example Course",
            "URL Slug (suggested)": "approved-example-course",
            "Publish Status": "Published",
            "Category": "Python",
            "Subject": "Python",
            "Program Type": "Course",
            "Learning Model": "Assisted Learning (AL)",
            "Level": "Easy",
            "Language": "English",
            "Lessons": 8,
            "Grade From": 4,
            "Grade To": 6,
            "Duration": "12 weeks",
            "Short Description": "A concise approved description.",
            "Overview": " ".join(["Approved"] * 90),
            "What You'll Learn": "Build a project\nCreate a program\nDebug code\nShare work",
            "Thumbnail Ready": "Yes",
            "Enrol CTA": "Book a Free Class",
        }
        self.required = list(self.row.keys())
        self.approved_lists = {
            "Category": {"Python"},
            "Subject": {"Python"},
            "Language": {"English", "Hindi", "Not specified"},
        }

    def test_maps_workbook_headers_and_preserves_available_content(self):
        self.assertEqual(sync.publication_errors(self.row, self.required, self.approved_lists), [])
        public = sync.record_to_catalogue(
            self.row, {"Syllabus": [], "Instructors": [], "Reviews": []}, True
        )
        self.assertEqual(public["id"], "WC-TEST")
        self.assertEqual(public["title"], "Approved Example Course")
        self.assertEqual(public["learningModel"], "Assisted Learning (AL)")
        self.assertEqual(public["catalogueInclusion"], "intended")
        self.assertTrue(public["offeringApproved"])
        self.assertEqual(public["learningOutcomes"], [
            "Build a project", "Create a program", "Debug code", "Share work"
        ])
        self.assertIsNone(public["thumbnailUrl"])

    def test_missing_optional_thumbnail_url_does_not_block_publication(self):
        self.assertEqual(sync.publication_errors(self.row, self.required, self.approved_lists), [])

    def test_unresolved_dropdown_values_block_a_published_row(self):
        row = {**self.row, "Learning Model": "ALTS (meaning to confirm)"}
        errors = sync.publication_errors(row, self.required, self.approved_lists)
        self.assertIn("Learning Model (unresolved dropdown value)", errors)

    def test_missing_required_values_are_reported_as_missing(self):
        row = {**self.row, "Duration": None}
        errors = sync.publication_errors(row, self.required, self.approved_lists)
        self.assertIn("Duration", errors)

    def test_incomplete_not_started_record_remains_catalogue_visible_without_admin_data(self):
        draft = {key: None for key in self.row}
        draft.update({
            "Web Course ID": "WC-DRAFT",
            "Course Title": "Workbook title",
            "URL Slug (suggested)": "workbook-title",
            "Category": "Python",
            "Subject": "Python",
            "Program Type": "Course",
            "Learning Model": "Not specified",
            "Level": "Not specified",
            "Language": "Not specified",
            "Publish Status": "Not started",
            "Content Notes": "internal note must not ship",
            "Source Flags": "internal source warning must not ship",
            "Owner": "internal owner",
            "LMS Record IDs": "CRS-999",
        })
        record = sync.record_to_catalogue(
            draft, {"Syllabus": [], "Instructors": [], "Reviews": []}, False
        )
        self.assertEqual(record["id"], "WC-DRAFT")
        self.assertEqual(record["learningModel"], "Not specified")
        self.assertIsNone(record["gradeFrom"])
        self.assertIsNone(record["shortDescription"])
        self.assertFalse(record["offeringApproved"])
        self.assertEqual(record["catalogueInclusion"], "intended")
        self.assertFalse({"publishStatus", "Content Notes", "Source Flags", "Owner", "LMS Record IDs"} & record.keys())

    def test_unresolved_slug_collision_retains_both_with_stable_routes(self):
        records = [
            {"id": "WC-040", "slug": "same-slug", "routeSlug": "same-slug"},
            {"id": "WC-041", "slug": "same-slug", "routeSlug": "same-slug"},
        ]
        sync.unique_route_slugs(records)
        self.assertEqual([record["slug"] for record in records], ["same-slug", "same-slug"])
        self.assertEqual([record["routeSlug"] for record in records], ["same-slug", "same-slug-wc-041"])

    def test_only_fully_excluded_source_rows_are_excluded(self):
        self.assertTrue(sync.is_explicitly_excluded({"LMS Record IDs": "CRS-1, CRS-2"}, {"CRS-1", "CRS-2"}))
        self.assertFalse(sync.is_explicitly_excluded({"LMS Record IDs": "CRS-1, CRS-2"}, {"CRS-1"}))


if __name__ == "__main__":
    unittest.main()
