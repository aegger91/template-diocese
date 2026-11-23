export type CalendarStyle = "revised-julian" | "julian";

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

/** Days between the Julian and Gregorian calendars for a given year (13 for 1900 to 2099). */
function julianOffset(year: number) {
  return Math.floor(year / 100) - Math.floor(year / 400) - 2;
}

/** Orthodox Pascha on the civil (Gregorian) calendar, using the Julian computus (Meeus). */
export function orthodoxPascha(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  return addDays(utc(year, month, day), julianOffset(year));
}

/** A fixed church date (month/day) on the civil calendar for the chosen calendar style. */
function fixed(year: number, month: number, day: number, style: CalendarStyle) {
  const base = utc(year, month, day);
  return style === "julian" ? addDays(base, julianOffset(year)) : base;
}

export interface FeastEntry {
  key: string;
  date: Date;
  moveable: boolean;
  kind: "pascha" | "great";
}

export interface FastEntry {
  key: string;
  start: Date;
  end: Date;
}

export function feastsForYear(year: number, style: CalendarStyle): { feasts: FeastEntry[]; fasts: FastEntry[] } {
  const pascha = orthodoxPascha(year);
  const f = (key: string, date: Date, moveable = false): FeastEntry => ({ key, date, moveable, kind: "great" });

  // Julian-calendar fixed dates late in the church year (e.g. Nativity on Dec 25 Julian)
  // fall into the next civil year, so the previous year's dates are included and then filtered.
  const fixedFeasts = (y: number) => [
    f("nativityTheotokos", fixed(y, 9, 8, style)),
    f("exaltation", fixed(y, 9, 14, style)),
    f("entry", fixed(y, 11, 21, style)),
    f("nativity", fixed(y, 12, 25, style)),
    f("theophany", fixed(y, 1, 6, style)),
    f("meeting", fixed(y, 2, 2, style)),
    f("annunciation", fixed(y, 3, 25, style)),
    f("transfiguration", fixed(y, 8, 6, style)),
    f("dormition", fixed(y, 8, 15, style)),
  ];

  const inYear = (d: Date) => d.getUTCFullYear() === year;
  const feasts: FeastEntry[] = [
    ...fixedFeasts(year - 1),
    ...fixedFeasts(year),
    f("palmSunday", addDays(pascha, -7), true),
    f("ascension", addDays(pascha, 39), true),
    f("pentecost", addDays(pascha, 49), true),
    { key: "pascha", date: pascha, moveable: true, kind: "pascha" as const },
  ]
    .filter((x) => inYear(x.date))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const fasts: FastEntry[] = [
    { key: "greatLent", start: addDays(pascha, -48), end: addDays(pascha, -1) },
    { key: "apostlesFast", start: addDays(pascha, 57), end: fixed(year, 6, 28, style) },
    { key: "dormitionFast", start: fixed(year, 8, 1, style), end: fixed(year, 8, 14, style) },
    { key: "nativityFast", start: fixed(year, 11, 15, style), end: fixed(year, 12, 24, style) },
  ].filter((x) => x.end.getTime() >= x.start.getTime());

  return { feasts, fasts };
}
