import type { Metadata } from "next";
import Link from "next/link";
import { ClergyDirectory, type ClergyView } from "@/components/clergy/clergy-directory";
import { HierarchPlaceholder } from "@/components/orthodox/emblems";
import { PageHeader } from "@/components/site/page-parts";
import { clergy, deaneryById, diocese, parishById, parishes } from "@/lib/content";
import { getDictionary, loc } from "@/lib/i18n";
import { localHref } from "@/lib/links";
import { clergyDisplayName } from "@/lib/view";
import type { Clergy } from "@/lib/types";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).clergy.title };
}

const RANK_ORDER = ["bishop", "archimandrite", "archpriest", "priest", "hieromonk", "protodeacon", "deacon"];

export default async function ClergyPage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const roles = t.roles as Record<string, string>;

  const assignmentsOf = (c: Clergy) =>
    c.assignments.map((a) => {
      const p = parishById(a.parishId);
      const d = deaneryById(a.deanery);
      const where = p ? loc(p.name, lang) : d ? loc(d.name, lang) : "";
      return {
        label: where ? `${roles[a.role] ?? a.role}, ${where}` : roles[a.role] ?? a.role,
        href: p ? localHref(lang, `/parishes/${p.id}/`) : undefined,
      };
    });

  const bishops = clergy.filter((c) => c.rank === "bishop");
  const others: ClergyView[] = clergy
    .filter((c) => c.rank !== "bishop")
    .sort((a, b) => RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank))
    .map((c) => ({
      id: c.id,
      name: loc(c.name, lang),
      rank: c.rank,
      rankLabel: t.ranks[c.rank],
      group: c.status === "retired" ? "retired" : c.rank.includes("deacon") ? "deacons" : "priests",
      assignments: assignmentsOf(c),
      parishIds: c.assignments.map((a) => a.parishId).filter(Boolean) as string[],
      searchText: [loc(c.name, lang), loc(c.name, "en")].join(" ").toLocaleLowerCase(),
    }));

  const usedRanks = RANK_ORDER.filter((r) => r !== "bishop" && clergy.some((c) => c.rank === r));

  return (
    <>
      <PageHeader
        lang={lang}
        title={t.clergy.title}
        intro={t.clergy.intro}
        crumbs={[
          { label: t.about.title, href: "/about/" },
          { label: t.clergy.title, href: "/clergy/" },
        ]}
      />
      <div className="container-site py-10 sm:py-14">
        <section aria-labelledby="bishops" className="mb-12">
          <h2 id="bishops" className="mb-5 text-3xl text-royal-900">
            {t.clergy.bishops}
          </h2>
          <ul className="grid gap-5 md:grid-cols-2">
            {bishops.map((b) => (
              <li key={b.id} className="frame-official flex flex-col gap-5 rounded-sm bg-white p-5 sm:flex-row sm:items-center">
                <HierarchPlaceholder label={t.clergy.portraitPlaceholder} className="size-24 shrink-0 rounded-full" />
                <div className="min-w-0">
                  <p className="font-heading text-2xl text-royal-900">
                    {b.id === diocese.bishop.clergyId ? loc(diocese.bishop.styledName, lang) : clergyDisplayName(b, lang)}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-ink">
                    {assignmentsOf(b).map((a, i) => (
                      <li key={i}>{a.href ? <Link href={a.href} className="hover:underline">{a.label}</Link> : a.label}</li>
                    ))}
                  </ul>
                  {b.id === diocese.bishop.clergyId ? (
                    <Link href={localHref(lang, "/about/bishop/")} className="mt-3 inline-block text-sm font-semibold text-royal-700 hover:underline">
                      {t.about.biography}
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <ClergyDirectory
          clergy={others}
          ranks={usedRanks.map((r) => ({ value: r, label: (t.ranks as Record<string, string>)[r] }))}
          parishes={parishes.map((p) => ({ value: p.id, label: loc(p.name, lang) }))}
          labels={{
            search: t.clergy.searchPlaceholder,
            rank: t.clergy.rank,
            anyRank: t.clergy.anyRank,
            parish: t.clergy.parish,
            anyParish: t.clergy.anyParish,
            clear: t.common.clearFilters,
            noResults: t.common.noResults,
            priests: t.clergy.priests,
            deacons: t.clergy.deacons,
            retired: t.clergy.retired,
            assignments: t.clergy.assignments,
          }}
        />
      </div>
    </>
  );
}
