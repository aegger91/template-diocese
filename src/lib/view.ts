import { bishopSchedule, clergyById, parishById } from "./content";
import { formatRange, monthParts, parseLocal } from "./dates";
import { getDictionary, loc } from "./i18n";
import { localHref } from "./links";
import type { Clergy, DiocesanEvent, ScheduleEntry } from "./types";

/** Event data flattened to plain strings so client components need no content lookups. */
export interface EventView {
  id: string;
  href: string;
  title: string;
  summary: string;
  start: string;
  end: string;
  category: DiocesanEvent["category"];
  categoryLabel: string;
  place: string;
  range: string;
  day: string;
  month: string;
  major: boolean;
  hasRegistration: boolean;
  livestream: boolean;
}

export function eventPlace(ev: DiocesanEvent, lang: string) {
  if (ev.location.parishId) {
    const p = parishById(ev.location.parishId);
    if (p) return `${loc(p.name, lang)}, ${p.address.city}`;
  }
  return loc(ev.location.name, lang);
}

export function eventView(ev: DiocesanEvent, lang: string): EventView {
  const t = getDictionary(lang);
  const parts = monthParts(ev.start, lang);
  return {
    id: ev.id,
    href: localHref(lang, `/events/${ev.id}/`),
    title: loc(ev.title, lang),
    summary: loc(ev.summary, lang),
    start: ev.start,
    end: ev.end ?? ev.start,
    category: ev.category,
    categoryLabel: t.events.categories[ev.category],
    place: eventPlace(ev, lang),
    range: formatRange(ev.start, ev.end, lang),
    day: parts.day,
    month: parts.month,
    major: ev.major,
    hasRegistration: Boolean(ev.registration),
    livestream: Boolean(ev.livestream),
  };
}

export interface ScheduleView {
  key: string;
  date: string;
  title: string;
  kindLabel: string;
  place: string;
  placeHref?: string;
  range: string;
  day: string;
  month: string;
}

export function scheduleViews(lang: string): ScheduleView[] {
  const t = getDictionary(lang);
  return bishopSchedule.entries
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e: ScheduleEntry, i) => {
      const p = parishById(e.parishId);
      const parts = monthParts(e.date, lang);
      return {
        key: `${e.date}-${i}`,
        date: e.date,
        title: loc(e.title, lang),
        kindLabel: t.news.kinds[e.kind],
        place: p ? `${loc(p.name, lang)}, ${p.address.city}` : loc(e.place, lang),
        placeHref: p ? localHref(lang, `/parishes/${p.id}/`) : undefined,
        range: formatRange(e.date, undefined, lang),
        day: parts.day,
        month: parts.month,
      };
    });
}

export function clergyDisplayName(c: Clergy, lang: string) {
  const t = getDictionary(lang);
  return `${t.ranks[c.rank]} ${loc(c.name, lang)}`;
}

export function clergyNameById(id: string | undefined, lang: string) {
  const c = clergyById(id);
  return c ? clergyDisplayName(c, lang) : "";
}

export function isPast(value: string, now: Date) {
  return parseLocal(value).getTime() < now.getTime();
}
