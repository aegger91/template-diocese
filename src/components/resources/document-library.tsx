"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterSelect, readQuery, writeQuery } from "@/components/site/filter-select";

export interface DocumentView {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  audience: string;
  audienceLabel: string;
  href: string;
  updated: string;
  updatedLabel: string;
}

const KEYS = ["q", "category", "audience"] as const;
type Filters = Record<(typeof KEYS)[number], string>;
const EMPTY: Filters = { q: "", category: "", audience: "" };

export function DocumentLibrary({
  documents,
  categories,
  audiences,
  labels,
}: {
  documents: DocumentView[];
  categories: { value: string; label: string }[];
  audiences: { value: string; label: string }[];
  labels: { search: string; category: string; anyCategory: string; audience: string; anyAudience: string; clear: string; empty: string; download: string; updated: string };
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

  const list = useMemo(() => {
    const q = f.q.trim().toLocaleLowerCase();
    return documents.filter(
      (d) =>
        (!q || `${d.title} ${d.description}`.toLocaleLowerCase().includes(q)) &&
        (!f.category || d.category === f.category) &&
        (!f.audience || d.audience === f.audience),
    );
  }, [documents, f]);

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-3 rounded-lg border border-line bg-parchment p-4 sm:grid-cols-3 sm:p-5">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor="doc-q" className="text-xs font-bold uppercase tracking-wider text-muted-ink">
            {labels.search}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" aria-hidden />
            <Input id="doc-q" type="search" value={f.q} onChange={(e) => update({ q: e.target.value })} className="h-11 bg-white ps-9 text-base" />
          </div>
        </div>
        <FilterSelect id="doc-cat" label={labels.category} value={f.category} onChange={(v) => update({ category: v })} options={categories} anyLabel={labels.anyCategory} />
        <FilterSelect id="doc-aud" label={labels.audience} value={f.audience} onChange={(v) => update({ audience: v })} options={audiences} anyLabel={labels.anyAudience} />
      </form>
      {Object.values(f).some(Boolean) ? (
        <Button variant="ghost" onClick={() => update(EMPTY)} className="mt-3 h-9 text-royal-700">
          <X className="size-4" aria-hidden />
          {labels.clear}
        </Button>
      ) : null}

      <ul className="mt-6 grid gap-3" aria-live="polite">
        {list.length === 0 ? (
          <li className="rounded-lg border border-dashed border-royal-200 bg-royal-50/60 px-6 py-10 text-center text-muted-ink">{labels.empty}</li>
        ) : null}
        {list.map((d) => (
          <li key={d.id} className="flex flex-col gap-4 rounded-lg border border-line bg-white p-4 sm:flex-row sm:items-center sm:p-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-md bg-royal-50 text-royal-700">
              <FileText className="size-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-xl leading-snug text-royal-900">{d.title}</p>
              {d.description ? <p className="mt-0.5 text-sm text-muted-ink">{d.description}</p> : null}
              <p className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-sm bg-royal-50 px-2 py-0.5 font-semibold text-royal-800">{d.categoryLabel}</span>
                <span className="rounded-sm bg-gold-300/30 px-2 py-0.5 font-semibold text-gold-700">{d.audienceLabel}</span>
                <span className="px-1 py-0.5 text-muted-ink">
                  {labels.updated} <time dateTime={d.updated}>{d.updatedLabel}</time>
                </span>
              </p>
            </div>
            <Button asChild variant="outline" className="h-10 shrink-0 rounded-md border-royal-200 text-royal-800">
              <a href={d.href} download>
                {labels.download}
              </a>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
