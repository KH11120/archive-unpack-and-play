import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { getCourseCategorySlug } from "../data/courseCatalogue";

/**
 * Link to the Courses page with these categories selected in the category strip, using the
 * strip's own addresses: one category opens its category page (/courses/category/<slug>),
 * several open /courses?category=a,b. Both survive refresh and can be shared. No categories
 * opens the full catalogue (/courses).
 */
export default function CourseCategoryLink({
  categories,
  className,
  children,
}: {
  categories: readonly string[];
  className?: string;
  children: ReactNode;
}) {
  if (categories.length === 0)
    return (
      <Link to="/courses" className={className}>
        {children}
      </Link>
    );
  return categories.length === 1 ? (
    <Link
      to="/courses/category/$category"
      params={{ category: getCourseCategorySlug(categories[0]!) }}
      className={className}
    >
      {children}
    </Link>
  ) : (
    <Link
      to="/courses"
      search={{ category: categories.map(getCourseCategorySlug).join(",") }}
      className={className}
    >
      {children}
    </Link>
  );
}
