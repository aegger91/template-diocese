import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MinistryIcon, PageHeader } from "@/components/site/page-parts";
import { ministries } from "@/lib/content";
import { getDictionary, loc } from "@/lib/i18n";
import { localHref } from "@/lib/links";
import { clergyNameById } from "@/lib/view";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).ministries.title };
}

export default async function MinistriesPage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  return (
    <>
      <PageHeader lang={lang} title={t.ministries.title} intro={t.ministries.intro} crumbs={[{ label: t.ministries.title, href: "/ministries/" }]} />
      <div className="container-site py-10 sm:py-14">
        <ul className="grid gap-5 md:grid-cols-2">
          {ministries.map((m) => (
            <li key={m.id}>
              <Link
                href={localHref(lang, `/ministries/${m.id}/`)}
                className="group flex h-full gap-5 rounded-lg border border-line bg-white p-6 transition hover:border-gold-500 hover:shadow-[0_12px_32px_-20px_rgba(14,27,66,0.5)]"
              >
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-royal-800 text-gold-300 ring-4 ring-royal-100">
                  <MinistryIcon icon={m.icon} className="size-6" />
                </span>
                <span className="min-w-0">
                  <span className="block font-heading text-2xl text-royal-900 group-hover:underline underline-offset-4">{loc(m.name, lang)}</span>
                  <span className="mt-1 block text-muted-ink">{loc(m.summary, lang)}</span>
                  <span className="mt-3 block text-sm text-ink">
                    {t.ministries.contactPerson}: {clergyNameById(m.contactClergyId, lang)}
                  </span>
                  <ArrowRight className="mt-3 size-4 text-gold-700 rtl:rotate-180" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
