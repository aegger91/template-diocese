"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Radio, Ticket } from "lucide-react";
import { DateTile } from "@/components/site/page-parts";
import { nowLocal, parseLocal } from "@/lib/dates";
import type { EventView, ScheduleView } from "@/lib/view";

/** The build renders with the build date; the browser re-filters with today's date after it loads. */
export function useNow(buildTime: string) {
  const [now, setNow] = useState(() => new Date(buildTime));
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(nowLocal());
  }, []);
  return now;
}

const upcoming = <T extends { end?: string; date?: string; start?: string }>(items: T[], now: Date) =>
  items.filter((x) => parseLocal((x.end ?? x.date ?? x.start) as string).getTime() >= now.getTime());

export function NextMajorEvent({
  events,
  buildTime,
  labels,
}: {
  events: EventView[];
  buildTime: string;
  labels: { empty: string; major: string; readMore: string };
}) {
  const now = useNow(buildTime);
  const future = upcoming(events, now);
  const next = future.find((e) => e.major) ?? future[0];
  if (!next) return <p className="text-muted-ink">{labels.empty}</p>;
  return (
    <Link href={next.href} className="group flex gap-4 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-gold-500/50">
      <DateTile day={next.day} month={next.month} />
      <div className="min-w-0">
        <p className="font-heading text-xl leading-snug text-royal-900 group-hover:underline underline-offset-4">{next.title}</p>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-ink">
          <CalendarDays className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden />
          <span>{next.range}</span>
        </p>
        <p className="mt-0.5 flex items-start gap-1.5 text-sm text-muted-ink">
          <MapPin className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden />
          <span>{next.place}</span>
        </p>
      </div>
    </Link>
  );
}

export function UpcomingEventList({
  events,
  buildTime,
  limit,
  labels,
}: {
  events: EventView[];
  buildTime: string;
  limit: number;
  labels: { empty: string; register: string; livestream: string };
}) {
  const now = useNow(buildTime);
  const list = upcoming(events, now).slice(0, limit);
  if (!list.length) return <p className="text-muted-ink">{labels.empty}</p>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {list.map((e) => (
        <li key={e.id}>
          <Link
            href={e.href}
            className="group flex h-full gap-4 rounded-lg border border-line bg-white p-4 transition-shadow hover:shadow-[0_10px_30px_-18px_rgba(14,27,66,0.45)] focus-visible:ring-3 focus-visible:ring-gold-500/50 outline-none"
          >
            <DateTile day={e.day} month={e.month} />
            <div className="min-w-0">
              <p className="eyebrow !text-[0.68rem]">{e.categoryLabel}</p>
              <p className="mt-1 font-heading text-xl leading-snug text-royal-900 group-hover:underline underline-offset-4">{e.title}</p>
              <p className="mt-1 text-sm text-muted-ink">{e.range}</p>
              <p className="text-sm text-muted-ink">{e.place}</p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-royal-700">
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
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function UpcomingSchedule({
  entries,
  buildTime,
  limit,
  empty,
  variant = "compact",
}: {
  entries: ScheduleView[];
  buildTime: string;
  limit?: number;
  empty: string;
  variant?: "compact" | "full";
}) {
  const now = useNow(buildTime);
  const list = upcoming(entries, now).slice(0, limit ?? entries.length);
  if (!list.length) return <p className="text-muted-ink">{empty}</p>;
  return (
    <ol className="divide-y divide-line">
      {list.map((s) => (
        <li key={s.key} className="flex gap-4 py-4 first:pt-0 last:pb-0">
          <DateTile day={s.day} month={s.month} />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-gold-700">{s.kindLabel}</p>
            <p className={variant === "full" ? "font-heading text-xl text-royal-900" : "font-semibold text-royal-900"}>{s.title}</p>
            <p className="text-sm text-muted-ink">
              {s.placeHref ? (
                <Link href={s.placeHref} className="underline-offset-4 hover:underline">
                  {s.place}
                </Link>
              ) : (
                s.place
              )}
            </p>
            {variant === "full" ? <p className="text-sm text-muted-ink">{s.range}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
