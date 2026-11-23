import en from "@content/i18n/en.json";
import ru from "@content/i18n/ru.json";
import el from "@content/i18n/el.json";
import siteConfigJson from "@content/site.config.json";
import type { Localized, LocalizedParagraphs } from "./types";

const defaultLanguage = siteConfigJson.defaultLanguage;

// Add a file to content/i18n and list it here when a new language is configured.
const dictionaries: Record<string, unknown> = { en, ru, el };

export type Dictionary = typeof en;

function deepMerge<T>(base: T, override: unknown): T {
  if (typeof base !== "object" || base === null || typeof override !== "object" || override === null) {
    return (override ?? base) as T;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    const current = out[key];
    out[key] =
      typeof current === "object" && current !== null && typeof value === "object" && value !== null
        ? deepMerge(current, value)
        : value === "" || value === undefined
          ? current
          : value;
  }
  return out as T;
}

/** Interface strings for a language, with every missing key falling back to the default language. */
export function getDictionary(lang: string): Dictionary {
  const base = (dictionaries[defaultLanguage] ?? en) as Dictionary;
  if (lang === defaultLanguage) return base;
  return deepMerge(base, dictionaries[lang]);
}

/** Pick one language from a localized field: requested language, then the default language, then any value. */
export function loc(field: Localized | undefined, lang: string): string {
  if (field === undefined || field === null) return "";
  if (typeof field === "string") return field;
  return field[lang] || field[defaultLanguage] || Object.values(field).find(Boolean) || "";
}

/** Like loc(), but also reports which language was used so fallback text can carry its own lang attribute. */
export function locWithLang(field: Localized | undefined, lang: string): { text: string; lang: string } {
  if (!field) return { text: "", lang };
  if (typeof field === "string") return { text: field, lang };
  if (field[lang]) return { text: field[lang], lang };
  if (field[defaultLanguage]) return { text: field[defaultLanguage], lang: defaultLanguage };
  const first = Object.entries(field).find(([, v]) => v);
  return first ? { text: first[1], lang: first[0] } : { text: "", lang };
}

export function locParagraphs(field: LocalizedParagraphs | undefined, lang: string): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  return field[lang]?.length ? field[lang] : field[defaultLanguage] ?? Object.values(field)[0] ?? [];
}
