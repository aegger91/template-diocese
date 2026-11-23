import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HierarchPlaceholder, KiotFrame } from "@/components/orthodox/emblems";
import { IcXcNika, OrthodoxCross } from "@/components/orthodox/cross";
import { PageHeader } from "@/components/site/page-parts";
import { clergy, diocese, parishes, siteConfig } from "@/lib/content";
import { getDictionary, loc } from "@/lib/i18n";
import { localHref } from "@/lib/links";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).about.title };
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const nav = siteConfig.navigation.find((n) => n.href === "/about/");
  const icons = [
    <HierarchPlaceholder key="b" label="" className="size-16 rounded-full" />,
    <KiotFrame key="h" className="h-16 w-auto" />,
    <span key="s" className="grid size-16 place-items-center rounded-full bg-royal-800 text-gold-300"><OrthodoxCross className="h-9 w-auto" /></span>,
    <span key="c" className="grid size-16 place-items-center rounded-full bg-royal-800 text-gold-300"><IcXcNika className="size-11" /></span>,
  ];

  return (
    <>
      <PageHeader lang={lang} title={t.about.title} intro={t.about.intro} crumbs={[{ label: t.about.title, href: "/about/" }]} />
      <div className="container-site py-10 sm:py-14">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(nav?.children ?? []).map((c, i) => (
            <li key={c.href}>
              <Link
                href={localHref(lang, c.href)}
                className="group flex h-full items-center gap-5 rounded-lg border border-line bg-white p-5 transition hover:border-gold-500 hover:shadow-[0_12px_32px_-20px_rgba(14,27,66,0.5)]"
              >
                <span className="shrink-0">{icons[i] ?? icons[3]}</span>
                <span className="min-w-0">
                  <span className="block font-heading text-2xl leading-snug text-royal-900 group-hover:underline underline-offset-4">{loc(c.label, lang)}</span>
                  <ArrowRight className="mt-1 size-4 text-gold-700 rtl:rotate-180" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-14 grid gap-8 rounded-lg bg-royal-50 p-6 sm:p-10 lg:grid-cols-[1fr_1.4fr]" aria-labelledby="glance">
          <div>
            <h2 id="glance" className="text-3xl text-royal-900">{t.about.atAGlance}</h2>
            <p className="mt-3 text-muted-ink">{loc(diocese.structure.intro, lang)}</p>
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { n: parishes.length, label: t.parishes.title },
              { n: diocese.structure.deaneries.length, label: t.about.deaneries },
              { n: clergy.filter((c) => c.status === "active").length, label: t.home.statClergy },
              { n: new Set(parishes.flatMap((p) => p.languages)).size, label: t.parishes.languagesOfWorship },
            ].map((s) => (
              <div key={s.label} className="rounded-md bg-white p-4 text-center">
                <dd className="font-heading text-4xl text-royal-800">{s.n}</dd>
                <dt className="mt-1 text-sm text-muted-ink">{s.label}</dt>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}
