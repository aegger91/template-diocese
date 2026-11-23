import { cn } from "@/lib/utils";

type CrossVariant = "slavic" | "byzantine";

/**
 * The one cross used across the site. Never use the ☦ glyph and never mirror this element:
 * on the Slavic cross the footrest rises toward the viewer's LEFT, and that must hold in RTL layouts too.
 */
export function OrthodoxCross({
  variant = "slavic",
  className,
  title,
}: {
  variant?: CrossVariant;
  className?: string;
  title?: string;
}) {
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true as const };
  if (variant === "byzantine") {
    return (
      <svg viewBox="0 0 60 60" className={cn("orthodox-symbol", className)} fill="currentColor" {...a11y}>
        <rect x="26" y="6" width="8" height="48" />
        <rect x="6" y="26" width="48" height="8" />
        <circle cx="30" cy="5" r="4" />
        <circle cx="30" cy="55" r="4" />
        <circle cx="5" cy="30" r="4" />
        <circle cx="55" cy="30" r="4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 60" className={cn("orthodox-symbol", className)} fill="currentColor" {...a11y}>
      <rect x="18" y="0" width="4" height="60" />
      <rect x="12" y="8" width="16" height="3.5" />
      <rect x="3" y="18" width="34" height="5" />
      {/* footrest: viewer's left end (x=9) is higher than the right end (x=31) */}
      <polygon points="9,39.5 31,46.5 31,50.5 9,43.5" />
    </svg>
  );
}

const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Greek cross with IC XC (with titla) above the arms and NI KA below. Letters are drawn, not typed, so no font can alter them. */
export function IcXcNika({ className, title = "IC XC NIKA" }: { className?: string; title?: string }) {
  const C = (cx: number, cy: number) => `M${cx + 5},${cy - 6.5} A7,8.5 0 1 0 ${cx + 5},${cy + 6.5}`;
  return (
    <svg viewBox="0 0 100 100" className={cn("orthodox-symbol", className)} role="img" aria-label={title}>
      <g fill="currentColor">
        <rect x="45.5" y="8" width="9" height="84" />
        <rect x="8" y="45.5" width="84" height="9" />
      </g>
      <g {...STROKE}>
        {/* IC */}
        <path d="M18,20 V36" />
        <path d={C(29, 28)} />
        <path d="M14,15 L15.5,12.5 H35.5 L37,15" />
        {/* XC */}
        <path d="M61,20 L71,36 M71,20 L61,36" />
        <path d={C(81, 28)} />
        <path d="M58,15 L59.5,12.5 H86.5 L88,15" />
        {/* NI */}
        <path d="M15,80 V64 L25,80 V64" />
        <path d="M33,64 V80" />
        {/* KA */}
        <path d="M61,64 V80 M70,64 L61,72.5 L70,80" />
        <path d="M74,80 L79.5,64 L85,80 M76.2,74 H82.8" />
      </g>
    </svg>
  );
}

/** Thin gold rule with a small cross in the middle. */
export function Ornament({ className }: { className?: string }) {
  return (
    <div dir="ltr" className={cn("flex items-center gap-3 text-gold-500", className)} aria-hidden>
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-gold-500/70" />
      <OrthodoxCross className="h-5 w-auto" />
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-gold-500/70" />
    </div>
  );
}
