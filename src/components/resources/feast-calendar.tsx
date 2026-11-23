"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrthodoxCross } from "@/components/orthodox/cross";
import { feastsForYear, type CalendarStyle } from "@/lib/feasts";
import { cn } from "@/lib/utils";

export function FeastCalendar({
  initialYear,
  style,
  lang,
  names,
  labels,
}: {
  initialYear: number;
  style: CalendarStyle;
  lang: string;
  names: Record<string, string>;
  labels: { year: string; previous: string; next: string; feastOfFeasts: string; greatFeasts: string; fasts: string; moveable: string; note: string };
}) {
  const [year, setYear] = useState(initialYear);
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    const n = new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(n.getFullYear());
    setToday(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
  }, []);

  const { feasts, fasts } = feastsForYear(year, style);
  const pascha = feasts.find((f) => f.kind === "pascha")!;
  const great = feasts.filter((f) => f.kind !== "pascha");
  const nextKey = today === null ? null : great.find((f) => f.date.getTime() >= today)?.key;

  const long = new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  const short = new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", timeZone: "UTC" });
  const day = new Intl.DateTimeFormat(lang, { day: "numeric", timeZone: "UTC" });
  const month = new Intl.DateTimeFormat(lang, { month: "short", timeZone: "UTC" });

  return (
    <div>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-parchment p-3 sm:justify-start sm:gap-5">
        <Button variant="outline" size="icon" className="size-10 border-royal-200" onClick={() => setYear((y) => y - 1)} aria-label={labels.previous}>
          <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden />
        </Button>
        <p className="font-heading text-3xl text-royal-900" aria-live="polite">
          <span className="sr-only">{labels.year} </span>
          {year}
        </p>
        <Button variant="outline" size="icon" className="size-10 border-royal-200" onClick={() => setYear((y) => y + 1)} aria-label={labels.next}>
          <ChevronRight className="size-5 rtl:rotate-180" aria-hidden />
        </Button>
      </div>
      <p className="mt-3 text-sm text-muted-ink">{labels.note}</p>

      <section aria-labelledby="pascha" className="on-dark relative mt-8 overflow-hidden rounded-lg bg-royal-900 p-6 text-white sm:p-10">
        <OrthodoxCross className="pointer-events-none absolute -bottom-6 end-4 h-52 w-auto text-gold-400/15 sm:end-10" />
        <p id="pascha" className="eyebrow">{labels.feastOfFeasts}</p>
        <p className="display-text mt-2 text-3xl text-gold-300 sm:text-5xl">{names.pascha}</p>
        <p className="mt-3 text-xl text-royal-100">{long.format(pascha.date)}</p>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <section aria-labelledby="great">
          <h2 id="great" className="mb-4 text-3xl text-royal-900">{labels.greatFeasts}</h2>
          <ol className="divide-y divide-line rounded-lg border border-line bg-white">
            {great.map((f) => (
              <li key={f.key} className={cn("flex items-center gap-4 p-4", f.key === nextKey && "bg-gold-300/20")}>
                <span className="flex w-14 shrink-0 flex-col items-center rounded-md border border-gold-500/50 py-1.5 text-center">
                  <span className="font-heading text-2xl leading-none text-royal-900">{day.format(f.date)}</span>
                  <span className="mt-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-gold-700">{month.format(f.date).replace(".", "")}</span>
                </span>
                <span className="min-w-0">
                  <span className="block font-heading text-xl leading-snug text-royal-900">{names[f.key]}</span>
                  <span className="text-sm text-muted-ink">
                    {long.format(f.date)}
                    {f.moveable ? <span className="ms-2 rounded-sm bg-royal-50 px-1.5 py-0.5 text-xs font-semibold text-royal-700">{labels.moveable}</span> : null}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="fasts">
          <h2 id="fasts" className="mb-4 text-3xl text-royal-900">{labels.fasts}</h2>
          <ul className="space-y-3">
            {fasts.map((f) => (
              <li key={f.key} className="rounded-lg border-s-4 border-royal-700 bg-royal-50 p-4">
                <p className="font-heading text-xl text-royal-900">{names[f.key]}</p>
                <p className="text-sm text-muted-ink">
                  {short.format(f.start)} - {short.format(f.end)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
