import siteConfigJson from "@content/site.config.json";
import tokensJson from "@content/tokens.json";
import dioceseJson from "@content/diocese.json";
import parishesJson from "@content/parishes.json";
import clergyJson from "@content/clergy.json";
import eventsJson from "@content/events.json";
import newsJson from "@content/news.json";
import scheduleJson from "@content/bishop-schedule.json";
import ministriesJson from "@content/ministries.json";
import documentsJson from "@content/documents.json";
import fundsJson from "@content/funds.json";
import careersJson from "@content/careers.json";
import mediaJson from "@content/media.json";
import pagesJson from "@content/pages.json";
import type {
  Clergy,
  CustomPage,
  DiocesanEvent,
  DocumentItem,
  Fund,
  Localized,
  LocalizedParagraphs,
  MediaItem,
  Ministry,
  NewsItem,
  Opening,
  Parish,
  ScheduleEntry,
  SiteConfig,
} from "./types";

export const siteConfig = siteConfigJson as unknown as SiteConfig;
export const tokens = tokensJson;

export const diocese = dioceseJson as unknown as {
  bishop: {
    clergyId: string;
    styledName: Localized;
    signature: Localized;
    welcomeTitle: Localized;
    welcomeShort: Localized;
    welcomeFull: LocalizedParagraphs;
    biography: LocalizedParagraphs;
    milestones: { year: string; text: Localized }[];
  };
  history: {
    intro: Localized;
    timeline: { year: string; title: Localized; text: Localized; image?: string }[];
  };
  structure: {
    intro: Localized;
    deaneries: { id: string; name: Localized; deanId?: string }[];
    offices: { title: Localized; clergyId?: string; text?: Localized }[];
  };
  parentChurch: {
    name: Localized;
    synodName: Localized;
    text: LocalizedParagraphs;
    website?: string;
  };
};

export const parishes = (parishesJson as unknown as { parishes: Parish[] }).parishes;
export const clergy = (clergyJson as unknown as { clergy: Clergy[] }).clergy;
export const events = (eventsJson as unknown as { events: DiocesanEvent[] }).events
  .slice()
  .sort((a, b) => a.start.localeCompare(b.start));
export const news = (newsJson as unknown as { news: NewsItem[] }).news
  .slice()
  .sort((a, b) => b.date.localeCompare(a.date));
export const bishopSchedule = scheduleJson as unknown as {
  note: Localized;
  entries: ScheduleEntry[];
};
export const ministries = (ministriesJson as unknown as { ministries: Ministry[] }).ministries;
export const documents = (documentsJson as unknown as { documents: DocumentItem[] }).documents;
export const fundsData = fundsJson as unknown as {
  appeal: { title: Localized; text: Localized };
  funds: Fund[];
};
export const careers = careersJson as unknown as { intro: Localized; openings: Opening[] };
export const media = mediaJson as unknown as {
  albums: { id: string; name: Localized }[];
  items: MediaItem[];
};
export const customPages = (pagesJson as unknown as { pages: CustomPage[] }).pages;

export const languageCodes = siteConfig.languages.map((l) => l.code);

export function getLanguage(code: string) {
  return siteConfig.languages.find((l) => l.code === code) ?? siteConfig.languages[0];
}

export const parishById = (id?: string) => parishes.find((p) => p.id === id);
export const clergyById = (id?: string) => clergy.find((c) => c.id === id);
export const deaneryById = (id?: string) => diocese.structure.deaneries.find((d) => d.id === id);

export const creditFor = (src: string) => media.items.find((m) => m.src === src)?.credit ?? "";

export function clergyForParish(parishId: string) {
  return clergy.filter((c) => c.assignments.some((a) => a.parishId === parishId));
}
