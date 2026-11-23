import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { IcXcNika } from "@/components/orthodox/cross";
import { PageHeader } from "@/components/site/page-parts";
import { UpcomingEventList } from "@/components/site/upcoming";
import { Button } from "@/components/ui/button";
import { events, siteConfig } from "@/lib/content";
import { nowLocal } from "@/lib/dates";
import { getDictionary } from "@/lib/i18n";
import { eventView } from "@/lib/view";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).live.title };
}

export default async function LivePage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const { embedUrl, channelUrl } = siteConfig.livestream;
  const broadcasts = events.filter((e) => e.livestream).map((e) => eventView(e, lang));

  return (
    <>
      <PageHeader lang={lang} title={t.live.title} intro={t.live.intro} crumbs={[{ label: t.live.title, href: "/live/" }]} />
      <div className="container-site space-y-12 py-10 sm:py-14">
        <div className="frame-official overflow-hidden bg-royal-950 p-2">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={t.live.title}
              className="aspect-video w-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="on-dark grid aspect-video w-full place-items-center bg-royal-900 p-6 text-center text-white sm:aspect-[16/7]">
              <div className="max-w-md">
                <IcXcNika className="mx-auto size-16 text-gold-400 sm:size-20" />
                <p className="mt-4 font-heading text-2xl text-gold-300 sm:text-3xl">{t.live.offline}</p>
                <p className="mt-2 text-sm text-royal-100 sm:text-base">{t.live.offlineText}</p>
                {channelUrl ? (
                  <Button asChild variant="outline" className="mt-5 h-10 border-gold-400/60 bg-transparent text-gold-300 hover:bg-white/10 hover:text-white">
                    <a href={channelUrl} rel="noopener">
                      {t.live.channel}
                      <ExternalLink className="size-4" aria-hidden />
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </div>
        <section aria-labelledby="broadcasts">
          <h2 id="broadcasts" className="mb-5 text-3xl text-royal-900">{t.live.upcoming}</h2>
          <UpcomingEventList
            events={broadcasts}
            buildTime={nowLocal().toISOString()}
            limit={6}
            labels={{ empty: t.home.noUpcoming, register: t.events.register, livestream: t.events.livestreamed }}
          />
        </section>
      </div>
    </>
  );
}
