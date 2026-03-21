/**
 * CareerLaunch Logo — faithful SVG recreation of the uploaded image.
 *
 * The logo features:
 *  - 3-step ascending staircase with a smooth arc curve underneath
 *  - A minimalist 3D figure walking up carrying a briefcase
 *  - Teal/green gradient that shifts with the active color theme
 *  - No background square — transparent, placed on any surface
 */

interface LogoProps {
  variant?: "full" | "icon" | "wordmark";
  /** Height of the icon portion in px */
  size?: number;
  className?: string;
}

const CareerLaunchLogo = ({ variant = "full", size = 40, className = "" }: LogoProps) => {
  // Unique gradient ID per instance to avoid conflicts
  const gid = `cl_${Math.random().toString(36).slice(2, 7)}`;

  /* ── The staircase + figure icon ─────────────────────────────── */
  const Icon = (
    <svg
      width={size}
      height={size * 0.88}
      viewBox="0 0 220 194"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CareerLaunch — figure climbing stairs"
    >
      <defs>
        {/* Main body gradient — follows theme */}
        <linearGradient id={`${gid}_main`} x1="20" y1="194" x2="200" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="var(--hero-mid,  #004d3a)" />
          <stop offset="50%"  stopColor="var(--primary,   #006b50)" />
          <stop offset="100%" stopColor="var(--secondary-fixed, #4edea3)" />
        </linearGradient>
        {/* Lighter highlight gradient for top faces of stairs */}
        <linearGradient id={`${gid}_light`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--secondary-fixed, #6ffbbe)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--primary, #006b50)"          stopOpacity="0.7" />
        </linearGradient>
        {/* Figure gradient */}
        <linearGradient id={`${gid}_fig`} x1="60" y1="20" x2="120" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="var(--secondary-fixed, #7fffd4)" />
          <stop offset="100%" stopColor="var(--primary-fixed,   #9ff4c8)" />
        </linearGradient>
        {/* Briefcase gradient */}
        <linearGradient id={`${gid}_bag`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="var(--primary-fixed,   #9ff4c8)" />
          <stop offset="100%" stopColor="var(--secondary-fixed, #4edea3)" />
        </linearGradient>
      </defs>

      {/* ══════════════════════════════════════════
          STAIRCASE — 3 rising steps
          Each step has: front face (darker) + top face (lighter)
          ══════════════════════════════════════════ */}

      {/* Smooth arc curve underneath the stairs */}
      <path
        d="M 10 185 Q 80 160 150 100 Q 185 70 210 30"
        stroke={`url(#${gid}_main)`}
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />

      {/* Step 1 — bottom left (shortest) */}
      {/* Front face */}
      <rect x="8" y="140" width="62" height="50" rx="4" fill={`url(#${gid}_main)`} />
      {/* Top face — lighter */}
      <ellipse cx="39" cy="140" rx="31" ry="7" fill={`url(#${gid}_light)`} opacity="0.85" />

      {/* Step 2 — middle */}
      {/* Front face */}
      <rect x="70" y="100" width="62" height="90" rx="4" fill={`url(#${gid}_main)`} />
      {/* Top face */}
      <ellipse cx="101" cy="100" rx="31" ry="7" fill={`url(#${gid}_light)`} opacity="0.85" />

      {/* Step 3 — top right (tallest) */}
      {/* Front face */}
      <rect x="132" y="55" width="72" height="135" rx="4" fill={`url(#${gid}_main)`} />
      {/* Top face */}
      <ellipse cx="168" cy="55" rx="36" ry="8" fill={`url(#${gid}_light)`} opacity="0.90" />

      {/* Shadow / depth line on right of each step */}
      <rect x="66" y="140" width="6" height="50" rx="2" fill="rgba(0,0,0,0.12)" />
      <rect x="128" y="100" width="6" height="90" rx="2" fill="rgba(0,0,0,0.12)" />

      {/* ══════════════════════════════════════════
          FIGURE — walking up, carrying briefcase
          Positioned on step 1→2 transition
          ══════════════════════════════════════════ */}

      {/* Head */}
      <circle cx="88" cy="32" r="13" fill={`url(#${gid}_fig)`} />

      {/* Neck */}
      <rect x="84" y="43" width="8" height="8" rx="3" fill={`url(#${gid}_fig)`} />

      {/* Torso */}
      <path d="M 72 50 C 72 50 78 48 88 48 C 98 48 104 50 104 50 L 108 95 L 68 95 Z"
        fill={`url(#${gid}_fig)`} />

      {/* Left arm — swinging forward and down (holding briefcase) */}
      <path d="M 74 58 Q 58 72 52 88"
        stroke={`url(#${gid}_fig)`} strokeWidth="10" strokeLinecap="round" fill="none" />

      {/* Right arm — swinging back/up (natural walking motion) */}
      <path d="M 102 56 Q 120 46 128 38"
        stroke={`url(#${gid}_fig)`} strokeWidth="10" strokeLinecap="round" fill="none" />

      {/* Left leg — back leg, stepping down */}
      <path d="M 80 95 Q 72 118 68 138"
        stroke={`url(#${gid}_fig)`} strokeWidth="11" strokeLinecap="round" fill="none" />
      {/* Left foot */}
      <ellipse cx="66" cy="140" rx="12" ry="5" fill={`url(#${gid}_fig)`} />

      {/* Right leg — front leg, lifted onto next step */}
      <path d="M 96 95 Q 104 110 112 100"
        stroke={`url(#${gid}_fig)`} strokeWidth="11" strokeLinecap="round" fill="none" />
      {/* Right foot on step 2 */}
      <ellipse cx="116" cy="100" rx="13" ry="5" fill={`url(#${gid}_fig)`} />

      {/* ══ Briefcase ══ */}
      {/* Main body */}
      <rect x="34" y="86" width="28" height="22" rx="4" fill={`url(#${gid}_bag)`} />
      {/* Handle */}
      <path d="M 41 86 L 41 80 Q 41 77 44 77 L 56 77 Q 59 77 59 80 L 59 86"
        stroke={`url(#${gid}_fig)`} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Latch */}
      <line x1="48" y1="86" x2="48" y2="108"
        stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
      {/* Clasp */}
      <rect x="44" y="95" width="8" height="5" rx="1.5"
        fill="rgba(0,0,0,0.15)" />
    </svg>
  );

  if (variant === "icon") return Icon;

  /* ── Wordmark only ─────────────────────────────────────────── */
  if (variant === "wordmark") {
    return (
      <div className="flex flex-col leading-none select-none">
        <span style={{
          fontFamily: "var(--font-headline)",
          fontWeight: 800,
          fontSize: size * 0.55,
          color: "var(--primary)",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}>
          Career<span style={{ color: "var(--secondary, #4edea3)" }}>Launch</span>
        </span>
        <span style={{
          fontFamily: "var(--font-body)",
          fontSize: size * 0.22,
          color: "var(--outline)",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          marginTop: 3,
        }}>
          Architect Your Future
        </span>
      </div>
    );
  }

  /* ── Full: icon left + wordmark right ─────────────────────── */
  return (
    <div className="flex items-center gap-3 select-none">
      {Icon}
      <div className="flex flex-col leading-none">
        <span style={{
          fontFamily: "var(--font-headline)",
          fontWeight: 800,
          fontSize: size * 0.42,
          color: "var(--primary)",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}>
          Career<span style={{ color: "var(--secondary, #4edea3)" }}>Launch</span>
        </span>
        <span style={{
          fontFamily: "var(--font-body)",
          fontSize: size * 0.18,
          color: "var(--outline)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginTop: 2,
        }}>
          Architect Your Future
        </span>
      </div>
    </div>
  );
};

export default CareerLaunchLogo;
