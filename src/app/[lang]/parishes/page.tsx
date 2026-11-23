import type { Metadata } from "next";
import { ParishDirectory, type ParishView } from "@/components/parishes/parish-directory";
import { PageHeader } from "@/components/site/page-parts";
import { deaneryById, parishes, siteConfig } from "@/lib/content";
import { formatClock } from "@/lib/dates";
import { getDictionary, loc } from "@/lib/i18n";
import { asset, localHref } from "@/lib/links";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).parishes.title };
}

export default async function ParishesPage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const langLabel = (code: string) => (t.worshipLanguages as Record<string, string>)[code] ?? code;

  const views: ParishView[] = parishes.map((p) => {
    const sunday = p.services.find((s) => s.day === "sun" && s.service === "liturgy") ?? p.services[0];
    const name = loc(p.name, lang);
    return {
      id: p.id,
      name,
      type: p.type,
      typeLabel: t.types[p.type],
      isCathedral: Boolean(p.isCathedral),
      street: p.address.street,
      city: p.address.city,
      region: p.address.region,
      languages: p.languages,
      languageLabels: p.languages.map(langLabel),
      deanery: loc(deaneryById(p.deanery)?.name, lang),
      href: localHref(lang, `/parishes/${p.id}/`),
      absoluteHref: asset(localHref(lang, `/parishes/${p.id}/`)),
      lat: p.coordinates.lat,
      lng: p.coordinates.lng,
      firstService: sunday
        ? `${t.days[sunday.day]} ${formatClock(sunday.time, lang)}, ${(t.serviceTypes as Record<string, string>)[sunday.service] ?? sunday.service}`
        : "",
      searchText: [
        name,
        loc(p.name, siteConfig.defaultLanguage),
        p.address.street,
        p.address.city,
        p.address.region,
        p.address.postalCode,
      ]
        .join(" ")
        .toLocaleLowerCase(),
    };
  });

  const uniq = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b));
  const options = {
    cities: uniq(parishes.map((p) => p.address.city)).map((c) => ({ value: c, label: c })),
    regions: uniq(parishes.map((p) => p.address.region)).map((r) => ({ value: r, label: r })),
    languages: uniq(parishes.flatMap((p) => p.languages)).map((l) => ({ value: l, label: langLabel(l) })),
    types: (["parish", "mission", "monastery", "chapel"] as const).map((x) => ({ value: x, label: t.types[x] })),
  };

  return (
    <>
      <PageHeader lang={lang} title={t.parishes.title} intro={t.parishes.intro} crumbs={[{ label: t.parishes.title, href: "/parishes/" }]} />
      <div className="container-site py-10 sm:py-14">
        <ParishDirectory
          parishes={views}
          options={options}
          map={{ tileUrl: siteConfig.map.tileUrl, attribution: siteConfig.map.tileAttribution }}
          labels={{
            searchLabel: t.parishes.searchLabel,
            searchPlaceholder: t.parishes.searchPlaceholder,
            city: t.parishes.city,
            region: t.parishes.region,
            language: t.parishes.language,
            type: t.parishes.type,
            anyCity: t.parishes.anyCity,
            anyRegion: t.parishes.anyRegion,
            anyLanguage: t.parishes.anyLanguage,
            anyType: t.parishes.anyType,
            clear: t.common.clearFilters,
            noResults: t.common.noResults,
            result: t.common.result,
            results: t.common.results,
            viewDetails: t.parishes.viewDetails,
            onMap: t.parishes.onMap,
            mapUnavailable: t.parishes.mapUnavailable,
            map: t.common.map,
            cathedral: t.parishes.cathedral,
          }}
        />
      </div>
    </>
  );
}
