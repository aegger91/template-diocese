import type { Metadata, Viewport } from "next";
import "../globals.css";
import { SiteHeader, type HeaderNavItem } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Logo } from "@/components/site/logo";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getLanguage, languageCodes, siteConfig } from "@/lib/content";
import { getDictionary, loc } from "@/lib/i18n";
import { asset, localHref } from "@/lib/links";
import { tokenStyle } from "@/lib/tokens";

export const dynamicParams = false;

export function generateStaticParams() {
  return languageCodes.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const name = loc(siteConfig.siteName, lang);
  return {
    title: { default: name, template: `%s | ${name}` },
    description: loc(siteConfig.siteTagline, lang),
    icons: { icon: asset("/favicon.svg") },
    alternates: {
      languages: Object.fromEntries(languageCodes.map((code) => [code, `/${code}/`])),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0e1b42",
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const language = getLanguage(lang);
  const t = getDictionary(lang);
  const { features } = siteConfig;

  const nav: HeaderNavItem[] = siteConfig.navigation
    .map((item) => ({
      label: loc(item.label, lang),
      href: localHref(lang, item.href),
      children: item.children
        ?.filter((c) => {
          if (c.href.startsWith("/careers") && !features.careers) return false;
          if (c.href.startsWith("/media") && !features.mediaGallery) return false;
          if (c.href.startsWith("/live") && !features.livestream) return false;
          return true;
        })
        .map((c) => ({ label: loc(c.label, lang), href: localHref(lang, c.href) })),
    }));

  const utilityLinks = [
    { label: t.parishes.title, href: localHref(lang, "/parishes/") },
    { label: t.home.bishopSchedule, href: localHref(lang, "/news/schedule/") },
    ...(features.livestream ? [{ label: t.live.title, href: localHref(lang, "/live/") }] : []),
    { label: t.resources.feastsTitle, href: localHref(lang, "/resources/feasts/") },
  ];

  return (
    <html lang={lang} dir={language.direction} style={tokenStyle(lang) as React.CSSProperties} data-scroll-behavior="smooth">
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded bg-gold-500 px-4 py-2 font-semibold text-royal-950 focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
        >
          {t.common.skipToContent}
        </a>
        {siteConfig.showSampleNotice ? (
          <div className="bg-gold-300 text-royal-950">
            <p className="container-site py-1.5 text-center text-xs font-semibold leading-snug sm:text-[0.8rem]">
              {t.common.sampleNotice}
            </p>
          </div>
        ) : null}
        <TooltipProvider>
          <SiteHeader
            lang={lang}
            dir={language.direction}
            languages={siteConfig.languages.map((l) => ({ code: l.code, label: l.label }))}
            nav={nav}
            utilityLinks={utilityLinks}
            donateHref={features.donate ? localHref(lang, "/donate/") : null}
            homeHref={localHref(lang, "/")}
            logo={<Logo lang={lang} idPrefix="header" />}
            labels={{
              menu: t.common.menu,
              closeMenu: t.common.closeMenu,
              donate: t.common.donate,
              language: t.common.language,
              home: `${loc(siteConfig.siteName, lang)}: ${t.common.home}`,
            }}
          />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter lang={lang} />
        </TooltipProvider>
      </body>
    </html>
  );
}
