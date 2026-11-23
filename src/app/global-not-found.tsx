import type { Metadata } from "next";
import "./globals.css";
import { IcXcNika } from "@/components/orthodox/cross";
import { siteConfig } from "@/lib/content";
import { getDictionary, loc } from "@/lib/i18n";
import { asset } from "@/lib/links";
import { tokenStyle } from "@/lib/tokens";

const lang = siteConfig.defaultLanguage;

export const metadata: Metadata = {
  title: getDictionary(lang).notFound.title,
};

export default function GlobalNotFound() {
  return (
    <html lang={lang} style={tokenStyle(lang) as React.CSSProperties}>
      <body className="flex min-h-dvh items-center justify-center bg-parchment p-6">
        <main className="frame-official max-w-xl bg-white p-8 text-center sm:p-12">
          <IcXcNika className="mx-auto mb-6 size-20 text-royal-800" />
          <p className="eyebrow mb-2">404</p>
          <div className="space-y-6">
            {siteConfig.languages.map((l) => {
              const t = getDictionary(l.code);
              return (
                <div key={l.code} lang={l.code}>
                  <h1 className="font-heading text-3xl text-royal-900">{t.notFound.title}</h1>
                  <p className="mt-1 text-muted-ink">{t.notFound.text}</p>
                  <a href={asset(`/${l.code}/`)} className="mt-2 inline-block font-semibold text-royal-700 underline underline-offset-4">
                    {t.notFound.home}: {loc(siteConfig.siteName, l.code)}
                  </a>
                </div>
              );
            })}
          </div>
        </main>
      </body>
    </html>
  );
}
