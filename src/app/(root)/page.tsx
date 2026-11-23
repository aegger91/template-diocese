import type { Metadata } from "next";
import { OrthodoxCross } from "@/components/orthodox/cross";
import { siteConfig } from "@/lib/content";
import { loc } from "@/lib/i18n";
import { asset } from "@/lib/links";

export const metadata: Metadata = {
  title: loc(siteConfig.siteName, siteConfig.defaultLanguage),
};

// A static host has no server redirects, so the root page picks a language in the browser.
const script = `(function(){var langs=${JSON.stringify(siteConfig.languages.map((l) => l.code))};var base=${JSON.stringify(asset("/"))};var pick=${JSON.stringify(siteConfig.defaultLanguage)};var prefs=navigator.languages||[navigator.language||""];for(var i=0;i<prefs.length;i++){var c=(prefs[i]||"").slice(0,2).toLowerCase();if(langs.indexOf(c)>-1){pick=c;break;}}location.replace(base+pick+"/");})();`;

export default function RootPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <OrthodoxCross className="h-14 w-auto text-gold-400" />
      <ul className="flex flex-wrap justify-center gap-3">
        {siteConfig.languages.map((l) => (
          <li key={l.code}>
            <a href={asset(`/${l.code}/`)} lang={l.code} className="rounded border border-gold-500/60 px-4 py-2 hover:bg-white/10">
              {loc(siteConfig.siteName, l.code)} · {l.label}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
