import { assetUrl } from "@/site/assetUrl";

/** Official APTCODER logo (transparent PNG). Use this everywhere the logo appears. */
export const aptcoderLogo = {
  src: assetUrl("/images/brand/aptcoder_logo.png"),
  alt: "APTCODER – access the potential",
  /** Intrinsic size of the file; keeps the aspect ratio exact (about 3.5 : 1; includes the ® mark). */
  width: 1463,
  height: 413,
} as const;
