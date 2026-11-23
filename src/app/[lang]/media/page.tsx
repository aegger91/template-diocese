import type { Metadata } from "next";
import { Gallery } from "@/components/media/gallery";
import { PageHeader } from "@/components/site/page-parts";
import { media } from "@/lib/content";
import { getDictionary, loc } from "@/lib/i18n";
import { asset } from "@/lib/links";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).media.title };
}

export default async function MediaPage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  return (
    <>
      <PageHeader lang={lang} title={t.media.title} intro={t.media.intro} crumbs={[{ label: t.media.title, href: "/media/" }]} />
      <div className="container-site py-10 sm:py-14">
        <Gallery
          albums={media.albums.map((a) => ({ id: a.id, name: loc(a.name, lang) }))}
          items={media.items.map((m) => ({
            id: m.id,
            album: m.album,
            src: asset(m.src),
            alt: loc(m.alt, lang),
            caption: loc(m.caption, lang),
            credit: m.credit,
          }))}
          labels={{ all: t.common.all, previous: t.media.previous, next: t.media.next, credit: t.media.credit, album: t.media.album, close: t.media.close }}
        />
      </div>
    </>
  );
}
