/**
 * Official APTCODER contact details and social profiles: the single source for the footer,
 * Contact page and About page. Change them here and every page updates.
 */

export const CONTACT_EMAIL = "hello@aptcoder.com";

export const CONTACT_PHONE = "+91-9318497057";
/** `tel:` link (digits only, with country code) so phones open the dialler. */
export const CONTACT_PHONE_HREF = "tel:+919318497057";

export const OFFICE_ADDRESS_LINES = [
  "APTCODER C/O BHARAT IMPACT",
  "C-26, C Block, Sector 59",
  "Noida, Uttar Pradesh 201309",
] as const;

/** Opens the office address in Google Maps (app on phones, website elsewhere). */
export const OFFICE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "C-26, C Block, Sector 59, Noida, Uttar Pradesh 201309",
)}`;

export type SocialPlatform = "linkedin" | "facebook" | "instagram" | "googleplay";

export type SocialLink = {
  platform: SocialPlatform;
  /** Accessible name, e.g. "APTCODER on LinkedIn". */
  label: string;
  url: string;
};

export const socialLinks: SocialLink[] = [
  {
    platform: "linkedin",
    label: "APTCODER on LinkedIn",
    url: "https://www.linkedin.com/company/aptcoder/",
  },
  {
    platform: "facebook",
    label: "APTCODER on Facebook",
    url: "https://www.facebook.com/aptcoder",
  },
  {
    platform: "instagram",
    label: "APTCODER on Instagram",
    url: "https://www.instagram.com/aptcoder/",
  },
  {
    platform: "googleplay",
    label: "Get the APTCODER app on Google Play",
    url: "https://play.google.com/store/apps/details?id=com.aptcoder&hl=en_IN",
  },
];
