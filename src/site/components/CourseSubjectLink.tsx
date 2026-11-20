import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

/**
 * Link to the Courses page with these subjects selected in the subject bar
 * (/courses?subject=a,b), so it survives refresh and can be shared. No subjects opens the full
 * catalogue (/courses).
 */
export default function CourseSubjectLink({
  subjects,
  className,
  children,
}: {
  subjects: readonly string[];
  className?: string;
  children: ReactNode;
}) {
  return subjects.length === 0 ? (
    <Link to="/courses" className={className}>
      {children}
    </Link>
  ) : (
    <Link to="/courses" search={{ subject: subjects.join(",") }} className={className}>
      {children}
    </Link>
  );
}
