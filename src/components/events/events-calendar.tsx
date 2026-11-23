"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Radio, Star, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateTile } from "@/components/site/page-parts";
import { FilterSelect, readQuery, writeQuery } from "@/components/site/filter-select";
import { addDays, dayKey, formatDate, formatMonthYear, formatTime, hasTime, parseLocal } from "@/lib/dates";
import type { EventView } from "@/lib/view";
import { cn } from "@/lib/utils";

type View = "month" | "week" | "list";

interface Labels {
  month: string;
  week: string;
  list: string;
  today: string;
  previous: string;
  next: string;
  category: string;
  allCategories: string;
  empty: string;
  upcoming: string;
  past: string;
  more: string;
  register: string;
  livestream: string;
  major: string;
  views: string;
}

const CATEGORY_DOT: Record<string, string> = {
  assembly: "bg-royal-700",
  retreat: "bg-emerald-700",
  service: "bg-gold-500",
  youth: "bg-sky-600",
  education: "bg-indigo-500",
  music: "bg-rose-700",
  charity: "bg-orange-600",
  clergy: "bg-slate-600",
};

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d));

function eventDays(e: EventView) {
  const days: string[] = [];
  let d = parseLocal(e.start.slice(0, 10));
  const last = dayKey(parseLocal(e.end));
  for (let i = 0; i < 60 && dayKey(d) <= last; i++, d = addDays(d, 1)) days.push(dayKey(d));
  return days;
}

