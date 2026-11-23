import Link from "next/link";
import { ArrowRight, HeartHandshake, MapPin, Radio, Search } from "lucide-react";
import { IcXcNika, Ornament, OrthodoxCross } from "@/components/orthodox/cross";
import { HierarchPlaceholder } from "@/components/orthodox/emblems";
import { DateTile, MinistryIcon, SectionHeading } from "@/components/site/page-parts";
import { NextMajorEvent, UpcomingEventList, UpcomingSchedule } from "@/components/site/upcoming";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clergy,
  diocese,
  events,
  fundsData,
  media,
  ministries,
  news,
  parishes,
  siteConfig,
} from "@/lib/content";
import { monthParts, nowLocal } from "@/lib/dates";
import { getDictionary, loc } from "@/lib/i18n";
import { asset, localHref } from "@/lib/links";
import { eventView, scheduleViews } from "@/lib/view";
import type { HomeSectionId } from "@/lib/types";

type Props = { params: Promise<{ lang: string }> };

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  const buildTime = nowLocal().toISOString();
  const sections: Record<HomeSectionId, React.ReactNode> = {
    hero: <Hero lang={lang} buildTime={buildTime} />,
    welcome: <WelcomeBlock lang={lang} />,
    announcements: <Announcements lang={lang} />,
    events: <EventsSection lang={lang} buildTime={buildTime} />,
    bishopSchedule: <ScheduleSection lang={lang} buildTime={buildTime} />,
    parishFinder: <ParishFinder lang={lang} />,
    ministries: <MinistriesSection lang={lang} />,
    livestream: siteConfig.features.livestream ? <LivestreamBand lang={lang} /> : null,
    donateAppeal: siteConfig.features.donate ? <DonateAppeal lang={lang} /> : null,
    gallery: siteConfig.features.mediaGallery ? <GalleryStrip lang={lang} /> : null,
  };

  return (
    <>
      {siteConfig.homeSections
        .filter((s) => s.enabled)
        .map((s) => (
          <div key={s.id} data-section={s.id}>
            {sections[s.id]}
          </div>
        ))}
    </>
  );
}

