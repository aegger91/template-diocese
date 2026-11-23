import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { ChurchPlaceholder } from "@/components/orthodox/emblems";
import { PageHeader } from "@/components/site/page-parts";
import { Button } from "@/components/ui/button";
import { clergyForParish, deaneryById, languageCodes, parishById, parishes } from "@/lib/content";
import { formatClock } from "@/lib/dates";
import { getDictionary, loc } from "@/lib/i18n";
import { asset, localHref } from "@/lib/links";
import { clergyDisplayName } from "@/lib/view";
import type { DayKey } from "@/lib/types";

type Props = { params: Promise<{ lang: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return languageCodes.flatMap((lang) => parishes.map((p) => ({ lang, slug: p.id })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = parishById(slug);
  return { title: p ? loc(p.name, lang) : undefined };
}

const DAY_ORDER: DayKey[] = ["daily", "sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export default async function ParishPage({ params }: Props) {
  const { lang, slug } = await params;
  const p = parishById(slug);
  if (!p) notFound();
  const t = getDictionary(lang);
  const name = loc(p.name, lang);
  const clergyHere = clergyForParish(p.id);
  const services = p.services.slice().sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || a.time.localeCompare(b.time));
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${p.coordinates.lat}&mlon=${p.coordinates.lng}#map=15/${p.coordinates.lat}/${p.coordinates.lng}`;
  const langLabel = (code: string) => (t.worshipLanguages as Record<string, string>)[code] ?? code;

  return (
    <>
      <PageHeader
        lang={lang}
        title={name}
        eyebrow={`${t.types[p.type]}${p.isCathedral ? ` · ${t.parishes.cathedral}` : ""} · ${loc(deaneryById(p.deanery)?.name, lang)}`}
        intro={loc(p.about, lang)}
        crumbs={[
          { label: t.parishes.title, href: "/parishes/" },
          { label: name, href: `/parishes/${p.id}/` },
        ]}
      />
      <div className="container-site grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-10">
          <div className="overflow-hidden rounded-lg border border-line">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset(p.image)} alt="" className="aspect-[16/9] w-full object-cover" />
            ) : (
              <ChurchPlaceholder className="aspect-[16/9] w-full" />
            )}
          </div>

          <section aria-labelledby="services">
            <h2 id="services" className="mb-4 text-3xl text-royal-900">
              {t.parishes.services}
            </h2>
            <table className="w-full border-collapse text-start">
              <tbody>
                {services.map((s, i) => (
                  <tr key={i} className="border-b border-line align-top">
                    <th scope="row" className="w-1/3 py-3 pe-4 text-start font-semibold text-royal-900">
                      {t.days[s.day]}
                    </th>
                    <td className="w-24 py-3 pe-4 tabular-nums text-ink">{formatClock(s.time, lang)}</td>
                    <td className="py-3 text-ink">
                      {(t.serviceTypes as Record<string, string>)[s.service] ?? s.service}
                      {s.note ? <span className="block text-sm text-muted-ink">{loc(s.note, lang)}</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section aria-labelledby="clergy">
            <h2 id="clergy" className="mb-4 text-3xl text-royal-900">
              {t.parishes.clergy}
            </h2>
            {clergyHere.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {clergyHere.map((c) => {
                  const role = c.assignments.find((a) => a.parishId === p.id)?.role ?? "";
                  return (
                    <li key={c.id} className="rounded-lg border border-line bg-parchment p-4">
                      <p className="font-heading text-xl text-royal-900">{clergyDisplayName(c, lang)}</p>
                      <p className="text-sm text-muted-ink">{(t.roles as Record<string, string>)[role] ?? role}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted-ink">{t.parishes.noClergy}</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="frame-official rounded-sm bg-white p-6">
            <h2 className="mb-4 font-heading text-2xl text-royal-900">{t.parishes.contact}</h2>
            <ul className="space-y-3 text-[0.95rem]">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-gold-700" aria-hidden />
                <span>
                  {p.address.street}
                  <br />
                  {p.address.city}, {p.address.region} {p.address.postalCode}
                </span>
              </li>
              {p.phone ? (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 size-5 shrink-0 text-gold-700" aria-hidden />
                  <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">
                    {p.phone}
                  </a>
                </li>
              ) : null}
              {p.email ? (
                <li className="flex gap-3">
                  <Mail className="mt-0.5 size-5 shrink-0 text-gold-700" aria-hidden />
                  <a href={`mailto:${p.email}`} className="break-all hover:underline">
                    {p.email}
                  </a>
                </li>
              ) : null}
              {p.website ? (
                <li className="flex gap-3">
                  <Globe className="mt-0.5 size-5 shrink-0 text-gold-700" aria-hidden />
                  <a href={p.website} rel="noopener" className="break-all hover:underline">
                    {p.website.replace(/^https?:\/\//, "")}
                  </a>
                </li>
              ) : null}
            </ul>
            <Button asChild variant="outline" className="mt-5 h-10 w-full rounded-md border-royal-200 text-royal-800">
              <a href={mapsUrl} rel="noopener">
                <Navigation className="size-4" aria-hidden />
                {t.parishes.directions}
              </a>
            </Button>
          </div>

          <dl className="space-y-4 rounded-lg bg-royal-50 p-6">
            {p.patronalFeast ? (
              <div>
                <dt className="eyebrow">{t.parishes.patronalFeast}</dt>
                <dd className="mt-1 text-ink">{loc(p.patronalFeast, lang)}</dd>
              </div>
            ) : null}
            <div>
              <dt className="eyebrow">{t.parishes.languagesOfWorship}</dt>
              <dd className="mt-1 text-ink">{p.languages.map(langLabel).join(", ")}</dd>
            </div>
            <div>
              <dt className="eyebrow">{t.parishes.deanery}</dt>
              <dd className="mt-1 text-ink">{loc(deaneryById(p.deanery)?.name, lang)}</dd>
            </div>
          </dl>

          <Link href={localHref(lang, "/parishes/")} className="inline-flex items-center gap-2 font-semibold text-royal-700 hover:underline">
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
            {t.parishes.backToDirectory}
          </Link>
        </aside>
      </div>
    </>
  );
}
