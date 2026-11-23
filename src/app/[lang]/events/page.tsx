import type { Metadata } from "next";
import { EventsCalendar } from "@/components/events/events-calendar";
import { PageHeader } from "@/components/site/page-parts";
import { events, siteConfig } from "@/lib/content";
import { nowLocal } from "@/lib/dates";
import { getDictionary } from "@/lib/i18n";
import { eventView } from "@/lib/view";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).events.title };
}

export default async function EventsPage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const used = [...new Set(events.map((e) => e.category))];

  return (
    <>
      <PageHeader lang={lang} title={t.events.title} intro={t.events.intro} crumbs={[{ label: t.events.title, href: "/events/" }]} />
      <div className="container-site py-10 sm:py-14">
        <EventsCalendar
          events={events.map((e) => eventView(e, lang))}
          categories={used.map((c) => ({ value: c, label: t.events.categories[c] }))}
          buildTime={nowLocal().toISOString()}
          lang={lang}
          weekStartsOn={siteConfig.weekStartsOn}
          labels={{
            month: t.events.month,
            week: t.events.week,
            list: t.events.list,
            today: t.events.today,
            previous: t.events.previous,
            next: t.events.next,
            category: t.events.category,
            allCategories: t.events.allCategories,
            empty: t.events.noEventsInView,
            upcoming: t.events.upcoming,
            past: t.events.past,
            more: t.events.moreEvents,
            register: t.events.register,
            livestream: t.events.livestreamed,
            major: t.events.major,
            views: t.events.views,
          }}
        />
      </div>
    </>
  );
}