function WelcomeBlock({ lang }: { lang: string }) {
  const t = getDictionary(lang);
  const { welcomeBlock } = diocese;
  return (
    <section aria-labelledby="welcome-title" className="border-b border-line bg-parchment">
      <div className="container-site flex flex-col items-center py-12 text-center sm:py-16">
        <h2 id="welcome-title" className="text-3xl text-royal-900 sm:text-4xl">
          {loc(welcomeBlock.title, lang)}
        </h2>
        <Ornament className="mt-4 w-full max-w-56" />
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink">{loc(welcomeBlock.text, lang)}</p>
        <Link
          href={localHref(lang, "/about/")}
          className="mt-5 inline-flex items-center gap-1.5 font-semibold text-royal-700 underline-offset-4 hover:underline"
        >
          {t.home.welcomeMore}
          <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

function Hero({ lang, buildTime }: { lang: string; buildTime: string }) {
  const t = getDictionary(lang);
  const { bishop } = diocese;
  return (
    <section className="on-dark relative bg-royal-950 text-white" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/images/pd/stolobny-monastery.jpg")}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-35"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-linear-to-b from-royal-950/80 via-royal-950/85 to-royal-950" />
      </div>
      <div className="container-site relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:gap-14 lg:py-20">
        <div className="min-w-0">
          <p className="eyebrow mb-4">{t.home.heroEyebrow}</p>
          <h1 id="hero-title" className="display-text text-4xl leading-snug sm:text-5xl lg:text-6xl">
            {loc(siteConfig.siteName, lang)}
          </h1>
          <Ornament className="my-7 max-w-xs !justify-start [&>span:first-child]:hidden" />
          <figure className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <HierarchPlaceholder
              label={`${loc(bishop.styledName, lang)}. ${t.clergy.portraitPlaceholder}`}
              className="size-24 shrink-0 rounded-full ring-2 ring-gold-500 ring-offset-4 ring-offset-royal-950 sm:size-28"
            />
            <div className="min-w-0">
              <h2 className="font-heading text-2xl text-gold-300">{loc(bishop.welcomeTitle, lang)}</h2>
              <blockquote className="mt-3 font-heading text-xl leading-relaxed text-royal-50 italic sm:text-[1.35rem]">
                {loc(bishop.welcomeShort, lang)}
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-2 text-royal-100">
                <OrthodoxCross className="h-5 w-auto text-gold-400" title="" />
                <span className="font-heading text-lg">{loc(bishop.signature, lang)}</span>
              </figcaption>
              <Link
                href={localHref(lang, "/about/bishop/")}
                className="mt-5 inline-flex items-center gap-2 font-semibold text-gold-300 underline-offset-4 hover:underline"
              >
                {t.home.readWelcome}
                <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
              </Link>
            </div>
          </figure>
        </div>

        <div className="flex min-w-0 flex-col gap-5 lg:pt-10">
          <div className="rounded-lg bg-white p-5 text-ink shadow-2xl sm:p-6">
            <h2 className="flex items-center gap-2 font-heading text-2xl text-royal-900">
              <MapPin className="size-5 text-gold-700" aria-hidden />
              {t.home.findParish}
            </h2>
            <form action={asset(localHref(lang, "/parishes/"))} method="get" role="search" className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label htmlFor="hero-parish-search" className="sr-only">
                {t.home.findParishHint}
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" aria-hidden />
                <Input id="hero-parish-search" name="q" placeholder={t.home.findParishHint} className="h-12 ps-9 text-base" />
              </div>
              <Button type="submit" className="h-12 rounded-md bg-royal-700 px-6 text-base font-semibold hover:bg-royal-800">
                {t.home.findParishButton}
              </Button>
            </form>
            <ul className="mt-4 flex flex-wrap gap-2 text-sm">
              {(["parish", "mission", "monastery", "chapel"] as const).map((type) => (
                <li key={type}>
                  <Link
                    href={`${localHref(lang, "/parishes/")}?type=${type}`}
                    className="inline-flex min-h-8 items-center rounded-full border border-royal-200 px-3 text-royal-800 hover:border-royal-700 hover:bg-royal-50"
                  >
                    {t.types[type]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border-t-4 border-gold-500 bg-white p-5 text-ink shadow-2xl sm:p-6">
            <p className="eyebrow mb-4">{t.home.nextEvent}</p>
            <NextMajorEvent
              events={events.map((e) => eventView(e, lang))}
              buildTime={buildTime}
              labels={{ empty: t.home.noUpcoming, major: t.events.major, readMore: t.common.readMore }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Announcements({ lang }: { lang: string }) {
  const t = getDictionary(lang);
  const latest = news.slice(0, 3);
  return (
    <section className="bg-parchment py-14 sm:py-20" aria-label={t.home.announcements}>
      <div className="container-site">
        <SectionHeading title={t.home.announcements} action={{ label: t.common.viewAll, href: localHref(lang, "/news/") }} />
        <ul className="grid gap-5 md:grid-cols-3">
          {latest.map((n, i) => {
            const parts = monthParts(n.date, lang);
            const official = n.category !== "announcement";
            return (
              <li key={n.id} className={i === 0 ? "md:col-span-3 lg:col-span-1" : undefined}>
                <Link
                  href={localHref(lang, `/news/${n.id}/`)}
                  className="group flex h-full flex-col rounded-lg border border-line bg-white p-6 transition-shadow hover:shadow-[0_14px_36px_-20px_rgba(14,27,66,0.5)] outline-none focus-visible:ring-3 focus-visible:ring-gold-500/50"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span
                      className={
                        official
                          ? "rounded-sm bg-royal-800 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-gold-300"
                          : "rounded-sm bg-royal-50 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-royal-700"
                      }
                    >
                      {t.news.categories[n.category]}
                    </span>
                    <time dateTime={n.date} className="text-sm text-muted-ink">
                      {parts.day} {parts.month}
                    </time>
                  </div>
                  <h3 className="font-heading text-2xl leading-snug text-royal-900 group-hover:underline underline-offset-4">{loc(n.title, lang)}</h3>
                  <p className="mt-2 text-muted-ink">{loc(n.summary, lang)}</p>
                  {n.pdf ? <p className="mt-auto pt-4 text-sm font-semibold text-royal-700">PDF</p> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function EventsSection({ lang, buildTime }: { lang: string; buildTime: string }) {
  const t = getDictionary(lang);
  return (
    <section className="py-14 sm:py-20" aria-label={t.home.events}>
      <div className="container-site">
        <SectionHeading title={t.home.events} action={{ label: t.events.title, href: localHref(lang, "/events/") }} />
        <UpcomingEventList
          events={events.map((e) => eventView(e, lang))}
          buildTime={buildTime}
          limit={4}
          labels={{ empty: t.home.noUpcoming, register: t.events.register, livestream: t.events.livestreamed }}
        />
      </div>
    </section>
  );
}

function ScheduleSection({ lang, buildTime }: { lang: string; buildTime: string }) {
  const t = getDictionary(lang);
  return (
    <section className="bg-royal-50 py-14 sm:py-20" aria-label={t.home.bishopSchedule}>
      <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <div>
          <SectionHeading title={t.home.bishopSchedule} className="mb-4" />
          <p className="text-muted-ink">{t.news.scheduleIntro}</p>
          <Link
            href={localHref(lang, "/news/schedule/")}
            className="mt-6 inline-flex items-center gap-2 font-semibold text-royal-700 underline-offset-4 hover:underline"
          >
            {t.about.seeSchedule}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 sm:p-7">
          <UpcomingSchedule entries={scheduleViews(lang)} buildTime={buildTime} limit={4} empty={t.news.noSchedule} />
        </div>
      </div>
    </section>
  );
}

function ParishFinder({ lang }: { lang: string }) {
  const t = getDictionary(lang);
  const count = (type: string) => parishes.filter((p) => p.type === type).length;
  const stats = [
    { n: count("parish"), label: t.home.statParishes },
    { n: count("mission"), label: t.home.statMissions },
    { n: count("monastery"), label: t.home.statMonasteries },
    { n: count("chapel"), label: t.home.statChapels },
    { n: clergy.filter((c) => c.status === "active").length, label: t.home.statClergy },
  ];
  const regions = [...new Set(parishes.map((p) => p.address.region))].sort();
  return (
    <section className="py-14 sm:py-20" aria-label={t.home.parishFinderTitle}>
      <div className="container-site">
        <div className="frame-official grid gap-8 rounded-sm bg-white p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="text-3xl text-royal-900 sm:text-4xl">{t.home.parishFinderTitle}</h2>
            <p className="mt-3 max-w-xl text-muted-ink">{t.home.parishFinderText}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {regions.map((r) => (
                <li key={r}>
                  <Link
                    href={`${localHref(lang, "/parishes/")}?region=${r}`}
                    className="inline-flex min-h-9 items-center rounded-md border border-royal-200 px-3 text-sm font-semibold text-royal-800 hover:border-royal-700 hover:bg-royal-50"
                  >
                    {r}
                  </Link>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6 h-11 rounded-md bg-royal-700 px-5 text-base hover:bg-royal-800">
              <Link href={localHref(lang, "/parishes/")}>
                {t.home.openDirectory}
                <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
              </Link>
            </Button>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-parchment px-4 py-5 text-center">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-heading text-4xl text-royal-800">{s.n}</span>
                  <span className="text-sm text-muted-ink">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function MinistriesSection({ lang }: { lang: string }) {
  const t = getDictionary(lang);
  return (
    <section className="bg-parchment py-14 sm:py-20" aria-label={t.home.ministries}>
      <div className="container-site">
        <SectionHeading title={t.home.ministries} center />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ministries.map((m) => (
            <li key={m.id}>
              <Link
                href={localHref(lang, `/ministries/${m.id}/`)}
                className="group flex h-full flex-col items-center rounded-lg border border-line bg-white p-6 text-center transition hover:border-gold-500 outline-none focus-visible:ring-3 focus-visible:ring-gold-500/50"
              >
                <span className="mb-4 grid size-14 place-items-center rounded-full bg-royal-800 text-gold-300 ring-4 ring-royal-100">
                  <MinistryIcon icon={m.icon} className="size-6" />
                </span>
                <h3 className="font-heading text-xl leading-snug text-royal-900">{loc(m.name, lang)}</h3>
                <p className="mt-2 text-sm text-muted-ink">{loc(m.summary, lang)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function LivestreamBand({ lang }: { lang: string }) {
  const t = getDictionary(lang);
  const next = events.find((e) => e.livestream);
  return (
    <section className="on-dark bg-royal-900 py-14 text-white sm:py-16" aria-label={t.home.livestream}>
      <div className="container-site flex flex-col gap-8 md:flex-row md:items-center">
        <IcXcNika className="size-24 shrink-0 text-gold-400 sm:size-28" />
        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-2 flex items-center gap-2">
            <Radio className="size-4" aria-hidden />
            {t.live.title}
          </p>
          <h2 className="text-3xl sm:text-4xl">{t.home.livestream}</h2>
          <p className="mt-3 max-w-2xl text-royal-100">{t.home.livestreamText}</p>
          {next ? (
            <div className="mt-5 flex items-center gap-3">
              <DateTile {...monthParts(next.start, lang)} className="border-gold-500 bg-royal-950 shadow-none [&>span:first-child]:text-white [&>span:last-child]:text-gold-300" />
              <p className="font-heading text-xl">{loc(next.title, lang)}</p>
            </div>
          ) : null}
        </div>
        <Button asChild className="h-12 shrink-0 self-start rounded-md bg-gold-500 px-6 text-base font-semibold text-royal-950 hover:bg-gold-400 md:self-center">
          <Link href={localHref(lang, "/live/")}>{t.home.watch}</Link>
        </Button>
      </div>
    </section>
  );
}

function DonateAppeal({ lang }: { lang: string }) {
  const t = getDictionary(lang);
  return (
    <section className="py-14 sm:py-20" aria-label={loc(fundsData.appeal.title, lang)}>
      <div className="container-site">
        <div className="grid gap-8 overflow-hidden rounded-lg border border-gold-500/40 bg-linear-to-br from-parchment to-white p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow mb-2">{t.common.donate}</p>
            <h2 className="text-3xl text-royal-900 sm:text-4xl">{loc(fundsData.appeal.title, lang)}</h2>
            <p className="mt-3 max-w-2xl text-lg text-muted-ink">{loc(fundsData.appeal.text, lang)}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {fundsData.funds.map((f) => (
                <li key={f.id} className="rounded-full bg-royal-50 px-3 py-1 text-sm text-royal-800">
                  {loc(f.name, lang)}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <Button asChild className="h-12 rounded-md bg-gold-500 px-7 text-base font-semibold text-royal-950 hover:bg-gold-400">
              <Link href={localHref(lang, "/donate/")}>
                <HeartHandshake className="size-5" aria-hidden />
                {t.common.donate}
              </Link>
            </Button>
            <p className="text-sm text-muted-ink">
              {t.donate.oneTime} · {t.donate.monthly}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function GalleryStrip({ lang }: { lang: string }) {
  const t = getDictionary(lang);
  const items = media.items.slice(0, 4);
  return (
    <section className="pb-16 sm:pb-20" aria-label={t.home.gallery}>
      <div className="container-site">
        <SectionHeading title={t.home.gallery} action={{ label: t.media.title, href: localHref(lang, "/media/") }} />
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((m) => (
            <li key={m.id}>
              <Link href={localHref(lang, `/media/#${m.id}`)} className="group block overflow-hidden rounded-md bg-royal-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(m.src)}
                  alt={loc(m.alt, lang)}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
