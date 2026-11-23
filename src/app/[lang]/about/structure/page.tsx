import type { Metadata } from "next";
import Link from "next/link";
import { HierarchPlaceholder } from "@/components/orthodox/emblems";
import { MinistryIcon, PageHeader } from "@/components/site/page-parts";
import { diocese, ministries, parishes } from "@/lib/content";
import { getDictionary, loc } from "@/lib/i18n";
import { localHref } from "@/lib/links";
import { clergyNameById } from "@/lib/view";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).about.structureTitle };
}

export default async function StructurePage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const { structure, bishop } = diocese;

  return (
    <>
      <PageHeader
        lang={lang}
        title={t.about.structureTitle}
        intro={loc(structure.intro, lang)}
        crumbs={[
          { label: t.about.title, href: "/about/" },
          { label: t.about.structureTitle, href: "/about/structure/" },
        ]}
      />
      <div className="container-site space-y-14 py-10 sm:py-14">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <HierarchPlaceholder label="" className="size-20 rounded-full ring-2 ring-gold-500 ring-offset-4" />
          <p className="mt-4 font-heading text-2xl text-royal-900">{loc(bishop.styledName, lang)}</p>
          <p className="text-sm text-muted-ink">{t.roles.rulingBishop}</p>
          <span className="mt-6 h-10 w-px bg-gold-500/60" aria-hidden />
        </div>

        <section aria-labelledby="admin">
          <h2 id="admin" className="mb-5 text-3xl text-royal-900">{t.about.administration}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {structure.offices.map((o, i) => (
              <li key={i} className="rounded-lg border-t-4 border-gold-500 bg-white p-5 shadow-[0_8px_24px_-18px_rgba(14,27,66,0.5)] ring-1 ring-line">
                <p className="font-heading text-xl text-royal-900">{loc(o.title, lang)}</p>
                {o.clergyId ? <p className="mt-1 font-semibold text-ink">{clergyNameById(o.clergyId, lang)}</p> : null}
                {o.text ? <p className="mt-1 text-sm text-muted-ink">{loc(o.text, lang)}</p> : null}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="deaneries">
          <h2 id="deaneries" className="mb-5 text-3xl text-royal-900">{t.about.deaneries}</h2>
          <ul className="grid gap-5 lg:grid-cols-3">
            {structure.deaneries.map((d) => {
              const members = parishes.filter((p) => p.deanery === d.id);
              return (
                <li key={d.id} className="frame-official rounded-sm bg-white p-6">
                  <h3 className="font-heading text-2xl text-royal-900">{loc(d.name, lang)}</h3>
                  <p className="mt-1 text-sm text-muted-ink">
                    {t.about.dean}: <span className="font-semibold text-ink">{clergyNameById(d.deanId, lang)}</span>
                  </p>
                  <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-[0.95rem]">
                    {members.map((p) => (
                      <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <Link href={localHref(lang, `/parishes/${p.id}/`)} className="text-royal-800 hover:underline">
                          {loc(p.name, lang)}
                        </Link>
                        <span className="text-xs text-muted-ink">{p.address.city}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="departments">
          <h2 id="departments" className="mb-5 text-3xl text-royal-900">{t.about.departments}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ministries.map((m) => (
              <li key={m.id}>
                <Link href={localHref(lang, `/ministries/${m.id}/`)} className="flex h-full items-start gap-3 rounded-lg border border-line bg-parchment p-4 hover:border-gold-500">
                  <MinistryIcon icon={m.icon} className="mt-0.5 size-5 shrink-0 text-gold-700" />
                  <span>
                    <span className="block font-semibold text-royal-900">{loc(m.name, lang)}</span>
                    <span className="text-sm text-muted-ink">{clergyNameById(m.contactClergyId, lang)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
