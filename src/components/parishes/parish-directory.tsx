"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Clock, Crosshair, Languages, MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterSelect, readQuery, writeQuery } from "@/components/site/filter-select";
import { cn } from "@/lib/utils";
import type { MapPoint } from "./parish-map";

const ParishMap = dynamic(() => import("./parish-map").then((m) => m.ParishMap), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-royal-100" />,
});

export interface ParishView {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  isCathedral: boolean;
  street: string;
  city: string;
  region: string;
  languages: string[];
  languageLabels: string[];
  deanery: string;
  href: string;
  absoluteHref: string;
  lat: number;
  lng: number;
  firstService: string;
  searchText: string;
}

type Labels = {
  searchLabel: string;
  searchPlaceholder: string;
  city: string;
  region: string;
  language: string;
  type: string;
  anyCity: string;
  anyRegion: string;
  anyLanguage: string;
  anyType: string;
  clear: string;
  noResults: string;
  result: string;
  results: string;
  viewDetails: string;
  onMap: string;
  mapUnavailable: string;
  map: string;
  cathedral: string;
};

const KEYS = ["q", "city", "region", "language", "type"] as const;
type Filters = Record<(typeof KEYS)[number], string>;
const EMPTY: Filters = { q: "", city: "", region: "", language: "", type: "" };

export function ParishDirectory({
  parishes,
  labels,
  options,
  map,
}: {
  parishes: ParishView[];
  labels: Labels;
  options: {
    cities: { value: string; label: string }[];
    regions: { value: string; label: string }[];
    languages: { value: string; label: string }[];
    types: { value: string; label: string }[];
  };
  map: { tileUrl: string; attribution: string };
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [focusId, setFocusId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters({ ...EMPTY, ...readQuery([...KEYS]) } as Filters);
  }, []);

  const update = (patch: Partial<Filters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      writeQuery(next);
      return next;
    });
  };

  const results = useMemo(() => {
    const q = filters.q.trim().toLocaleLowerCase();
    return parishes.filter(
      (p) =>
        (!q || p.searchText.includes(q)) &&
        (!filters.city || p.city === filters.city) &&
        (!filters.region || p.region === filters.region) &&
        (!filters.language || p.languages.includes(filters.language)) &&
        (!filters.type || p.type === filters.type),
    );
  }, [filters, parishes]);

  const points: MapPoint[] = useMemo(
    () =>
      results.map((p) => ({
        id: p.id,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        type: p.type,
        href: p.absoluteHref,
        address: `${p.street}, ${p.city}, ${p.region}`,
        linkLabel: labels.viewDetails,
      })),
    [results, labels.viewDetails],
  );

  const active = Object.values(filters).some(Boolean);

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="grid gap-3 rounded-lg border border-line bg-parchment p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[1.6fr_repeat(4,1fr)]"
      >
        <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
          <label htmlFor="parish-q" className="text-xs font-bold uppercase tracking-wider text-muted-ink">
            {labels.searchLabel}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" aria-hidden />
            <Input
              id="parish-q"
              type="search"
              value={filters.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder={labels.searchPlaceholder}
              className="h-11 bg-white ps-9 text-base"
            />
          </div>
        </div>
        <FilterSelect id="f-city" label={labels.city} value={filters.city} onChange={(v) => update({ city: v })} options={options.cities} anyLabel={labels.anyCity} />
        <FilterSelect id="f-region" label={labels.region} value={filters.region} onChange={(v) => update({ region: v })} options={options.regions} anyLabel={labels.anyRegion} />
        <FilterSelect id="f-lang" label={labels.language} value={filters.language} onChange={(v) => update({ language: v })} options={options.languages} anyLabel={labels.anyLanguage} />
        <FilterSelect id="f-type" label={labels.type} value={filters.type} onChange={(v) => update({ type: v })} options={options.types} anyLabel={labels.anyType} />
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-ink" role="status" aria-live="polite">
          <strong className="text-royal-900">{results.length}</strong> {results.length === 1 ? labels.result : labels.results}
        </p>
        {active ? (
          <Button variant="ghost" onClick={() => update(EMPTY)} className="h-9 text-royal-700">
            <X className="size-4" aria-hidden />
            {labels.clear}
          </Button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
        <div id="parish-map" className="h-72 scroll-mt-24 overflow-hidden rounded-lg border border-line sm:h-96 lg:sticky lg:top-24 lg:order-2 lg:h-[calc(100dvh-8rem)] lg:max-h-[44rem]">
          <ParishMap
            points={points}
            focusId={focusId}
            tileUrl={map.tileUrl}
            attribution={map.attribution}
            unavailableLabel={labels.mapUnavailable}
            ariaLabel={labels.map}
          />
        </div>

        <div className="lg:order-1">
          {results.length === 0 ? (
            <div className="rounded-lg border border-dashed border-royal-200 bg-royal-50/60 px-6 py-12 text-center">
              <p className="text-muted-ink">{labels.noResults}</p>
              <Button variant="outline" className="mt-4" onClick={() => update(EMPTY)}>
                {labels.clear}
              </Button>
            </div>
          ) : (
            <ul className="grid gap-4">
              {results.map((p) => (
                <li key={p.id}>
                  <article
                    className={cn(
                      "rounded-lg border bg-white p-5 transition-shadow",
                      focusId === p.id ? "border-gold-500 shadow-[0_0_0_3px_color-mix(in_oklch,var(--color-gold-500)_25%,transparent)]" : "border-line",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-sm bg-royal-50 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-royal-700">
                        {p.typeLabel}
                      </span>
                      {p.isCathedral ? (
                        <span className="rounded-sm bg-royal-800 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-gold-300">
                          {labels.cathedral}
                        </span>
                      ) : null}
                      <span className="text-xs text-muted-ink">{p.deanery}</span>
                    </div>
                    <h3 className="mt-2 font-heading text-2xl leading-snug text-royal-900">
                      <Link href={p.href} className="hover:underline underline-offset-4">
                        {p.name}
                      </Link>
                    </h3>
                    <dl className="mt-3 grid gap-1.5 text-sm text-ink">
                      <div className="flex items-start gap-2">
                        <dt className="sr-only">{labels.city}</dt>
                        <MapPin className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden />
                        <dd>
                          {p.street}, {p.city}, {p.region}
                        </dd>
                      </div>
                      <div className="flex items-start gap-2">
                        <dt className="sr-only">{labels.language}</dt>
                        <Languages className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden />
                        <dd>{p.languageLabels.join(", ")}</dd>
                      </div>
                      {p.firstService ? (
                        <div className="flex items-start gap-2">
                          <dt className="sr-only">Services</dt>
                          <Clock className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden />
                          <dd>{p.firstService}</dd>
                        </div>
                      ) : null}
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button asChild className="h-10 rounded-md bg-royal-700 hover:bg-royal-800">
                        <Link href={p.href}>{labels.viewDetails}</Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 rounded-md border-royal-200 text-royal-800"
                        onClick={() => {
                          setFocusId(p.id);
                          if (window.matchMedia("(max-width: 1023px)").matches) {
                            document.getElementById("parish-map")?.scrollIntoView({ behavior: "smooth", block: "center" });
                          }
                        }}
                        aria-label={`${labels.onMap}: ${p.name}`}
                      >
                        <Crosshair className="size-4" aria-hidden />
                        {labels.onMap}
                      </Button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
