# Course catalogue data sync

`src/site/data/courseCatalogue.generated.json` is the safe catalogue projection
used by the website. Refresh it after workbook updates with:

```sh
python3 -m pip install -r requirements-catalogue.txt
pnpm catalogue:sync
```

The exporter reads `Website Courses`, the approved `Lists`, and the `Excluded
Records` sheet. It includes every intended website-course row except records
whose complete set of LMS source IDs is explicitly excluded. Missing optional
fields remain null/empty so the interface can omit them without dropping a
course. A route slug is disambiguated with the stable course ID when source
slugs collide; the workbook slug itself remains unchanged.

The generated projection contains an inclusion marker and a separate
`offeringApproved` boolean. That boolean is true only for `Published` rows that
pass all required Field Guide checks and have no unresolved duplicate slug.
Workflow status, owner, source flags, content notes, merge metadata, and excluded
records are never exported. Instructor, review, certificate, price, and enrol
fields are included only for fully approved offerings; instructor and review
consent checks still apply. The exporter prints aggregate record, exclusion,
duplicate, and approval counts.
