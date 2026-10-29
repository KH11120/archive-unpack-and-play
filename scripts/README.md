# Course catalogue data sync

`src/site/data/courseCatalogue.generated.json` is generated from the simplified
`Website Courses` sheet in the project workbook. Refresh it after editing that
sheet with:

```sh
python3 -m pip install -r requirements-catalogue.txt
pnpm catalogue:sync
```

The exporter maps the eight available columns directly. It derives a stable
`COURSE-###` ID and URL slug from the workbook serial number and title; duplicate
titles are retained and receive distinct detail routes. Workbook row order is
the catalogue's recommended order.

Missing grade ranges, descriptions, duration, lessons, imagery, syllabus,
pricing, and other optional information stay empty and are hidden by the UI.
The simplified workbook has no publication approval or exclusion fields, so all
86 rows are represented as intended catalogue entries while offering approval
remains false. The exporter does not infer approval or fabricate missing data.
Grade filtering is omitted until the source workbook provides grade fields.
