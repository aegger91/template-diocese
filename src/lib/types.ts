export type Localized = string | Record<string, string>;
export type LocalizedParagraphs = string[] | Record<string, string[]>;

export type LogoStyle = "seal" | "kiot" | "square" | "wordmark";
export type DisplayFont = "none" | "slavonic" | "greek";

export interface LanguageConfig {
  code: string;
  label: string;
  direction: "ltr" | "rtl";
  displayFont: DisplayFont;
}

export interface NavItem {
  label: Localized;
  href: string;
  children?: NavItem[];
}

export type HomeSectionId =
  | "hero"
  | "welcome"
  | "announcements"
  | "events"
  | "bishopSchedule"
  | "parishFinder"
  | "ministries"
  | "livestream"
  | "donateAppeal"
  | "gallery";

export interface SiteConfig {
  templateSlug: string;
  siteName: Localized;
  siteTagline: Localized;
  showSampleNotice: boolean;
  defaultLanguage: string;
  languages: LanguageConfig[];
  logo: { style: LogoStyle; image?: string; sealText: Localized; sealYear?: string };
  churchCalendar: "revised-julian" | "julian";
  weekStartsOn: "sunday" | "monday";
  homeSections: { id: HomeSectionId; enabled: boolean }[];
  features: {
    donate: boolean;
    careers: boolean;
    mediaGallery: boolean;
    livestream: boolean;
    newsletter: boolean;
    fundTotals: boolean;
  };
  navigation: NavItem[];
  contact: {
    officeName: Localized;
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
    officeHours: Localized;
  };
  orthodoxConnect: {
    enabled: boolean;
    baseUrl: string;
    organizationId: string;
    eventRegistrationPath: string;
    newsletterSignupPath: string;
  };
  donations: {
    paymentProvider: "none" | "stripe" | "authorizenet" | "tithely";
    currency: string;
    suggestedAmounts: number[];
    fundTotalsProvider: "none" | "mock" | "stripe" | "authorizenet" | "tithely";
    fundTotalsEndpoint: string;
  };
  map: { tileUrl: string; tileAttribution: string };
  livestream: { embedUrl: string; channelUrl: string };
  social: { label: string; href: string }[];
}

export type ParishType = "parish" | "mission" | "monastery" | "chapel";
export type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "daily";

export interface Parish {
  id: string;
  name: Localized;
  type: ParishType;
  isCathedral?: boolean;
  deanery: string;
  patronalFeast?: Localized;
  address: { street: string; city: string; region: string; postalCode: string };
  coordinates: { lat: number; lng: number };
  languages: string[];
  services: { day: DayKey; time: string; service: string; note?: Localized }[];
  phone?: string;
  email?: string;
  website?: string;
  about?: Localized;
  image?: string;
}

export type ClergyRank =
  | "bishop"
  | "archimandrite"
  | "archpriest"
  | "priest"
  | "hieromonk"
  | "protodeacon"
  | "deacon";

export interface Clergy {
  id: string;
  rank: ClergyRank;
  name: Localized;
  status: "active" | "retired";
  assignments: { role: string; parishId?: string; deanery?: string }[];
  email?: string;
}

export type EventCategory =
  | "assembly"
  | "retreat"
  | "service"
  | "youth"
  | "education"
  | "music"
  | "charity"
  | "clergy";

export interface DiocesanEvent {
  id: string;
  title: Localized;
  summary: Localized;
  description?: LocalizedParagraphs;
  start: string;
  end?: string;
  category: EventCategory;
  major: boolean;
  location: { parishId?: string; name?: Localized };
  registration?: { connectEventId: string; deadline?: string };
  livestream?: boolean;
  image?: string;
}

export type NewsCategory = "announcement" | "encyclical" | "pastoralLetter";

export interface NewsItem {
  id: string;
  date: string;
  category: NewsCategory;
  title: Localized;
  summary: Localized;
  body: LocalizedParagraphs;
  pdf?: string;
  image?: string;
}

export interface ScheduleEntry {
  date: string;
  kind: "visitation" | "liturgy" | "meeting" | "ordination";
  parishId?: string;
  place?: Localized;
  title: Localized;
}

export interface Ministry {
  id: string;
  icon: "youth" | "education" | "missions" | "music" | "charity";
  name: Localized;
  summary: Localized;
  body: LocalizedParagraphs;
  contactClergyId?: string;
  email?: string;
  eventCategories: EventCategory[];
}

export interface DocumentItem {
  id: string;
  title: Localized;
  description?: Localized;
  category: "forms" | "policies" | "liturgical" | "finance" | "assembly";
  audience: "clergy" | "parishes" | "everyone";
  file: string;
  updated: string;
}

export interface Fund {
  id: string;
  name: Localized;
  description: Localized;
  isDefault?: boolean;
}

export interface Opening {
  id: string;
  kind: "clergyAssignment" | "staff" | "volunteer";
  title: Localized;
  parishId?: string;
  summary: Localized;
  posted: string;
  contactEmail: string;
}

export interface MediaItem {
  id: string;
  album: string;
  src: string;
  alt: Localized;
  caption: Localized;
  credit: string;
}

export type PageBlock =
  | { type: "text"; heading?: Localized; body: LocalizedParagraphs }
  | { type: "image"; src: string; alt: Localized; caption?: Localized }
  | {
      type: "callout";
      heading?: Localized;
      body: LocalizedParagraphs;
      link?: { label: Localized; href: string };
    };

export interface CustomPage {
  path: string;
  title: Localized;
  intro?: Localized;
  blocks: PageBlock[];
}
