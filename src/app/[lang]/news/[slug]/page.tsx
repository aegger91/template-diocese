import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown } from "lucide-react";
import { EpiscopalSeal } from "@/components/orthodox/emblems";
import { Ornament, OrthodoxCross } from "@/components/orthodox/cross";
import { PageHeader, Prose } from "@/components/site/page-parts";
import { Button } from "@/components/ui/button";
import { diocese, languageCodes, news, siteConfig } from "@/lib/content";
import { formatDate } from "@/lib/dates";
import { getDictionary, loc, locParagraphs } from "@/lib/i18n";
import { asset, localHref } from "@/lib/links";

type Props = { params: Promise<{ lang: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return languageCodes.flatMap((lang) => news.map((n) => ({ lang, slug: n.id })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const n = news.find((x) => x.id === slug);
  return { title: n ? loc(n.title, lang) : undefined, description: n ? loc(n.summary, lang) : undefined };
}

export default async function NewsItemPage({ params }: Props) {
  const { lang, slug } = await params;
  const n = news.find((x) => x.id === slug);
  if (!n) notFound();
  const t = getDictionary(lang);
  const official = n.category !== "announcement";
  const index = news.indexOf(n);
  const newer = news[index - 1];
  const older = news[index + 1];

  const pdfButton = n.pdf ? (
    <Button asChild className="h-11 rounded-md bg-royal-700 px-5 hover:bg-royal-800">
      <a href={asset(n.pdf)} download>
        <FileDown className="size-4" aria-hidden />
        {t.common.downloadPdf}
      </a>
    </Button>
  ) : null;

  return (
    <>
      <PageHeader
        lang={lang}
        eyebrow={t.news.categories[n.category]}
        title={loc(n.title, lang)}
        crumbs={[{ label: t.news.title, href: "/news/" }]}
      >
        <p className="mt-4 text-royal-100">
          <time dateTime={n.date}>{formatDate(n.date, lang)}</time>
        </p>
      </PageHeader>
      <div className="container-site py-10 sm:py-14">
        {official ? (
          <article className="frame-official mx-auto max-w-3xl bg-parchment px-5 py-10 sm:px-12 sm:py-14">
            <header className="flex flex-col items-center text-center">
              <EpiscopalSeal
                text={loc(siteConfig.logo.sealText, lang)}
                year={siteConfig.logo.sealYear}
                idPrefix="doc-seal"
                className="size-24 text-royal-800"
              />
              <p className="eyebrow mt-5">{t.news.officialDocument}</p>
              <p className="mt-1 text-sm text-muted-ink">{loc(siteConfig.siteName, lang)}</p>
              <Ornament className="mt-5 w-full max-w-xs" />
            </header>
            <Prose paragraphs={locParagraphs(n.body, lang)} className="mt-8 font-heading [&_p]:text-[1.2rem] [&_p]:leading-relaxed" />
            <footer className="mt-10 flex flex-col items-end gap-1 text-end">
              <OrthodoxCross className="h-8 w-auto text-gold-700" />
              <p className="font-heading text-xl text-royal-900">{loc(diocese.bishop.signature, lang)}</p>
              <p className="text-sm text-muted-ink">{formatDate(n.date, lang)}</p>
            </footer>
            {pdfButton ? <div className="mt-10 flex justify-center border-t border-line pt-8">{pdfButton}</div> : null}
          </article>
        ) : (
          <article className="mx-auto max-w-3xl">
            <p className="text-xl leading-relaxed text-muted-ink">{loc(n.summary, lang)}</p>
            <Prose paragraphs={locParagraphs(n.body, lang)} className="mt-6" />
            {pdfButton ? <div className="mt-8">{pdfButton}</div> : null}
          </article>
        )}

        <nav aria-label={t.news.title} className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          {older ? (
            <Link href={localHref(lang, `/news/${older.id}/`)} className="rounded-lg border border-line p-4 hover:border-gold-500">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-ink">{formatDate(older.date, lang, "medium")}</span>
              <span className="mt-1 block font-heading text-lg text-royal-900">{loc(older.title, lang)}</span>
            </Link>
          ) : <span />}
          {newer ? (
            <Link href={localHref(lang, `/news/${newer.id}/`)} className="rounded-lg border border-line p-4 text-end hover:border-gold-500">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-ink">{formatDate(newer.date, lang, "medium")}</span>
              <span className="mt-1 block font-heading text-lg text-royal-900">{loc(newer.title, lang)}</span>
            </Link>
          ) : null}
        </nav>
        <p className="mx-auto mt-8 max-w-3xl">
          <Link href={localHref(lang, "/news/")} className="inline-flex items-center gap-1.5 font-semibold text-royal-700 hover:underline">
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
            {t.news.title}
          </Link>
        </p>
      </div>
    </>
  );
}
