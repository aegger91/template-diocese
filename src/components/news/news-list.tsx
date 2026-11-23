"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileDown, ScrollText } from "lucide-react";
import { readQuery, writeQuery } from "@/components/site/filter-select";

export interface NewsView {
  id: string;
  href: string;
  title: string;
  summary: string;
  date: string;
  dateLabel: string;
  official: boolean;
  categoryLabel: string;
  pdfHref?: string;
}

type Tab = "all" | "letters" | "announcements";

export function NewsList({
  items,
  labels,
}: {
  items: NewsView[];
  labels: { all: string; letters: string; announcements: string; empty: string; pdf: string; filter: string };
}) {
  const [tab, setTab] = useState<Tab>("all");
  useEffect(() => {
    const q = readQuery(["type"]).type;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q === "letters" || q === "announcements") setTab(q);
  }, []);
  const choose = (next: Tab) => {
    setTab(next);
    writeQuery({ type: next === "all" ? "" : next });
  };
  const list = items.filter((n) => tab === "all" || (tab === "letters" ? n.official : !n.official));
  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: labels.all },
    { id: "letters", label: labels.letters },
    { id: "announcements", label: labels.announcements },
  ];

  return (
    <div>
      <div role="group" aria-label={labels.filter} className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            onClick={() => choose(t.id)}
            className="h-10 rounded-full border border-royal-200 px-4 text-sm font-semibold text-royal-800 transition hover:border-royal-600 aria-pressed:border-royal-800 aria-pressed:bg-royal-800 aria-pressed:text-white"
          >
            {t.label}
          </button>
        ))}
      </div>
      <ul className="mt-8 divide-y divide-line border-y border-line" aria-live="polite">
        {list.length === 0 ? <li className="py-10 text-center text-muted-ink">{labels.empty}</li> : null}
        {list.map((n) => (
          <li key={n.id} className="grid gap-3 py-6 sm:grid-cols-[9rem_1fr] sm:gap-6">
            <div className="flex items-center gap-3 sm:block">
              <time dateTime={n.date} className="text-sm font-semibold text-muted-ink">
                {n.dateLabel}
              </time>
              <p
                className={
                  n.official
                    ? "inline-flex items-center gap-1 rounded-sm bg-royal-800 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-gold-300 sm:mt-2"
                    : "inline-flex items-center rounded-sm bg-royal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-royal-700 sm:mt-2"
                }
              >
                {n.official ? <ScrollText className="size-3" aria-hidden /> : null}
                {n.categoryLabel}
              </p>
            </div>
            <div className="min-w-0">
              <Link href={n.href} className="font-heading text-2xl leading-snug text-royal-900 underline-offset-4 hover:underline">
                {n.title}
              </Link>
              <p className="mt-1 max-w-3xl text-muted-ink">{n.summary}</p>
              {n.pdfHref ? (
                <a href={n.pdfHref} download className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-royal-700 hover:underline">
                  <FileDown className="size-4" aria-hidden />
                  {labels.pdf}
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
