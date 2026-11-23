import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";
import { MinistryIcon, PageHeader } from "@/components/site/page-parts";
import { ministries, siteConfig } from "@/lib/content";
import { getDictionary, loc } from "@/lib/i18n";
import { localHref } from "@/lib/links";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).contact.title };
}

export default async function ContactPage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const c = siteConfig.contact;

  return (
    <>
      <PageHeader lang={lang} title={t.contact.title} intro={t.contact.intro} crumbs={[{ label: t.contact.title, href: "/contact/" }]} />
      <div className="container-site grid gap-12 py-10 sm:py-14 lg:grid-cols-[22rem_1fr]">
        <aside className="space-y-6">
          <div className="frame-official bg-white p-6">
            <p className="eyebrow">{t.contact.office}</p>
            <p className="mt-1 font-heading text-2xl text-royal-900">{loc(c.officeName, lang)}</p>
            <ul className="mt-4 space-y-3 text-[0.95rem]">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden />
                <address className="not-italic">
                  {c.street}
                  <br />
                  {c.city}, {c.region} {c.postalCode}
                </address>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden />
                <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className="hover:underline" dir="ltr">
                  {c.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden />
                <a href={`mailto:${c.email}`} className="break-all hover:underline">
                  {c.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden />
                <span>
                  <span className="block font-semibold">{t.contact.hours}</span>
                  {loc(c.officeHours, lang)}
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-3 font-heading text-2xl text-royal-900">{t.contact.departments}</h2>
            <ul className="divide-y divide-line rounded-lg border border-line bg-white">
              {ministries.map((m) => (
                <li key={m.id} className="flex items-start gap-3 p-3">
                  <MinistryIcon icon={m.icon} className="mt-1 size-4 shrink-0 text-gold-700" />
                  <span className="min-w-0">
                    <Link href={localHref(lang, `/ministries/${m.id}/`)} className="block font-semibold text-royal-900 hover:underline">
                      {loc(m.name, lang)}
                    </Link>
                    {m.email ? (
                      <a href={`mailto:${m.email}`} className="break-all text-sm text-muted-ink hover:underline">
                        {m.email}
                      </a>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <section aria-labelledby="form" className="min-w-0">
          <h2 id="form" className="mb-5 text-3xl text-royal-900">{t.contact.formTitle}</h2>
          <ContactForm
            topics={Object.entries(t.contact.topics).map(([value, label]) => ({ value, label: label as string }))}
            labels={{
              name: t.contact.name,
              email: t.contact.email,
              topic: t.contact.topic,
              message: t.contact.message,
              send: t.contact.send,
              sent: t.contact.sent,
              invalidEmail: t.donate.invalidEmail,
            }}
          />
        </section>
      </div>
    </>
  );
}
