import logoSizes from "./partnerLogoSizes.generated.json";

/*
 * Ecosystem partners shown in the homepage logo strip and on the About page.
 * To add a partner: put its logo in public/images/organisations, run
 * `python3 scripts/build-partner-logos.py`, then add an entry below.
 */
interface PartnerEntry {
  /** Short name shown under the logo on the About page. */
  name: string;
  /** Full name, used as the image's alternative text. */
  fullName: string;
  /** File name inside public/images/organisations/web (made by the build script). */
  logo: string;
}

const PARTNERS_IN_ORDER: readonly PartnerEntry[] = [
  {
    name: "FITT, IIT Delhi",
    fullName: "Foundation for Innovation and Technology Transfer, IIT Delhi",
    logo: "fitt-iit-delhi.png",
  },
  { name: "Microsoft", fullName: "Microsoft", logo: "microsoft.png" },
  {
    name: "IIM Lucknow EIC",
    fullName: "IIM Lucknow Enterprise Incubation Centre",
    logo: "iim-lucknow-eic.png",
  },
  { name: "IIT Ropar", fullName: "IIT Ropar", logo: "iit-ropar.png" },
  { name: "Kotak BizLabs", fullName: "Kotak BizLabs", logo: "kotak-bizlab.png" },
  { name: "DST", fullName: "Department of Science & Technology", logo: "dst.png" },
  { name: "EXIM Bank", fullName: "India Exim Bank", logo: "exim-bank.png" },
  { name: "Cyran AI Solutions", fullName: "Cyran AI Solutions", logo: "cyran-ai-solutions.png" },
  { name: "SIDBI", fullName: "Small Industries Development Bank of India", logo: "sidbi.png" },
  { name: "NSDC", fullName: "National Skill Development Corporation", logo: "nsdc.png" },
  { name: "AICTE", fullName: "All India Council for Technical Education", logo: "aicte.png" },
  { name: "Startup Punjab", fullName: "Startup Punjab", logo: "startup-punjab.png" },
];

export interface Partner {
  name: string;
  fullName: string;
  src: string;
  width: number;
  height: number;
  order: number;
}

const sizes = logoSizes as Record<string, { width: number; height: number }>;

export const partners: readonly Partner[] = PARTNERS_IN_ORDER.map((entry, index) => {
  const size = sizes[entry.logo];
  if (!size)
    throw new Error(`Missing web logo for ${entry.name}: run scripts/build-partner-logos.py`);
  return {
    name: entry.name,
    fullName: entry.fullName,
    src: `/images/organisations/web/${entry.logo}`,
    width: size.width,
    height: size.height,
    order: index + 1,
  };
});
