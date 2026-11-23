import type { Metadata } from "next";
import { HierarchPlaceholder } from "@/components/orthodox/emblems";
import { PageHeader } from "@/components/site/page-parts";
import { UpcomingSchedule } from "@/components/site/upcoming";
import { bishopSchedule, diocese } from "@/lib/content";
import { nowLocal } from "@/lib/dates";
import { getDictionary, loc } from "@/lib/i18n";
import { scheduleViews } from "@/lib/view";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).news.scheduleTitle };
}

export default async function SchedulePage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  return (
    <>
      <PageHeader
        lang={lang}
        title={t.news.scheduleTitle}
        intro={t.news.scheduleIntro}
        crumbs={[
          { label: t.news.title, href: "/news/" },
          { label: t.news.scheduleTitle, href: "/news/schedule/" },
        ]}
      />
      <div className="container-site grid gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0 rounded-lg border border-line bg-white p-5 sm:p-8">
          <UpcomingSchedule entries={scheduleViews(lang)} buildTime={nowLocal().toISOString()} empty={t.news.noSchedule} variant="full" />
        </div>
        <aside className="h-fit space-y-4 rounded-lg bg-royal-50 p-6">
          <HierarchPlaceholder label="" className="size-20 rounded-full" />
          <p className="font-heading text-xl text-royal-900">{loc(diocese.bishop.styledName, lang)}</p>
          <p className="text-sm leading-relaxed text-muted-ink">{loc(bishopSchedule.note, lang)}</p>
        </aside>
      </div>
    </>
  );
}
