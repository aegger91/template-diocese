import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { IcXcNika } from "@/components/orthodox/cross";
import { PageHeader, Prose } from "@/components/site/page-parts";
import { Button } from "@/components/ui/button";
import { diocese, media } from "@/lib/content";
import { getDictionary, loc, locParagraphs } from "@/lib/i18n";
import { asset } from "@/lib/links";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).about.churchTitle };
}

export default async function ChurchPage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const { parentChurch } = diocese;
  const trinity = media.items.find((m) => m.id === "trinity");

  return (
    <>
      <PageHeader
        lang={lang}
        eyebrow={t.about.churchTitle}
        title={loc(parentChurch.name, lang)}
        crumbs={[
          { label: t.about.title, href: "/about/" },
          { label: t.about.churchTitle, href: "/about/church/" },
        ]}
      />
      <div className="container-site grid gap-12 py-10 sm:py-14 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          <Prose paragraphs={locParagraphs(parentChurch.text, lang)} className="max-w-3xl" />
          <figure className="mt-10 max-w-3xl overflow-hidden rounded-md border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/images/pd/rublev-trinity.jpg")} alt="" loading="lazy" className="max-h-[32rem] w-full bg-royal-950 object-contain" />
            <figcaption className="bg-parchment px-4 py-2 text-xs text-muted-ink">
              {loc(trinity?.caption, lang)}. {trinity?.credit}
            </figcaption>
          </figure>
        </div>
        <aside className="space-y-5">
          <div className="frame-official flex flex-col items-center bg-white p-6 text-center">
            <IcXcNika className="size-24 text-royal-800" />
            <p className="eyebrow mt-4">{t.about.synod}</p>
            <p className="mt-1 font-heading text-2xl text-royal-900">{loc(parentChurch.synodName, lang)}</p>
            {parentChurch.website ? (
              <Button asChild variant="outline" className="mt-5 h-10 rounded-md border-royal-200 text-royal-800">
                <a href={parentChurch.website} rel="noopener">
                  {t.about.visitWebsite}
                  <ExternalLink className="size-4" aria-hidden />
                </a>
              </Button>
            ) : null}
          </div>
        </aside>
      </div>
    </>
  );
}
