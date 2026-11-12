import { useEffect, useRef, useState } from "react";

export const VERNATICS_VIDEO_SRC = "/videos/Vernatics%20AI%20video.mp4";
export const VERNATICS_POSTER_SRC = "/videos/vernatics-poster.jpg";

/**
 * Silent, looping Vernatics robot clip for the Meet Vernatics media panel.
 *
 * - Nothing is downloaded until the panel is about to scroll into view (the poster shows
 *   until then), so the homepage's first load is unaffected.
 * - Muted + playsInline so browsers allow autoplay; no controls.
 * - Pauses while off screen; reduced-motion visitors see the still poster only.
 * - object-fit: contain inside a 16:9 frame, so the whole robot is always visible and the
 *   video is never stretched.
 */
export default function VernaticsVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;

    const sync = () => {
      if (motion.matches || !visible) {
        video.pause();
      } else {
        video.play().catch(() => {
          // Autoplay refused (e.g. battery saver): the poster stays as a still image.
        });
      }
    };

    if (!("IntersectionObserver" in window)) {
      visible = true;
      setLoad(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible) setLoad(true);
        sync();
      },
      // Start loading a little before the panel is on screen.
      { rootMargin: "200px 0px" },
    );
    observer.observe(video);
    motion.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", sync);
    };
  }, []);

  // Once the source is attached, start playing if the panel is (still) visible.
  useEffect(() => {
    const video = videoRef.current;
    if (!load || !video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {});
  }, [load]);

  return (
    <div
      className="relative w-full overflow-hidden bg-peach-mid aspect-video lg:rounded-2xl lg:shadow-[0_18px_40px_-18px_rgba(17,24,39,0.45)] lg:ring-1 lg:ring-black/5"
      role="img"
      aria-label="Vernatics robot driving on a table with its LED display lit up"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-contain"
        src={load ? VERNATICS_VIDEO_SRC : undefined}
        poster={VERNATICS_POSTER_SRC}
        muted
        loop
        playsInline
        preload={load ? "auto" : "none"}
        disablePictureInPicture
        tabIndex={-1}
        aria-hidden="true"
        data-testid="vernatics-video"
      />
    </div>
  );
}
