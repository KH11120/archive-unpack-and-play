import {
  categoryOptions,
  emptyCatalogueFilters,
  getCourseCategorySlug,
  gradeOptions,
  languageOptions,
  learningModelOptions,
  levelOptions,
  programTypeOptions,
  sortOptions,
  type CatalogueFilters,
} from "./courseCatalogue";

export interface CatalogueUrlSearch extends Record<string, unknown> {
  q?: string;
  /** Selected categories as URL slugs, e.g. "python,web-development". */
  category?: string;
  model?: string;
  grade?: string;
  level?: string;
  language?: string;
  program?: string;
  sort?: string;
}

function readCsv(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return [
    ...new Set(
      raw
        .flatMap((item) => String(item).split(","))
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function approvedOptions(values: string[], options: readonly string[]): string[] {
  return values
    .map((value) =>
      options.find((option) => option.toLocaleLowerCase() === value.toLocaleLowerCase()),
    )
    .filter((value): value is string => Boolean(value));
}

export function parseCatalogueSearch(search: Record<string, unknown>): CatalogueFilters {
  const sort =
    typeof search["sort"] === "string" &&
    sortOptions.includes(search["sort"] as CatalogueFilters["sort"])
      ? (search["sort"] as CatalogueFilters["sort"])
      : "recommended";
  return {
    q: typeof search["q"] === "string" ? search["q"].slice(0, 100) : "",
    categories: readCsv(search["category"])
      .map((slug) => categoryOptions.find((option) => getCourseCategorySlug(option) === slug))
      .filter(
        (value, index, list): value is string => Boolean(value) && list.indexOf(value) === index,
      ),
    models: approvedOptions(readCsv(search["model"]), learningModelOptions),
    grades: readCsv(search["grade"])
      .map(Number)
      .filter((grade) => Number.isInteger(grade) && gradeOptions.includes(grade)),
    levels: approvedOptions(readCsv(search["level"]), levelOptions),
    languages: approvedOptions(readCsv(search["language"]), languageOptions),
    programTypes: approvedOptions(readCsv(search["program"]), programTypeOptions),
    sort,
  };
}

export function serializeCatalogueSearch(filters: CatalogueFilters): Record<string, string> {
  const result: Record<string, string> = {};
  if (filters.q.trim()) result["q"] = filters.q.trim();
  if (filters.categories.length)
    result["category"] = filters.categories.map(getCourseCategorySlug).join(",");
  if (filters.models.length) result["model"] = filters.models.join(",");
  if (filters.grades.length) result["grade"] = filters.grades.join(",");
  if (filters.levels.length) result["level"] = filters.levels.join(",");
  if (filters.languages.length) result["language"] = filters.languages.join(",");
  if (filters.programTypes.length) result["program"] = filters.programTypes.join(",");
  if (filters.sort !== "recommended") result["sort"] = filters.sort;
  return result;
}

export function validateCatalogueSearch(search: Record<string, unknown>): CatalogueUrlSearch {
  return serializeCatalogueSearch(parseCatalogueSearch(search));
}

export function hasActiveCatalogueSearch(filters: CatalogueFilters): boolean {
  return Boolean(
    filters.q.trim() ||
    filters.categories.length ||
    filters.models.length ||
    filters.grades.length ||
    filters.levels.length ||
    filters.languages.length ||
    filters.programTypes.length,
  );
}

export function isDefaultCatalogueSearch(filters: CatalogueFilters): boolean {
  return !hasActiveCatalogueSearch(filters) && filters.sort === emptyCatalogueFilters.sort;
}
