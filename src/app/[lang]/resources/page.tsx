import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OrthodoxCross } from "@/components/orthodox/cross";
import { DocumentLibrary } from "@/components/resources/document-library";
import { PageHeader } from "@/components/site/page-parts";
import { documents } from "@/lib/content";
import { formatDate } from "@/lib/dates";
import { getDictionary, loc } from "@/lib/i18n";
import { asset, localHref } from "@/lib/links";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).resources.title };
}

export default async function ResourcesPage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const r = t.resources;
  const cats = [...new Set(documents.map((d) => d.category))];
  const auds = [...new Set(documents.map((d) => d.audience))];

  return (
    <>
      <PageHeader lang={lang} title={r.title} intro={r.intro} crumbs={[{ label: r.title, href: "/resources/" }]} />
      <div className="container-site grid gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0">
          <DocumentLibrary
            documents={documents.map((d) => ({
              id: d.id,
              title: loc(d.title, lang),
              description: loc(d.description, lang),
              category: d.category,
              categoryLabel: r.categories[d.category],
              audience: d.audience,
              audienceLabel: r.audiences[d.audience],
              href: asset(d.file),
              updated: d.updated,
              updatedLabel: formatDate(d.updated, lang, "medium"),
            }))}
            categories={cats.map((c) => ({ value: c, label: r.categories[c] }))}
            audiences={auds.map((a) => ({ value: a, label: r.audiences[a] }))}
            labels={{
              search: r.searchPlaceholder,
              category: r.category,
              anyCategory: t.common.all,
              audience: r.audience,
              anyAudience: t.common.all,
              clear: t.common.clearFilters,
              empty: t.common.noResults,
              download: t.common.downloadPdf,
              updated: t.common.updated,
            }}
          />
        </div>
        <aside className="h-fit">
          <Link
            href={localHref(lang, "/resources/feasts/")}
            className="on-dark group relative block rounded-lg bg-royal-900 p-6 text-white"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg" aria-hidden>
              <OrthodoxCross className="absolute -bottom-4 end-3 h-32 w-auto text-gold-400/20" />
            </div>
            <div className="relative">
              <p className="eyebrow">{r.year}</p>
              <p className="mt-2 font-heading text-2xl leading-snug text-gold-300">{r.feastsTitle}</p>
              <p className="mt-2 text-sm leading-snug text-royal-100">{r.feastsIntro}</p>
              <ArrowRight className="mt-4 size-5 text-gold-300 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
            </div>
          </Link>
        </aside>
      </div>
    </>
  );
}
