/*
 * Game pieces drawn as inline SVG so they stay crisp at any size and need no image files.
 * The robot is drawn facing up; the game rotates it to face the current direction.
 */

export function RobotSprite({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {/* direction arrow: always points where the robot is facing */}
      <path d="M32 1 L41 11 L23 11 Z" fill="#E8401C" />
      {/* antenna */}
      <line
        x1="32"
        y1="12"
        x2="32"
        y2="18"
        stroke="#1E293B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="12" r="3.5" fill="#FBBF24" stroke="#1E293B" strokeWidth="2" />
      {/* wheels */}
      <rect x="6" y="30" width="7" height="18" rx="3.5" fill="#1E293B" />
      <rect x="51" y="30" width="7" height="18" rx="3.5" fill="#1E293B" />
      {/* body */}
      <rect
        x="11"
        y="18"
        width="42"
        height="40"
        rx="12"
        fill="#E8401C"
        stroke="#1E293B"
        strokeWidth="3"
      />
      {/* face screen */}
      <rect
        x="17"
        y="24"
        width="30"
        height="20"
        rx="7"
        fill="#FFFFFF"
        stroke="#1E293B"
        strokeWidth="2.5"
      />
      <circle cx="26" cy="33" r="3.6" fill="#1E293B" />
      <circle cx="38" cy="33" r="3.6" fill="#1E293B" />
      <circle cx="27.2" cy="31.8" r="1.2" fill="#FFFFFF" />
      <circle cx="39.2" cy="31.8" r="1.2" fill="#FFFFFF" />
      <path
        d="M27 39 Q32 43 37 39"
        fill="none"
        stroke="#1E293B"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* chest light */}
      <circle cx="32" cy="51" r="3" fill="#FFF1EC" />
    </svg>
  );
}

export function StarSprite({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M32 5 L39.8 22.6 L58.9 24.6 L44.6 37.4 L48.6 56.2 L32 46.6 L15.4 56.2 L19.4 37.4 L5.1 24.6 L24.2 22.6 Z"
        fill="#FBBF24"
        stroke="#B45309"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M24 26 L31 15" stroke="#FEF3C7" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

const BLOCK_COLOURS = [
  { face: "#3B82F6", top: "#93C5FD", edge: "#1E3A8A" },
  { face: "#8B5CF6", top: "#C4B5FD", edge: "#4C1D95" },
  { face: "#10B981", top: "#6EE7B7", edge: "#064E3B" },
] as const;

/** A toy building block. Same shape every time; colour varies so neighbours look distinct. */
export function BlockSprite({
  variant = 0,
  className = "",
}: {
  variant?: number;
  className?: string;
}) {
  const colour = BLOCK_COLOURS[variant % BLOCK_COLOURS.length]!;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect
        x="7"
        y="16"
        width="50"
        height="42"
        rx="8"
        fill={colour.face}
        stroke={colour.edge}
        strokeWidth="3"
      />
      <rect x="7" y="16" width="50" height="12" rx="6" fill={colour.top} opacity="0.55" />
      {[20, 32, 44].map((x) => (
        <g key={x}>
          <rect
            x={x - 5}
            y="7"
            width="10"
            height="11"
            rx="3"
            fill={colour.face}
            stroke={colour.edge}
            strokeWidth="2.5"
          />
          <rect x={x - 3} y="9" width="3" height="5" rx="1.5" fill="#FFFFFF" opacity="0.45" />
        </g>
      ))}
      <path
        d="M17 44 H47 M17 50 H40"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

export function SparkleSprite({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z"
        fill="#FBBF24"
      />
    </svg>
  );
}
