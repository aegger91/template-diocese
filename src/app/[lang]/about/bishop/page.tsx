import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Mail } from "lucide-react";
import { HierarchPlaceholder } from "@/components/orthodox/emblems";
import { Ornament, OrthodoxCross } from "@/components/orthodox/cross";
import { PageHeader, Prose } from "@/components/site/page-parts";
import { Button } from "@/components/ui/button";
import { diocese } from "@/lib/content";
import { getDictionary, loc, locParagraphs } from "@/lib/i18n";
import { localHref } from "@/lib/links";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).about.bishopTitle };
}

export default async function BishopPage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const { bishop } = diocese;

  return (
    <>
      <PageHeader
        lang={lang}
        eyebrow={t.about.bishopTitle}
        title={loc(bishop.styledName, lang)}
        crumbs={[
          { label: t.about.title, href: "/about/" },
          { label: t.about.bishopTitle, href: "/about/bishop/" },
        ]}
      />
      <div className="container-site grid gap-12 py-10 sm:py-14 lg:grid-cols-[20rem_1fr]">
        <aside className="space-y-6">
          <figure className="frame-official mx-auto max-w-xs bg-white p-3">
            <HierarchPlaceholder label={t.clergy.portraitPlaceholder} className="aspect-square w-full" />
            <figcaption className="mt-2 text-center text-xs text-muted-ink">{t.clergy.portraitPlaceholder}</figcaption>
          </figure>
          <div className="grid gap-2">
            <Button asChild className="h-11 rounded-md bg-royal-700 hover:bg-royal-800">
              <Link href={localHref(lang, "/news/schedule/")}>
                <CalendarDays className="size-4" aria-hidden />
                {t.about.seeSchedule}
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto min-h-11 whitespace-normal rounded-md border-royal-200 py-2 text-royal-800">
              <Link href={localHref(lang, "/contact/")}>
                <Mail className="size-4" aria-hidden />
                {t.about.writeToBishop}
              </Link>
            </Button>
          </div>
          <section aria-labelledby="milestones" className="rounded-lg bg-royal-50 p-5">
            <h2 id="milestones" className="mb-3 font-heading text-2xl text-royal-900">{t.about.milestones}</h2>
            <ol className="space-y-3 border-s-2 border-gold-500/60 ps-4">
              {bishop.milestones.map((m) => (
                <li key={m.year}>
                  <span className="block font-heading text-lg text-royal-800">{m.year}</span>
                  <span className="text-sm text-muted-ink">{loc(m.text, lang)}</span>
                </li>
              ))}
            </ol>
          </section>
        </aside>

        <div className="min-w-0 space-y-12">
          <section aria-labelledby="welcome" className="frame-official bg-parchment p-6 sm:p-10">
            <h2 id="welcome" className="mb-5 text-3xl text-royal-900">{loc(bishop.welcomeTitle, lang)}</h2>
            <Prose paragraphs={locParagraphs(bishop.welcomeFull, lang)} className="font-heading [&_p]:text-xl [&_p]:leading-relaxed" />
            <p className="mt-2 flex items-center gap-2 font-heading text-xl text-royal-900">
              <OrthodoxCross className="h-6 w-auto text-gold-700" />
              {loc(bishop.signature, lang)}
            </p>
          </section>
          <Ornament className="mx-auto max-w-sm" />
          <section aria-labelledby="bio">
            <h2 id="bio" className="mb-5 text-3xl text-royal-900">{t.about.biography}</h2>
            <Prose paragraphs={locParagraphs(bishop.biography, lang)} className="max-w-3xl" />
          </section>
        </div>
      </div>
    </>
  );
}
