import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/site/page-parts";
import { Button } from "@/components/ui/button";
import { careers, parishById } from "@/lib/content";
import { formatDate } from "@/lib/dates";
import { getDictionary, loc } from "@/lib/i18n";
import { localHref } from "@/lib/links";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).careers.title };
}

export default async function CareersPage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const openings = careers.openings.slice().sort((a, b) => b.posted.localeCompare(a.posted));

  return (
    <>
      <PageHeader lang={lang} title={t.careers.title} intro={loc(careers.intro, lang)} crumbs={[{ label: t.careers.title, href: "/careers/" }]} />
      <div className="container-site py-10 sm:py-14">
        {openings.length === 0 ? (
          <EmptyState>{t.careers.none}</EmptyState>
        ) : (
          <ul className="grid gap-5 lg:grid-cols-2">
            {openings.map((o) => {
              const p = parishById(o.parishId);
              return (
                <li key={o.id} id={o.id} className="flex flex-col rounded-lg border border-line bg-white p-6">
                  <p className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="rounded-sm bg-royal-800 px-2 py-0.5 font-bold uppercase tracking-wider text-gold-300">{t.careers.kinds[o.kind]}</span>
                    <span className="text-muted-ink">
                      {t.common.posted} <time dateTime={o.posted}>{formatDate(o.posted, lang, "medium")}</time>
                    </span>
                  </p>
                  <h2 className="mt-3 text-2xl leading-snug text-royal-900">{loc(o.title, lang)}</h2>
                  {p ? (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-ink">
                      <MapPin className="size-4 text-gold-700" aria-hidden />
                      <Link href={localHref(lang, `/parishes/${p.id}/`)} className="hover:underline">
                        {loc(p.name, lang)}, {p.address.city}
                      </Link>
                    </p>
                  ) : null}
                  <p className="mt-3 flex-1 text-ink">{loc(o.summary, lang)}</p>
                  <Button asChild variant="outline" className="mt-5 h-10 w-fit rounded-md border-royal-200 text-royal-800">
                    <a href={`mailto:${o.contactEmail}?subject=${encodeURIComponent(loc(o.title, lang))}`}>
                      <Mail className="size-4" aria-hidden />
                      {t.careers.apply}
                    </a>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
