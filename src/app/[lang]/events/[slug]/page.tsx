import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Radio, Star } from "lucide-react";
import { AddToCalendar } from "@/components/events/add-to-calendar";
import { RegistrationPanel } from "@/components/events/registration-panel";
import { PageHeader, Prose } from "@/components/site/page-parts";
import { events, languageCodes, parishById, siteConfig } from "@/lib/content";
import { formatDate, formatRange, nowLocal } from "@/lib/dates";
import { getDictionary, loc, locParagraphs } from "@/lib/i18n";
import { eventRegistrationUrl } from "@/lib/integrations/orthodoxconnect";
import { asset, localHref } from "@/lib/links";
import { eventPlace } from "@/lib/view";

type Props = { params: Promise<{ lang: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return languageCodes.flatMap((lang) => events.map((e) => ({ lang, slug: e.id })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const e = events.find((x) => x.id === slug);
  return { title: e ? loc(e.title, lang) : undefined, description: e ? loc(e.summary, lang) : undefined };
}

export default async function EventPage({ params }: Props) {
  const { lang, slug } = await params;
  const ev = events.find((x) => x.id === slug);
  if (!ev) notFound();
  const t = getDictionary(lang);
  const parish = parishById(ev.location.parishId);
  const place = eventPlace(ev, lang);
  const description = ev.description ? locParagraphs(ev.description, lang) : [loc(ev.summary, lang)];

  return (
    <>
      <PageHeader
        lang={lang}
        eyebrow={t.events.categories[ev.category]}
        title={loc(ev.title, lang)}
        intro={loc(ev.summary, lang)}
        crumbs={[{ label: t.events.title, href: "/events/" }]}
      >
        {ev.major ? (
          <p className="mt-5 inline-flex items-center gap-1.5 rounded-sm bg-gold-500 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-royal-950">
            <Star className="size-3.5" aria-hidden />
            {t.events.major}
          </p>
        ) : null}
      </PageHeader>
      <div className="container-site grid gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          {ev.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset(ev.image)} alt="" className="mb-8 aspect-[16/7] w-full rounded-md object-cover" />
          ) : null}
          <Prose paragraphs={description} className="max-w-3xl" />
          {ev.livestream && siteConfig.features.livestream ? (
            <p className="mt-8 flex max-w-3xl items-start gap-3 rounded-md border border-royal-200 bg-royal-50 p-4 text-royal-900">
              <Radio className="mt-0.5 size-5 shrink-0 text-royal-700" aria-hidden />
              <span>
                {t.events.livestreamNote}{" "}
                <Link href={localHref(lang, "/live/")} className="font-semibold underline">
                  {t.live.title}
                </Link>
              </span>
            </p>
          ) : null}
          <p className="mt-10">
            <Link href={localHref(lang, "/events/")} className="inline-flex items-center gap-1.5 font-semibold text-royal-700 hover:underline">
              <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
              {t.events.allEvents}
            </Link>
          </p>
        </div>
        <aside className="frame-official h-fit space-y-6 bg-white p-6">
          <dl className="space-y-4">
            <div>
              <dt className="eyebrow flex items-center gap-1.5">
                <CalendarDays className="size-3.5" aria-hidden />
                {t.events.when}
              </dt>
              <dd className="mt-1 font-semibold text-ink">{formatRange(ev.start, ev.end, lang)}</dd>
            </div>
            <div>
              <dt className="eyebrow flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden />
                {t.events.where}
              </dt>
              <dd className="mt-1 font-semibold text-ink">
                {parish ? (
                  <Link href={localHref(lang, `/parishes/${parish.id}/`)} className="hover:underline">
                    {loc(parish.name, lang)}
                  </Link>
                ) : (
                  place
                )}
              </dd>
              {parish ? (
                <dd className="text-sm text-muted-ink">
                  {parish.address.street}, {parish.address.city}, {parish.address.region}
                </dd>
              ) : null}
            </div>
          </dl>
          <div className="border-t border-line pt-6">
            <RegistrationPanel
              end={ev.end ?? ev.start}
              registrationUrl={ev.registration ? eventRegistrationUrl(ev.registration.connectEventId, lang) : null}
              deadlineLabel={ev.registration?.deadline ? formatDate(ev.registration.deadline, lang) : undefined}
              buildTime={nowLocal().toISOString()}
              labels={{
                register: t.events.register,
                deadline: t.events.registrationDeadline,
                closed: t.events.registrationClosed,
                none: t.events.noRegistration,
                note: t.events.registrationOpensInApp,
              }}
            />
          </div>
          <AddToCalendar
            id={ev.id}
            title={loc(ev.title, lang)}
            summary={loc(ev.summary, lang)}
            place={parish ? `${loc(parish.name, lang)}, ${parish.address.street}, ${parish.address.city}` : place}
            start={ev.start}
            end={ev.end}
            label={t.events.addToCalendar}
          />
        </aside>
      </div>
    </>
  );
}
