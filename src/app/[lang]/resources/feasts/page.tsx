import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-parts";
import { FeastCalendar } from "@/components/resources/feast-calendar";
import { siteConfig } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).resources.feastsTitle };
}

export default async function FeastsPage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const r = t.resources;
  return (
    <>
      <PageHeader
        lang={lang}
        title={r.feastsTitle}
        intro={r.feastsIntro}
        crumbs={[
          { label: r.title, href: "/resources/" },
          { label: r.feastsTitle, href: "/resources/feasts/" },
        ]}
      />
      <div className="container-site py-10 sm:py-14">
        <FeastCalendar
          initialYear={new Date().getFullYear()}
          style={siteConfig.churchCalendar}
          lang={lang}
          names={t.feasts}
          labels={{
            year: r.year,
            previous: t.events.previous,
            next: t.events.next,
            feastOfFeasts: r.feastOfFeasts,
            greatFeasts: r.greatFeasts,
            fasts: r.fasts,
            moveable: r.moveable,
            note: siteConfig.churchCalendar === "julian" ? r.calendarJulian : r.calendarRevisedJulian,
          }}
        />
      </div>
    </>
  );
}
