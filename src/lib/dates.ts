// Content dates are local diocesan times written without a zone ("2026-12-12T09:30").
// They are parsed and formatted as UTC so the build and the browser always agree.

export function parseLocal(value: string): Date {
  const [datePart, timePart = "00:00"] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh || 0, mm || 0));
}

export function hasTime(value: string) {
  return value.includes("T");
}

/** "Now" expressed in the same zone-less frame as content dates. */
export function nowLocal(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate(), n.getHours(), n.getMinutes()));
}

export function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

const fmt = (lang: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(lang, { timeZone: "UTC", ...opts });

export function formatDate(value: string | Date, lang: string, style: "long" | "medium" | "short" = "long") {
  const d = typeof value === "string" ? parseLocal(value) : value;
  if (style === "short") return fmt(lang, { day: "numeric", month: "short" }).format(d);
  if (style === "medium") return fmt(lang, { day: "numeric", month: "short", year: "numeric" }).format(d);
  return fmt(lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
}

export function formatTime(value: string | Date, lang: string) {
  const d = typeof value === "string" ? parseLocal(value) : value;
  return fmt(lang, { hour: "numeric", minute: "2-digit" }).format(d);
}

export function formatClock(hhmm: string, lang: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return fmt(lang, { hour: "numeric", minute: "2-digit" }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
}

export function formatMonthYear(d: Date, lang: string) {
  return fmt(lang, { month: "long", year: "numeric" }).format(d);
}

export function monthParts(value: string, lang: string) {
  const d = parseLocal(value);
  return {
    day: fmt(lang, { day: "numeric" }).format(d),
    month: fmt(lang, { month: "short" }).format(d).replace(".", ""),
    weekday: fmt(lang, { weekday: "short" }).format(d),
  };
}

export function formatRange(start: string, end: string | undefined, lang: string) {
  const s = parseLocal(start);
  if (!end) {
    return hasTime(start) ? `${formatDate(s, lang)}, ${formatTime(s, lang)}` : formatDate(s, lang);
  }
  const e = parseLocal(end);
  if (dayKey(s) === dayKey(e)) {
    return hasTime(start)
      ? `${formatDate(s, lang)}, ${formatTime(s, lang)} - ${formatTime(e, lang)}`
      : formatDate(s, lang);
  }
  return `${formatDate(s, lang, "medium")} - ${formatDate(e, lang, "medium")}`;
}

export function addDays(d: Date, n: number) {
  return new Date(d.getTime() + n * 86400000);
}

export function eventEnd(ev: { start: string; end?: string }) {
  return parseLocal(ev.end ?? ev.start);
}