export function EventsCalendar({
  events,
  categories,
  buildTime,
  lang,
  weekStartsOn,
  labels,
}: {
  events: EventView[];
  categories: { value: string; label: string }[];
  buildTime: string;
  lang: string;
  weekStartsOn: "sunday" | "monday";
  labels: Labels;
}) {
  const [now, setNow] = useState(() => new Date(buildTime));
  const [cursor, setCursor] = useState(() => new Date(buildTime));
  const [view, setView] = useState<View>("month");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const n = new Date();
    const today = utc(n.getFullYear(), n.getMonth(), n.getDate());
    const q = readQuery(["view", "category"]);
    /* eslint-disable react-hooks/set-state-in-effect */
    setNow(new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate(), n.getHours(), n.getMinutes())));
    setCursor(today);
    if (q.view === "week" || q.view === "list" || q.view === "month") setView(q.view);
    if (q.category) setCategory(q.category);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const sync = (v: View, c: string) => writeQuery({ view: v === "month" ? "" : v, category: c });
  const chooseView = (v: View) => {
    setView(v);
    sync(v, category);
  };
  const chooseCategory = (c: string) => {
    setCategory(c);
    sync(view, c);
  };

  const filtered = useMemo(() => events.filter((e) => !category || e.category === category), [events, category]);
  const byDay = useMemo(() => {
    const map = new Map<string, EventView[]>();
    for (const e of filtered) for (const k of eventDays(e)) map.set(k, [...(map.get(k) ?? []), e]);
    return map;
  }, [filtered]);

  const weekStart = weekStartsOn === "monday" ? 1 : 0;
  const startOfWeek = (d: Date) => addDays(utc(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), -((d.getUTCDay() - weekStart + 7) % 7));
  const todayKey = dayKey(now);

  const weekdayNames = Array.from({ length: 7 }, (_, i) => {
    const d = utc(2023, 0, 1 + ((i + weekStart) % 7));
    return {
      short: new Intl.DateTimeFormat(lang, { weekday: "short", timeZone: "UTC" }).format(d),
      long: new Intl.DateTimeFormat(lang, { weekday: "long", timeZone: "UTC" }).format(d),
    };
  });

  const shift = (dir: -1 | 1) => {
    if (view === "week") setCursor((c) => addDays(c, 7 * dir));
    else setCursor((c) => utc(c.getUTCFullYear(), c.getUTCMonth() + dir, 1));
  };
  const goToday = () => setCursor(utc(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const monthStart = utc(cursor.getUTCFullYear(), cursor.getUTCMonth(), 1);
  const monthEnd = utc(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0);
  const gridStart = startOfWeek(monthStart);
  const gridDays: Date[] = [];
  for (let d = gridStart; d <= monthEnd || gridDays.length % 7 !== 0; d = addDays(d, 1)) gridDays.push(d);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i));
  const monthEvents = filtered.filter((e) => e.start.slice(0, 7) <= dayKey(monthEnd).slice(0, 7) && e.end.slice(0, 7) >= dayKey(monthStart).slice(0, 7));

  const title =
    view === "week"
      ? `${formatDate(weekDays[0], lang, "medium")} - ${formatDate(weekDays[6], lang, "medium")}`
      : view === "month"
        ? formatMonthYear(cursor, lang)
        : labels.upcoming;

  const timeOf = (e: EventView) => (hasTime(e.start) ? formatTime(e.start, lang) : "");

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-lg border border-line bg-parchment p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
        <div role="group" aria-label={labels.views} className="inline-flex w-full rounded-md border border-royal-200 bg-white p-1 sm:w-auto">
          {(["month", "week", "list"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => chooseView(v)}
              className="h-9 flex-1 rounded-sm px-4 text-sm font-semibold text-royal-800 transition aria-pressed:bg-royal-800 aria-pressed:text-white sm:flex-none"
            >
              {labels[v]}
            </button>
          ))}
        </div>
        <FilterSelect
          id="ev-cat"
          label={labels.category}
          value={category}
          onChange={chooseCategory}
          options={categories}
          anyLabel={labels.allCategories}
          className="lg:w-64"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl capitalize text-royal-900 sm:text-3xl" aria-live="polite">
          {title}
        </h2>
        {view !== "list" ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="size-10 border-royal-200" onClick={() => shift(-1)} aria-label={labels.previous}>
              <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden />
            </Button>
            <Button variant="outline" className="h-10 border-royal-200 px-4 text-royal-800" onClick={goToday}>
              {labels.today}
            </Button>
            <Button variant="outline" size="icon" className="size-10 border-royal-200" onClick={() => shift(1)} aria-label={labels.next}>
              <ChevronRight className="size-5 rtl:rotate-180" aria-hidden />
            </Button>
          </div>
        ) : null}
      </div>

      {view === "month" ? (
        <>
          <div className="mt-4 overflow-hidden rounded-lg border border-line bg-white">
            <div className="grid grid-cols-7 border-b border-line bg-royal-900 text-gold-300">
              {weekdayNames.map((w) => (
                <div key={w.long} className="px-1 py-2 text-center text-[0.7rem] font-bold uppercase tracking-wider sm:text-xs">
                  <abbr title={w.long} className="no-underline">
                    {w.short}
                  </abbr>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {gridDays.map((d) => {
                const k = dayKey(d);
                const list = byDay.get(k) ?? [];
                const outside = d.getUTCMonth() !== cursor.getUTCMonth();
                return (
                  <div
                    key={k}
                    className={cn(
                      "min-h-14 border-b border-e border-line p-1 text-sm sm:min-h-28 sm:p-1.5 [&:nth-child(7n)]:border-e-0",
                      outside && "bg-royal-50/50 text-muted-ink/60",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-7 place-items-center rounded-full text-xs font-semibold sm:text-sm",
                        k === todayKey && "bg-gold-500 text-royal-950",
                      )}
                    >
                      {d.getUTCDate()}
                    </span>
                    {list.length ? (
                      <>
                        <ul className="mt-1 hidden space-y-1 sm:block">
                          {list.slice(0, 3).map((e) => (
                            <li key={e.id}>
                              <Link
                                href={e.href}
                                title={e.title}
                                className={cn(
                                  "block rounded-sm px-1.5 py-0.5 text-xs font-semibold leading-snug break-words hyphens-auto",
                                  e.major ? "bg-royal-800 text-white hover:bg-royal-700" : "bg-royal-50 text-royal-900 hover:bg-royal-100",
                                )}
                              >
                                {k === e.start.slice(0, 10) && timeOf(e) ? `${timeOf(e)} ` : ""}
                                {e.title}
                              </Link>
                            </li>
                          ))}
                          {list.length > 3 ? (
                            <li className="px-1.5 text-xs text-muted-ink">
                              +{list.length - 3} {labels.more}
                            </li>
                          ) : null}
                        </ul>
                        <span className="mt-1 flex flex-wrap justify-center gap-0.5 sm:hidden" aria-hidden>
                          {list.slice(0, 3).map((e) => (
                            <span key={e.id} className={cn("size-1.5 rounded-full", CATEGORY_DOT[e.category] ?? "bg-royal-700")} />
                          ))}
                        </span>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6 sm:hidden">
            <EventRows events={monthEvents} lang={lang} labels={labels} />
          </div>
        </>
      ) : null}

      {view === "week" ? (
        <ol className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
          {weekDays.map((d) => {
            const k = dayKey(d);
            const list = byDay.get(k) ?? [];
            return (
              <li key={k} className={cn("grid gap-3 p-4 sm:grid-cols-[11rem_1fr]", k === todayKey && "bg-gold-300/15")}>
                <p className="font-heading text-lg text-royal-900">
                  {new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(d)}
                  {k === todayKey ? <span className="ms-2 rounded-sm bg-gold-500 px-1.5 py-0.5 align-middle font-sans text-[0.65rem] font-bold uppercase text-royal-950">{labels.today}</span> : null}
                </p>
                {list.length ? (
                  <ul className="space-y-2">
                    {list.map((e) => (
                      <li key={e.id}>
                        <Link href={e.href} className="group flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                          {timeOf(e) && k === e.start.slice(0, 10) ? <span className="text-sm font-semibold text-gold-700">{timeOf(e)}</span> : null}
                          <span className="font-semibold text-royal-900 group-hover:underline">{e.title}</span>
                          <span className="text-sm text-muted-ink">{e.place}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-ink/70">-</p>
                )}
              </li>
            );
          })}
        </ol>
      ) : null}

      {view === "list" ? (
        <div className="mt-4 space-y-10">
          <EventRows events={filtered.filter((e) => parseLocal(e.end).getTime() >= now.getTime())} lang={lang} labels={labels} />
          {filtered.some((e) => parseLocal(e.end).getTime() < now.getTime()) ? (
            <details className="group rounded-lg border border-line bg-white p-4">
              <summary className="cursor-pointer font-heading text-xl text-royal-900">{labels.past}</summary>
              <div className="mt-4">
                <EventRows events={filtered.filter((e) => parseLocal(e.end).getTime() < now.getTime()).reverse()} lang={lang} labels={labels} muted />
              </div>
            </details>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function EventRows({ events, labels, muted }: { events: EventView[]; lang: string; labels: Labels; muted?: boolean }) {
  if (!events.length) return <p className="rounded-lg border border-dashed border-royal-200 bg-royal-50/60 px-6 py-8 text-center text-muted-ink">{labels.empty}</p>;
  return (
    <ul className="space-y-3">
      {events.map((e) => (
        <li key={e.id}>
          <Link
            href={e.href}
            className={cn(
              "group flex gap-4 rounded-lg border border-line bg-white p-4 transition hover:border-gold-500",
              e.major && !muted && "border-s-4 border-s-gold-500",
              muted && "opacity-80",
            )}
          >
            <DateTile day={e.day} month={e.month} />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-2 text-xs font-bold uppercase tracking-wider text-gold-700">
                <span className={cn("size-2 rounded-full", CATEGORY_DOT[e.category])} aria-hidden />
                {e.categoryLabel}
                {e.major ? (
                  <span className="inline-flex items-center gap-1 text-royal-700">
                    <Star className="size-3" aria-hidden />
                    {labels.major}
                  </span>
                ) : null}
              </p>
              <p className="mt-1 font-heading text-xl leading-snug text-royal-900 group-hover:underline underline-offset-4">{e.title}</p>
              <p className="mt-0.5 text-sm text-muted-ink">{e.range}</p>
              <p className="text-sm text-muted-ink">{e.place}</p>
              {!muted && (e.hasRegistration || e.livestream) ? (
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-royal-700">
                  {e.hasRegistration ? (
                    <span className="inline-flex items-center gap-1">
                      <Ticket className="size-3.5" aria-hidden />
                      {labels.register}
                    </span>
                  ) : null}
                  {e.livestream ? (
                    <span className="inline-flex items-center gap-1">
                      <Radio className="size-3.5" aria-hidden />
                      {labels.livestream}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
