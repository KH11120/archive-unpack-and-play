import { useMemo } from "react";

const COLOURS = ["#E8401C", "#FBBF24", "#3B82F6", "#8B5CF6", "#10B981", "#EC4899"];
const PIECES = 70;

/**
 * Lightweight CSS confetti burst (no library). Rendered once per celebration via `burstId`;
 * the parent removes it after the animation. Hidden entirely for reduced-motion users by CSS.
 */
export default function Confetti({ burstId }: { burstId: number }) {
  const pieces = useMemo(() => {
    // Seeded so a given burst renders identically on re-render.
    let seed = burstId * 9301 + 49297;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: PIECES }, (_, index) => ({
      index,
      left: random() * 100,
      drift: (random() - 0.5) * 220,
      rotate: 360 + random() * 720,
      delay: random() * 0.35,
      duration: 1.8 + random() * 1.2,
      size: 6 + random() * 7,
      round: random() > 0.6,
      colour: COLOURS[index % COLOURS.length]!,
    }));
  }, [burstId]);

  return (
    <div
      className="codely-confetti pointer-events-none fixed inset-0 z-[80] overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <span
          key={piece.index}
          className="codely-confetti-piece"
          style={
            {
              left: `${piece.left}%`,
              width: `${piece.size}px`,
              height: `${piece.round ? piece.size : piece.size * 0.45}px`,
              borderRadius: piece.round ? "9999px" : "2px",
              background: piece.colour,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              "--codely-drift": `${piece.drift}px`,
              "--codely-spin": `${piece.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
