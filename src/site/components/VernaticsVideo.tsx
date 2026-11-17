import { useEffect, useRef, useState } from "react";
import { assetUrl } from "@/site/assetUrl";

export const VERNATICS_VIDEO_SRC = assetUrl("/videos/Vernatics%20AI%20video.mp4");
export const VERNATICS_POSTER_SRC = assetUrl("/videos/vernatics-poster.jpg");

const DEFAULT_FRAME =
  "relative w-full overflow-hidden bg-peach-mid aspect-video lg:rounded-2xl lg:shadow-[0_18px_40px_-18px_rgba(17,24,39,0.45)] lg:ring-1 lg:ring-black/5";

/**
 * Silent, looping Vernatics robot clip (homepage Meet Vernatics panel and the /vernatics hero).
 *
 * - Nothing is downloaded until the video is about to scroll into view (the poster shows
 *   until then), so it never slows a page's first load.
 * - Muted + playsInline so browsers allow autoplay; no controls by default.
 * - Pauses while off screen; reduced-motion visitors see the still poster.
 * - object-fit: contain inside a 16:9 frame, so the whole robot is always visible and the
 *   video is never stretched.
 * - `fallbackControls`: when autoplay is refused or reduced motion is on, show the browser's
 *   normal controls so the visitor can still choose to play it.
 */
export default function VernaticsVideo({
  className = DEFAULT_FRAME,
  fallbackControls = false,
}: {
  /** Classes for the 16:9 frame around the video. */
  className?: string;
  fallbackControls?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  const [needsControls, setNeedsControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;

    const sync = () => {
      if (motion.matches) {
        video.pause();
        setNeedsControls(true);
      } else if (!visible) {
        video.pause();
      } else {
        video.play().catch(() => {
          // Autoplay refused (e.g. battery saver): the poster stays as a still image.
          setNeedsControls(true);
        });
      }
    };

    if (!("IntersectionObserver" in window)) {
      visible = true;
      setLoad(true);
      return;
    }
    if (motion.matches) setNeedsControls(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible) setLoad(true);
        sync();
      },
      // Start loading a little before the video is on screen.
      { rootMargin: "200px 0px" },
    );
    observer.observe(video);
    motion.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", sync);
    };
  }, []);

  // Once the source is attached, start playing if the video is (still) visible.
  useEffect(() => {
    const video = videoRef.current;
    if (!load || !video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => setNeedsControls(true));
  }, [load]);

  const controls = fallbackControls && needsControls;
  const label = "Vernatics robot driving on a table with its LED display lit up";

  return (
    <div className={className} {...(controls ? {} : { role: "img", "aria-label": label })}>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-contain"
        src={load || controls ? VERNATICS_VIDEO_SRC : undefined}
        poster={VERNATICS_POSTER_SRC}
        muted
        loop
        playsInline
        controls={controls}
        preload={load ? "auto" : "none"}
        disablePictureInPicture
        tabIndex={controls ? undefined : -1}
        aria-hidden={controls ? undefined : true}
        aria-label={controls ? label : undefined}
        data-testid="vernatics-video"
      />
    </div>
  );
}
