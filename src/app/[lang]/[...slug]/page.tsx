import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader, Prose } from "@/components/site/page-parts";
import { customPages, languageCodes, siteConfig } from "@/lib/content";
import { loc, locParagraphs } from "@/lib/i18n";
import { asset, isExternal, localHref } from "@/lib/links";
import type { NavItem } from "@/lib/types";

type Props = { params: Promise<{ lang: string; slug: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return languageCodes.flatMap((lang) => customPages.map((p) => ({ lang, slug: p.path.split("/").filter(Boolean) })));
}

const findPage = (slug: string[]) => customPages.find((p) => p.path.split("/").filter(Boolean).join("/") === slug.join("/"));

function labelFor(href: string, lang: string): string | undefined {
  const walk = (items: NavItem[]): string | undefined => {
    for (const i of items) {
      if (i.href === href) return loc(i.label, lang);
      const found = i.children ? walk(i.children) : undefined;
      if (found) return found;
    }
  };
  const fromNav = walk(siteConfig.navigation);
  if (fromNav) return fromNav;
  const page = customPages.find((p) => `/${p.path}/` === href);
  return page ? loc(page.title, lang) : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = findPage(slug);
  return { title: page ? loc(page.title, lang) : undefined };
}

export default async function CustomPage({ params }: Props) {
  const { lang, slug } = await params;
  const page = findPage(slug);
  if (!page) notFound();

  const crumbs = slug
    .map((_, i) => `/${slug.slice(0, i + 1).join("/")}/`)
    .map((href) => ({ href, label: labelFor(href, lang) }))
    .filter((c): c is { href: string; label: string } => Boolean(c.label));

  return (
    <>
      <PageHeader lang={lang} title={loc(page.title, lang)} intro={loc(page.intro, lang) || undefined} crumbs={crumbs} />
      <div className="container-site py-10 sm:py-14">
        <div className="mx-auto max-w-3xl space-y-10">
          {page.blocks.map((b, i) => {
            if (b.type === "text") {
              return (
                <section key={i}>
                  {b.heading ? <h2 className="mb-4 text-3xl text-royal-900">{loc(b.heading, lang)}</h2> : null}
                  <Prose paragraphs={locParagraphs(b.body, lang)} />
                </section>
              );
            }
            if (b.type === "image") {
              return (
                <figure key={i} className="overflow-hidden rounded-md border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(b.src)} alt={loc(b.alt, lang)} loading="lazy" className="w-full" />
                  {b.caption ? <figcaption className="bg-parchment px-4 py-2 text-sm text-muted-ink">{loc(b.caption, lang)}</figcaption> : null}
                </figure>
              );
            }
            return (
              <aside key={i} className="frame-official bg-parchment p-6 sm:p-8">
                {b.heading ? <h2 className="mb-3 font-heading text-2xl text-royal-900">{loc(b.heading, lang)}</h2> : null}
                <Prose paragraphs={locParagraphs(b.body, lang)} />
                {b.link ? (
                  <Link
                    href={isExternal(b.link.href) ? b.link.href : localHref(lang, b.link.href)}
                    className="mt-2 inline-flex items-center gap-1.5 font-semibold text-royal-700 hover:underline"
                  >
                    {loc(b.link.label, lang)}
                    <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
                  </Link>
                ) : null}
              </aside>
            );
          })}
        </div>
      </div>
    </>
  );
}
