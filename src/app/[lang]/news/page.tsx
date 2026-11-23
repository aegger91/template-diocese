import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { NewsList } from "@/components/news/news-list";
import { PageHeader } from "@/components/site/page-parts";
import { news } from "@/lib/content";
import { formatDate } from "@/lib/dates";
import { getDictionary, loc } from "@/lib/i18n";
import { asset, localHref } from "@/lib/links";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).news.title };
}

export default async function NewsPage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const items = news.map((n) => ({
    id: n.id,
    href: localHref(lang, `/news/${n.id}/`),
    title: loc(n.title, lang),
    summary: loc(n.summary, lang),
    date: n.date,
    dateLabel: formatDate(n.date, lang, "medium"),
    official: n.category !== "announcement",
    categoryLabel: t.news.categories[n.category],
    pdfHref: n.pdf ? asset(n.pdf) : undefined,
  }));

  return (
    <>
      <PageHeader lang={lang} title={t.news.title} intro={t.news.intro} crumbs={[{ label: t.news.title, href: "/news/" }]}>
        <Link
          href={localHref(lang, "/news/schedule/")}
          className="mt-5 inline-flex items-center gap-2 rounded-md border border-gold-400/60 px-4 py-2 text-sm font-semibold text-gold-300 hover:bg-white/10"
        >
          <CalendarDays className="size-4" aria-hidden />
          {t.news.scheduleTitle}
        </Link>
      </PageHeader>
      <div className="container-site py-10 sm:py-14">
        <NewsList
          items={items}
          labels={{
            all: t.news.filterAll,
            letters: t.news.filterLetters,
            announcements: t.news.filterAnnouncements,
            empty: t.common.noResults,
            pdf: t.common.downloadPdf,
            filter: t.common.search,
          }}
        />
      </div>
    </>
  );
}
