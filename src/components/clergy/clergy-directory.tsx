"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterSelect, readQuery, writeQuery } from "@/components/site/filter-select";

export interface ClergyView {
  id: string;
  name: string;
  rank: string;
  rankLabel: string;
  group: "priests" | "deacons" | "retired";
  assignments: { label: string; href?: string }[];
  parishIds: string[];
  searchText: string;
}

const KEYS = ["q", "rank", "parish"] as const;
type Filters = Record<(typeof KEYS)[number], string>;
const EMPTY: Filters = { q: "", rank: "", parish: "" };

export function ClergyDirectory({
  clergy,
  ranks,
  parishes,
  labels,
}: {
  clergy: ClergyView[];
  ranks: { value: string; label: string }[];
  parishes: { value: string; label: string }[];
  labels: {
    search: string;
    rank: string;
    anyRank: string;
    parish: string;
    anyParish: string;
    clear: string;
    noResults: string;
    priests: string;
    deacons: string;
    retired: string;
    assignments: string;
  };
}) {
  const [f, setF] = useState<Filters>(EMPTY);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setF({ ...EMPTY, ...readQuery([...KEYS]) } as Filters);
  }, []);
  const update = (patch: Partial<Filters>) =>
    setF((prev) => {
      const next = { ...prev, ...patch };
      writeQuery(next);
      return next;
    });

  const results = useMemo(() => {
    const q = f.q.trim().toLocaleLowerCase();
    return clergy.filter(
      (c) => (!q || c.searchText.includes(q)) && (!f.rank || c.rank === f.rank) && (!f.parish || c.parishIds.includes(f.parish)),
    );
  }, [f, clergy]);

  const groups = (["priests", "deacons", "retired"] as const)
    .map((g) => ({ key: g, title: labels[g], items: results.filter((c) => c.group === g) }))
    .filter((g) => g.items.length);

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-3 rounded-lg border border-line bg-parchment p-4 sm:grid-cols-3 sm:p-5">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor="clergy-q" className="text-xs font-bold uppercase tracking-wider text-muted-ink">
            {labels.search}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" aria-hidden />
            <Input id="clergy-q" type="search" value={f.q} onChange={(e) => update({ q: e.target.value })} className="h-11 bg-white ps-9 text-base" placeholder={labels.search} />
          </div>
        </div>
        <FilterSelect id="c-rank" label={labels.rank} value={f.rank} onChange={(v) => update({ rank: v })} options={ranks} anyLabel={labels.anyRank} />
        <FilterSelect id="c-parish" label={labels.parish} value={f.parish} onChange={(v) => update({ parish: v })} options={parishes} anyLabel={labels.anyParish} />
      </form>

      {Object.values(f).some(Boolean) ? (
        <Button variant="ghost" onClick={() => update(EMPTY)} className="mt-3 h-9 text-royal-700">
          <X className="size-4" aria-hidden />
          {labels.clear}
        </Button>
      ) : null}

      <div className="mt-8 space-y-10" aria-live="polite">
        {groups.length === 0 ? (
          <p className="rounded-lg border border-dashed border-royal-200 bg-royal-50/60 px-6 py-10 text-center text-muted-ink">{labels.noResults}</p>
        ) : (
          groups.map((g) => (
            <section key={g.key} aria-label={g.title}>
              <h2 className="mb-4 border-b border-line pb-2 text-2xl text-royal-900">{g.title}</h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((c) => (
                  <li key={c.id} className="rounded-lg border border-line bg-white p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-gold-700">{c.rankLabel}</p>
                    <p className="mt-1 font-heading text-xl leading-snug text-royal-900">{c.name}</p>
                    <p className="sr-only">{labels.assignments}</p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-ink">
                      {c.assignments.map((a, i) => (
                        <li key={i}>
                          {a.href ? (
                            <Link href={a.href} className="hover:text-royal-700 hover:underline">
                              {a.label}
                            </Link>
                          ) : (
                            a.label
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
