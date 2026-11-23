import type { Metadata } from "next";
import { OrthodoxCross } from "@/components/orthodox/cross";
import { PageHeader } from "@/components/site/page-parts";
import { creditFor, diocese } from "@/lib/content";
import { getDictionary, loc } from "@/lib/i18n";
import { asset } from "@/lib/links";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).about.historyTitle };
}

export default async function HistoryPage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const { history } = diocese;

  return (
    <>
      <PageHeader
        lang={lang}
        title={t.about.historyTitle}
        intro={loc(history.intro, lang)}
        crumbs={[
          { label: t.about.title, href: "/about/" },
          { label: t.about.historyTitle, href: "/about/history/" },
        ]}
      />
      <div className="container-site py-10 sm:py-14">
        <ol className="relative mx-auto max-w-4xl space-y-12 before:absolute before:inset-y-0 before:start-[1.15rem] before:w-px before:bg-gold-500/50 sm:before:start-[1.4rem]">
          {history.timeline.map((item) => (
            <li key={item.year} className="relative grid gap-4 ps-12 sm:ps-16">
              <span className="absolute start-0 top-0 grid size-10 place-items-center rounded-full border-2 border-gold-500 bg-royal-800 text-gold-300 sm:size-12">
                <OrthodoxCross className="h-5 w-auto sm:h-6" />
              </span>
              <div>
                <p className="font-heading text-4xl text-gold-700">{item.year}</p>
                <h2 className="mt-1 text-2xl text-royal-900 sm:text-3xl">{loc(item.title, lang)}</h2>
                <p className="mt-2 max-w-2xl text-lg leading-relaxed text-ink">{loc(item.text, lang)}</p>
              </div>
              {item.image ? (
                <figure className="overflow-hidden rounded-md border border-line bg-royal-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(item.image)} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
                  <figcaption className="px-3 py-2 text-xs text-muted-ink">{creditFor(item.image)}</figcaption>
                </figure>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
