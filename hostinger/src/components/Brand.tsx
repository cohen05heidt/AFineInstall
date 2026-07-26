/* Brand marks and the site icon set. Every glyph here shares one language:
   1.6 stroke, square cap, 24 box, no fill. Drawn once, used in services,
   process and the map legend, so the page never mixes two icon families. */
import type { ReactNode } from "react";

type IconProps = { className?: string };

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "square",
  strokeLinejoin: "miter",
} as const;

function Box({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...S}>
      {children}
    </svg>
  );
}

/* AFI monogram: three strokes that read as the letters and as a signal
   dropping through them. Used in the nav and as the favicon source. */
export function Monogram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="0.8" y="0.8" width="38.4" height="38.4" rx="1.5"
        fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.35" />
      <path d="M7 29 13.5 11 20 29" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="square" />
      <path d="M9.9 23h7.2" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M24 29V11h7.5" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="square" />
      <path d="M24 20.5h5.6" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="33.4" cy="8.2" r="2" fill="var(--afi-signal)" />
    </svg>
  );
}

export function Wordmark({ className }: IconProps) {
  return (
    <span className={className}>
      <span className="afi-display text-[0.98em] tracking-[-0.03em]">
        A Fine <span className="text-[var(--afi-signal)]">Install</span>
      </span>
    </span>
  );
}

/* --- the icon set (8 glyphs, one stroke language) --- */

export function IconDish({ className }: IconProps) {
  return (
    <Box className={className}>
      <path d="M4 15.5 14.5 6" />
      <path d="M4.6 15.3a7.4 7.4 0 0 1 10.4-9.6Z" />
      <path d="M12.4 12.2 19 19v2H9" />
      <path d="M17.5 4.5a6 6 0 0 1 2 2" />
    </Box>
  );
}

export function IconMesh({ className }: IconProps) {
  return (
    <Box className={className}>
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="4.5" cy="5" r="1.6" />
      <circle cx="19.5" cy="5" r="1.6" />
      <circle cx="4.5" cy="19" r="1.6" />
      <circle cx="19.5" cy="19" r="1.6" />
      <path d="M5.6 6.2 10.7 11M18.4 6.2 13.3 11M5.6 17.8 10.7 13M18.4 17.8 13.3 13" />
    </Box>
  );
}

export function IconSpeaker({ className }: IconProps) {
  return (
    <Box className={className}>
      <rect x="6" y="3" width="12" height="18" />
      <circle cx="12" cy="9" r="2.2" />
      <circle cx="12" cy="16" r="1.2" />
    </Box>
  );
}

export function IconScreen({ className }: IconProps) {
  return (
    <Box className={className}>
      <rect x="2.5" y="4" width="19" height="12.5" />
      <path d="M8.5 20h7M12 16.5V20" />
    </Box>
  );
}

export function IconCamera({ className }: IconProps) {
  return (
    <Box className={className}>
      <path d="M3 8.5 16.5 4.5l1.8 5.6L4.8 14.1Z" />
      <path d="M18.3 10.1 21.5 8.9v5.4l-3.2-1.2" />
      <path d="M7.5 14v5.5h3.2V15" />
    </Box>
  );
}

export function IconAlarm({ className }: IconProps) {
  return (
    <Box className={className}>
      <path d="M12 3 20 6v6.5c0 4.2-3.3 7-8 8.5-4.7-1.5-8-4.3-8-8.5V6Z" />
      <path d="M9 12.2l2.2 2.3L15.4 10" />
    </Box>
  );
}

export function IconGate({ className }: IconProps) {
  return (
    <Box className={className}>
      <path d="M3 20V9h8v11" />
      <path d="M13 20v-6h8v6" />
      <path d="M3 12.5h8" />
      <path d="M16.6 10.5a4 4 0 0 0 0-5" />
      <path d="M19.4 11.6a6.4 6.4 0 0 0 0-7.2" />
    </Box>
  );
}

export function IconPrewire({ className }: IconProps) {
  return (
    <Box className={className}>
      <path d="M3 21V7.5L12 3l9 4.5V21" />
      <path d="M8 21v-6h8v6" />
      <path d="M6 11.5c2.4 0 2.4 3 4.8 3s2.4-3 4.8-3 2.4 3 2.4 3" />
    </Box>
  );
}

export function IconPin({ className }: IconProps) {
  return (
    <Box className={className}>
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </Box>
  );
}

export function IconInstagram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9A4.5 4.5 0 0 1 16.5 21h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm0 2A2.5 2.5 0 0 0 5 7.5v9A2.5 2.5 0 0 0 7.5 19h9a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 16.5 5h-9Zm4.5 2.8a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4Zm0 2a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Zm5.1-2.65a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1Z"
      />
    </svg>
  );
}

export function IconFacebook({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.25-1.5 1.55-1.5H16.6V4.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.2v3h2.7V21Z" />
    </svg>
  );
}
