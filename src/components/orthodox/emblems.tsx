import { cn } from "@/lib/utils";

/** Slavic cross geometry from OrthodoxCross, reused inside other drawings (viewBox 40 x 60). */
function CrossShape({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="currentColor">
      <rect x="18" y="0" width="4" height="60" />
      <rect x="12" y="8" width="16" height="3.5" />
      <rect x="3" y="18" width="34" height="5" />
      <polygon points="9,39.5 31,46.5 31,50.5 9,43.5" />
    </g>
  );
}

/** Bishop's mitre in line art, centered on (cx, cy) with a nominal height of ~70 units. */
function Mitre({ cx, cy, scale = 1 }: { cx: number; cy: number; scale?: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale}) translate(-100 -105)`}>
      <path
        d="M73,128 C68,100 79,77 100,73 C121,77 132,100 127,128 Z"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <path d="M100,74 V128" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
      <path d="M77,104 C90,98 110,98 123,104" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
      <circle cx="100" cy="94" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="86" cy="113" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="114" cy="113" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="100" cy="117" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="71" y="127" width="58" height="10" rx="2" fill="currentColor" />
      <CrossShape x={94} y={52} scale={0.3} />
    </g>
  );
}

/** Circular episcopal seal. Text runs around the ring; the mitre sits in the field. */
export function EpiscopalSeal({
  text,
  year,
  idPrefix,
  className,
  title,
}: {
  text: string;
  year?: string;
  idPrefix: string;
  className?: string;
  title?: string;
}) {
  const topId = `${idPrefix}-seal-top`;
  const bottomId = `${idPrefix}-seal-bottom`;
  const topArc = Math.PI * 79;
  const fontSize = Math.min(17, (topArc * 0.86) / Math.max(text.length, 8) / 0.74);
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("orthodox-symbol", className)}
      role="img"
      aria-label={title ?? text}
    >
      <defs>
        <path id={topId} d="M 21,100 A 79,79 0 0 1 179,100" />
        <path id={bottomId} d="M 30,100 A 70,70 0 0 0 170,100" />
      </defs>
      <circle cx="100" cy="100" r="99" fill="var(--color-gold-500)" />
      <circle cx="100" cy="100" r="95" fill="var(--color-royal-800)" />
      <circle cx="100" cy="100" r="91" fill="none" stroke="var(--color-gold-400)" strokeWidth="0.8" />
      <circle cx="100" cy="100" r="64" fill="var(--color-royal-900)" stroke="var(--color-gold-400)" strokeWidth="2" />
      <circle cx="100" cy="100" r="59" fill="none" stroke="var(--color-gold-400)" strokeWidth="0.6" strokeDasharray="1.5 3" />
      <text
        fill="var(--color-gold-300)"
        fontFamily="var(--font-heading)"
        fontSize={fontSize}
        fontWeight="600"
        letterSpacing="1.2"
        style={{ textTransform: "uppercase" }}
      >
        <textPath href={`#${topId}`} startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
      {year ? (
        <text fill="var(--color-gold-300)" fontFamily="var(--font-heading)" fontSize="12" letterSpacing="2">
          <textPath href={`#${bottomId}`} startOffset="50%" textAnchor="middle" dominantBaseline="hanging">
            {year}
          </textPath>
        </text>
      ) : null}
      <g fill="var(--color-gold-400)">
        <circle cx="27" cy="104" r="2.2" />
        <circle cx="173" cy="104" r="2.2" />
      </g>
      <g color="var(--color-gold-400)">
        <Mitre cx={100} cy={104} scale={0.78} />
      </g>
    </svg>
  );
}

/** Kiot: an arched icon-case frame around the cross. */
export function KiotFrame({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 120 150"
      className={cn("orthodox-symbol", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d="M6,146 V58 A54,54 0 0 1 114,58 V146 Z" fill="var(--color-gold-500)" />
      <path d="M12,140 V60 A48,48 0 0 1 108,60 V140 Z" fill="var(--color-royal-800)" />
      <path d="M18,134 V62 A42,42 0 0 1 102,62 V134 Z" fill="none" stroke="var(--color-gold-400)" strokeWidth="1.2" />
      <g color="var(--color-gold-300)">
        <CrossShape x={42} y={42} scale={0.9} />
      </g>
      <rect x="2" y="142" width="116" height="7" rx="1.5" fill="var(--color-gold-500)" />
    </svg>
  );
}

/** Drawn portrait placeholder for a hierarch: mitre above a panagia on its chain. */
export function HierarchPlaceholder({ className, label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("orthodox-symbol", className)}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <rect width="200" height="200" fill="var(--color-royal-800)" />
      <circle cx="100" cy="100" r="92" fill="none" stroke="var(--color-gold-500)" strokeOpacity="0.5" strokeWidth="1" />
      <g color="var(--color-gold-400)">
        <Mitre cx={100} cy={78} scale={0.85} />
        <path d="M70,118 Q100,150 130,118" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 2.5" />
        <ellipse cx="100" cy="150" rx="13" ry="17" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
        <ellipse cx="100" cy="150" rx="7.5" ry="10.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

/** Drawn placeholder for a parish with no photo: an onion-domed church under the cross. */
export function ChurchPlaceholder({ className, label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      className={cn("orthodox-symbol", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <rect width="320" height="200" fill="var(--color-royal-800)" />
      <path d="M0,170 H320 V200 H0 Z" fill="var(--color-royal-900)" />
      <g fill="none" stroke="var(--color-gold-400)" strokeWidth="2" strokeLinejoin="round">
        <path d="M110,170 V110 H210 V170" />
        <path d="M110,110 L160,92 L210,110" />
        <path d="M140,92 V72 H180 V92" />
        <path d="M160,40 C145,52 138,62 142,72 H178 C182,62 175,52 160,40 Z" fill="var(--color-gold-400)" fillOpacity="0.15" />
        <path d="M148,170 V138 A12,12 0 0 1 172,138 V170" />
        <path d="M124,128 V146 M196,128 V146" />
        <path d="M60,170 V130 H90 V170" />
        <path d="M60,130 L75,118 L90,130" />
        <path d="M230,170 V130 H260 V170" />
        <path d="M230,130 L245,118 L260,130" />
      </g>
      <g color="var(--color-gold-400)">
        <CrossShape x={153.5} y={18} scale={0.33} />
      </g>
    </svg>
  );
}
