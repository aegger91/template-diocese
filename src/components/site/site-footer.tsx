import Link from "next/link";
import { IcXcNika } from "@/components/orthodox/cross";
import { Logo } from "@/components/site/logo";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { siteConfig } from "@/lib/content";
import { getDictionary, loc } from "@/lib/i18n";
import { orthodoxConnectEnabled } from "@/lib/integrations/orthodoxconnect";
import { localHref } from "@/lib/links";

export function SiteFooter({ lang }: { lang: string }) {
  const t = getDictionary(lang);
  const { contact, features } = siteConfig;
  const showNewsletter = features.newsletter && orthodoxConnectEnabled;
  const links = [
    ...siteConfig.navigation.map((n) => ({ label: loc(n.label, lang), href: n.href })),
    ...(features.donate ? [{ label: t.common.donate, href: "/donate/" }] : []),
  ];

  return (
    <footer className="on-dark mt-auto bg-royal-950 text-royal-100">
      <div className="h-1 bg-linear-to-r from-gold-700 via-gold-400 to-gold-700" aria-hidden />
      <div className="container-site grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.4fr] lg:py-16">
        <div className="space-y-5">
          <Logo lang={lang} variant="footer" idPrefix="footer" />
          <address className="space-y-1 text-sm not-italic leading-relaxed text-royal-100">
            <p className="font-semibold text-white">{loc(contact.officeName, lang)}</p>
            <p>{contact.street}</p>
            <p>
              {contact.city}, {contact.region} {contact.postalCode}
            </p>
            <p>
              <a className="hover:text-white hover:underline" href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>
                {contact.phone}
              </a>
            </p>
            <p>
              <a className="break-all hover:text-white hover:underline" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </p>
            <p className="pt-1 text-royal-200">{loc(contact.officeHours, lang)}</p>
          </address>
        </div>

        <nav aria-label={t.footer.quickLinks}>
          <h2 className="eyebrow mb-4">{t.footer.quickLinks}</h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={localHref(lang, l.href)} className="hover:text-white hover:underline underline-offset-4">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {siteConfig.social.length ? (
            <>
              <h2 className="eyebrow mb-3 mt-8">{t.footer.follow}</h2>
              <ul className="flex flex-wrap items-center gap-3 text-sm leading-normal">
                {siteConfig.social.map((s) => (
                  <li key={s.href} className="leading-normal">
                    <a href={s.href} rel="noopener" className="inline-flex items-center rounded border border-white/15 px-3 py-1.5 leading-normal hover:border-gold-400 hover:text-white">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </nav>

        {showNewsletter ? (
          <div className="md:col-span-2 lg:col-span-1">
            <h2 className="mb-2 font-heading text-2xl text-white">{t.footer.newsletterTitle}</h2>
            <p className="mb-4 text-sm text-royal-200">{t.footer.newsletterText}</p>
            <NewsletterForm
              lang={lang}
              labels={{
                placeholder: t.footer.newsletterPlaceholder,
                subscribe: t.footer.subscribe,
                subscribed: t.footer.subscribed,
                invalidEmail: t.donate.invalidEmail,
              }}
            />
            <p className="mt-3 text-xs text-royal-200/80">OrthodoxConnect</p>
          </div>
        ) : null}
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-start gap-4 py-6 text-xs text-royal-200 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <IcXcNika className="size-9 shrink-0 text-gold-400" />
            <p>
              © {loc(siteConfig.siteName, lang)}. {t.footer.copyright}
            </p>
          </div>
          <Link href={localHref(lang, "/media/")} className="hover:text-white hover:underline">
            {t.footer.imageCredits}
          </Link>
        </div>
      </div>
    </footer>
  );
}
