/**
 * Public-file URLs that respect the site's base path.
 *
 * Normally the site is served from the domain root ("/"). The GitHub Pages build serves it from
 * a sub-path (e.g. "/archive-unpack-and-play/"), set through Vite's `base` (see vite.config.ts),
 * so "/images/logo.png" must become "/archive-unpack-and-play/images/logo.png" there.
 */
const BASE_URL: string = import.meta.env.BASE_URL ?? "/";

export function assetUrl(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${BASE_URL.replace(/\/$/, "")}${path}`;
}
