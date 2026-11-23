import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { MinistryIcon, PageHeader, Prose } from "@/components/site/page-parts";
import { UpcomingEventList } from "@/components/site/upcoming";
import { events, languageCodes, ministries } from "@/lib/content";
import { nowLocal } from "@/lib/dates";
import { getDictionary, loc, locParagraphs } from "@/lib/i18n";
import { clergyNameById, eventView } from "@/lib/view";

type Props = { params: Promise<{ lang: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return languageCodes.flatMap((lang) => ministries.map((m) => ({ lang, slug: m.id })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const m = ministries.find((x) => x.id === slug);
  return { title: m ? loc(m.name, lang) : undefined };
}

export default async function MinistryPage({ params }: Props) {
  const { lang, slug } = await params;
  const m = ministries.find((x) => x.id === slug);
  if (!m) notFound();
  const t = getDictionary(lang);
  const related = events.filter((e) => m.eventCategories.includes(e.category)).map((e) => eventView(e, lang));

  return (
    <>
      <PageHeader
        lang={lang}
        title={loc(m.name, lang)}
        intro={loc(m.summary, lang)}
        crumbs={[
          { label: t.ministries.title, href: "/ministries/" },
          { label: loc(m.name, lang), href: `/ministries/${m.id}/` },
        ]}
      />
      <div className="container-site grid gap-12 py-10 sm:py-14 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-12">
          <Prose paragraphs={locParagraphs(m.body, lang)} className="max-w-3xl" />
          <section aria-labelledby="related">
            <h2 id="related" className="mb-5 text-3xl text-royal-900">{t.ministries.relatedEvents}</h2>
            <UpcomingEventList
              events={related}
              buildTime={nowLocal().toISOString()}
              limit={4}
              labels={{ empty: t.ministries.noEvents, register: t.events.register, livestream: t.events.livestreamed }}
            />
          </section>
        </div>
        <aside className="frame-official h-fit bg-white p-6">
          <span className="grid size-14 place-items-center rounded-full bg-royal-800 text-gold-300">
            <MinistryIcon icon={m.icon} className="size-6" />
          </span>
          <p className="eyebrow mt-5">{t.ministries.contactPerson}</p>
          <p className="mt-1 font-heading text-xl text-royal-900">{clergyNameById(m.contactClergyId, lang)}</p>
          {m.email ? (
            <a href={`mailto:${m.email}`} className="mt-3 flex items-center gap-2 break-all text-royal-700 hover:underline">
              <Mail className="size-4 shrink-0" aria-hidden />
              {m.email}
            </a>
          ) : null}
        </aside>
      </div>
    </>
  );
}
