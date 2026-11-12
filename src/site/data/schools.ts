/**
 * Partner schools shown as logos in the School page "Trusted by Schools" row, in order.
 *
 * Names are taken from the logos themselves (public/images/school). `logo` is a web-sized
 * copy with the empty transparent margin trimmed (scripts/build-school-logos.py), so logos
 * look evenly sized; the original file is kept alongside it.
 */
export type PartnerSchool = {
  id: string;
  /** Name as written on the logo; used for alt text and the hover title. */
  name: string;
  logo: string;
  originalLogo: string;
};

const school = (id: string, name: string, file: string): PartnerSchool => ({
  id,
  name,
  logo: `/images/school/web/${file}`,
  originalLogo: `/images/school/${file}`,
});

export const partnerSchools: PartnerSchool[] = [
  school("dps", "Delhi Public School", "dps.png"),
  school("chitra", "Chitra International School", "chitra.png"),
  school("indraprastha", "Indraprastha", "indraprastha.png"),
  school("kalka", "Kalka Group of Institutions", "kalka.png"),
  school("sanskriti", "Govt. Model Sanskriti Sr. Sec. School", "sanskriti.png"),
];
